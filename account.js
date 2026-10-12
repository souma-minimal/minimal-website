// minimal Accounts uses Supabase Auth's public key only. Passwords are sent
// directly to Supabase over HTTPS and are never written to browser storage.
(() => {
  const config = { url: 'https://etxroajblozqyjyvpcoo.supabase.co', publishableKey: 'sb_publishable_6xjW2XlBXj4tnbibzK1WWQ_30SUWF93' };
  const tokenKey = 'minimal-accounts-access-token';
  const refreshKey = 'minimal-accounts-refresh-token';
  const flowKey = 'minimal-accounts-auth-flow';
  const emailKey = 'minimal-accounts-email';
  const form = document.querySelector('[data-account-form]');
  const resetForm = document.querySelector('[data-account-reset-form]');
  const status = document.querySelector('[data-account-status]');
  const feedback = document.querySelector('[data-account-feedback]');
  const library = document.querySelector('[data-account-library]');
  const libraryItems = document.querySelector('[data-account-library-items]');
  const userLine = document.querySelector('[data-account-user]');
  const signOut = document.querySelector('[data-account-signout]');
  const signedIn = document.querySelector('[data-account-signed-in]');
  const signedInEmail = document.querySelector('[data-account-signed-in-email]');
  const confirmWrap = document.querySelector('[data-account-confirm-wrap]');
  const survey = document.querySelector('[data-account-survey]');
  const surveyForm = document.querySelector('[data-account-survey-form]');
  const surveyFeedback = document.querySelector('[data-account-survey-feedback]');
  const recoveryButton = document.querySelector('[data-account-recovery]');
  const modeButtons = [...document.querySelectorAll('[data-account-mode]')];
  const submitJa = document.querySelector('[data-account-submit-ja]');
  const submitEn = document.querySelector('[data-account-submit-en]');
  const formHelp = document.querySelector('[data-account-form-help]');
  if (!form || !resetForm || !status || !feedback || !library || !libraryItems || !userLine || !signOut || !signedIn || !signedInEmail) return;

  let mode = 'login';
  const language = () => document.documentElement.dataset.uiLanguage === 'en' ? 'en' : 'ja';
  const message = (ja, en, type = 'error') => {
    feedback.hidden = false;
    feedback.classList.toggle('is-info', type === 'info');
    feedback.textContent = language() === 'en' ? en : ja;
  };
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
    if (session.user?.email) localStorage.setItem(emailKey, session.user.email);
    return session.access_token;
  };
  const emailFromToken = (token) => {
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(payload)).email || '';
    } catch { return ''; }
  };
  const getCallbackSession = async () => {
    const hash = new URLSearchParams(location.hash.slice(1));
    const query = new URLSearchParams(location.search);
    const code = query.get('code');
    let accessToken = hash.get('access_token') || query.get('access_token');
    const refreshToken = hash.get('refresh_token') || query.get('refresh_token');
    // Supabase can return either an implicit-flow token in the URL fragment or
    // a PKCE `code` query parameter. Supporting both keeps confirmation and
    // password-recovery links reliable across dashboard and browser settings.
    const callbackType = hash.get('type') || query.get('type') || query.get('flow') || localStorage.getItem(flowKey);
    if (!accessToken && code) {
      const session = await request('/auth/v1/token?grant_type=pkce', { method: 'POST', body: JSON.stringify({ auth_code: code }) });
      accessToken = storeSession(session);
    }
    if (!accessToken) return { token: null, callbackType };
    localStorage.setItem(tokenKey, accessToken);
    if (refreshToken) localStorage.setItem(refreshKey, refreshToken);
    if (callbackType) localStorage.setItem(flowKey, callbackType);
    const email = emailFromToken(accessToken);
    if (email) localStorage.setItem(emailKey, email);
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
  const loadLibrary = async (accessToken) => {
    const response = await fetch('/api/library', {
      headers: { authorization: `Bearer ${accessToken}`, 'cache-control': 'no-store' }
    });
    if (!response.ok) throw new Error('Could not load library.');
    return response.json();
  };
  const surveyRequest = async (method, accessToken, data) => {
    const response = await fetch('/api/survey', {
      method,
      headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json', 'cache-control': 'no-store' },
      body: data ? JSON.stringify(data) : undefined
    });
    if (!response.ok) throw new Error('Could not load survey.');
    return response.json();
  };
  const loadSurvey = async (accessToken) => {
    if (!survey || !surveyForm) return;
    try {
      const response = await surveyRequest('GET', accessToken);
      survey.hidden = false;
      if (!response) return;
      surveyForm.elements.uses.value = response.uses || '';
      surveyForm.elements.interest.value = response.interest || '';
      surveyForm.elements.notes.value = response.notes || '';
    } catch { /* An optional survey must never block the library. */ }
  };
  const productName = (key) => ({ 'free-still-water': 'Still Water', 'minimal-schedule': 'minimal Schedule', 'terrain-dune': 'Terrain Studies — Dune', 'terrain-ridge': 'Terrain Studies — Ridge', 'terrain-tide': 'Terrain Studies — Tide', 'terrain-stone': 'Terrain Studies — Stone', 'terrain-moon': 'Terrain Studies — Moon', 'terrain-fog': 'Terrain Studies — Fog' }[key] || key);
  const showAccessForm = () => { form.hidden = false; resetForm.hidden = true; signedIn.hidden = true; };
  const showSignedInState = (email) => {
    library.hidden = false;
    userLine.textContent = email || '';
    signedInEmail.textContent = email || '';
    form.hidden = true;
    resetForm.hidden = true;
    signedIn.hidden = false;
    localStorage.removeItem(flowKey);
    window.dispatchEvent(new CustomEvent('minimal-account-session', { detail: { email: email || '' } }));
  };
  const renderLibrary = async (accessToken, knownUser = null) => {
    // Show the already-known account straight away. Waiting for /auth/v1/user
    // made a successful password sign-in look stalled when a region was slow.
    const cachedEmail = knownUser?.email || localStorage.getItem(emailKey) || emailFromToken(accessToken);
    if (cachedEmail) {
      localStorage.setItem(emailKey, cachedEmail);
      showSignedInState(cachedEmail);
    } else {
      const user = await request('/auth/v1/user', {}, accessToken);
      if (user.email) localStorage.setItem(emailKey, user.email);
      showSignedInState(user.email || '');
    }
    libraryItems.innerHTML = '<p class="account-empty"><span class="lang-ja">ライブラリを読み込んでいます…</span><span class="lang-en">Loading your library…</span></p>';
    // Entitlements are non-essential to authentication. Never make a member
    // wait for a database query before their signed-in state is visible.
    void loadLibrary(accessToken)
      .catch(async () => loadLibrary(await refreshSession()))
      .then((purchases) => {
        // Keep the full purchase history in the database for support and
        // accounting, but show each owned product only once in the library.
        // The newest successful checkout supplies the current delivery link.
        const ownedProducts = [...new Map(purchases.map((purchase) => [purchase.product_key, purchase])).values()];
        libraryItems.innerHTML = !ownedProducts.length
          ? `<p class="account-empty"><span class="lang-ja">まだライブラリに商品はありません。これからこのメールアドレスで購入した商品は、ここに並びます。</span><span class="lang-en">Nothing is in your library yet. Products purchased with this email will appear here.</span></p>`
          : ownedProducts.map((purchase) => {
            const isSchedule = purchase.product_key === 'minimal-schedule';
            const receiveUrl = isSchedule
              ? 'https://pointy-banjo-ec2.notion.site/minimal-Schedule-3f56585f3df380d4aa97dd49c6be32dd?source=copy_link'
              : `wallpaper-download.html?session_id=${encodeURIComponent(purchase.stripe_checkout_session_id)}&item=${encodeURIComponent(purchase.product_key)}`;
            const receiveText = isSchedule
              ? '<span class="lang-ja">Notionで開く ↗</span><span class="lang-en">OPEN IN NOTION ↗</span>'
              : '<span class="lang-ja">ダウンロード ↓</span><span class="lang-en">DOWNLOAD ↓</span>';
            return `<article><div><strong>${productName(purchase.product_key)}</strong><small>${new Date(purchase.granted_at).toLocaleDateString()}</small></div><a class="account-library-action" href="${receiveUrl}"${isSchedule ? ' target="_blank" rel="noopener"' : ''}>${receiveText}</a></article>`;
          }).join('');
      })
      .catch(() => {
        libraryItems.innerHTML = '<p class="account-empty"><span class="lang-ja">ライブラリを読み込めませんでした。ページを再読み込みしてください。</span><span class="lang-en">We could not load your library. Please refresh the page.</span></p>';
      });
    void loadSurvey(accessToken).catch(async () => loadSurvey(await refreshSession()));
    feedback.hidden = true;
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
      ? '<span class="lang-ja">10文字以上で設定してください。初回だけ確認メールを送ります。</span><span class="lang-en">Use at least 10 characters. We send one confirmation email.</span>'
      : '<span class="lang-ja">メールアドレスとパスワードでログインします。</span><span class="lang-en">Sign in with your email address and password.</span>';
    feedback.hidden = true;
  };
  const passwordMatches = (password, confirmation) => password.length >= 10 && password === confirmation;

  modeButtons.forEach((button) => button.addEventListener('click', () => setMode(button.dataset.accountMode)));
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const values = new FormData(form);
    const email = values.get('email')?.trim();
    const password = values.get('password') || '';
    const confirmation = values.get('passwordConfirm') || '';
    if (!email || !password) return;
    if (mode === 'signup' && !passwordMatches(password, confirmation)) { message('パスワードは10文字以上にし、確認用と同じものを入力してください。', 'Use at least 10 characters and make both passwords match.'); return; }
    const button = form.querySelector('.account-submit');
    button.disabled = true;
    try {
      if (mode === 'signup') {
        message('登録メールを送信しています…', 'Sending your confirmation email…', 'info');
        const signup = await request('/auth/v1/signup', { method: 'POST', body: JSON.stringify({ email, password, data: {}, redirect_to: `${location.origin}/accounts` }) });
        // Supabase deliberately returns a 200 response for an address that
        // already exists. An empty identities array is the safe signal that no
        // new account or confirmation email was created.
        if (signup.user && Array.isArray(signup.user.identities) && signup.user.identities.length === 0) {
          setMode('login');
          form.elements.email.value = email;
          message('このメールアドレスはすでに登録済みです。パスワードを設定していない場合は、下の「パスワードを忘れた／初めて設定する」を押してください。', 'This email already has an account. If you have not set a password, choose “Forgot or need to set a password?” below.', 'info');
          return;
        }
        form.reset();
        message('確認メールを送りました。メール内のリンクを一度だけ開くと登録が完了します。以後はメールとパスワードでログインできます。', 'We sent a confirmation email. Open its link once to finish. After that, sign in with your email and password.', 'info');
      } else {
        message('ログインしています…', 'Signing you in…', 'info');
        const session = await request('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password }) });
        form.reset();
        await renderLibrary(storeSession(session), session.user);
      }
    } catch (error) { showError(error); } finally { button.disabled = false; }
  });
  recoveryButton?.addEventListener('click', async () => {
    const email = form.elements.email.value.trim();
    if (!email) { message('先にメールアドレスを入力してください。', 'Enter your email address first.'); form.elements.email.focus(); return; }
    recoveryButton.disabled = true;
    try {
      // Keep the intended screen even if a mail client removes Supabase's
      // `type=recovery` parameter while opening the link.
      localStorage.setItem(flowKey, 'recovery');
      const redirect = new URL('/accounts', location.origin);
      redirect.searchParams.set('flow', 'recovery');
      await request('/auth/v1/recover', { method: 'POST', body: JSON.stringify({ email, redirect_to: redirect.toString() }) });
      message('パスワード設定用のメールを送りました。リンクを開いて新しいパスワードを設定してください。', 'We sent a password setup email. Open the link to set a new password.', 'info');
    } catch (error) { showError(error); } finally { recoveryButton.disabled = false; }
  });
  resetForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const values = new FormData(resetForm);
    const password = values.get('password') || '';
    const confirmation = values.get('passwordConfirm') || '';
    if (!passwordMatches(password, confirmation)) { message('パスワードは10文字以上にし、確認用と同じものを入力してください。', 'Use at least 10 characters and make both passwords match.'); return; }
    const button = resetForm.querySelector('.account-submit');
    button.disabled = true;
    try {
      const token = localStorage.getItem(tokenKey);
      if (!token) throw new Error('No active password-setup session');
      await request('/auth/v1/user', { method: 'PUT', body: JSON.stringify({ password }) }, token);
      resetForm.reset();
      await renderLibrary(token);
      message('パスワードを設定しました。次回からメールとパスワードでログインできます。', 'Your password is set. Next time, sign in with your email and password.', 'info');
    } catch (error) { showError(error); } finally { button.disabled = false; }
  });
  signOut.addEventListener('click', async () => {
    const accessToken = localStorage.getItem(tokenKey);
    if (accessToken) await request('/auth/v1/logout', { method: 'POST' }, accessToken).catch(() => null);
    localStorage.removeItem(tokenKey); localStorage.removeItem(refreshKey); localStorage.removeItem(flowKey); localStorage.removeItem(emailKey);
    library.hidden = true;
    if (survey) survey.hidden = true;
    showAccessForm(); message('ログアウトしました。', 'You are signed out.', 'info');
  });
  window.addEventListener('minimal-account-signout', () => {
    library.hidden = true;
    if (survey) survey.hidden = true;
    showAccessForm();
    message('ログアウトしました。', 'You are signed out.', 'info');
  });

  surveyForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const token = localStorage.getItem(tokenKey);
    if (!token || !surveyFeedback) return;
    const button = surveyForm.querySelector('button');
    button.disabled = true;
    surveyFeedback.textContent = language() === 'en' ? 'Saving…' : '保存しています…';
    surveyFeedback.classList.remove('is-error');
    try {
      await surveyRequest('POST', token, Object.fromEntries(new FormData(surveyForm)));
      surveyFeedback.textContent = language() === 'en' ? 'Saved. Thank you.' : '保存しました。ありがとうございます。';
    } catch {
      surveyFeedback.textContent = language() === 'en' ? 'Could not save. Please try again.' : '保存できませんでした。もう一度お試しください。';
      surveyFeedback.classList.add('is-error');
    } finally { button.disabled = false; }
  });

  (async () => {
    try {
      const callback = await getCallbackSession();
      const accessToken = callback.token || localStorage.getItem(tokenKey);
      if (accessToken && callback.callbackType === 'recovery') {
        form.hidden = true; resetForm.hidden = false;
        message('新しいパスワードを設定してください。', 'Set your new password.', 'info');
      } else if (accessToken) {
        renderLibrary(accessToken).catch(async () => {
          try { await renderLibrary(await refreshSession()); }
          catch (error) { localStorage.removeItem(tokenKey); localStorage.removeItem(refreshKey); localStorage.removeItem(emailKey); showAccessForm(); showError(error); }
        });
      }
    } catch (error) {
      localStorage.removeItem(tokenKey); localStorage.removeItem(refreshKey); localStorage.removeItem(emailKey);
      showAccessForm(); showError(error);
    }
  })();
})();
