# minimal Accounts — login email branding

Configure this once in **Supabase Dashboard → minimal-accounts → Authentication → Email Templates → Magic Link**.

- Subject: `minimal Accounts — ログインリンク`
- From name: `minimal Accounts`
- Redirect URL: `https://minimal-website-djl.pages.dev/accounts`

In **Authentication → URL Configuration**, allow this exact URL as well:

`https://minimal-website-djl.pages.dev/accounts`

Cloudflare Pages canonicalizes `accounts.html` to `/accounts`. Using the final URL directly prevents a redirect from losing a magic-link session fragment.

Use this body:

```html
<div style="background:#f7f7f5;padding:40px 20px;font-family:Arial,Helvetica,sans-serif;color:#111">
  <div style="max-width:520px;margin:auto;border:1px solid #d8d8d4;padding:36px;background:#f7f7f5">
    <p style="font-size:24px;font-weight:700;letter-spacing:-1px;margin:0 0 48px">minimal.</p>
    <p style="font-size:11px;letter-spacing:1.5px;color:#777">MINIMAL ACCOUNTS</p>
    <h1 style="font-size:32px;letter-spacing:-1.5px;line-height:1.05;margin:16px 0">ログインを<br>完了する。</h1>
    <p style="font-size:15px;line-height:1.7;color:#555">minimal Accounts にログインするためのリンクです。下のボタンを押すと、あなたのライブラリに戻ります。</p>
    <p style="margin:32px 0"><a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:15px 20px;font-size:13px">ログインする →</a></p>
    <p style="font-size:12px;line-height:1.6;color:#777">この操作に心当たりがない場合は、このメールを破棄してください。<br>minimal. Less, but better.</p>
  </div>
</div>
```

Do not put service-role keys, Stripe secrets, or customer data in this template.
