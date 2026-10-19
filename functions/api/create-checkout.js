import { runtimeConfiguration, runtimeUnavailableJson } from '../_lib/runtime-config.js';

const stripeApi = 'https://api.stripe.com/v1';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

function stripeHeaders(key) {
  return { authorization: `Basic ${btoa(`${key}:`)}`, 'content-type': 'application/x-www-form-urlencoded' };
}

async function currentUser(request, supabaseUrl, serviceKey) {
  const authorization = request.headers.get('authorization') || '';
  if (!authorization.startsWith('Bearer ')) return null;
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: serviceKey, authorization }
  });
  return response.ok ? response.json() : null;
}

function findPrice(productMap, productKey) {
  return Object.entries(productMap).find(([, key]) => key === productKey)?.[0] || null;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const runtime = runtimeConfiguration(env, request, { stripe: true });
  if (!runtime.ok) return runtimeUnavailableJson();
  const origin = new URL(request.url).origin;
  const checkoutKey = env.STRIPE_CHECKOUT_KEY || env.STRIPE_SECRET_KEY;
  if (!checkoutKey || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !env.PRODUCT_ACCOUNT_ENTITLEMENTS) {
    return json({ error: 'Checkout is still being configured.' }, 503);
  }

  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid request.' }, 400); }
  const productKey = typeof body.product_key === 'string' ? body.product_key : '';
  const user = await currentUser(request, env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  if (!user?.id || !user.email) return json({ error: 'Please sign in before checkout.' }, 401);

  let productMap;
  try { productMap = JSON.parse(env.PRODUCT_ACCOUNT_ENTITLEMENTS); } catch { return json({ error: 'Product setup is invalid.' }, 503); }
  const priceId = findPrice(productMap, productKey);
  if (!priceId) return json({ error: 'This product is not ready for checkout.' }, 404);

  const deliveryPage = productKey === 'minimal-schedule' ? 'thanks.html' : 'wallpaper-download.html';
  const successUrl = new URL(`/${deliveryPage}`, origin);
  successUrl.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}');
  successUrl.searchParams.set('item', productKey);
  const params = new URLSearchParams({
    mode: 'payment',
    success_url: successUrl.toString(),
    cancel_url: new URL('/accounts.html', origin).toString(),
    client_reference_id: user.id,
    customer_email: user.email,
    'metadata[minimal_account_id]': user.id,
    'metadata[product_key]': productKey,
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1'
  });

  const response = await fetch(`${stripeApi}/checkout/sessions`, {
    method: 'POST', headers: stripeHeaders(checkoutKey), body: params.toString()
  });
  const session = await response.json().catch(() => ({}));
  if (!response.ok || !session.url) return json({ error: 'Checkout is unavailable.' }, 502);
  return json({ url: session.url });
}
