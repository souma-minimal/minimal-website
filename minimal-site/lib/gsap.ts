"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ── プラグイン登録はモジュール読み込み時（トップレベル）で同期的に行う ──
// Reactでは「子のuseLayoutEffectは親のuseEffectより先に実行される」ため、
// registerPluginをどこかのコンポーネントのuseEffect内で呼ぶと、
// 各セクションがScrollTriggerを使おうとした時点でまだ未登録という
// 競合状態が起こり、pin/scrubが一切効かなくなる（サイレントに失敗する）。
// モジュールのトップレベルで即時登録することで、どのコンポーネントの
// エフェクトよりも確実に先に登録を完了させる。
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * レイアウト確定後にScrollTriggerの計測をやり直す
 * (フォント読み込み・画像読み込みによる高さのズレ対策)
 *
 * 注意: window の "load" イベントは、このフックが実行される時点で
 * 既に発火し終えている場合がある（開発サーバーなど読み込みが速いケース）。
 * その場合 addEventListener("load", ...) は二度と呼ばれず、
 * 他の固定(pin)セクションがまだ挿入していないスペーサー分だけ
 * ページ全体の高さが実際より短く計測されたままになる
 * （ページ全体のスクロール量を使うReductionCounterなどが早く0に近づく原因）。
 * useEffect（本フック）はどのコンポーネントのuseLayoutEffectよりも後に
 * 実行されるため、ここで直接refreshすれば全セクションのpin挿入後の
 * 正しい高さで再計測できる。loadイベントは画像等の後読み込み対策として残す。
 */
export function useGsapSetup() {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();

    refresh();
    const raf = requestAnimationFrame(refresh);
    window.addEventListener("load", refresh);

    // WorldJourneyの3Dシーン(dynamic import)のように、初回コミット後
    // 非同期でマウントされてページ全体の高さが後から変わるケースに追従する。
    // ページ全体の高さが変化するたびに、ScrollTriggerの計測をやり直す。
    let debounce: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      clearTimeout(debounce);
      debounce = setTimeout(refresh, 150);
    });
    ro.observe(document.body);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(debounce);
      window.removeEventListener("load", refresh);
      ro.disconnect();
    };
  }, []);
}

export { gsap, ScrollTrigger };

/** モバイル判定。ピン留めの多用や3D演出の強度をここで分岐する。 */
export const MOBILE_QUERY = "(max-width: 767px)";
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * 現在のビューポート状態を同期的に取得する。
 *
 * 以前は `gsap.matchMedia()` の複数条件オブジェクトAPIを使っていたが、
 * React 18 Strict Modeの「マウント→アンマウント→再マウント」と
 * matchMediaのコールバックの発火タイミングが噛み合わず、
 * コールバックが一度も実行されない不具合があった（＝pin/scrubが
 * 一切効かず、アニメーションが常に最終状態のまま固まって見えた）。
 * 実行タイミングが確実な同期関数に置き換えることで、
 * 各コンポーネントのuseLayoutEffect内で確実に評価できるようにする。
 */
export function getMediaFlags() {
  if (typeof window === "undefined") {
    return { isMobile: false, reduced: false };
  }
  return {
    isMobile: window.matchMedia(MOBILE_QUERY).matches,
    reduced: window.matchMedia(REDUCED_MOTION_QUERY).matches,
  };
}
