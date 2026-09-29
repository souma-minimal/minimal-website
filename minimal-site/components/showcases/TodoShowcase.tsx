"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, getMediaFlags } from "@/lib/gsap";
import PhoneMockup from "@/components/PhoneMockup";
import TodoUI from "@/components/mockups/TodoUI";

// 整理される前の、頭の中に散らばった「やること」の断片
const SCRAPS = [
  { text: "洗濯", className: "left-[14%] top-[30%] -rotate-6" },
  { text: "メール返信", className: "right-[16%] top-[24%] rotate-3" },
  { text: "買い出し", className: "left-[18%] bottom-[28%] rotate-2" },
  { text: "掃除", className: "right-[12%] bottom-[32%] -rotate-3" },
];

export default function TodoShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const phoneWrapRef = useRef<HTMLDivElement>(null);
  const scrapRefs = useRef<Array<HTMLDivElement | null>>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const solidRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const { isMobile, reduced } = getMediaFlags();

      if (reduced) {
        gsap.set(copyRef.current, { opacity: 1 });
        gsap.set(solidRef.current, { opacity: 1 });
        gsap.set(phoneWrapRef.current, { opacity: 0 });
        return;
      }

      gsap.set(phoneWrapRef.current, { rotateY: -62, opacity: 1, scale: 0.9 });
      gsap.set(scrapRefs.current, { opacity: 0, scale: 0.8 });
      gsap.set(gridRef.current, { opacity: 0 });
      gsap.set(copyRef.current, { opacity: 0, y: 12 });
      gsap.set(solidRef.current, { opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: isMobile ? "+=260%" : "+=400%",
          scrub: 0.7,
          pin: true,
          anticipatePin: 1,
        },
      });

      // 0 - 0.25 : 画面が開くようなY軸回転
      tl.to(
        phoneWrapRef.current,
        { rotateY: 0, scale: 1.05, duration: 0.25, ease: "power2.out" },
        0
      );

      // 0.25 - 0.55 : やることが一度増えて（頭の中の断片）→ 整理されて消えていく
      scrapRefs.current.forEach((el, i) => {
        if (!el) return;
        tl.to(el, { opacity: 1, scale: 1, duration: 0.08 }, 0.26 + i * 0.03);
      });
      scrapRefs.current.forEach((el, i) => {
        if (!el) return;
        tl.to(el, { opacity: 0, scale: 0.85, duration: 0.1 }, 0.42 + i * 0.03);
      });

      // 0.55 - 0.8 : 背景グリッドが静かに流れる
      tl.to(gridRef.current, { opacity: 1, y: -20, duration: 0.25, ease: "none" }, 0.55);

      // 0.8 - 1.0 : 収束
      tl.to(phoneWrapRef.current, { scale: 0.7, opacity: 0, duration: 0.2 }, 0.8)
        .to(gridRef.current, { opacity: 0, duration: 0.15 }, 0.8)
        .to(solidRef.current, { opacity: 1, duration: 0.2 }, 0.82)
        .to(copyRef.current, { opacity: 1, y: 0, duration: 0.2 }, 0.88);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="todo"
      ref={sectionRef}
      className="pin-wrap relative h-screen w-full bg-mist"
    >
      <div
        ref={gridRef}
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div
        ref={stageRef}
        className="absolute inset-0 flex items-center justify-center"
        style={{ perspective: "1400px" }}
      >
        {SCRAPS.map((s, i) => (
          <div
            key={s.text}
            ref={(el) => {
              scrapRefs.current[i] = el;
            }}
            className={`pointer-events-none absolute rounded-sm border border-line bg-white px-3 py-2 text-[11px] text-graphite shadow-sm ${s.className}`}
          >
            {s.text}
          </div>
        ))}
        <div ref={phoneWrapRef} style={{ willChange: "transform", transformStyle: "preserve-3d" }}>
          <PhoneMockup>
            <TodoUI />
          </PhoneMockup>
        </div>
      </div>

      <div ref={solidRef} className="absolute inset-0 bg-accent-todo" />

      <div
        ref={copyRef}
        className="absolute inset-x-0 bottom-[14%] flex flex-col items-center px-6 text-center"
      >
        <span className="text-caption text-white/80">minimal Todo</span>
        <p className="mt-2 text-display-3 font-medium text-white">
          やることリストから、無駄を消す。
        </p>
      </div>
    </section>
  );
}
