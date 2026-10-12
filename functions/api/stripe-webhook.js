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
      Prefer: 'resolution=ignore-duplicates,return=representation'
    },
    body: JSON.stringify(rows)
  });
  if (!response.ok) throw new Error('Unable to save purchase entitlement.');
  return response.json();
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function productLabel(key) {
  return ({
    'free-still-water': 'Still Water', 'minimal-schedule': 'minimal Schedule',
    'nocturne-arc': 'Nocturne — Arc', 'nocturne-sphere': 'Nocturne — Sphere',
    'nocturne-monolith': 'Nocturne — Monolith', 'nocturne-light': 'Nocturne — Light',
    'terrain-dune': 'Terrain Studies — Dune', 'terrain-ridge': 'Terrain Studies — Ridge',
    'terrain-tide': 'Terrain Studies — Tide', 'terrain-stone': 'Terrain Studies — Stone',
    'terrain-moon': 'Terrain Studies — Moon', 'terrain-fog': 'Terrain Studies — Fog'
  }[key] || key);
}

function filesForPrice(rules, priceId) {
  return (rules?.[priceId] || []).map(file => typeof file === 'string' ? { key: file } : file).filter(file => file.key);
}

async function sendPurchaseEmail({ env, session, entitlementRows, lines, productMap }) {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) return false;
  const recipient = session.customer_details?.email || session.customer_email;
  if (!recipient || !entitlementRows.length) return false;
  const origin = env.PUBLIC_SITE_URL || 'https://minimal-website-djl.pages.dev';
  let fileRules = {};
  try { fileRules = JSON.parse(env.PRODUCT_ENTITLEMENTS || '{}'); } catch { /* Links remain available through the library. */ }
  const keys = [...new Set(entitlementRows.map(row => row.product_key))];
  const downloads = lines.flatMap(line => filesForPrice(fileRules, line.price?.id));
  const directDownloads = downloads.map(file => `${origin}/api/download?session_id=${encodeURIComponent(session.id)}&key=${encodeURIComponent(file.key)}`);
  const items = keys.map(productLabel).map(escapeHtml).join('<br>');
  const socialUrl = env.MINIMAL_SOCIAL_URL || `${origin}/#products`;
  const downloadBlock = directDownloads.length
    ? `<p style="margin:28px 0 12px">すぐに保存する場合は、下のリンクを開いてください。</p>${directDownloads.map((url, index) => `<p><a href="${url}" style="color:#fff;background:#111;padding:14px 18px;display:inline-block;text-decoration:none">${escapeHtml(keys[index] || 'Download')} をダウンロード</a></p>`).join('')}`
    : '';
  const html = `<div style="max-width:560px;margin:0 auto;padding:36px 24px;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;color:#171717;line-height:1.65"><p style="font-size:25px;font-weight:700;letter-spacing:-.05em;margin:0 0 34px">minimal.</p><p style="font-size:11px;letter-spacing:.12em;color:#757570">PURCHASE CONFIRMED / ご購入ありがとうございます</p><h1 style="font-size:32px;line-height:1.08;letter-spacing:-.06em;margin:12px 0 18px">あなたの新しい<br>余白が届きました。</h1><p>minimalを選んでいただき、ありがとうございます。購入内容は minimal Accounts のライブラリにもすぐ追加されます。</p><div style="border-top:1px solid #deded8;border-bottom:1px solid #deded8;padding:18px 0;margin:28px 0"><strong>今回の受け取り内容</strong><br>${items}</div><p><a href="${origin}/accounts.html" style="color:#fff;background:#111;padding:14px 18px;display:inline-block;text-decoration:none">ライブラリを開く</a></p>${downloadBlock}<div style="border-top:1px solid #deded8;margin-top:32px;padding-top:22px"><strong>次におすすめ</strong><p>静かな画面と、見通しのいい一週間を一緒に整えるプロダクトも用意しています。</p><p><a href="${origin}/#products" style="color:#171717">ほかの商品を見る →</a><br><a href="${socialUrl}" style="color:#171717">Instagram / Threads を見る →</a></p></div><p style="font-size:12px;color:#757570;margin-top:38px">minimal. — Less, but better.</p></div>`;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: env.EMAIL_FROM, to: [recipient], subject: 'minimal. — ご購入ありがとうございます', html })
  });
  return response.ok;
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
    const directUserId = session.client_reference_id || session.metadata?.minimal_account_id;
    const userId = directUserId || await userIdForEmail(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, email);
    if (!userId) return json({ received: true, reason: 'No matching account yet.' });
    const lines = await stripeLineItems(session.id, STRIPE_SECRET_KEY);
    const created = await grantEntitlements({
      supabaseUrl: SUPABASE_URL,
      serviceRoleKey: SUPABASE_SERVICE_ROLE_KEY,
      userId,
      sessionId: session.id,
      customerId: session.customer || null,
      lines,
      productMap
    });
    // The library insert is idempotent. A repeat free download should not add
    // duplicate cards, but it should still receive the confirmation email.
    const entitlementRows = created.length
      ? created
      : lines.map(line => ({ product_key: productMap[line.price?.id] })).filter(row => row.product_key);
    await sendPurchaseEmail({ env: context.env, session, entitlementRows, lines, productMap }).catch(() => false);
    return json({ received: true, granted: created.length });
  } catch {
    // Return a retryable failure without exposing payment, account, or secret details.
    return json({ error: 'Unable to process purchase.' }, 500);
  }
}
