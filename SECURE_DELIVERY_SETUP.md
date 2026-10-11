# Secure wallpaper delivery

This site now has Cloudflare Pages Functions that verify a completed Stripe Checkout session before streaming an original wallpaper from a private R2 bucket. The original PNG files must **not** remain in `assets/wallpapers/` when this is enabled.

## One-time Cloudflare setup

1. In Cloudflare, create a private R2 bucket named `minimal-private-wallpapers`. Do not enable public access.
2. Upload the original PNGs with these object keys:
   - `wallpapers/minimal-wallpaper-01-iphone.png` through `wallpapers/minimal-wallpaper-04-iphone.png`
   - `wallpapers/terrain-studies-01-dune-iphone.png` through `wallpapers/terrain-studies-06-fog-iphone.png`
3. Cloudflare Dashboard → Workers & Pages → `minimal-website` → Settings → Bindings: add the R2 bucket as `WALLPAPER_FILES`.
4. Settings → Variables and Secrets: add secret `STRIPE_SECRET_KEY` using a Stripe restricted key (`rk_live_...`) with Checkout Sessions read access. Never put this key in Git or in an HTML file.
5. Add `PRODUCT_ENTITLEMENTS` as a JSON variable. Map each Stripe Price ID to the files a buyer is entitled to. Example:

```json
{
  "price_for_dune": [{"key":"wallpapers/terrain-dune.png","label":"Dune"}],
  "price_for_terrain_pack": [
    {"key":"wallpapers/terrain-dune.png","label":"Dune"},
    {"key":"wallpapers/terrain-ridge.png","label":"Ridge"}
  ]
}
```

6. In each Stripe Payment Link, set the post-payment redirect URL to the relevant delivery page with this exact parameter:

```
https://minimal-website-djl.pages.dev/wallpaper-download.html?session_id={CHECKOUT_SESSION_ID}
```

For a pack, use `wallpaper-thanks.html` or `terrain-thanks.html` in the same way. Stripe replaces the placeholder after payment.

7. After testing one real or test-mode purchase, remove the original PNGs from `assets/wallpapers/` and deploy. Keep only the watermarked files in `assets/wallpapers/social-samples/` and `assets/social-samples/`.

## Important

This provides purchase-gated delivery, not DRM: a purchaser can still share a downloaded file. It prevents visitors and social-media viewers from directly downloading the original assets from the public site.
