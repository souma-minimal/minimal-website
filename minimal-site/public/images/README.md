# 画像素材について

現在このサイトは、実際のアプリスクリーンショットが無い状態でも成立するように、
`components/mockups/*.tsx` によるHTML/CSSベースの簡易UIモックアップで代用しています。

実際の画像が用意でき次第、以下のパスに配置し、対応するコンポーネントの
`<PhoneMockup>` に `imageSrc` プロパティを渡してください。自動的にCSSモックアップから差し替わります。

```
public/images/apps/schedule/screen-1.png
public/images/apps/notes/screen-1.png
public/images/apps/finance/screen-1.png
public/images/brand/logo.svg   （必要であれば）
```

## 差し替え例

`components/showcases/ScheduleShowcase.tsx` 内：

```tsx
<PhoneMockup imageSrc="/images/apps/schedule/screen-1.png" imageAlt="minimal Scheduleのメイン画面">
  <ScheduleUI />
</PhoneMockup>
```

`imageSrc` が指定されている間は `children`（CSSモックアップ）は使われません。

## 推奨仕様

- 形式：PNG / WebP（Next.jsが自動的にAVIF/WebPへ変換します）
- 比率：9:19.5 前後（iPhoneのスクリーンショット比率）
- 解像度：長辺 1200px 程度で十分（表示サイズは260px幅前後のため）
