// Public, display-only product catalog.
// Checkout never trusts this file: its server-side Price ID map remains the
// authority for the amount charged. Keeping all customer-facing labels here
// prevents product pages and the home page from drifting apart.
window.MINIMAL_CATALOG = Object.freeze({
  schedule: Object.freeze({ key: 'minimal-schedule', price: '$7', files: 0, kind: 'notion' }),
  nocturne: Object.freeze({ key: 'nocturne-pack', price: '$3.99', individualPrice: '$1.49', files: 4, kind: 'wallpaper' }),
  terrain: Object.freeze({ key: 'terrain-studies', price: '$4.99', individualPrice: '$1.49', files: 6, kind: 'wallpaper' }),
  stillWater: Object.freeze({ key: 'free-still-water', price: '$0', files: 1, kind: 'wallpaper' })
});
