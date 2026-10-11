# minimal Accounts — purchase and member research plan

## Live purchase flow

1. A visitor selects a free or paid product.
2. If they are not signed in, they are sent to minimal Accounts and the selected product is remembered locally.
3. After sign-in, the site creates a Stripe Checkout Session on the server with the Account ID as `client_reference_id`.
4. Stripe sends a verified completion event to `/api/stripe-webhook`.
5. The webhook writes `purchase_entitlements` for that Account, then sends the purchase email.
6. The library and delivery page can be opened immediately. The email also contains a secure download link for wallpaper files.

## Member survey — next small release

Keep the survey optional, skippable, and available from Accounts at any time. Do not block registration or checkout.

Suggested first questions:

- What are you here to make calmer? (`weekly planning`, `phone screen`, `both`, `something else`)
- Which product would help next? (`Todo`, `Finance`, `wallpapers`, `widgets`, `other`)
- May we contact you about early access? (`yes` / `no`)

Store answers against the signed-in `user_id` with row-level security: users can read and update only their own answer. Add aggregate-only reporting later; do not expose individual survey responses in browser analytics.
