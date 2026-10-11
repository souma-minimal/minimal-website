# minimal Accounts — Stripe webhook setup

This is required before a new Stripe purchase can automatically appear in minimal Accounts.

## 1. Cloudflare Pages variables

In **minimal-website → Settings → Variables and Secrets → Production**, add:

| Name | Type | Value |
| --- | --- | --- |
| `SUPABASE_URL` | plain text | `https://etxroajblozqyjyvpcoo.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | encrypted secret | The **Secret key** from Supabase → Settings → API Keys. Never use the publishable key here. |
| `STRIPE_WEBHOOK_SECRET` | encrypted secret | The `whsec_…` signing secret created for the endpoint below. |
| `PRODUCT_ACCOUNT_ENTITLEMENTS` | plain text | A JSON map from Stripe **Price ID** to a minimal product key. |

`STRIPE_SECRET_KEY` already exists and must remain a restricted key with Checkout Sessions read permission only.

Example product map (replace every Price ID with the live ID from Stripe):

```json
{
  "price_123": "free-still-water",
  "price_456": "minimal-schedule",
  "price_789": "terrain-dune"
}
```

## 2. Stripe event destination

In **Stripe Dashboard → Developers → Webhooks**, create an endpoint:

`https://minimal-website-djl.pages.dev/api/stripe-webhook`

Listen for exactly these events:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`

Copy the endpoint's `whsec_…` signing secret into the Cloudflare `STRIPE_WEBHOOK_SECRET` secret. Do not put it in source code or in a plain-text variable.

## 3. Test safely

1. Sign in to minimal Accounts using the same email address that will be used at Stripe Checkout.
2. Complete a **test-mode** Checkout, using a test-mode endpoint and test-mode configuration where possible.
3. Verify the event delivery is `200` in Stripe and the product appears in the library.
4. Only then configure the production endpoint/secrets and make a small real purchase or free Checkout verification.

## How it is protected

- The endpoint validates the exact raw request body against Stripe's `Stripe-Signature` HMAC.
- It accepts only completed or asynchronously succeeded Checkout sessions; unpaid sessions receive no entitlement.
- The server retrieves actual line items from Stripe rather than trusting a browser-provided product list.
- The Supabase service key is an encrypted Cloudflare secret, never browser code.
- The database uses a unique checkout-session/product pair, so retried Stripe events do not create duplicate access.
