import assert from 'node:assert/strict';
import { onRequestGet } from '../functions/api/library.js';

const origin = 'https://preview.example.test';
const serverKey = 'sb_secret_test_only';
const baseEnv = {
  MINIMAL_ENVIRONMENT: 'production',
  PUBLIC_SITE_URL: origin,
  SUPABASE_URL: 'https://test-project.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test_only',
  SUPABASE_SERVICE_ROLE_KEY: serverKey
};

function context(env = baseEnv) {
  return {
    env,
    request: new Request(`${origin}/api/library`, {
      headers: { authorization: 'Bearer test-user-token' }
    })
  };
}

async function withFetch(handler, callback) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = handler;
  try {
    await callback();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}

function assertServerKeyOnly(options) {
  assert.equal(options.headers.apikey, serverKey);
  assert.equal(options.headers.authorization, undefined);
}

await withFetch(async (url, options = {}) => {
  const value = String(url);
  if (value.endsWith('/auth/v1/user')) {
    assert.equal(options.headers.apikey, serverKey);
    assert.equal(options.headers.authorization, 'Bearer test-user-token');
    return jsonResponse({ id: '11111111-1111-1111-1111-111111111111', email: 'member@example.test', user_metadata: {} });
  }
  if (value.includes('/rest/v1/purchase_entitlements?')) {
    assertServerKeyOnly(options);
    return jsonResponse([]);
  }
  throw new Error(`Unexpected request: ${value}`);
}, async () => {
  const response = await onRequestGet(context());
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('x-minimal-library-source'), 'database');
  assert.deepEqual(await response.json(), []);
});

await withFetch(async (url, options = {}) => {
  const value = String(url);
  if (value.endsWith('/auth/v1/user')) return jsonResponse({ id: '11111111-1111-1111-1111-111111111111', email: 'member@example.test', user_metadata: {} });
  if (value.includes('/rest/v1/purchase_entitlements?')) {
    assertServerKeyOnly(options);
    return jsonResponse({ message: 'database unavailable' }, 500);
  }
  throw new Error(`Unexpected request: ${value}`);
}, async () => {
  const response = await onRequestGet(context());
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('x-minimal-library-source'), null);
  assert.deepEqual(await response.json(), { error: 'Library data is temporarily unavailable.' });
});

await withFetch(async (url, options = {}) => {
  const value = String(url);
  if (value.endsWith('/auth/v1/user')) return jsonResponse({ id: '11111111-1111-1111-1111-111111111111', email: 'member@example.test', user_metadata: {} });
  if (value.includes('/rest/v1/purchase_entitlements?')) {
    assertServerKeyOnly(options);
    return jsonResponse({ message: 'schema cache is refreshing' }, 404);
  }
  if (value.startsWith('https://api.stripe.com/v1/customers?')) return jsonResponse({ data: [] });
  throw new Error(`Unexpected request: ${value}`);
}, async () => {
  const response = await onRequestGet(context({
    ...baseEnv,
    STRIPE_CHECKOUT_KEY: 'rk_test_only',
    PRODUCT_ACCOUNT_ENTITLEMENTS: JSON.stringify({ price_test: 'free-still-water' })
  }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('x-minimal-library-source'), 'stripe-fallback');
  assert.deepEqual(await response.json(), []);
});

await withFetch(async (url, options = {}) => {
  const value = String(url);
  if (value.endsWith('/auth/v1/user')) {
    assert.equal(options.headers.authorization, 'Bearer test-user-token');
    return jsonResponse({ id: '11111111-1111-1111-1111-111111111111', user_metadata: {
      minimal_library: [{ product_key: 'free-still-water', stripe_checkout_session_id: 'cs_test_metadata', granted_at: '2026-10-19T00:00:00.000Z' }]
    } });
  }
  throw new Error(`Unexpected request: ${value}`);
}, async () => {
  const response = await onRequestGet(context());
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('x-minimal-library-source'), 'metadata');
  assert.equal((await response.json()).length, 1);
});

await withFetch(async (url) => {
  if (String(url).endsWith('/auth/v1/user')) return jsonResponse({ message: 'invalid token' }, 401);
  throw new Error(`Unexpected request: ${url}`);
}, async () => {
  const response = await onRequestGet(context());
  assert.equal(response.status, 401);
  assert.equal(response.headers.get('x-minimal-library-source'), null);
  assert.deepEqual(await response.json(), { error: 'Sign in is required.' });
});

console.log('library-api tests passed');
