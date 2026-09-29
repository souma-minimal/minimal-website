"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, getMediaFlags } from "@/lib/gsap";

// 最初に画面に散らばせる「ノイズ」= 削られる前の候補群。
// これらが消えていく過程そのものが、ブランドの引き算を体験させる。
const NOISE_ITEMS = [
  { text: "予定を、増やさない。", className: "left-[8%] top-[22%] rotate-[-4deg]" },
  { text: "もっと、便利に。", className: "right-[10%] top-[18%] rotate-[3deg]" },
  { text: "たくさんの機能。", className: "left-[12%] bottom-[26%] rotate-[2deg]" },
  { text: "常に、繋がる。", className: "right-[8%] bottom-[24%] rotate-[-2deg]" },
  { text: "選択肢を、増やす。", className: "left-[46%] top-[10%] rotate-[1deg]" },
];

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const noiseRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const shapeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const wordmarkRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const { isMobile, reduced } = getMediaFlags();

      if (reduced) {
        gsap.set(noiseRefs.current, { opacity: 0 });
        gsap.set(shapeRefs.current, { opacity: 0 });
        gsap.set(taglineRef.current, { opacity: 1, y: 0 });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: isMobile ? "+=60%" : "+=100%",
          scrub: 0.6,
          pin: !isMobile, // モバイルはpinせず、負荷の軽いスクラブのみ
          anticipatePin: 1,
        },
      });

      // ノイズ要素は時間差をつけて個別に消える（一斉に消えると単調になる）
      noiseRefs.current.forEach((el, i) => {
        if (!el) return;
        tl.to(
          el,
          {
            opacity: 0,
            y: -24 - i * 6,
            scale: 0.9,
            duration: 0.5,
            ease: "power2.out",
          },
          i * 0.08
        );
      });

      shapeRefs.current.forEach((el, i) => {
        if (!el) return;
        tl.to(
          el,
          { opacity: 0, scale: 0.7, duration: 0.5, ease: "power2.out" },
          0.1 + i * 0.1
        );
      });

      // 残った要素はわずかに引き締まる（消えていく過程の"軸"として機能させる）
      tl.to(
        wordmarkRef.current,
        { scale: 1.03, duration: 0.6, ease: "power1.out" },
        0.15
      );
      tl.to(
        taglineRef.current,
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        0.5
      );
      tl.to(cueRef.current, { opacity: 0, duration: 0.3 }, 0);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-paper"
    >
      {/* ノイズ：削られる前の候補コピー群 */}
      {NOISE_ITEMS.map((item, i) => (
        <span
          key={item.text}
          ref={(el) => {
            noiseRefs.current[i] = el;
          }}
          className={`pointer-events-none absolute hidden text-[13px] text-graphite sm:block ${item.className}`}
        >
          {item.text}
        </span>
      ))}

      {/* ノイズ：装飾的な図形 */}
      <div
        ref={(el) => {
          shapeRefs.current[0] = el;
        }}
        className="pointer-events-none absolute left-[20%] top-[14%] h-16 w-16 rounded-full border border-line"
      />
      <div
        ref={(el) => {
          shapeRefs.current[1] = el;
        }}
        className="pointer-events-none absolute right-[18%] bottom-[16%] h-px w-32 bg-line"
      />
      <div
        ref={(el) => {
          shapeRefs.current[2] = el;
        }}
        className="pointer-events-none absolute right-[24%] top-[26%] h-10 w-10 border border-line"
      />

      {/* 残るもの：ロゴとタグライン */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <h1
          ref={wordmarkRef}
          className="text-display-1 font-semibold tracking-tight text-ink"
        >
          minimal
        </h1>
        <p
          ref={taglineRef}
          className="mt-6 -translate-y-2 text-display-3 font-normal text-graphite opacity-0"
        >
          必要なものだけで、
          <br className="sm:hidden" />
          毎日を整える。
        </p>
      </div>

      <div
        ref={cueRef}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-caption text-graphite"
      >
        scroll
      </div>
    </section>
  );
}
