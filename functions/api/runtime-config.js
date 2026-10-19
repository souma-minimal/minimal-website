import { runtimeConfiguration, runtimeUnavailableJson } from '../_lib/runtime-config.js';

// This is intentionally the only runtime configuration exposed to browser
// code. It never serialises server-only keys, Stripe keys, or R2 bindings.
export async function onRequestGet(context) {
  const runtime = runtimeConfiguration(context.env, context.request);
  if (!runtime.ok) return runtimeUnavailableJson();
  return new Response(JSON.stringify({
    environment: runtime.environment,
    supabaseUrl: runtime.supabaseUrl,
    supabasePublishableKey: runtime.supabasePublishableKey
  }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff'
    }
  });
}
