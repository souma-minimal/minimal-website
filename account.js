// minimal Accounts uses Supabase Auth's public key only. The key is safe in a
// browser because every exposed table is protected by RLS policies.
(() => {
  const config = {
    url: 'https://etxroajblozqyjyvpcoo.supabase.co',
    publishableKey: 'sb_publishable_6xjW2XlBXj4tnbibzK1WWQ_30SUWF93'
  };
  const tokenKey = 'minimal-accounts-access-token';
  const refreshKey = 'minimal-accounts-refresh-token';
  const form = document.querySelector('[data-account-form]');
  const status = document.querySelector('[data-account-status]');
  const library = document.querySelector('[data-account-library]');
  const libraryItems = document.querySelector('[data-account-library-items]');
  const userLine = document.querySelector('[data-account-user]');
  const signOut = document.querySelector('[data-account-signout]');
  const signedIn = document.querySelector('[data-account-signed-in]');
  const signedInEmail = document.querySelector('[data-account-signed-in-email]');
  if (!form || !status || !library || !libraryItems || !userLine || !signOut || !signedIn || !signedInEmail) return;

  const language = () => document.documentElement.dataset.uiLanguage === 'en' ? 'en' : 'ja';
  const message = (ja, en) => {
    status.innerHTML = `<span class="dot"></span><span>${language() === 'en' ? en : ja}</span>`;
  };
  const headers = (token) => ({
    apikey: config.publishableKey,
    Authorization: `Bearer ${token || config.publishableKey}`,
    'Content-Type': 'application/json'
  });
  const getSessionFromHash = () => {
    // Supabase appends tokens after # for an implicit magic-link callback.
    // Read query parameters too so a browser/client that preserves them there
    // still completes the session instead of appearing signed out.
    const hash = new URLSearchParams(location.hash.slice(1));
    const query = new URLSearchParams(location.search);
    const accessToken = hash.get('access_token') || query.get('access_token');
    const refreshToken = hash.get('refresh_token') || query.get('refresh_token');
    if (!accessToken) return null;
    localStorage.setItem(tokenKey, accessToken);
    if (refreshToken) localStorage.setItem(refreshKey, refreshToken);
    history.replaceState({}, document.title, location.pathname);
    return accessToken;
  };
  const request = async (path, options = {}, token) => {
    const response = await fetch(`${config.url}${path}`, { ...options, headers: { ...headers(token), ...(options.headers || {}) } });
    if (!response.ok) throw new Error((await response.json().catch(() => ({}))).msg || 'Request failed');
    return response.status === 204 ? null : response.json();
  };
  const refreshSession = async () => {
    const refreshToken = localStorage.getItem(refreshKey);
    if (!refreshToken) throw new Error('No refresh token');
    const response = await fetch(`${config.url}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { apikey: config.publishableKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    if (!response.ok) throw new Error('Could not refresh session');
    const session = await response.json();
    localStorage.setItem(tokenKey, session.access_token);
    if (session.refresh_token) localStorage.setItem(refreshKey, session.refresh_token);
    return session.access_token;
  };
  const productName = (key) => ({
    'free-still-water': 'Still Water',
    'minimal-schedule': 'minimal Schedule',
    'terrain-dune': 'Terrain Studies — Dune',
    'terrain-ridge': 'Terrain Studies — Ridge',
    'terrain-tide': 'Terrain Studies — Tide',
    'terrain-stone': 'Terrain Studies — Stone',
    'terrain-moon': 'Terrain Studies — Moon',
    'terrain-fog': 'Terrain Studies — Fog'
  }[key] || key);
  const renderLibrary = async (accessToken) => {
    const user = await request('/auth/v1/user', {}, accessToken);
    await request('/rest/v1/profiles', {
      method: 'POST',
      headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
      body: JSON.stringify({ id: user.id })
    }, accessToken);
    const purchases = await request('/rest/v1/purchase_entitlements?select=product_key,granted_at&order=granted_at.desc', {}, accessToken);
    library.hidden = false;
    userLine.textContent = user.email || '';
    signedInEmail.textContent = user.email || '';
    form.hidden = true;
    signedIn.hidden = false;
    window.dispatchEvent(new CustomEvent('minimal-account-session', { detail: { email: user.email || '' } }));
    if (!purchases.length) {
      libraryItems.innerHTML = `<p class="account-empty"><span class="lang-ja">まだライブラリに商品はありません。これからこのメールアドレスで購入した商品は、ここに並びます。</span><span class="lang-en">Nothing is in your library yet. Products purchased with this email will appear here.</span></p>`;
    } else {
      libraryItems.innerHTML = purchases.map((purchase) => `<article><span>${productName(purchase.product_key)}</span><small>${new Date(purchase.granted_at).toLocaleDateString()}</small></article>`).join('');
    }
    message('ログインしました。あなたのライブラリを確認できます。', 'You are signed in. Your library is ready.');
  };
  const showError = (error) => {
    const detail = error && error.message ? error.message : '';
    message(`ログインを完了できませんでした。もう一度お試しください。${detail ? ` (${detail})` : ''}`, `We could not finish sign-in. Please try again.${detail ? ` (${detail})` : ''}`);
  };
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = new FormData(form).get('email')?.trim();
    if (!email) return;
    const button = form.querySelector('button');
    button.disabled = true;
    message('メールを送信しています…', 'Sending your email…');
    try {
      await request('/auth/v1/otp', {
        method: 'POST',
        // Cloudflare Pages canonicalizes /accounts.html to /accounts. Redirect
        // to that final URL directly so an auth fragment cannot be dropped by
        // an intermediate redirect before this script reads it.
        body: JSON.stringify({ email, create_user: true, redirect_to: `${location.origin}/accounts` })
      });
      message('メールを送りました。届いたリンクを開くと、このページにログインします。', 'Check your email. Open the link and you will return here signed in.');
    } catch (error) {
      showError(error);
    } finally {
      button.disabled = false;
    }
  });
  signOut.addEventListener('click', async () => {
    const accessToken = localStorage.getItem(tokenKey);
    if (accessToken) await request('/auth/v1/logout', { method: 'POST' }, accessToken).catch(() => null);
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(refreshKey);
    library.hidden = true;
    form.hidden = false;
    signedIn.hidden = true;
    message('ログアウトしました。', 'You are signed out.');
  });
  const accessToken = getSessionFromHash() || localStorage.getItem(tokenKey);
  if (accessToken) {
    renderLibrary(accessToken).catch(async () => {
      try {
        await renderLibrary(await refreshSession());
      } catch (error) {
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(refreshKey);
        showError(error);
      }
    });
  }
})();
