// Shared, non-sensitive account affordance for every minimal page.
(() => {
  const tokenKey = 'minimal-accounts-access-token';
  const token = localStorage.getItem(tokenKey);
  const accountUrl = 'accounts.html';
  const languageKey = 'minimal-language';
  let language = localStorage.getItem(languageKey) || (navigator.language.toLowerCase().startsWith('ja') ? 'ja' : 'en');
  const headers = { apikey: 'sb_publishable_6xjW2XlBXj4tnbibzK1WWQ_30SUWF93', Authorization: `Bearer ${token || 'sb_publishable_6xjW2XlBXj4tnbibzK1WWQ_30SUWF93'}` };
  const label = signedIn => signedIn ? '● Accounts' : 'Accounts';
  const addShortcut = (signedIn = false) => {
    document.querySelectorAll('[data-account-shortcut]').forEach(node => node.remove());
    const link = document.createElement('a');
    link.href = accountUrl;
    link.className = `account-shortcut${signedIn ? ' is-signed-in' : ''}`;
    link.dataset.accountShortcut = 'true';
    link.setAttribute('aria-label', signedIn ? 'minimal Accounts: signed in' : 'minimal Accounts');
    link.innerHTML = label(signedIn);
    const header = document.querySelector('.header, .top');
    if (!header) return;
    const nav = header.querySelector('nav');
    if (nav) nav.append(link); else header.append(link);
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
  translateDeliveryPage();
  addLanguageControl();
  addShortcut(false);
  if (!token) return;
  fetch('https://etxroajblozqyjyvpcoo.supabase.co/auth/v1/user', { headers })
    .then(response => response.ok ? response.json() : Promise.reject())
    .then(user => { if (!user?.email) throw new Error('No user'); addShortcut(true); })
    .catch(() => localStorage.removeItem(tokenKey));
})();
