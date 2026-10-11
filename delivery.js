(() => {
  const status = document.querySelector('[data-delivery-status]');
  const list = document.querySelector('[data-delivery-list]');
  const sessionId = new URLSearchParams(location.search).get('session_id');
  const requested = new URLSearchParams(location.search).get('item');
  const japanese = (localStorage.getItem('minimal-language') || navigator.language).toLowerCase().startsWith('ja');
  const copy = (ja, en) => japanese ? ja : en;
  const tokenKey = 'minimal-accounts-access-token';
  const refreshKey = 'minimal-accounts-refresh-token';
  const supabaseUrl = 'https://etxroajblozqyjyvpcoo.supabase.co';
  const publicKey = 'sb_publishable_6xjW2XlBXj4tnbibzK1WWQ_30SUWF93';

  const fail = message => {
    if (status) status.textContent = message;
    if (list) list.hidden = true;
  };

  if (!sessionId) {
    fail(copy('購入情報が見つかりません。ライブラリから受け取り状況を確認してください。', 'We could not find this purchase. Check your library for delivery status.'));
    return;
  }

  const tokenIsFresh = (token) => {
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return Number(JSON.parse(atob(payload)).exp || 0) > (Date.now() / 1000) + 30;
    } catch { return false; }
  };
  const currentAccessToken = async () => {
    const token = localStorage.getItem(tokenKey);
    if (tokenIsFresh(token || '')) return token;
    const refreshToken = localStorage.getItem(refreshKey);
    if (!refreshToken) return token;
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { apikey: publicKey, 'content-type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    if (!response.ok) return token;
    const session = await response.json();
    if (session.access_token) localStorage.setItem(tokenKey, session.access_token);
    if (session.refresh_token) localStorage.setItem(refreshKey, session.refresh_token);
    return session.access_token || token;
  };
  currentAccessToken().then(token => fetch(`/api/entitlements?session_id=${encodeURIComponent(sessionId)}`, {
    cache: 'no-store', headers: token ? { authorization: `Bearer ${token}` } : {}
  }))
    .then(response => response.json().then(data => ({ response, data })))
    .then(({ response, data }) => {
      if (!response.ok) throw new Error(data.error || copy('購入を確認できませんでした。', 'We could not verify this purchase.'));
      const files = requested ? data.files.filter(file => file.key.includes(requested)) : data.files;
      if (status) status.textContent = copy(
        files.length
          ? (data.library_updated ? '購入を確認し、ライブラリにも追加しました。下のボタンから原寸ファイルを保存できます。' : '購入を確認しました。下のボタンから原寸ファイルを保存できます。')
          : (data.library_updated ? '購入を確認し、ライブラリに追加しました。受け取り先は下のボタンから開けます。' : '購入を確認しました。受け取り先は下のボタンから開けます。'),
        files.length
          ? (data.library_updated ? 'Purchase verified and added to your library. Use the buttons below to save your original files.' : 'Purchase verified. Use the buttons below to save your original files.')
          : (data.library_updated ? 'Purchase verified and added to your library. Open your item below.' : 'Purchase verified. Open your item below.')
      );
      if (!list || !files.length) return;
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
