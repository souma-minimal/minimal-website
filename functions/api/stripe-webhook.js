const stripeApi = 'https://api.stripe.com/v1';
const encoder = new TextEncoder();
const signatureToleranceSeconds = 300;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

function safeEqual(left, right) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return result === 0;
}

function stripeSignatureParts(header) {
  const parts = new Map();
  for (const part of header.split(',')) {
    const [key, value] = part.split('=');
    if (!key || !value) continue;
    const values = parts.get(key) || [];
    values.push(value);
    parts.set(key, values);
  }
  return parts;
}

async function isValidStripeSignature(payload, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;
  const parts = stripeSignatureParts(signatureHeader);
  const timestamp = Number(parts.get('t')?.[0]);
  const signatures = parts.get('v1') || [];
  if (!Number.isFinite(timestamp) || !signatures.length) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > signatureToleranceSeconds) return false;
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = await crypto.subtle.sign('HMAC', key, encoder.encode(`${timestamp}.${payload}`));
  const expected = [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  return signatures.some(signature => safeEqual(signature, expected));
}

async function stripeLineItems(sessionId, restrictedKey) {
  if (!/^[a-zA-Z0-9_]+$/.test(sessionId)) throw new Error('Invalid checkout session.');
  const response = await fetch(`${stripeApi}/checkout/sessions/${sessionId}/line_items?limit=100`, {
    headers: { authorization: `Basic ${btoa(`${restrictedKey}:`)}` }
  });
  if (!response.ok) throw new Error('Unable to retrieve checkout line items.');
  return (await response.json()).data || [];
}

async function userIdForEmail(supabaseUrl, serviceRoleKey, email) {
  // Auth's Admin endpoint is server-only. The small first release can safely
  // paginate the account list; future scale can replace this with a private
  // email-lookup function or an explicit purchase-account association.
  const wanted = email.trim().toLowerCase();
  for (let page = 1; page <= 20; page += 1) {
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=${page}&per_page=1000`, {
      headers: { apikey: serviceRoleKey, authorization: `Bearer ${serviceRoleKey}` }
    });
    if (!response.ok) throw new Error('Unable to find the account owner.');
    const body = await response.json();
    const users = body.users || [];
    const match = users.find(user => user.email?.trim().toLowerCase() === wanted);
    if (match) return match.id;
    if (users.length < 1000) break;
  }
  return null;
}

async function grantEntitlements({ supabaseUrl, serviceRoleKey, userId, sessionId, customerId, lines, productMap }) {
  const rows = lines
    .map(line => ({ priceId: line.price?.id, productKey: productMap[line.price?.id] }))
    .filter(line => line.priceId && line.productKey)
    .map(line => ({
      user_id: userId,
      stripe_checkout_session_id: sessionId,
      stripe_customer_id: customerId || null,
      stripe_price_id: line.priceId,
      product_key: line.productKey
    }));
  if (!rows.length) return 0;
  const response = await fetch(`${supabaseUrl}/rest/v1/purchase_entitlements?on_conflict=stripe_checkout_session_id,product_key`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      'content-type': 'application/json',
      Prefer: 'resolution=ignore-duplicates,return=minimal'
    },
    body: JSON.stringify(rows)
  });
  if (!response.ok) throw new Error('Unable to save purchase entitlement.');
  return rows.length;
}

export async function onRequestPost(context) {
  const { STRIPE_WEBHOOK_SECRET, STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PRODUCT_ACCOUNT_ENTITLEMENTS } = context.env;
  if (!STRIPE_WEBHOOK_SECRET || !STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !PRODUCT_ACCOUNT_ENTITLEMENTS) {
    return json({ error: 'Webhook delivery is not configured.' }, 503);
  }

  const rawBody = await context.request.text();
  const signature = context.request.headers.get('stripe-signature');
  if (!(await isValidStripeSignature(rawBody, signature, STRIPE_WEBHOOK_SECRET))) {
    return json({ error: 'Invalid signature.' }, 400);
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return json({ error: 'Invalid event payload.' }, 400);
  }
  if (!['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type)) return json({ received: true });

  const session = event.data?.object;
  if (!session?.id || session.payment_status === 'unpaid') return json({ received: true });
  const email = session.customer_details?.email || session.customer_email;
  if (!email) return json({ received: true, reason: 'No customer email.' });

  try {
    const productMap = JSON.parse(PRODUCT_ACCOUNT_ENTITLEMENTS);
    const userId = await userIdForEmail(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, email);
    if (!userId) return json({ received: true, reason: 'No matching account yet.' });
    const lines = await stripeLineItems(session.id, STRIPE_SECRET_KEY);
    const granted = await grantEntitlements({
      supabaseUrl: SUPABASE_URL,
      serviceRoleKey: SUPABASE_SERVICE_ROLE_KEY,
      userId,
      sessionId: session.id,
      customerId: session.customer || null,
      lines,
      productMap
    });
    return json({ received: true, granted });
  } catch {
    // Return a retryable failure without exposing payment, account, or secret details.
    return json({ error: 'Unable to process purchase.' }, 500);
  }
}
