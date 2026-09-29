"use client";

import { useEffect, useRef } from "react";

const START_COUNT = 24;

/**
 * 画面の隅に常駐し、ページ全体のスクロール進捗に応じて
 * 24 → 01 へと数字が減っていくカウンター。
 * 「引き算」という抽象的な思想を、具体的な数字の変化として体感させる。
 *
 * ScrollTriggerではなく、素のscrollイベントから直接計算している。
 * 理由: ページ内には複数のpin(固定)セクションがあり、それぞれが
 * 非同期にpin-spacerを挿入してページ全体の高さを後から変化させる
 * （3Dシーンなど動的インポートされるものは特に顕著）。
 * ScrollTrigger越しに「ページ全体の高さ」をtrigger:document.bodyとして
 * 一度計測してしまうと、他のセクションの高さが確定する前の値で
 * 固まってしまうことがある。scrollイベント側で毎回
 * document.documentElement.scrollHeight を読み直す方式なら、
 * 常に最新の実測値に基づいて進捗を計算できる。
 */
export default function ReductionCounter() {
  const numberRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const value = Math.round(START_COUNT - progress * (START_COUNT - 1));
      if (numberRef.current) {
        numberRef.current.textContent = String(value).padStart(2, "0");
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-6 left-6 z-40 mix-blend-difference sm:bottom-8 sm:left-8">
      <div className="flex flex-col items-start">
        <span
          ref={numberRef}
          className="font-mono text-[20px] leading-none text-white sm:text-[22px]"
        >
          24
        </span>
        <span className="mt-1.5 text-[8px] uppercase tracking-[0.2em] text-white/70 sm:text-[9px]">
          reducing
        </span>
      </div>
    </div>
  );
}
