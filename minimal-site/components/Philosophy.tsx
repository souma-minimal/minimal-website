"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, getMediaFlags } from "@/lib/gsap";

const LINES = ["予定を、減らす。", "メモを、減らす。", "お金の悩みを、減らす。", "minimal"];

export default function Philosophy() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const bgRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const { isMobile, reduced } = getMediaFlags();

      if (reduced) {
        gsap.set(lineRefs.current, { opacity: 0 });
        gsap.set(lineRefs.current[lineRefs.current.length - 1], { opacity: 1 });
        return;
      }

      gsap.set(lineRefs.current, { opacity: 0, y: 16 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: isMobile ? "+=220%" : "+=300%",
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
        },
      });

      const step = 1 / LINES.length;
      LINES.forEach((_, i) => {
        const el = lineRefs.current[i];
        if (!el) return;
        const start = i * step;
        tl.to(el, { opacity: 1, y: 0, duration: step * 0.35, ease: "power2.out" }, start);
        // 最後の行（minimal）は残す。それ以外はフェードアウトさせて次へ譲る
        if (i < LINES.length - 1) {
          tl.to(
            el,
            { opacity: 0, y: -16, duration: step * 0.35, ease: "power2.in" },
            start + step * 0.55
          );
        }
      });

      // スクロールが進むほど背景のコントラストを静かに落としていく
      tl.to(
        bgRef.current,
        { backgroundColor: "#F4F4F2", duration: 1, ease: "none" },
        0
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-paper"
    >
      <div ref={bgRef} className="absolute inset-0 bg-paper" />
      <div className="relative z-10 w-full px-6 text-center">
        {LINES.map((line, i) => (
          <p
            key={line}
            ref={(el) => {
              lineRefs.current[i] = el;
            }}
            className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap opacity-0 ${
              line === "minimal"
                ? "left-1/2 -translate-x-1/2 text-display-1 font-semibold text-ink"
                : "left-1/2 -translate-x-1/2 text-display-2 font-normal text-ink sm:left-[38%]"
            }`}
          >
            {line}
          </p>
        ))}
      </div>
    </section>
  );
}
