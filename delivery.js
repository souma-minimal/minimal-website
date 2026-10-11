(() => {
  const status = document.querySelector('[data-delivery-status]');
  const list = document.querySelector('[data-delivery-list]');
  const sessionId = new URLSearchParams(location.search).get('session_id');
  const requested = new URLSearchParams(location.search).get('item');
  const japanese = (localStorage.getItem('minimal-language') || navigator.language).toLowerCase().startsWith('ja');
  const copy = (ja, en) => japanese ? ja : en;

  const fail = message => {
    if (status) status.textContent = message;
    if (list) list.hidden = true;
  };

  if (!sessionId) {
    fail(copy('購入の確認リンクが見つかりません。Stripeの決済完了メールから、もう一度受け取りページを開いてください。', 'We could not find the purchase link. Open the delivery page again from your Stripe receipt.'));
    return;
  }

  fetch(`/api/entitlements?session_id=${encodeURIComponent(sessionId)}`, { cache: 'no-store' })
    .then(response => response.json().then(data => ({ response, data })))
    .then(({ response, data }) => {
      if (!response.ok) throw new Error(data.error || copy('購入を確認できませんでした。', 'We could not verify this purchase.'));
      const files = requested ? data.files.filter(file => file.key.includes(requested)) : data.files;
      if (!files.length) throw new Error(copy('この購入に対応するダウンロードが見つかりません。', 'No downloads were found for this purchase.'));
      if (status) status.textContent = copy('購入を確認しました。下のボタンから原寸ファイルを保存できます。', 'Purchase verified. Use the buttons below to save your original files.');
      if (!list) return;
      list.hidden = false;
      list.replaceChildren(...files.map(file => {
        const link = document.createElement('a');
        link.className = 'buy-button';
        link.href = `/api/download?session_id=${encodeURIComponent(sessionId)}&key=${encodeURIComponent(file.key)}`;
        link.textContent = japanese ? `${file.label} をダウンロード ↓` : `Download ${file.label} ↓`;
        return link;
      }));
    })
    .catch(error => fail(error.message));
})();
