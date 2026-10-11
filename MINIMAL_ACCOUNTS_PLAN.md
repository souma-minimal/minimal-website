# minimal Accounts — first-release plan

## Purpose

One passwordless account for every minimal product. It should let a customer find the digital items they own, safely re-download them, and later use Schedule, Todo and Finance with the same identity.

## Release 1

1. Email magic-link sign-in (no password storage).
2. A private library of verified Stripe purchases.
3. Per-item downloads issued through the existing private R2 delivery endpoint.
4. A minimal account record: stable user ID, email, creation time and consent timestamps only.

## Security rules

- Never trust a browser-provided product list or Stripe session ID as ownership proof.
- Stripe webhook events must update server-side purchase records; redirects remain a convenience, not the source of truth.
- R2 originals remain private. Download URLs are issued only after a server-side entitlement check.
- Store payment provider identifiers, not card or bank data.
- Give users a way to export or delete their account data.

## Required connection before real login

Choose and connect an authentication provider that supports passwordless email links and server-side session verification. After it is connected, add its credentials as encrypted Cloudflare Pages secrets, then implement the login callback and private `/account` route.
