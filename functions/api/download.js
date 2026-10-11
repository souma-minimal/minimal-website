const stripeApi = 'https://api.stripe.com/v1';

function message(text, status) {
  return new Response(text, { status, headers: { 'cache-control': 'no-store' } });
}

function filesForPrice(rules, priceId) {
  return (rules[priceId] || []).map(file => typeof file === 'string'
    ? { key: file, label: file.split('/').pop() }
    : file);
}

async function paidLineItems(sessionId, secret) {
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
  return (await items.json()).data || [];
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const sessionId = url.searchParams.get('session_id');
  const key = url.searchParams.get('key');
  if (!sessionId || !key || key.includes('..') || !key.startsWith('wallpapers/')) return message('Invalid download request.', 400);
  if (!context.env.STRIPE_SECRET_KEY || !context.env.PRODUCT_ENTITLEMENTS || !context.env.WALLPAPER_FILES) {
    return message('Secure delivery is still being configured.', 503);
  }

  try {
    const rules = JSON.parse(context.env.PRODUCT_ENTITLEMENTS);
    const lineItems = await paidLineItems(sessionId, context.env.STRIPE_SECRET_KEY);
    const hasAccess = lineItems.some(line => filesForPrice(rules, line.price?.id).some(file => file.key === key));
    if (!hasAccess) return message('This purchase does not include this file.', 403);
    const object = await context.env.WALLPAPER_FILES.get(key);
    if (!object) return message('File not found.', 404);
    const name = key.split('/').pop();
    return new Response(object.body, {
      headers: {
        'content-type': object.httpMetadata?.contentType || 'image/png',
        'content-disposition': `attachment; filename="${name}"`,
        'cache-control': 'private, no-store',
        'x-content-type-options': 'nosniff'
      }
    });
  } catch (error) {
    return message(error.message || 'Unable to verify this purchase.', 403);
  }
}
