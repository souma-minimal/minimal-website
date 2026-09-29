# minimal — 公式Webサイト

「スクロールして情報を読むサイト」ではなく、
**「スクロールすることでminimalというブランドを体験するサイト」**として実装しています。

## セットアップ

```bash
npm install
npm run dev
```

`http://localhost:3000` を開いてください。

本番ビルド：

```bash
npm run build
npm run start
```

## 技術構成

- Next.js 14（App Router） / React 18 / TypeScript
- GSAP + ScrollTrigger（スクロール連動アニメーション）
- Tailwind CSS（デザインシステムを `tailwind.config.ts` に一元管理）

外部フォント（Google Fontsなど）は使わず、OS標準の日本語対応フォントスタックのみで
構成しています。ネットワーク依存を減らし、表示速度と可搬性を優先するためです。
ブランド専用の欧文書体を導入したい場合は `tailwind.config.ts` の `fontFamily.display` と
`app/layout.tsx` を差し替えてください。

## ディレクトリ構成

```
app/
  layout.tsx        ルートレイアウト
  page.tsx           全セクションを組み立てるトップページ
  globals.css        デザインシステムの土台となるグローバルCSS

components/
  Nav.tsx            ナビゲーション（mix-blend-modeで自動的に反転）
  Hero.tsx           01. Hero（情報が消えていく導入）
  Philosophy.tsx     02. Philosophy（言葉が引き算を演じる）
  ProductsIntro.tsx  03. 3アプリへの接続セクション
  showcases/
    ScheduleShowcase.tsx  04. minimal Schedule
    NotesShowcase.tsx     05. minimal Notes
    FinanceShowcase.tsx   06. minimal Finance
  WorldView.tsx      07. 3アプリの統一された世界観（横スクロール）
  FinalSection.tsx   08. Closing Statement + 09. Footer
  PhoneMockup.tsx    スマートフォンフレーム（実画像へ差し替え可能）
  mockups/           各アプリのCSSベース簡易UI（実画像が無い間の代用）

lib/
  gsap.ts            GSAP / ScrollTriggerの共通セットアップ、matchMediaの定数

public/images/       実際のスクリーンショットの配置場所（README.md参照）
```

## 画像・実データの差し替え

`public/images/README.md` を参照してください。実際のアプリスクリーンショットが
用意でき次第、`PhoneMockup` に `imageSrc` を渡すだけでCSSモックアップから
自動的に切り替わります。

## 設計判断のメモ（今後の調整のために）

- **アニメーションの密度は意図的に不均一にしています。** Hero/Philosophyは抑えめ、
  Schedule/Notes/Financeの3セクションに演出を集中させ、Closing Statementでは
  ほぼ動きを止めています。「動と静のコントラスト」自体が引き算の思想を体現する
  構造になっているため、セクションごとに演出量を安易に均していくと、この設計意図が
  崩れます。
- **`gsap.matchMedia` でモバイル分岐しています。** モバイルでは`pin`を使わない、
  もしくはpin時間を短縮し、横スクロールジャック（WorldView）は行わない設定にして
  います。スマートフォンでの体感速度を優先した判断です。
- **`prefers-reduced-motion` に対応しています。** 該当ユーザーには、すべての
  最終状態（コピー・ロゴ）を最初から表示し、スクロール連動アニメーションを
  スキップします。
- **ナビゲーションの色反転は `mix-blend-mode: difference` で実装しています。**
  背景がライト/ダークどちらのセクションでも、JSでテーマを判定せずに常に読める
  配色になります。ロゴや実写真などdifferenceブレンドと相性が悪い要素をナビに
  追加する場合は、この前提が崩れる点に注意してください。
- **アクセントカラーはWCAGコントラストを踏まえて選定しています。**
  各アプリの単色収束画面で白文字を乗せることを想定し、`tailwind.config.ts`の
  `accent.*` は大きめの見出しテキストで3:1以上のコントラストを確保する明度に
  調整済みです。変更する場合はコントラストを再確認してください。
- **`gsap.matchMedia()` は使わず、`lib/gsap.ts` の `getMediaFlags()` で
  同期的にビューポート状態を判定しています。** 以前は `gsap.matchMedia()` の
  複数条件オブジェクトAPIを使っていましたが、React 18 Strict Modeの
  「マウント→アンマウント→再マウント」とmatchMediaのコールバックの発火
  タイミングが噛み合わず、コールバックが一度も実行されない不具合がありました
  （＝pin/scrubが一切効かず、要素が最終状態のまま固まって見える）。画面幅を
  リアルタイムに追従させたい場合は、resizeイベント＋`ScrollTrigger.refresh()`
  の追加を検討してください。
- **`gsap.registerPlugin(ScrollTrigger)` は `lib/gsap.ts` のモジュール
  トップレベルで同期的に呼び出しています。** Reactでは「子コンポーネントの
  `useLayoutEffect`は親の`useEffect`より先に実行される」ため、登録処理を
  どこかのコンポーネントのeffect内に置くと、他のセクションがScrollTriggerを
  使おうとした時点でまだ未登録という競合状態が起こり得ます。新しいセクションを
  追加する際も、プラグイン登録はこのファイルのトップレベルのままにしてください。
- **オープニングは react-three-fiber（Three.js）による3Dワールドです。**
  `components/WorldJourney.tsx` がスクロール量に応じて`components/world/`
  以下のシーン内をカメラが移動する体験を制御しています。
  - `WorldScene.tsx`：地形・建物・道路・港・空港などの静的な世界と、
    `CAMERA_PATH`（カメラが辿るキーフレームの配列）を定義しています。
    経路上に新しいゾーンを足したい場合は、この配列にキーフレームを追加し、
    対応する座標にオブジェクトを配置してください。
  - `WorldActors.tsx`：車・人・船・飛行機・太陽・雲など、常に動き続ける
    パーツをまとめています。スクロールと無関係に`useFrame`のループで
    継続的にアニメーションするため、スクロールしなくても世界が生きている
    ように見えます。
  - 色は黒・白・グレーを基調にし、彩度の高い色は各アプリのアクセントカラーを
    ごく一部（船のコンテナ数個など）に使う程度に抑えています。
  - パフォーマンス上、`Canvas`は`next/dynamic`で`ssr:false`指定して
    読み込んでいます（Three.jsはブラウザAPIに依存するため）。
- **アプリ紹介はナビゲーションの「Apps」ドロップダウンから辿れるようにして
  あります。** `components/Nav.tsx`の`APPS`配列にアプリを追加すると、
  ドロップダウンにも項目が増えます。

## 自己レビューで洗い出した、次に磨き込むべき点

- Heroの「ノイズ」テキストは現状 `sm:` 以上でのみ表示しており、モバイルでは
  ノイズが消えていく体験自体が発生しません（負荷対策を優先したトレードオフ）。
  モバイルでも軽量な形（要素数を絞る等）で体験させたい場合は
  `components/Hero.tsx` の `hidden sm:block` を調整してください。
- 現状すべてのアプリUIはCSSベースの簡易モックアップです。実際のスクリーン
  ショットに差し替えた際、余白やコントラストの再調整が必要になる可能性があります。
- WorldViewの横スクロールは現状デスクトップのみで有効です。タブレット幅
  （iPad想定）での見え方は実機での確認をおすすめします。
- Philosophyセクションで、各行のフェードアウトから次の行のフェードインまでの
  間に短い「無地の間（ま）」が生じます（意図した「静けさ」の演出ですが、
  やや長く感じる場合は `components/Philosophy.tsx` 内のタイムライン位置
  （`step * 0.55` 等の係数）を詰めてください）。
