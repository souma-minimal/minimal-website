// Account-bound checkout. A product can only be collected by a signed-in
// minimal Accounts member, so every Stripe session has an unambiguous owner.
(() => {
  const tokenKey = 'minimal-accounts-access-token';
  const checkoutKey = 'minimal-pending-checkout';
  const pendingFromUrl = new URLSearchParams(location.search).get('checkout');
  let isStarting = false;

  const copy = (ja, en) => (document.documentElement.dataset.uiLanguage === 'en' ? en : ja);
  const showNotice = (text) => {
    let notice = document.querySelector('[data-checkout-notice]');
    if (!notice) {
      notice = document.createElement('p');
      notice.dataset.checkoutNotice = '';
      notice.setAttribute('role', 'status');
      notice.style.cssText = 'margin:14px 0 0;font-size:12px;line-height:1.6;color:#6b6b66';
      const target = document.querySelector('[data-checkout-product]')?.parentElement || document.querySelector('main');
      target?.append(notice);
    }
    notice.textContent = text;
  };

  const goToAccounts = (productKey) => {
    localStorage.setItem(checkoutKey, productKey);
    const destination = new URL('accounts.html', location.href);
    destination.searchParams.set('checkout', productKey);
    location.assign(destination.toString());
  };

  const start = async (productKey) => {
    if (isStarting || !productKey) return;
    const token = localStorage.getItem(tokenKey);
    if (!token) { goToAccounts(productKey); return; }
    isStarting = true;
    showNotice(copy('安全な決済ページを開いています…', 'Opening secure checkout…'));
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_key: productKey })
      });
      const body = await response.json().catch(() => ({}));
      if (response.status === 401) { goToAccounts(productKey); return; }
      if (!response.ok || !body.url) throw new Error(body.error || 'Checkout is unavailable.');
      localStorage.removeItem(checkoutKey);
      location.assign(body.url);
    } catch (error) {
      isStarting = false;
      showNotice(copy('決済を開始できませんでした。少し時間をおいて、もう一度お試しください。', 'We could not start checkout. Please try again in a moment.'));
    }
  };

  document.addEventListener('click', (event) => {
    const link = event.target.closest('[data-checkout-product]');
    if (!link) return;
    event.preventDefault();
    start(link.dataset.checkoutProduct);
  });

  const resume = () => {
    const productKey = pendingFromUrl || localStorage.getItem(checkoutKey);
    if (!productKey || !localStorage.getItem(tokenKey)) return;
    const url = new URL(location.href);
    if (url.searchParams.has('checkout')) {
      url.searchParams.delete('checkout');
      history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
    }
    start(productKey);
  };

  window.addEventListener('minimal-account-session', resume);
  if (location.pathname.endsWith('/accounts') || location.pathname.endsWith('/accounts.html')) {
    window.setTimeout(resume, 0);
  }
  window.minimalStartCheckout = start;
})();
