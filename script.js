// minimal. quiet by design
// The copy is authored in Japanese and English so visitors never have to rely
// on browser machine translation for product or purchase information.
(() => {
  const catalog = window.MINIMAL_CATALOG || {};
  const schedule = catalog.schedule || { price: '$7' };
  const nocturne = catalog.nocturne || { price: '$3.99', individualPrice: '$1.49', files: 4 };
  const terrain = catalog.terrain || { price: '$4.99', individualPrice: '$1.49', files: 6 };
  // The public site intentionally serves only watermarked previews. Original
  // files are delivered by the purchase-verified download endpoint instead.
  document.querySelectorAll('img[src*="assets/wallpapers/"]').forEach((image) => {
    const source = image.getAttribute('src');
    if (!source || source.includes('/social-samples/')) return;
    image.src = source.replace('assets/wallpapers/', 'assets/wallpapers/social-samples/').replace(/-iphone\.png$/, '-iphone-sample.png');
    image.alt = `Watermarked preview — ${image.alt}`;
  });

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
    window.dispatchEvent(new CustomEvent('minimal-language-change', { detail: { language } }));
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
    translate('.terrain-list', '<li>モノクロ壁紙 6枚</li><li>Dune・Ridge・Tide・Stone・Moon・Fog</li><li>iPhone向け縦長PNG</li><li>買い切り・個人利用・デジタルダウンロード</li>');
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
    translate('.wallpaper-detail ul', '<li>モノクロ壁紙 4枚</li><li>黒・グラファイト・オフホワイト</li><li>iPhone向け縦長PNG</li><li>買い切り・個人利用・デジタルダウンロード</li>');
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
    translate('.final-cta .muted', '決済後、ライブラリからNotionテンプレートを複製できます。サブスクリプションも、物理商品の配送もありません。');
    translate('[data-i18n="schedule-buy-cta"]', `Scheduleを購入する — ${schedule.price} <span aria-hidden="true">↗</span>`);
    const scheduleCta = document.querySelector('[data-i18n="schedule-buy-cta"]');
    if (scheduleCta) scheduleCta.dataset.i18nEn = `Get Schedule — ${schedule.price} <span aria-hidden="true">↗</span>`;
    document.querySelectorAll('[data-catalog-price="schedule"]').forEach((node) => { node.textContent = schedule.price; });
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
    if (checkout) {
      checkout.href = '#checkout';
      checkout.dataset.checkoutProduct = 'minimal-schedule';
    }
    const schedulePrice = document.querySelector('.buy-summary strong');
    if (schedulePrice) schedulePrice.textContent = schedule.price;
  }
  if (location.pathname.endsWith('thanks.html') || location.pathname.endsWith('/thanks')) {
    translate('.thank-you .eyebrow', 'ありがとうございます');
    translate('.thank-you h1', '今週に、<br>余白ができました<span>.</span>');
    translate('.thank-you .lead', 'minimal Scheduleを、あなたのNotionに追加できます。');
    translate('.thank-you .buy-button', 'Notionで複製する <span aria-hidden="true">↗</span>');
    translate('.thank-you .product-note', 'Notionのページを開き、右上の「複製」を選ぶと自分のワークスペースに追加できます。');
  }

  const wallpaperItems = {
    nocturne: [
      { key: 'nocturne-arc', name: 'Arc', image: 'assets/wallpapers/social-samples/minimal-wallpaper-01-iphone-sample.png' },
      { key: 'nocturne-sphere', name: 'Sphere', image: 'assets/wallpapers/social-samples/minimal-wallpaper-02-iphone-sample.png' },
      { key: 'nocturne-monolith', name: 'Monolith', image: 'assets/wallpapers/social-samples/minimal-wallpaper-03-iphone-sample.png' },
      { key: 'nocturne-light', name: 'Light', image: 'assets/wallpapers/social-samples/minimal-wallpaper-04-iphone-sample.png' }
    ],
    terrain: [
      { key: 'terrain-dune', name: 'Dune', image: 'assets/wallpapers/social-samples/terrain-studies-01-dune-iphone-sample.png' },
      { key: 'terrain-ridge', name: 'Ridge', image: 'assets/wallpapers/social-samples/terrain-studies-02-ridge-iphone-sample.png' },
      { key: 'terrain-tide', name: 'Tide', image: 'assets/wallpapers/social-samples/terrain-studies-03-tide-iphone-sample.png' },
      { key: 'terrain-stone', name: 'Stone', image: 'assets/wallpapers/social-samples/terrain-studies-04-stone-iphone-sample.png' },
      { key: 'terrain-moon', name: 'Moon', image: 'assets/wallpapers/social-samples/terrain-studies-05-moon-iphone-sample.png' },
      { key: 'terrain-fog', name: 'Fog', image: 'assets/wallpapers/social-samples/terrain-studies-06-fog-iphone-sample.png' }
    ]
  };

  const chooserStyle = document.createElement('style');
  chooserStyle.textContent = `.wallpaper-selector{border-top:1px solid var(--line);padding:42px 0 76px}.wallpaper-selector-head{display:flex;justify-content:space-between;gap:24px;align-items:end;margin-bottom:22px}.wallpaper-selector h2{font-size:clamp(30px,4vw,54px);letter-spacing:-.06em;line-height:.95;margin:0}.wallpaper-selector .selector-note{font-size:12px;color:var(--muted);max-width:360px;line-height:1.55;margin:0}.wallpaper-choice-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.wallpaper-choice{border:1px solid var(--line);padding:12px;background:transparent;text-align:left;color:inherit;cursor:pointer}.wallpaper-choice:hover,.wallpaper-choice[aria-pressed=true]{border-color:#111;background:#f3f3f0}.wallpaper-choice img{display:block;width:100%;aspect-ratio:9/15;object-fit:cover;background:#191919;margin-bottom:11px}.wallpaper-choice strong{font-size:13px;letter-spacing:.03em}.wallpaper-choice span{display:block;margin-top:5px;font-size:10px;letter-spacing:.08em;color:var(--muted)}.wallpaper-selector-actions{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-top:22px;border-top:1px solid var(--line);padding-top:20px}.wallpaper-selector-actions p{font-size:11px;line-height:1.5;color:var(--muted);margin:0}.wallpaper-selector-actions .buy-button{min-width:210px;justify-content:space-between}.bundle-link{font-size:12px;color:inherit;text-underline-offset:5px}@media(max-width:700px){.wallpaper-selector{padding:35px 0 60px}.wallpaper-selector-head{display:block}.wallpaper-selector .selector-note{margin-top:14px}.wallpaper-choice-grid{grid-template-columns:repeat(2,1fr);gap:8px}.wallpaper-selector-actions{align-items:stretch;flex-direction:column}.wallpaper-selector-actions .buy-button{width:100%}}`;
  document.head.appendChild(chooserStyle);

  const addWallpaperChooser = (type, bundleKey, bundlePrice, individualPrice) => {
    const source = document.querySelector(type === 'terrain' ? '.terrain-grid' : '.wallpaper-grid');
    if (!source) return;
    const items = wallpaperItems[type];
    let selected = items[0];
    const chooser = document.createElement('section');
    chooser.className = 'section wallpaper-selector';
    const text = () => document.documentElement.dataset.uiLanguage === 'en' ? {
      eyebrow: 'CHOOSE ONE', heading: 'Choose the one<br>you want to keep.',
      note: `Each wallpaper is ${individualPrice}. Sign in once, then continue to secure checkout. The complete set is also available below.`,
      selected: `${selected.name} selected · ${individualPrice}`, buy: `Buy ${selected.name} — ${individualPrice}`,
      bundle: `Get all ${items.length} — ${bundlePrice}`
    } : {
      eyebrow: '1枚から選ぶ', heading: '最初に使いたい<br>一枚を選ぶ。',
      note: `1枚 ${individualPrice}。一度ログインすれば、安全な決済へ進めます。${items.length}枚すべてのセットも選べます。`,
      selected: `${selected.name} を選択中 · ${individualPrice}`, buy: `${selected.name} を購入 — ${individualPrice}`,
      bundle: `${items.length}枚すべて — ${bundlePrice}`
    };
    chooser.innerHTML = `<div class="wallpaper-selector-head"><div><p class="eyebrow" data-selector-eyebrow></p><h2 data-selector-heading></h2></div><p class="selector-note" data-selector-note></p></div><div class="wallpaper-choice-grid">${items.map((item, index) => `<button class="wallpaper-choice" type="button" data-wallpaper-key="${item.key}" aria-pressed="${index === 0}"><img src="${item.image}" alt="${item.name} wallpaper preview"><strong>${item.name}</strong><span>${individualPrice} · <span class="lang-ja">デジタルダウンロード</span><span class="lang-en">DIGITAL DOWNLOAD</span></span></button>`).join('')}</div><div class="wallpaper-selector-actions"><p class="selected-wallpaper"></p><a class="buy-button" href="#checkout" data-selected-wallpaper data-checkout-product="${selected.key}"><span data-selector-buy></span> <span aria-hidden="true">↗</span></a><a class="bundle-link" href="#checkout" data-checkout-product="${bundleKey}" data-selector-bundle></a></div>`;
    source.insertAdjacentElement('afterend', chooser);
    const refresh = () => {
      const copy = text();
      chooser.querySelector('[data-selector-eyebrow]').textContent = copy.eyebrow;
      chooser.querySelector('[data-selector-heading]').innerHTML = copy.heading;
      chooser.querySelector('[data-selector-note]').textContent = copy.note;
      chooser.querySelector('.selected-wallpaper').textContent = copy.selected;
      const link = chooser.querySelector('[data-selected-wallpaper]');
      link.href = '#checkout';
      link.dataset.checkoutProduct = selected.key;
      chooser.querySelector('[data-selector-buy]').textContent = copy.buy;
      chooser.querySelector('[data-selector-bundle]').textContent = copy.bundle;
      chooser.querySelectorAll('.wallpaper-choice').forEach((choice) => choice.setAttribute('aria-pressed', String(choice.dataset.wallpaperKey === selected.key)));
    };
    chooser.querySelectorAll('.wallpaper-choice').forEach((choice) => choice.addEventListener('click', () => {
      selected = items.find((item) => item.key === choice.dataset.wallpaperKey) || selected;
      refresh();
    }));
    window.addEventListener('minimal-language-change', refresh);
    refresh();
  };

  if (location.pathname.endsWith('wallpaper.html') || location.pathname.endsWith('/wallpaper')) {
    document.querySelector('.wallpaper-price strong').textContent = nocturne.individualPrice;
    document.querySelector('.wallpaper-price span').innerHTML = '<span class="lang-ja">1枚から選ぶ · 買い切り<br>iPhone壁紙</span><span class="lang-en">CHOOSE ONE · ONE-TIME PAYMENT<br>IPHONE WALLPAPER</span>';
    const oldCta = document.querySelector('.wallpaper-cta');
    if (oldCta) oldCta.remove();
    addWallpaperChooser('nocturne', nocturne.key, nocturne.price, nocturne.individualPrice);
  }
  if (location.pathname.endsWith('terrain.html') || location.pathname.endsWith('/terrain')) {
    document.querySelector('.terrain-price strong').textContent = terrain.individualPrice;
    document.querySelector('.terrain-price span').innerHTML = '<span class="lang-ja">1枚から選ぶ · 買い切り<br>iPhone壁紙</span><span class="lang-en">CHOOSE ONE · ONE-TIME PAYMENT<br>IPHONE WALLPAPER</span>';
    const oldCta = document.querySelector('.terrain-cta');
    if (oldCta) oldCta.remove();
    addWallpaperChooser('terrain', terrain.key, terrain.price, terrain.individualPrice);
  }
  if (location.pathname.endsWith('index.html') || location.pathname.endsWith('/')) {
    const heading = document.querySelector('.products-head h2');
    if (heading) heading.innerHTML = '<span class="lang-ja">今日から使える<br>4つのプロダクト。</span><span class="lang-en">Simple things.<br>Ready to use.</span>';
    document.querySelectorAll('.product-card').forEach((card) => {
      const title = card.querySelector('h3')?.textContent;
      const button = card.querySelector('.buy-button');
      if (!button) return;
      if (title === 'minimal Schedule') button.innerHTML = `<span class="lang-ja">購入する — ${schedule.price}</span><span class="lang-en">Get it — ${schedule.price}</span> <span aria-hidden="true">↗</span>`;
      if (title === 'Nocturne Pack') button.innerHTML = `<span class="lang-ja">好きな1枚を選ぶ — ${nocturne.individualPrice}〜</span><span class="lang-en">Choose one — from ${nocturne.individualPrice}</span> <span aria-hidden="true">↗</span>`;
      if (title === 'Terrain Studies') button.innerHTML = `<span class="lang-ja">好きな1枚を選ぶ — ${terrain.individualPrice}〜</span><span class="lang-en">Choose one — from ${terrain.individualPrice}</span> <span aria-hidden="true">↗</span>`;
    });
    const cards = document.querySelector('.product-cards');
    if (cards && !document.querySelector('[data-free-wallpaper]')) {
      const card = document.createElement('article');
      card.className = 'product-card wallpaper-card';
      card.dataset.freeWallpaper = 'true';
      card.innerHTML = `<div class="product-card-top"><p class="eyebrow">04 / FREE WALLPAPER</p><span class="status"><span class="lang-ja">無料配布</span><span class="lang-en">FREE</span></span></div><div class="wallpaper-card-preview device-card"><div class="wallpaper-gallery" aria-label="Still Water free wallpaper preview"><div class="gallery-phone"><img src="assets/wallpapers/free-still-water-iphone.png" alt="Still Water free monochrome iPhone wallpaper"><div class="mini-ui" aria-hidden="true"><b>9:41</b><small>MONDAY · OCT 21</small><div class="mini-icons"><i>◌</i><i>□</i><i>△</i><i>＋</i></div></div></div></div></div><div class="product-card-copy"><p class="product-use"><span class="lang-ja">まずは、静かな一枚から</span><span class="lang-en">A QUIET START</span></p><h3>Still Water</h3><p><span class="lang-ja">白とグレーだけで構成した、iPhone用の無料壁紙。minimalを初めて使うための一枚です。</span><span class="lang-en">One free monochrome wallpaper for iPhone. A quiet place to begin with minimal.</span></p><p class="product-includes"><span class="lang-ja">iPhone壁紙 1枚 / 無料 / 決済後すぐ受け取り</span><span class="lang-en">1 iPhone wallpaper · Free · Ready after checkout</span></p></div><div class="product-actions"><a class="text-action" href="#checkout" data-checkout-product="free-still-water"><span class="lang-ja">無料で受け取る</span><span class="lang-en">Get it free</span> ↗</a><a class="buy-button" href="#checkout" data-checkout-product="free-still-water"><span class="lang-ja">$0で入手する</span><span class="lang-en">Get it — $0</span> <span aria-hidden="true">↗</span></a></div>`;
      cards.append(card);
    }
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
