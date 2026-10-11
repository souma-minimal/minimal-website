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
  const sessionId = new URL(context.request.url).searchParams.get('session_id');
  if (!sessionId) return json({ error: 'Missing checkout session.' }, 400);
  if (!context.env.STRIPE_SECRET_KEY || !context.env.PRODUCT_ENTITLEMENTS) {
    return json({ error: 'Secure delivery is still being configured.' }, 503);
  }

  try {
    const rules = JSON.parse(context.env.PRODUCT_ENTITLEMENTS);
    const lineItems = await paidLineItems(sessionId, context.env.STRIPE_SECRET_KEY);
    const allowed = new Map();
    for (const line of lineItems) {
      const files = filesForPrice(rules, line.price?.id);
      for (const file of files) allowed.set(file.key, file);
    }
    if (!allowed.size) return json({ error: 'This purchase does not include a downloadable wallpaper.' }, 403);
    return json({ files: [...allowed.values()].map(file => ({ key: file.key, label: file.label })) });
  } catch (error) {
    return json({ error: error.message || 'Unable to verify this purchase.' }, 403);
  }
}
