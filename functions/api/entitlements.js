import { runtimeConfiguration, runtimeUnavailableJson } from '../_lib/runtime-config.js';

const stripeApi = 'https://api.stripe.com/v1';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

function filesForPrice(rules, priceId) {
  return (rules[priceId] || []).map(file => typeof file === 'string'
    ? { key: file, label: file.split('/').pop().replace(/-iphone\.png$/, '').replace(/-/g, ' ') }
    : file);
}

async function paidCheckout(sessionId, secret) {
  if (!/^[a-zA-Z0-9_]+$/.test(sessionId)) throw new Error('Invalid checkout session.');
  const auth = `Basic ${btoa(`${secret}:`)}`;
  const session = await fetch(`${stripeApi}/checkout/sessions/${sessionId}`, { headers: { authorization: auth } });
  if (!session.ok) throw new Error('Checkout session was not found.');
  const checkout = await session.json();
  const isCompletedPurchase = checkout.payment_status === 'paid'
    || (checkout.payment_status === 'no_payment_required' && checkout.amount_total === 0);
  if (!isCompletedPurchase) throw new Error('Payment has not completed.');
  const items = await fetch(`${stripeApi}/checkout/sessions/${sessionId}/line_items?limit=100`, { headers: { authorization: auth } });
  if (!items.ok) throw new Error('Checkout line items were not found.');
  return { checkout, lineItems: (await items.json()).data || [] };
}

async function signedInUser(request, supabaseUrl, serviceRoleKey) {
  const authorization = request.headers.get('authorization') || '';
  if (!authorization.startsWith('Bearer ')) return null;
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: serviceRoleKey, authorization }
  });
  return response.ok ? response.json() : null;
}

async function checkoutOwnerId(checkout, supabaseUrl, serviceRoleKey) {
  const directOwner = checkout.client_reference_id || checkout.metadata?.minimal_account_id;
  if (directOwner) return directOwner;
  // Older sessions can be recovered only from an existing server-managed
  // entitlement. Customer email and user metadata are not authorization data.
  const response = await fetch(`${supabaseUrl}/rest/v1/purchase_entitlements?stripe_checkout_session_id=eq.${encodeURIComponent(checkout.id)}&select=user_id&limit=2`, {
    headers: { apikey: serviceRoleKey, authorization: `Bearer ${serviceRoleKey}` }
  });
  if (!response.ok) return null;
  const owners = [...new Set((await response.json()).map(row => row.user_id).filter(Boolean))];
  return owners.length === 1 ? owners[0] : null;
}

async function saveLibraryMetadata({ env, user, checkout, productMap, lineItems }) {
  const additions = lineItems
    .map(line => productMap[line.price?.id])
    .filter(Boolean)
    .map(product_key => ({
      product_key,
      stripe_checkout_session_id: checkout.id,
      granted_at: new Date((checkout.created || Date.now() / 1000) * 1000).toISOString()
    }));
  if (!additions.length) return false;
  const existing = Array.isArray(user.user_metadata?.minimal_library) ? user.user_metadata.minimal_library : [];
  const library = [...existing, ...additions].reduce((all, item) => {
    const key = `${item.product_key}:${item.stripe_checkout_session_id}`;
    if (!all.some(entry => `${entry.product_key}:${entry.stripe_checkout_session_id}` === key)) all.push(item);
    return all;
  }, []);
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
    method: 'PUT',
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({ user_metadata: { ...(user.user_metadata || {}), minimal_library: library } })
  });
  return response.ok;
}

async function synchroniseLibrary({ env, user, checkout, lineItems }) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !env.PRODUCT_ACCOUNT_ENTITLEMENTS) return false;
  let productMap;
  try { productMap = JSON.parse(env.PRODUCT_ACCOUNT_ENTITLEMENTS); } catch { return false; }
  const rows = lineItems
    .map(line => ({ priceId: line.price?.id, productKey: productMap[line.price?.id] }))
    .filter(line => line.priceId && line.productKey)
    .map(line => ({
      user_id: user.id,
      stripe_checkout_session_id: checkout.id,
      stripe_customer_id: checkout.customer || null,
      stripe_price_id: line.priceId,
      product_key: line.productKey
    }));
  if (!rows.length) return false;
  let databaseUpdated = false;
  try {
    const response = await fetch(`${env.SUPABASE_URL}/rest/v1/purchase_entitlements?on_conflict=stripe_checkout_session_id,product_key`, {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'content-type': 'application/json',
        Prefer: 'resolution=ignore-duplicates,return=minimal'
      },
      body: JSON.stringify(rows)
    });
    databaseUpdated = response.ok;
  } catch { /* Auth metadata is an independent delivery record. */ }
  const metadataUpdated = await saveLibraryMetadata({ env, user, checkout, productMap, lineItems }).catch(() => false);
  return databaseUpdated || metadataUpdated;
}

export async function onRequestGet(context) {
  const runtime = runtimeConfiguration(context.env, context.request, { stripe: true });
  if (!runtime.ok) return runtimeUnavailableJson();
  const sessionId = new URL(context.request.url).searchParams.get('session_id');
  if (!sessionId) return json({ error: 'Missing checkout session.' }, 400);
  if (!context.env.STRIPE_SECRET_KEY || !context.env.SUPABASE_URL || !context.env.SUPABASE_SERVICE_ROLE_KEY || !context.env.PRODUCT_ENTITLEMENTS) {
    return json({ error: 'Secure delivery is still being configured.' }, 503);
  }

  try {
    const rules = JSON.parse(context.env.PRODUCT_ENTITLEMENTS);
    const { checkout, lineItems } = await paidCheckout(sessionId, context.env.STRIPE_SECRET_KEY);
    const user = await signedInUser(context.request, context.env.SUPABASE_URL, context.env.SUPABASE_SERVICE_ROLE_KEY);
    const owner = await checkoutOwnerId(checkout, context.env.SUPABASE_URL, context.env.SUPABASE_SERVICE_ROLE_KEY);
    if (!user?.id || !owner || user.id !== owner) return json({ error: 'Sign in with the account used for this purchase.' }, 403);
    // A Notion template has no private R2 file, but it must still appear in
    // minimal Accounts immediately after checkout.
    const libraryUpdated = await synchroniseLibrary({ env: context.env, user, checkout, lineItems });
    const allowed = new Map();
    for (const line of lineItems) {
      const files = filesForPrice(rules, line.price?.id);
      for (const file of files) allowed.set(file.key, file);
    }
    return json({ files: [...allowed.values()].map(file => ({ key: file.key, label: file.label })), library_updated: libraryUpdated });
  } catch (error) {
    return json({ error: error.message || 'Unable to verify this purchase.' }, 403);
  }
}
