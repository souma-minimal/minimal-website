"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, getMediaFlags } from "@/lib/gsap";
import PhoneMockup from "@/components/PhoneMockup";
import ScheduleUI from "@/components/mockups/ScheduleUI";

export default function ScheduleShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const phoneWrapRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Array<HTMLDivElement | null>>([]);
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

      gsap.set(phoneWrapRef.current, { scale: 0.55, opacity: 1 });
      gsap.set(lineRefs.current, { opacity: 0 });
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

      // 0 - 0.3 : 拡大（小さな存在感から、主役として立ち上がる）
      tl.to(phoneWrapRef.current, { scale: 1.15, duration: 0.3, ease: "power2.out" }, 0);

      // 0.3 - 0.55 : 軽く左右に動く = 画面を操作しているような感覚
      tl.to(phoneWrapRef.current, { x: -18, rotateZ: -1.5, duration: 0.12 }, 0.32)
        .to(phoneWrapRef.current, { x: 16, rotateZ: 1, duration: 0.12 }, 0.44)
        .to(phoneWrapRef.current, { x: 0, rotateZ: 0, duration: 0.1 }, 0.56);

      // 0.55 - 0.8 : 背景の「時間の線」が異なる速度で重なっていく（パララックス＋層）
      lineRefs.current.forEach((el, i) => {
        if (!el) return;
        tl.to(
          el,
          { opacity: 1, y: -30 - i * 14, duration: 0.35, ease: "none" },
          0.55 + i * 0.03
        );
      });

      // 0.8 - 1.0 : すべてが収束し、単色＋コピーへ
      tl.to(phoneWrapRef.current, { scale: 0.7, opacity: 0, duration: 0.2 }, 0.8)
        .to(lineRefs.current, { opacity: 0, duration: 0.15 }, 0.8)
        .to(solidRef.current, { opacity: 1, duration: 0.2 }, 0.82)
        .to(copyRef.current, { opacity: 1, y: 0, duration: 0.2 }, 0.88);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="schedule"
      ref={sectionRef}
      className="pin-wrap relative h-screen w-full bg-white"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {/* 時間の線（層として重なる装飾要素） */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            ref={(el) => {
              lineRefs.current[i] = el;
            }}
            className="pointer-events-none absolute h-px bg-accent-schedule/30"
            style={{ width: `${220 + i * 90}px`, top: `${40 + i * 8}%` }}
          />
        ))}
        <div ref={phoneWrapRef} style={{ willChange: "transform" }}>
          <PhoneMockup>
            <ScheduleUI />
          </PhoneMockup>
        </div>
      </div>

      <div ref={solidRef} className="absolute inset-0 bg-accent-schedule" />

      <div
        ref={copyRef}
        className="absolute inset-x-0 bottom-[14%] flex flex-col items-center px-6 text-center"
      >
        <span className="text-caption text-white/80">minimal Schedule</span>
        <p className="mt-2 text-display-3 font-medium text-white">
          予定表から、迷いを消す。
        </p>
      </div>
    </section>
  );
}
