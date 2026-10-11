(() => {
  const status = document.querySelector('[data-delivery-status]');
  const list = document.querySelector('[data-delivery-list]');
  const sessionId = new URLSearchParams(location.search).get('session_id');
  const requested = new URLSearchParams(location.search).get('item');

  const fail = message => {
    if (status) status.textContent = message;
    if (list) list.hidden = true;
  };

  if (!sessionId) {
    fail('購入の確認リンクが見つかりません。Stripeの決済完了メールから、もう一度受け取りページを開いてください。');
    return;
  }

  fetch(`/api/entitlements?session_id=${encodeURIComponent(sessionId)}`, { cache: 'no-store' })
    .then(response => response.json().then(data => ({ response, data })))
    .then(({ response, data }) => {
      if (!response.ok) throw new Error(data.error || '購入を確認できませんでした。');
      const files = requested ? data.files.filter(file => file.key.includes(requested)) : data.files;
      if (!files.length) throw new Error('この購入に対応するダウンロードが見つかりません。');
      if (status) status.textContent = '購入を確認しました。下のボタンから原寸ファイルを保存できます。';
      if (!list) return;
      list.hidden = false;
      list.replaceChildren(...files.map(file => {
        const link = document.createElement('a');
        link.className = 'buy-button';
        link.href = `/api/download?session_id=${encodeURIComponent(sessionId)}&key=${encodeURIComponent(file.key)}`;
        link.textContent = `${file.label} をダウンロード ↓`;
        return link;
      }));
    })
    .catch(error => fail(error.message));
})();
