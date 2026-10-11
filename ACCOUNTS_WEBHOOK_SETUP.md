# minimal Accounts — Stripe webhook setup

This is required before a new Stripe purchase can automatically appear in minimal Accounts.

The current checkout flow is account-bound: a visitor must sign in before a Stripe Checkout Session is created. The signed-in Account ID is set as Stripe's `client_reference_id`, so a completed payment can be added to the library without waiting for an email-address lookup.

## 1. Cloudflare Pages variables

In **minimal-website → Settings → Variables and Secrets → Production**, add:

| Name | Type | Value |
| --- | --- | --- |
| `SUPABASE_URL` | plain text | `https://etxroajblozqyjyvpcoo.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | encrypted secret | The **Secret key** from Supabase → Settings → API Keys. Never use the publishable key here. |
| `STRIPE_WEBHOOK_SECRET` | encrypted secret | The `whsec_…` signing secret created for the endpoint below. |
| `PRODUCT_ACCOUNT_ENTITLEMENTS` | plain text | A JSON map from Stripe **Price ID** to a minimal product key. |
| `STRIPE_CHECKOUT_KEY` | encrypted secret | A Stripe **restricted key** that can create Checkout Sessions and read Prices. Keep the existing read-only `STRIPE_SECRET_KEY` for download verification. |
| `RESEND_API_KEY` | encrypted secret, optional | Leave unset for now. Add it later only when a verified custom sender domain is ready for purchase-confirmation emails. |
| `EMAIL_FROM` | plain text, optional | Leave unset with `RESEND_API_KEY`. A verified sender such as `minimal. <hello@your-domain.com>` will be needed later. |
| `PUBLIC_SITE_URL` | plain text | `https://minimal-website-djl.pages.dev` (or the final custom domain). |
| `MINIMAL_SOCIAL_URL` | plain text, optional | Needed only when purchase emails are enabled later. Use a single public profile or link page. |

`STRIPE_SECRET_KEY` already exists and must remain a restricted key with Checkout Sessions read permission only. Never use a publishable key, service key, or full-secret `sk_…` key in the browser.

Example product map (replace every Price ID with the live ID from Stripe):

```json
{
  "price_123": "free-still-water",
  "price_456": "minimal-schedule",
  "price_789": "terrain-dune",
  "price_101": "nocturne-pack",
  "price_102": "terrain-pack"
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

1. Sign in to minimal Accounts, choose the free wallpaper, and continue through the $0 Checkout.
2. Verify the event delivery is `200` in Stripe and the product appears in the library immediately after the return page loads.
3. Verify the purchase email arrives from `minimal.` with a library link and a direct file-download button.
4. Repeat once with a **test-mode** paid Checkout before relying on a live paid product.

## How it is protected

- The endpoint validates the exact raw request body against Stripe's `Stripe-Signature` HMAC.
- It accepts only completed or asynchronously succeeded Checkout sessions; unpaid sessions receive no entitlement.
- The server retrieves actual line items from Stripe rather than trusting a browser-provided product list.
- The Supabase service key is an encrypted Cloudflare secret, never browser code.
- The database uses a unique checkout-session/product pair, so retried Stripe events do not create duplicate access.
- Purchase emails are sent only when the entitlement row was newly created, preventing duplicate webhook deliveries from sending duplicate thank-you emails.
