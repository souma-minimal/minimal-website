# minimal Accounts — first-release plan

## Purpose

One passwordless account for every minimal product. It should let a customer find the digital items they own, safely re-download them, and later use Schedule, Todo and Finance with the same identity.

## Release 1

1. Email magic-link sign-in (no password storage).
2. A private library of verified Stripe purchases.
3. Per-item downloads issued through the existing private R2 delivery endpoint.
4. A minimal account record: stable user ID, email, creation time and consent timestamps only.

## Current foundation

- Supabase project: `minimal-accounts` (free plan, Northeast Asia).
- Passwordless email provider is enabled. The only approved production redirect is `https://minimal-website-djl.pages.dev/accounts.html`.
- `profiles` and `purchase_entitlements` have RLS enabled. Customers can read only their own records; browsers cannot create or change entitlements.
- The public Accounts page can send magic links and show the signed-in customer's library. A verified Stripe-to-entitlement webhook is implemented in source and awaits its encrypted Cloudflare secrets and Stripe event destination.

## Security rules

- Never trust a browser-provided product list or Stripe session ID as ownership proof.
- Stripe webhook events must update server-side purchase records; redirects remain a convenience, not the source of truth.
- R2 originals remain private. Download URLs are issued only after a server-side entitlement check.
- Store payment provider identifiers, not card or bank data.
- Give users a way to export or delete their account data.

## Required connection before real login

Implement a Stripe webhook that verifies `checkout.session.completed`, associates the purchase with the signed-in account (or securely supports a later claim), and writes the entitlement from a server-only environment. Never use a browser-provided product list or a Supabase secret key for this step.
