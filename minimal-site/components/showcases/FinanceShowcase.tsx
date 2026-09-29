"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, getMediaFlags } from "@/lib/gsap";
import PhoneMockup from "@/components/PhoneMockup";
import FinanceUI from "@/components/mockups/FinanceUI";

// Schedule/Todoは「中央に置いたUIが拡大・回転して単色に収束する」という
// 共通の型を使っている。Financeだけは意図的にその型を崩し、
// 左：テキストが段階的に切り替わる／右：UIが動く、という
// 非対称の分割構成にすることで、3アプリ紹介が単なるテンプレートの
// 繰り返しに見えないようにしている。
const STAGES = [
  "毎月、なんとなく残るお金の不安。",
  "何にいくら使ったかを、数字で見る。",
  "本当に必要な支出だけが、残る。",
];

export default function FinanceShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const phoneWrapRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const categoryEls = useRef<Array<HTMLDivElement | null>>([]);
  const stageRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const finalCopyRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const { isMobile, reduced } = getMediaFlags();

      if (reduced) {
        gsap.set(stageRefs.current[stageRefs.current.length - 1], { opacity: 1 });
        gsap.set(finalCopyRef.current, { opacity: 1 });
        if (numberRef.current) numberRef.current.textContent = "128,400";
        return;
      }

      gsap.set(phoneWrapRef.current, { scale: 0.75, opacity: 1, y: 40 });
      gsap.set(stageRefs.current, { opacity: 0, y: 10 });
      gsap.set(stageRefs.current[0], { opacity: 1, y: 0 });
      gsap.set(finalCopyRef.current, { opacity: 0, y: 10 });

      const counter = { value: 0 };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: isMobile ? "+=280%" : "+=380%",
          scrub: 0.7,
          pin: true,
          anticipatePin: 1,
        },
      });

      // 0 - 0.28 : 一段目のコピー→フォーカスが立ち上がる
      tl.to(phoneWrapRef.current, { scale: 1, y: 0, duration: 0.28, ease: "power2.out" }, 0);

      // 0.28 : 一段目→二段目のコピー切り替え
      tl.to(stageRefs.current[0], { opacity: 0, y: -10, duration: 0.08 }, 0.28)
        .to(stageRefs.current[1], { opacity: 1, y: 0, duration: 0.08 }, 0.3);

      // 0.3 - 0.6 : 数字が積み上がっていく（スクロール量＝進捗）
      tl.to(
        counter,
        {
          value: 128400,
          duration: 0.3,
          ease: "power1.out",
          onUpdate: () => {
            if (numberRef.current) {
              numberRef.current.textContent = Math.round(
                counter.value
              ).toLocaleString("ja-JP");
            }
          },
        },
        0.3
      );

      // 0.58 : 二段目→三段目のコピー切り替え
      tl.to(stageRefs.current[1], { opacity: 0, y: -10, duration: 0.08 }, 0.58)
        .to(stageRefs.current[2], { opacity: 1, y: 0, duration: 0.08 }, 0.6);

      // 0.6 - 0.85 : 不要な項目が一つずつ消えていく
      categoryEls.current.forEach((el, i) => {
        if (!el) return;
        tl.to(
          el,
          { opacity: 0, x: -12, height: 0, marginBottom: 0, paddingBottom: 0, duration: 0.06 },
          0.62 + i * 0.045
        );
      });

      // 0.85 - 1.0 : 右側パネルだけが単色に収束する（左のコピー欄は白のまま）
      tl.to(phoneWrapRef.current, { scale: 0.85, opacity: 0, duration: 0.15 }, 0.85)
        .to(rightPanelRef.current, { backgroundColor: "#1C8F6E", duration: 0.15 }, 0.85)
        .to(stageRefs.current[2], { opacity: 0, duration: 0.1 }, 0.85)
        .to(finalCopyRef.current, { opacity: 1, y: 0, duration: 0.15 }, 0.92);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="finance"
      ref={sectionRef}
      className="pin-wrap relative grid h-screen w-full grid-cols-1 bg-white md:grid-cols-[0.85fr_1.15fr]"
    >
      {/* 左：段階的に切り替わるコピー（左寄せ・非中央） */}
      <div className="relative z-10 flex flex-col justify-center gap-2 px-8 py-16 sm:px-12 md:px-16">
        <span className="text-caption text-graphite">minimal Finance</span>
        <div className="relative mt-3 h-[5.5rem] sm:h-28">
          {STAGES.map((stage, i) => (
            <p
              key={stage}
              ref={(el) => {
                stageRefs.current[i] = el;
              }}
              className="absolute left-0 top-0 max-w-sm text-display-3 font-medium leading-snug text-ink"
            >
              {stage}
            </p>
          ))}
        </div>
        <div ref={finalCopyRef} className="mt-1">
          <p className="max-w-sm text-display-3 font-medium leading-snug text-ink">
            家計簿から、不安を消す。
          </p>
        </div>
      </div>

      {/* 右：UI（拡大・数値の変化・項目の削除のみ。回転や単色フルブリードはしない） */}
      <div
        ref={rightPanelRef}
        className="relative flex items-center justify-center overflow-hidden bg-mist"
      >
        <div ref={phoneWrapRef} style={{ willChange: "transform" }}>
          <PhoneMockup>
            <FinanceUI
              numberRef={numberRef}
              categoryRefs={(el, i) => {
                categoryEls.current[i] = el;
              }}
            />
          </PhoneMockup>
        </div>
      </div>
    </section>
  );
}
