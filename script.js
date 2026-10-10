// minimal. quiet by design
// The copy is authored in Japanese and English so visitors never have to rely
// on browser machine translation for product or purchase information.
(() => {
  const storageKey = 'minimal-language';
  const choices = document.querySelectorAll('[data-language-choice]');
  if (!choices.length) return;

  const initial = localStorage.getItem(storageKey) ||
    (navigator.language.toLowerCase().startsWith('ja') ? 'ja' : 'en');

  const setLanguage = (language) => {
    document.documentElement.dataset.uiLanguage = language;
    document.documentElement.lang = language;
    choices.forEach((choice) => {
      choice.setAttribute('aria-pressed', String(choice.dataset.languageChoice === language));
    });
    localStorage.setItem(storageKey, language);
    document.querySelectorAll('[data-i18n-ja]').forEach((element) => {
      element.innerHTML = language === 'ja' ? element.dataset.i18nJa : element.dataset.i18nEn;
    });
  };

  const translate = (selector, japanese) => {
    const element = document.querySelector(selector);
    if (!element) return;
    element.dataset.i18nEn = element.innerHTML;
    element.dataset.i18nJa = japanese;
  };
  if (location.pathname.endsWith('terrain.html') || location.pathname.endsWith('/terrain')) {
    translate('[data-i18n="nav-products"]', '商品');
    translate('[data-i18n="nav-wallpapers"]', '壁紙');
    translate('[data-i18n="nav-about"]', 'ブランドについて');
    translate('.terrain-lead', '自然のかたち。<br>情報を邪魔しない、<br>静かな壁紙。');
    translate('.terrain-note', '砂丘・尾根・潮・石・月・霧を、白黒とグレーだけで描いた6枚のiPhone壁紙。時刻や日付、必要な情報が見やすい余白を残しています。');
    translate('.terrain-detail h2', '自然を、<br>必要なぶんだけ。');
    translate('.terrain-detail p', 'すべてのデザインは画面下部から始まります。上部には時刻や通知が見やすい余白を残し、壁紙は飾りではなく毎日使いやすい背景になります。');
    translate('.custom-copy h2', 'まずは、<br>一枚選んでみる。');
    translate('.custom-copy p:not(.eyebrow):not(.choice-label)', '購入前に、実際のホーム画面で見え方を試せます。パックには6枚すべて入っています。ここでは、最初に使いたい一枚を見つけてください。');
    translate('.terrain-cta h2', 'スマホ画面に、<br>少しの余白を。');
  }
  if (location.pathname.endsWith('wallpaper.html') || location.pathname.endsWith('/wallpaper')) {
    translate('[data-i18n="nav-products"]', '商品');
    translate('[data-i18n="nav-about"]', 'ブランドについて');
    translate('.wallpaper-lead', '毎日手に取るスマホのための、<br>4枚の静かな壁紙。');
    translate('.wallpaper-hero .muted', '黒・グレー・白だけで構成したiPhone用モノクロ壁紙です。時刻やアプリを邪魔せず、画面と注意を静かに整えます。');
    translate('.in-use h2', 'アプリと一緒に<br>使うための壁紙。');
    translate('.in-use p:not(.eyebrow)', '毎日使うホーム画面での見え方を確認できます。時計・ウィジェット・アプリが見やすい、静かな背景です。');
    translate('.wallpaper-detail h2', '余計なものはなく、<br>画面はもっと静かに。');
    translate('.wallpaper-detail p', 'iPhoneのロック画面とホーム画面向けに作りました。色も名言も装飾もありません。必要な情報の下に、静かな背景だけを置きます。');
    translate('.wallpaper-cta h2', 'スマホ画面を、<br>少し軽く。');
  }

  choices.forEach((choice) => choice.addEventListener('click', () => setLanguage(choice.dataset.languageChoice)));
  setLanguage(initial);

  document.querySelectorAll('.wallpaper-card-preview').forEach((preview) => {
    const gallery = preview.querySelector('.wallpaper-gallery');
    if (!gallery) return;
    const step = () => gallery.querySelector('.gallery-phone')?.getBoundingClientRect().width + 14 || 180;
    preview.querySelector('[data-gallery-previous]')?.addEventListener('click', () => {
      gallery.scrollBy({ left: -step(), behavior: 'smooth' });
    });
    preview.querySelector('[data-gallery-next]')?.addEventListener('click', () => {
      gallery.scrollBy({ left: step(), behavior: 'smooth' });
    });
  });
})();
