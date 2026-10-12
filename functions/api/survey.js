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

async function userFor(context) {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = context.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return { error: json({ error: 'Survey service is not configured.' }, 503) };
  const user = await signedInUser(context.request, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  if (!user?.id) return { error: json({ error: 'Sign in is required.' }, 401) };
  return { user, url: SUPABASE_URL, key: SUPABASE_SERVICE_ROLE_KEY };
}

export async function onRequestGet(context) {
  const session = await userFor(context);
  if (session.error) return session.error;
  const query = new URLSearchParams({ select: 'uses,interest,notes,updated_at', user_id: `eq.${session.user.id}`, limit: '1' });
  const response = await fetch(`${session.url}/rest/v1/account_survey_responses?${query}`, {
    headers: { apikey: session.key, authorization: `Bearer ${session.key}` }
  });
  if (!response.ok) return json({ error: 'Could not load survey.' }, 500);
  return json((await response.json())[0] || null);
}

export async function onRequestPost(context) {
  const session = await userFor(context);
  if (session.error) return session.error;
  let body;
  try { body = await context.request.json(); } catch { return json({ error: 'Invalid response.' }, 400); }
  const uses = typeof body.uses === 'string' ? body.uses.slice(0, 64) : '';
  const interest = typeof body.interest === 'string' ? body.interest.slice(0, 64) : '';
  const notes = typeof body.notes === 'string' ? body.notes.slice(0, 600) : '';
  const response = await fetch(`${session.url}/rest/v1/account_survey_responses?on_conflict=user_id`, {
    method: 'POST',
    headers: {
      apikey: session.key,
      authorization: `Bearer ${session.key}`,
      'content-type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation'
    },
    body: JSON.stringify({ user_id: session.user.id, uses, interest, notes, updated_at: new Date().toISOString() })
  });
  if (!response.ok) return json({ error: 'Could not save survey.' }, 500);
  return json((await response.json())[0] || { uses, interest, notes });
}
