// Shared, non-sensitive account affordance for every minimal page.
(() => {
  const tokenKey = 'minimal-accounts-access-token';
  const token = localStorage.getItem(tokenKey);
  const accountUrl = 'accounts.html';
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
  addShortcut(false);
  if (!token) return;
  fetch('https://etxroajblozqyjyvpcoo.supabase.co/auth/v1/user', { headers })
    .then(response => response.ok ? response.json() : Promise.reject())
    .then(user => { if (!user?.email) throw new Error('No user'); addShortcut(true); })
    .catch(() => localStorage.removeItem(tokenKey));
})();
