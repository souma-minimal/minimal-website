// minimal Accounts uses Supabase Auth's public key only. Passwords are sent
// directly to Supabase over HTTPS and are never written to browser storage.
(() => {
  const config = { url: 'https://etxroajblozqyjyvpcoo.supabase.co', publishableKey: 'sb_publishable_6xjW2XlBXj4tnbibzK1WWQ_30SUWF93' };
  const tokenKey = 'minimal-accounts-access-token';
  const refreshKey = 'minimal-accounts-refresh-token';
  const flowKey = 'minimal-accounts-auth-flow';
  const form = document.querySelector('[data-account-form]');
  const resetForm = document.querySelector('[data-account-reset-form]');
  const status = document.querySelector('[data-account-status]');
  const library = document.querySelector('[data-account-library]');
  const libraryItems = document.querySelector('[data-account-library-items]');
  const userLine = document.querySelector('[data-account-user]');
  const signOut = document.querySelector('[data-account-signout]');
  const signedIn = document.querySelector('[data-account-signed-in]');
  const signedInEmail = document.querySelector('[data-account-signed-in-email]');
  const confirmWrap = document.querySelector('[data-account-confirm-wrap]');
  const recoveryButton = document.querySelector('[data-account-recovery]');
  const modeButtons = [...document.querySelectorAll('[data-account-mode]')];
  const submitJa = document.querySelector('[data-account-submit-ja]');
  const submitEn = document.querySelector('[data-account-submit-en]');
  const formHelp = document.querySelector('[data-account-form-help]');
  if (!form || !resetForm || !status || !library || !libraryItems || !userLine || !signOut || !signedIn || !signedInEmail) return;

  let mode = 'login';
  const language = () => document.documentElement.dataset.uiLanguage === 'en' ? 'en' : 'ja';
  const message = (ja, en) => { status.innerHTML = `<span class="dot"></span><span>${language() === 'en' ? en : ja}</span>`; };
  const authHeaders = (token) => ({ apikey: config.publishableKey, Authorization: `Bearer ${token || config.publishableKey}`, 'Content-Type': 'application/json' });
  const request = async (path, options = {}, token) => {
    const response = await fetch(`${config.url}${path}`, { ...options, headers: { ...authHeaders(token), ...(options.headers || {}) } });
    if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.msg || body.message || 'Request failed'); }
    return response.status === 204 ? null : response.json();
  };
  const storeSession = (session) => {
    if (!session?.access_token) throw new Error('No session returned');
    localStorage.setItem(tokenKey, session.access_token);
    if (session.refresh_token) localStorage.setItem(refreshKey, session.refresh_token);
    return session.access_token;
  };
  const getCallbackSession = () => {
    const hash = new URLSearchParams(location.hash.slice(1));
    const query = new URLSearchParams(location.search);
    const accessToken = hash.get('access_token') || query.get('access_token');
    const refreshToken = hash.get('refresh_token') || query.get('refresh_token');
    const callbackType = hash.get('type') || query.get('type') || localStorage.getItem(flowKey);
    if (!accessToken) return { token: null, callbackType };
    localStorage.setItem(tokenKey, accessToken);
    if (refreshToken) localStorage.setItem(refreshKey, refreshToken);
    if (callbackType) localStorage.setItem(flowKey, callbackType);
    history.replaceState({}, document.title, location.pathname);
    return { token: accessToken, callbackType };
  };
  const refreshSession = async () => {
    const refreshToken = localStorage.getItem(refreshKey);
    if (!refreshToken) throw new Error('No refresh token');
    const response = await fetch(`${config.url}/auth/v1/token?grant_type=refresh_token`, { method: 'POST', headers: { apikey: config.publishableKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: refreshToken }) });
    if (!response.ok) throw new Error('Could not refresh session');
    return storeSession(await response.json());
  };
  const productName = (key) => ({ 'free-still-water': 'Still Water', 'minimal-schedule': 'minimal Schedule', 'terrain-dune': 'Terrain Studies — Dune', 'terrain-ridge': 'Terrain Studies — Ridge', 'terrain-tide': 'Terrain Studies — Tide', 'terrain-stone': 'Terrain Studies — Stone', 'terrain-moon': 'Terrain Studies — Moon', 'terrain-fog': 'Terrain Studies — Fog' }[key] || key);
  const showAccessForm = () => { form.hidden = false; resetForm.hidden = true; signedIn.hidden = true; };
  const renderLibrary = async (accessToken) => {
    const user = await request('/auth/v1/user', {}, accessToken);
    await request('/rest/v1/profiles', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' }, body: JSON.stringify({ id: user.id }) }, accessToken);
    const purchases = await request('/rest/v1/purchase_entitlements?select=product_key,granted_at&order=granted_at.desc', {}, accessToken);
    library.hidden = false;
    userLine.textContent = user.email || '';
    signedInEmail.textContent = user.email || '';
    form.hidden = true;
    resetForm.hidden = true;
    signedIn.hidden = false;
    localStorage.removeItem(flowKey);
    window.dispatchEvent(new CustomEvent('minimal-account-session', { detail: { email: user.email || '' } }));
    libraryItems.innerHTML = !purchases.length
      ? `<p class="account-empty"><span class="lang-ja">まだライブラリに商品はありません。これからこのメールアドレスで購入した商品は、ここに並びます。</span><span class="lang-en">Nothing is in your library yet. Products purchased with this email will appear here.</span></p>`
      : purchases.map((purchase) => `<article><span>${productName(purchase.product_key)}</span><small>${new Date(purchase.granted_at).toLocaleDateString()}</small></article>`).join('');
    message('ログインしました。あなたのライブラリを確認できます。', 'You are signed in. Your library is ready.');
  };
  const showError = (error) => { const detail = error?.message || ''; message(`完了できませんでした。入力内容を確認してもう一度お試しください。${detail ? ` (${detail})` : ''}`, `We could not complete that. Check your details and try again.${detail ? ` (${detail})` : ''}`); };
  const setMode = (nextMode) => {
    mode = nextMode;
    const signup = mode === 'signup';
    modeButtons.forEach((button) => button.setAttribute('aria-selected', String(button.dataset.accountMode === mode)));
    confirmWrap.hidden = !signup;
    form.elements.password.autocomplete = signup ? 'new-password' : 'current-password';
    form.elements.passwordConfirm.required = signup;
    submitJa.textContent = signup ? '登録してメールを確認' : 'ログイン';
    submitEn.textContent = signup ? 'CREATE & VERIFY EMAIL' : 'SIGN IN';
    formHelp.innerHTML = signup
      ? '<span class="lang-ja">初回だけ確認メールを送ります。メール内のリンクを開けば登録完了です。</span><span class="lang-en">We send one confirmation email. Open its link once to finish registering.</span>'
      : '<span class="lang-ja">メールアドレスとパスワードでログインします。</span><span class="lang-en">Sign in with your email address and password.</span>';
  };
  const passwordMatches = (password, confirmation) => password.length >= 12 && password === confirmation;

  modeButtons.forEach((button) => button.addEventListener('click', () => setMode(button.dataset.accountMode)));
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const values = new FormData(form);
    const email = values.get('email')?.trim();
    const password = values.get('password') || '';
    const confirmation = values.get('passwordConfirm') || '';
    if (!email || !password) return;
    if (mode === 'signup' && !passwordMatches(password, confirmation)) { message('パスワードは12文字以上にし、確認用と同じものを入力してください。', 'Use at least 12 characters and make both passwords match.'); return; }
    const button = form.querySelector('.account-submit');
    button.disabled = true;
    try {
      if (mode === 'signup') {
        message('登録メールを送信しています…', 'Sending your confirmation email…');
        await request('/auth/v1/signup', { method: 'POST', body: JSON.stringify({ email, password, data: {}, redirect_to: `${location.origin}/accounts` }) });
        form.reset();
        message('確認メールを送りました。メール内のリンクを一度だけ開くと登録が完了します。以後はメールとパスワードでログインできます。', 'We sent a confirmation email. Open its link once to finish. After that, sign in with your email and password.');
      } else {
        message('ログインしています…', 'Signing you in…');
        const session = await request('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password }) });
        form.reset();
        await renderLibrary(storeSession(session));
      }
    } catch (error) { showError(error); } finally { button.disabled = false; }
  });
  recoveryButton?.addEventListener('click', async () => {
    const email = form.elements.email.value.trim();
    if (!email) { message('先にメールアドレスを入力してください。', 'Enter your email address first.'); form.elements.email.focus(); return; }
    recoveryButton.disabled = true;
    try {
      await request('/auth/v1/recover', { method: 'POST', body: JSON.stringify({ email, redirect_to: `${location.origin}/accounts` }) });
      message('パスワード設定用のメールを送りました。リンクを開いて新しいパスワードを設定してください。', 'We sent a password setup email. Open the link to set a new password.');
    } catch (error) { showError(error); } finally { recoveryButton.disabled = false; }
  });
  resetForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const values = new FormData(resetForm);
    const password = values.get('password') || '';
    const confirmation = values.get('passwordConfirm') || '';
    if (!passwordMatches(password, confirmation)) { message('パスワードは12文字以上にし、確認用と同じものを入力してください。', 'Use at least 12 characters and make both passwords match.'); return; }
    const button = resetForm.querySelector('.account-submit');
    button.disabled = true;
    try {
      const token = localStorage.getItem(tokenKey);
      if (!token) throw new Error('No active password-setup session');
      await request('/auth/v1/user', { method: 'PUT', body: JSON.stringify({ password }) }, token);
      resetForm.reset();
      await renderLibrary(token);
      message('パスワードを設定しました。次回からメールとパスワードでログインできます。', 'Your password is set. Next time, sign in with your email and password.');
    } catch (error) { showError(error); } finally { button.disabled = false; }
  });
  signOut.addEventListener('click', async () => {
    const accessToken = localStorage.getItem(tokenKey);
    if (accessToken) await request('/auth/v1/logout', { method: 'POST' }, accessToken).catch(() => null);
    localStorage.removeItem(tokenKey); localStorage.removeItem(refreshKey); localStorage.removeItem(flowKey);
    library.hidden = true; showAccessForm(); message('ログアウトしました。', 'You are signed out.');
  });

  const callback = getCallbackSession();
  const accessToken = callback.token || localStorage.getItem(tokenKey);
  if (accessToken && callback.callbackType === 'recovery') {
    form.hidden = true; resetForm.hidden = false;
    message('新しいパスワードを設定してください。', 'Set your new password.');
  } else if (accessToken) {
    renderLibrary(accessToken).catch(async () => {
      try { await renderLibrary(await refreshSession()); }
      catch (error) { localStorage.removeItem(tokenKey); localStorage.removeItem(refreshKey); showAccessForm(); showError(error); }
    });
  }
})();
