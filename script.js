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
    translate('[data-i18n="schedule-buy-cta"]', 'Scheduleを購入する — $7 <span aria-hidden="true">↗</span>');
    const scheduleCta = document.querySelector('[data-i18n="schedule-buy-cta"]');
    if (scheduleCta) scheduleCta.dataset.i18nEn = 'Get Schedule — $7 <span aria-hidden="true">↗</span>';
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
    const checkout = document.querySelector('[data-i18n="stripe-checkout"]');
    if (checkout) checkout.href = 'https://buy.stripe.com/14A7sL1IU8hafiL17Y2kw04';
    const schedulePrice = document.querySelector('.buy-summary strong');
    if (schedulePrice) schedulePrice.textContent = '$7';
  }

  const wallpaperItems = {
    nocturne: [
      { key: 'nocturne-arc', name: 'Arc', image: 'assets/wallpapers/minimal-wallpaper-01-iphone.png', url: 'https://buy.stripe.com/cNi4gzbjueFydaD03U2kw0c' },
      { key: 'nocturne-sphere', name: 'Sphere', image: 'assets/wallpapers/minimal-wallpaper-02-iphone.png', url: 'https://buy.stripe.com/5kQaEX2MYeFygmP17Y2kw0d' },
      { key: 'nocturne-monolith', name: 'Monolith', image: 'assets/wallpapers/minimal-wallpaper-03-iphone.png', url: 'https://buy.stripe.com/dRmbJ14V62WQ6Mf4ka2kw0e' },
      { key: 'nocturne-light', name: 'Light', image: 'assets/wallpapers/minimal-wallpaper-04-iphone.png', url: 'https://buy.stripe.com/3cIdR92MY7d60nR2c22kw0f' }
    ],
    terrain: [
      { key: 'terrain-dune', name: 'Dune', image: 'assets/wallpapers/terrain-studies-01-dune-iphone.png', url: 'https://buy.stripe.com/dRm28rcny54Y3A3g2S2kw06' },
      { key: 'terrain-ridge', name: 'Ridge', image: 'assets/wallpapers/terrain-studies-02-ridge-iphone.png', url: 'https://buy.stripe.com/7sY3cv0EQ9le0nRaIy2kw07' },
      { key: 'terrain-tide', name: 'Tide', image: 'assets/wallpapers/terrain-studies-03-tide-iphone.png', url: 'https://buy.stripe.com/fZudR9evG54Y9Yr3g62kw08' },
      { key: 'terrain-stone', name: 'Stone', image: 'assets/wallpapers/terrain-studies-04-stone-iphone.png', url: 'https://buy.stripe.com/dRmdR9cny7d60nR03U2kw09' },
      { key: 'terrain-moon', name: 'Moon', image: 'assets/wallpapers/terrain-studies-05-moon-iphone.png', url: 'https://buy.stripe.com/00wfZh1IUcxq0nRg2S2kw0a' },
      { key: 'terrain-fog', name: 'Fog', image: 'assets/wallpapers/terrain-studies-06-fog-iphone.png', url: 'https://buy.stripe.com/5kQaEX87ibtm7Qj5oe2kw0b' }
    ]
  };

  const chooserStyle = document.createElement('style');
  chooserStyle.textContent = `.wallpaper-selector{border-top:1px solid var(--line);padding:42px 0 76px}.wallpaper-selector-head{display:flex;justify-content:space-between;gap:24px;align-items:end;margin-bottom:22px}.wallpaper-selector h2{font-size:clamp(30px,4vw,54px);letter-spacing:-.06em;line-height:.95;margin:0}.wallpaper-selector .selector-note{font-size:12px;color:var(--muted);max-width:360px;line-height:1.55;margin:0}.wallpaper-choice-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.wallpaper-choice{border:1px solid var(--line);padding:12px;background:transparent;text-align:left;color:inherit;cursor:pointer}.wallpaper-choice:hover,.wallpaper-choice[aria-pressed=true]{border-color:#111;background:#f3f3f0}.wallpaper-choice img{display:block;width:100%;aspect-ratio:9/15;object-fit:cover;background:#191919;margin-bottom:11px}.wallpaper-choice strong{font-size:13px;letter-spacing:.03em}.wallpaper-choice span{display:block;margin-top:5px;font-size:10px;letter-spacing:.08em;color:var(--muted)}.wallpaper-selector-actions{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-top:22px;border-top:1px solid var(--line);padding-top:20px}.wallpaper-selector-actions p{font-size:11px;line-height:1.5;color:var(--muted);margin:0}.wallpaper-selector-actions .buy-button{min-width:210px;justify-content:space-between}.bundle-link{font-size:12px;color:inherit;text-underline-offset:5px}@media(max-width:700px){.wallpaper-selector{padding:35px 0 60px}.wallpaper-selector-head{display:block}.wallpaper-selector .selector-note{margin-top:14px}.wallpaper-choice-grid{grid-template-columns:repeat(2,1fr);gap:8px}.wallpaper-selector-actions{align-items:stretch;flex-direction:column}.wallpaper-selector-actions .buy-button{width:100%}}`;
  document.head.appendChild(chooserStyle);

  const addWallpaperChooser = (type, bundleUrl, bundlePrice) => {
    const source = document.querySelector(type === 'terrain' ? '.terrain-grid' : '.wallpaper-grid');
    if (!source) return;
    const items = wallpaperItems[type];
    let selected = items[0];
    const chooser = document.createElement('section');
    chooser.className = 'section wallpaper-selector';
    chooser.innerHTML = `<div class="wallpaper-selector-head"><div><p class="eyebrow">CHOOSE ONE / 1枚から選ぶ</p><h2>Choose the one<br>you want to keep.</h2></div><p class="selector-note">Each wallpaper is $1.49. Choose one, then continue to secure checkout. The full set is also available below.</p></div><div class="wallpaper-choice-grid">${items.map((item, index) => `<button class="wallpaper-choice" type="button" data-wallpaper-key="${item.key}" aria-pressed="${index === 0}"><img src="${item.image}" alt="${item.name} wallpaper preview"><strong>${item.name}</strong><span>$1.49 · DIGITAL DOWNLOAD</span></button>`).join('')}</div><div class="wallpaper-selector-actions"><p class="selected-wallpaper">${selected.name} selected · $1.49</p><a class="buy-button" href="${selected.url}" data-selected-wallpaper>Buy ${selected.name} — $1.49 <span aria-hidden="true">↗</span></a><a class="bundle-link" href="${bundleUrl}">Get all ${items.length} — $${bundlePrice} ↗</a></div>`;
    source.insertAdjacentElement('afterend', chooser);
    const refresh = () => {
      chooser.querySelector('.selected-wallpaper').textContent = `${selected.name} selected · $1.49`;
      const link = chooser.querySelector('[data-selected-wallpaper]');
      link.href = selected.url;
      link.innerHTML = `Buy ${selected.name} — $1.49 <span aria-hidden="true">↗</span>`;
      chooser.querySelectorAll('.wallpaper-choice').forEach((choice) => choice.setAttribute('aria-pressed', String(choice.dataset.wallpaperKey === selected.key)));
    };
    chooser.querySelectorAll('.wallpaper-choice').forEach((choice) => choice.addEventListener('click', () => {
      selected = items.find((item) => item.key === choice.dataset.wallpaperKey) || selected;
      refresh();
    }));
  };

  if (location.pathname.endsWith('wallpaper.html') || location.pathname.endsWith('/wallpaper')) {
    document.querySelector('.wallpaper-price strong').textContent = '$1.49';
    document.querySelector('.wallpaper-price span').innerHTML = 'CHOOSE ONE · ONE-TIME PAYMENT<br>IPHONE WALLPAPER';
    const oldCta = document.querySelector('.wallpaper-cta');
    if (oldCta) oldCta.remove();
    addWallpaperChooser('nocturne', 'https://buy.stripe.com/9B6dR95ZadBudaD9Eu2kw05', '3.99');
  }
  if (location.pathname.endsWith('terrain.html') || location.pathname.endsWith('/terrain')) {
    document.querySelector('.terrain-price strong').textContent = '$1.49';
    document.querySelector('.terrain-price span').innerHTML = 'CHOOSE ONE · ONE-TIME PAYMENT<br>IPHONE WALLPAPER';
    const oldCta = document.querySelector('.terrain-cta');
    if (oldCta) oldCta.remove();
    addWallpaperChooser('terrain', 'https://buy.stripe.com/3cI00j5Zabtm9YrcQG2kw0g', '4.99');
  }
  if (location.pathname.endsWith('index.html') || location.pathname.endsWith('/')) {
    document.querySelectorAll('.product-card').forEach((card) => {
      const title = card.querySelector('h3')?.textContent;
      const button = card.querySelector('.buy-button');
      if (!button) return;
      if (title === 'minimal Schedule') button.innerHTML = '<span class="lang-ja">購入する — $7</span><span class="lang-en">Get it — $7</span> <span aria-hidden="true">↗</span>';
      if (title === 'Nocturne Pack' || title === 'Terrain Studies') button.innerHTML = '<span class="lang-ja">好きな1枚を選ぶ — $1.49〜</span><span class="lang-en">Choose one — from $1.49</span> <span aria-hidden="true">↗</span>';
    });
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
