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
  if (location.pathname.endsWith('schedule.html') || location.pathname.endsWith('/schedule')) {
    translate('[data-i18n="nav-products"]', '商品');
    translate('[data-i18n="nav-wallpapers"]', '壁紙');
    translate('[data-i18n="nav-about"]', 'ブランドについて');
    translate('.schedule-lead', '考える量を減らし、<br>今週を見渡す。');
    translate('.schedule-copy > .muted', 'Notionで使う週間管理テンプレートです。予定・タスク・メモを一つにまとめ、今やることを見やすくします。');
    translate('.purchase > div span', '買い切り · サブスクリプションなし');
    translate('[data-i18n="schedule-buy"]', 'Scheduleを購入する <span aria-hidden="true">↗</span>');
    translate('.product-intro .label', '内容');
    translate('.product-intro h2', '必要な画面だけ。<br>迷わず使える。');
    translate('.product-intro .lead', '大切なことに注意を向けるための、1週間の仕組み。');
    translate('.product-intro .muted', '複雑なダッシュボードも、終わらないプロパティもありません。予定と考えを集め、今週へ戻るための静かな場所です。');
    translate('.features article:nth-child(1) h3', '今日');
    translate('.features article:nth-child(1) p', '一日の始まりを、一つの見やすい場所から。');
    translate('.features article:nth-child(2) h3', '今週');
    translate('.features article:nth-child(2) p', '予定をプロジェクト化せず、今週を見渡せます。');
    translate('.features article:nth-child(3) h3', '受信箱');
    translate('.features article:nth-child(3) p', '思いつきを、別の開いたタブになる前に残せます。');
    translate('.features article:nth-child(4) h3', '週次レビュー');
    translate('.features article:nth-child(4) p', 'うまくいったことに気づき、残りは手放す。');
    translate('.schedule-statement > p:first-child', '購入特典');
    translate('.schedule-statement h2', 'すべての画面に、<br>静かな壁紙を。');
    translate('.schedule-statement .muted', 'デスクトップとモバイル用のモノクロ壁紙6枚を同梱。計画と同じように、画面にも余白をつくります。');
    translate('.final-cta .eyebrow', 'もっと小さく、計画する');
    translate('.final-cta h2', '来週のために、<br>少しの余白を。');
    translate('.final-cta .muted', '決済後すぐに、Notionテンプレートを複製できます。サブスクリプションも、物理商品の配送もありません。');
    translate('[data-i18n="schedule-buy-cta"]', 'Scheduleを購入する — $19 <span aria-hidden="true">↗</span>');
  }
  if (location.pathname.endsWith('buy.html') || location.pathname.endsWith('/buy')) {
    translate('[data-i18n="nav-schedule"]', 'Scheduleについて');
    translate('[data-i18n="nav-products"]', '商品');
    translate('[data-i18n="nav-wallpapers"]', '壁紙');
    translate('.buy-page h1', '集中のための<br>余白をつくる<span>.</span>');
    translate('.buy-page .lead', 'Notionで使う、静かな週間管理システム。');
    translate('.buy-summary > div:first-child .label', '内容');
    translate('.buy-summary > div:first-child > p:last-child', 'Today・Week・Inbox・Weekly Review<br>デスクトップ・モバイル壁紙6枚');
    translate('.buy-summary > div:last-child .label', '買い切り');
    translate('[data-i18n="stripe-checkout"]', '安全に購入する <span aria-hidden="true">↗</span>');
    translate('.buy-page .product-note', 'Stripeによる安全な決済 · デジタル商品 · 物理商品の発送はありません<br>決済後すぐにNotionテンプレートを受け取れます。');
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
