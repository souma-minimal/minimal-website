// Shared, non-sensitive account affordance for every minimal page.
(() => {
  const tokenKey = 'minimal-accounts-access-token';
  const refreshKey = 'minimal-accounts-refresh-token';
  const flowKey = 'minimal-accounts-auth-flow';
  const emailKey = 'minimal-accounts-email';
  // If Supabase falls back to the Site URL, capture the implicit-flow token on
  // whichever page received it and immediately continue to Accounts. This
  // prevents a successful email sign-in from looking like a return to home.
  const callbackHash = new URLSearchParams(location.hash.slice(1));
  const callbackQuery = new URLSearchParams(location.search);
  const callbackToken = callbackHash.get('access_token') || callbackQuery.get('access_token');
  const callbackCode = callbackQuery.get('code');
  const callbackRefreshToken = callbackHash.get('refresh_token') || callbackQuery.get('refresh_token');
  const callbackFlow = callbackHash.get('type') || callbackQuery.get('type') || callbackQuery.get('flow');
  if (callbackToken) {
    localStorage.setItem(tokenKey, callbackToken);
    if (callbackRefreshToken) localStorage.setItem(refreshKey, callbackRefreshToken);
    if (callbackFlow) localStorage.setItem(flowKey, callbackFlow);
    try {
      const payload = callbackToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const email = JSON.parse(atob(payload)).email;
      if (email) localStorage.setItem(emailKey, email);
    } catch { /* The account page will validate the callback token. */ }
    if (!location.pathname.endsWith('/accounts') && !location.pathname.endsWith('/accounts.html')) {
      location.replace(`${location.origin}/accounts`);
      return;
    }
  }
  // PKCE links contain a one-time code instead of a token. Preserve it while
  // moving a Site URL fallback to Accounts, where account.js exchanges it.
  if (callbackCode && !location.pathname.endsWith('/accounts') && !location.pathname.endsWith('/accounts.html')) {
    const destination = new URL('/accounts', location.origin);
    destination.searchParams.set('code', callbackCode);
    if (callbackFlow) destination.searchParams.set('type', callbackFlow);
    location.replace(destination.toString());
    return;
  }
  const token = localStorage.getItem(tokenKey);
  const accountUrl = 'accounts.html';
  const languageKey = 'minimal-language';
  let language = localStorage.getItem(languageKey) || (navigator.language.toLowerCase().startsWith('ja') ? 'ja' : 'en');
  const apiKey = 'sb_publishable_6xjW2XlBXj4tnbibzK1WWQ_30SUWF93';
  const headers = accessToken => ({ apikey: apiKey, Authorization: `Bearer ${accessToken || apiKey}`, 'Content-Type': 'application/json' });
  const label = signedIn => signedIn ? (language === 'ja' ? '● ログイン中' : '● Signed in') : (language === 'ja' ? 'Accounts / ログイン' : 'Accounts / Sign in');
  const signOut = async () => {
    const accessToken = localStorage.getItem(tokenKey);
    if (accessToken) {
      await fetch('https://etxroajblozqyjyvpcoo.supabase.co/auth/v1/logout', { method: 'POST', headers: headers(accessToken) }).catch(() => null);
    }
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(refreshKey);
    localStorage.removeItem(flowKey);
    localStorage.removeItem(emailKey);
    addShortcut(false);
    window.dispatchEvent(new CustomEvent('minimal-account-signout'));
  };
  const addShortcut = (signedIn = false, email = '') => {
    document.querySelectorAll('[data-account-shortcut]').forEach(node => node.remove());
    document.querySelectorAll('[data-account-header-signout]').forEach(node => node.remove());
    const link = document.createElement('a');
    link.href = accountUrl;
    link.className = `account-shortcut${signedIn ? ' is-signed-in' : ''}`;
    link.dataset.accountShortcut = 'true';
    link.setAttribute('aria-label', signedIn ? 'minimal Accounts: signed in' : 'minimal Accounts');
    if (email) link.title = email;
    link.textContent = label(signedIn);
    if (signedIn && email) {
      const emailNode = document.createElement('span');
      emailNode.className = 'account-shortcut-email';
      emailNode.textContent = email;
      link.append(emailNode);
    }
    const header = document.querySelector('.header, .top');
    if (!header) return;
    const nav = header.querySelector('nav');
    const target = nav || header;
    target.append(link);
    if (signedIn) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'account-header-signout';
      button.dataset.accountHeaderSignout = 'true';
      button.textContent = language === 'ja' ? 'ログアウト' : 'Sign out';
      button.setAttribute('aria-label', language === 'ja' ? 'minimal Accountsからログアウト' : 'Sign out of minimal Accounts');
      button.addEventListener('click', () => { button.disabled = true; signOut().finally(() => { button.disabled = false; }); });
      target.append(button);
    }
  };
  const setText = (selector, ja, en) => {
    const node = document.querySelector(selector);
    if (node) node.innerHTML = language === 'ja' ? ja : en;
  };
  const translateDeliveryPage = () => {
    const path = location.pathname;
    if (path.endsWith('wallpaper-download.html') || path.endsWith('/wallpaper-download')) {
      setText('.buy-page .eyebrow', 'あなたの壁紙 / ダウンロード', 'YOUR WALLPAPER / DOWNLOAD');
      setText('.buy-page h1', '静かな<br>一枚の画面<span>.</span>', 'One quiet<br>screen<span>.</span>');
      setText('.buy-page .product-note', '決済後に原寸ファイルを受け取れます · 個人利用のみ · 再配布・再販売は禁止です。', 'ORIGINAL FILES ARE AVAILABLE AFTER PAYMENT · PERSONAL USE ONLY · DO NOT REDISTRIBUTE OR RESELL.');
    }
    if (path.endsWith('wallpaper-thanks.html')) {
      setText('.status', 'あなたのダウンロード', 'YOUR DOWNLOADS');
      setText('h1', '画面を、<br>もっと静かに<span class="dot">.</span>', 'Your screen<br>can be quieter<span class="dot">.</span>');
      setText('.intro:not([data-delivery-status])', '壁紙を選んで開き、写真に保存してからロック画面またはホーム画面に設定してください。', 'Tap a wallpaper below to open it, then save it to Photos and set it as your lock or home screen.');
      setText('.note', '個人利用のみです。再配布・再販売・他の商品への同梱は禁止です。', 'For personal use only. Please do not redistribute, resell, or include these files in another product.');
    }
    if (path.endsWith('terrain-thanks.html')) {
      setText('.status', 'あなたのダウンロード', 'YOUR DOWNLOADS');
      setText('h1', '画面に、<br>少しの余白を<span class="dot">.</span>', 'Your screen<br>has room<span class="dot">.</span>');
      setText('.intro:not([data-delivery-status])', '壁紙を選んで開き、写真に保存してからロック画面またはホーム画面に設定してください。', 'Tap a wallpaper below to open it, then save it to Photos and set it as your lock or home screen.');
      setText('.note', '個人利用のみです。再配布・再販売・他の商品への同梱は禁止です。', 'For personal use only. Please do not redistribute, resell, or include these files in another product.');
    }
  };
  const addLanguageControl = () => {
    if (document.querySelector('[data-language-choice]')) return;
    const header = document.querySelector('.header, .top');
    if (!header) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = language === 'ja' ? 'EN' : '日本語';
    button.setAttribute('aria-label', 'Change language');
    button.style.cssText = 'margin-left:16px;border:0;border-bottom:1px solid #777;background:transparent;padding:6px 0;color:inherit;font:10px/1 -apple-system,BlinkMacSystemFont,sans-serif;cursor:pointer';
    button.addEventListener('click', () => { language = language === 'ja' ? 'en' : 'ja'; localStorage.setItem(languageKey, language); translateDeliveryPage(); button.textContent = language === 'ja' ? 'EN' : '日本語'; });
    header.append(button);
  };
  const addMobileMenu = () => {
    const header = document.querySelector('.header');
    const nav = header?.querySelector('nav');
    if (!header || !nav || header.querySelector('[data-mobile-menu-toggle]')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mobile-menu-toggle';
    button.dataset.mobileMenuToggle = 'true';
    button.setAttribute('aria-label', language === 'ja' ? 'メニューを開く' : 'Open menu');
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = '<i></i><i></i>';
    const close = () => { header.classList.remove('is-mobile-menu-open'); button.setAttribute('aria-expanded', 'false'); };
    button.addEventListener('click', () => {
      const open = !header.classList.contains('is-mobile-menu-open');
      header.classList.toggle('is-mobile-menu-open', open);
      button.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', event => { if (event.target.closest('a,button')) close(); });
    document.addEventListener('click', event => { if (!header.contains(event.target)) close(); });
    header.append(button);
  };
  translateDeliveryPage();
  addLanguageControl();
  addMobileMenu();
  addShortcut(false);
  if (!token) return;
  // The email belongs to the signed-in session and is cached only to make the
  // header responsive. A background request below still validates the session.
  const cachedEmail = localStorage.getItem(emailKey);
  if (cachedEmail) addShortcut(true, cachedEmail);
  const refreshSession = async () => {
    const refreshToken = localStorage.getItem(refreshKey);
    if (!refreshToken) throw new Error('No refresh token');
    const response = await fetch('https://etxroajblozqyjyvpcoo.supabase.co/auth/v1/token?grant_type=refresh_token', {
      method: 'POST', headers: headers(), body: JSON.stringify({ refresh_token: refreshToken })
    });
    if (!response.ok) throw new Error('Could not refresh session');
    const session = await response.json();
    localStorage.setItem(tokenKey, session.access_token);
    if (session.refresh_token) localStorage.setItem(refreshKey, session.refresh_token);
    return session.access_token;
  };
  const getUser = async () => {
    let response = await fetch('https://etxroajblozqyjyvpcoo.supabase.co/auth/v1/user', { headers: headers(token) });
    if (!response.ok) {
      const refreshedAccessToken = await refreshSession();
      response = await fetch('https://etxroajblozqyjyvpcoo.supabase.co/auth/v1/user', { headers: headers(refreshedAccessToken) });
    }
    if (!response.ok) throw new Error('No active session');
    return response.json();
  };
  getUser()
    .then(user => {
      if (!user?.email) throw new Error('No user');
      localStorage.setItem(emailKey, user.email);
      addShortcut(true, user.email);
    })
    .catch(() => { localStorage.removeItem(tokenKey); localStorage.removeItem(refreshKey); localStorage.removeItem(emailKey); addShortcut(false); });
  window.addEventListener('minimal-account-session', event => addShortcut(true, event.detail?.email || ''));
})();
