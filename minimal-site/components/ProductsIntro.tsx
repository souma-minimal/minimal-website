"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { gsap, getMediaFlags } from "@/lib/gsap";

const APPS = [
  {
    name: "Schedule",
    accent: "bg-accent-schedule",
    icon: "/images/brand/schedule-icon.png",
    from: { x: -160, y: -80 },
  },
  {
    name: "Todo",
    accent: "bg-accent-todo",
    icon: "/images/brand/todo-icon.png",
    from: { x: 0, y: -140 },
  },
  { name: "Finance", accent: "bg-accent-finance", icon: null, from: { x: 160, y: -80 } },
];

export default function ProductsIntro() {
  const sectionRef = useRef<HTMLElement>(null);
  const iconRefs = useRef<Array<HTMLDivElement | null>>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const { reduced } = getMediaFlags();

      if (reduced) {
        gsap.set(iconRefs.current, { opacity: 1, x: 0, y: 0 });
        gsap.set(gridRef.current, { opacity: 1 });
        gsap.set(labelRef.current, { opacity: 1 });
        return;
      }

      iconRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, { opacity: 0, x: APPS[i].from.x, y: APPS[i].from.y, scale: 0.6 });
      });
      gsap.set(gridRef.current, { opacity: 0 });
      gsap.set(labelRef.current, { opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=150%",
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
        },
      });

      iconRefs.current.forEach((el, i) => {
        if (!el) return;
        tl.to(
          el,
          { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.4, ease: "power2.out" },
          i * 0.08
        );
      });
      tl.to(gridRef.current, { opacity: 1, duration: 0.25 }, 0.45);
      tl.to(labelRef.current, { opacity: 1, duration: 0.25 }, 0.6);
      tl.to({}, { duration: 0.2 }); // 静止する「間」
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-white"
    >
      <div
        ref={gridRef}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[200px] w-[560px] -translate-x-1/2 -translate-y-1/2 border-y border-line"
      />
      <div className="flex items-center gap-10 sm:gap-16">
        {APPS.map((app, i) => (
          <div
            key={app.name}
            ref={(el) => {
              iconRefs.current[i] = el;
            }}
            className="flex flex-col items-center gap-3"
          >
            {app.icon ? (
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl sm:h-20 sm:w-20">
                <Image src={app.icon} alt={`${app.name}アイコン`} fill sizes="80px" />
              </div>
            ) : (
              <div className={`h-16 w-16 rounded-2xl sm:h-20 sm:w-20 ${app.accent}`} />
            )}
            <span className="text-caption text-graphite">{app.name}</span>
          </div>
        ))}
      </div>
      <p
        ref={labelRef}
        className="absolute bottom-[16%] px-6 text-center text-body text-graphite"
      >
        3つのアプリは、同じ余白のルールでできている。
      </p>
    </section>
  );
}
