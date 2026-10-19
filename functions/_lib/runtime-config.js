const validEnvironments = new Set(['production', 'preview']);

function httpsOrigin(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.origin : null;
  } catch {
    return null;
  }
}

function isPublishableSupabaseKey(value) {
  // Supabase publishable keys use the `sb_publishable_` prefix. The legacy
  // anon JWT format is allowed only for existing deployments during migration.
  return typeof value === 'string' && (value.startsWith('sb_publishable_') || value.split('.').length === 3);
}

function requestOrigin(request) {
  try { return new URL(request.url).origin; } catch { return null; }
}

export function runtimeConfiguration(env, request, { stripe = false, r2 = false, webhook = false } = {}) {
  const environment = env.MINIMAL_ENVIRONMENT;
  const siteOrigin = httpsOrigin(env.PUBLIC_SITE_URL);
  const supabaseUrl = httpsOrigin(env.SUPABASE_URL);
  const previewSupabaseUrl = httpsOrigin(env.PREVIEW_SUPABASE_URL);
  const productionSupabaseUrl = httpsOrigin(env.PRODUCTION_SUPABASE_URL);

  if (!validEnvironments.has(environment) || !siteOrigin || !supabaseUrl || !isPublishableSupabaseKey(env.SUPABASE_PUBLISHABLE_KEY)) {
    return { ok: false };
  }

  if (environment === 'preview') {
    // Preview has no safe default. It must name its own origin and distinct
    // Supabase project explicitly, so an omitted binding cannot silently use
    // the production account or database.
    if (siteOrigin !== requestOrigin(request) || !previewSupabaseUrl || !productionSupabaseUrl
      || supabaseUrl !== previewSupabaseUrl || supabaseUrl === productionSupabaseUrl) return { ok: false };

    const stripeKey = env.STRIPE_CHECKOUT_KEY || env.STRIPE_SECRET_KEY;
    if (stripe && (!stripeKey || !(stripeKey.startsWith('rk_test_') || stripeKey.startsWith('sk_test_')))) return { ok: false };
    if (r2 && env.R2_BINDING_ENVIRONMENT !== 'preview') return { ok: false };
    if (webhook && env.WEBHOOK_ENVIRONMENT !== 'preview') return { ok: false };
  }

  return { ok: true, environment, siteOrigin, supabaseUrl, supabasePublishableKey: env.SUPABASE_PUBLISHABLE_KEY };
}

export function runtimeUnavailableJson() {
  return new Response(JSON.stringify({ error: 'This deployment is not configured for account access.' }), {
    status: 503,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}
