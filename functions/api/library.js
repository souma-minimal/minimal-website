function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

async function signedInUser(request, supabaseUrl, serviceRoleKey) {
  const authorization = request.headers.get('authorization') || '';
  if (!authorization.startsWith('Bearer ')) return null;
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: serviceRoleKey, authorization }
  });
  return response.ok ? response.json() : null;
}

// The browser never receives a service key. This endpoint checks the caller's
// Supabase session first, then reads only that caller's entitlement rows.
export async function onRequestGet(context) {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = context.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return json({ error: 'Library service is not configured.' }, 503);

  try {
    const user = await signedInUser(context.request, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    if (!user?.id) return json({ error: 'Sign in is required.' }, 401);
    const query = new URLSearchParams({
      select: 'product_key,granted_at,stripe_checkout_session_id',
      user_id: `eq.${user.id}`,
      order: 'granted_at.desc'
    });
    const response = await fetch(`${SUPABASE_URL}/rest/v1/purchase_entitlements?${query}`, {
      headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
    });
    if (!response.ok) throw new Error('Could not load library.');
    return json(await response.json());
  } catch {
    return json({ error: 'Could not load library.' }, 500);
  }
}
