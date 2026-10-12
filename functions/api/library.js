function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

const stripeApi = 'https://api.stripe.com/v1';

function stripeHeaders(key) {
  return { authorization: `Basic ${btoa(`${key}:`)}` };
}

async function signedInUser(request, supabaseUrl, serviceRoleKey) {
  const authorization = request.headers.get('authorization') || '';
  if (!authorization.startsWith('Bearer ')) return null;
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: serviceRoleKey, authorization }
  });
  return response.ok ? response.json() : null;
}

async function libraryFromStripe({ stripeKey, email, productMap }) {
  // This is a resilience path, not the primary store: it lets a signed-in
  // customer see completed purchases even while PostgREST is refreshing its
  // schema cache. We look up only the Stripe customer with the same verified
  // account email, then keep only completed sessions whose product key is in
  // this site's own configured product map.
  const customersResponse = await fetch(`${stripeApi}/customers?email=${encodeURIComponent(email)}&limit=10`, {
    headers: stripeHeaders(stripeKey)
  });
  if (!customersResponse.ok) throw new Error('Could not look up customer.');
  const customers = (await customersResponse.json()).data || [];
  const allowedProducts = new Set(Object.values(productMap));
  const purchases = [];

  for (const customer of customers) {
    const sessionsResponse = await fetch(`${stripeApi}/checkout/sessions?customer=${encodeURIComponent(customer.id)}&limit=100`, {
      headers: stripeHeaders(stripeKey)
    });
    if (!sessionsResponse.ok) continue;
    const sessions = (await sessionsResponse.json()).data || [];
    for (const session of sessions) {
      const productKey = session.metadata?.product_key;
      const complete = session.payment_status === 'paid'
        || (session.payment_status === 'no_payment_required' && session.amount_total === 0);
      if (!complete || !productKey || !allowedProducts.has(productKey)) continue;
      purchases.push({
        product_key: productKey,
        granted_at: new Date((session.created || 0) * 1000).toISOString(),
        stripe_checkout_session_id: session.id
      });
    }
  }
  return purchases.sort((left, right) => right.granted_at.localeCompare(left.granted_at));
}

function libraryFromMetadata(user) {
  const stored = user?.user_metadata?.minimal_library;
  if (!Array.isArray(stored)) return [];
  return stored.filter(item => item
    && typeof item.product_key === 'string'
    && typeof item.stripe_checkout_session_id === 'string'
    && typeof item.granted_at === 'string');
}

// The browser never receives a service key. This endpoint checks the caller's
// Supabase session first, then reads only that caller's entitlement rows.
export async function onRequestGet(context) {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, STRIPE_CHECKOUT_KEY, PRODUCT_ACCOUNT_ENTITLEMENTS } = context.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return json({ error: 'Library service is not configured.' }, 503);

  try {
    const user = await signedInUser(context.request, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    if (!user?.id) return json({ error: 'Sign in is required.' }, 401);
    const metadataLibrary = libraryFromMetadata(user);
    if (metadataLibrary.length) return json(metadataLibrary);
    const query = new URLSearchParams({
      select: 'product_key,granted_at,stripe_checkout_session_id',
      user_id: `eq.${user.id}`,
      order: 'granted_at.desc'
    });
    const response = await fetch(`${SUPABASE_URL}/rest/v1/purchase_entitlements?${query}`, {
      headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
    });
    if (response.ok) return json(await response.json());

    // PostgREST can briefly return 404 immediately after a table or policy
    // change. A completed Stripe Checkout remains the source of truth, so use
    // it to keep a buyer's library available during that window.
    const stripeKey = STRIPE_CHECKOUT_KEY || STRIPE_SECRET_KEY;
    if (!stripeKey || !PRODUCT_ACCOUNT_ENTITLEMENTS || !user.email) throw new Error('Could not load library.');
    const productMap = JSON.parse(PRODUCT_ACCOUNT_ENTITLEMENTS);
    return json(await libraryFromStripe({ stripeKey, email: user.email, productMap }));
  } catch {
    // A library can safely be empty; never make successful sign-in look like
    // a failure just because an optional history service is unavailable.
    return json([]);
  }
}
