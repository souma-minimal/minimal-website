"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { gsap, getMediaFlags } from "@/lib/gsap";

const PANELS = [
  {
    name: "Schedule",
    accent: "bg-accent-schedule",
    icon: "/images/brand/schedule-icon.png",
    copy: "予定を、削ぎ落とす。",
  },
  {
    name: "Todo",
    accent: "bg-accent-todo",
    icon: "/images/brand/todo-icon.png",
    copy: "やることを、削ぎ落とす。",
  },
  { name: "Finance", accent: "bg-accent-finance", icon: null, copy: "数字を、削ぎ落とす。" },
];

export default function WorldView() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const { isMobile, reduced } = getMediaFlags();

      if (reduced || !trackRef.current || !sectionRef.current) return;

      // モバイルは縦積みレイアウトにして、横スクロールジャックはしない
      if (isMobile) return;

      const track = trackRef.current;
      const distance = track.scrollWidth - window.innerWidth;

      gsap.to(track, {
        x: -distance,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${distance}`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-void"
    >
      <div className="absolute left-6 top-8 z-10 text-caption text-white/60 sm:left-10 sm:top-10">
        World View
      </div>
      <div
        ref={trackRef}
        className="flex h-full w-max flex-col sm:flex-row"
        style={{ willChange: "transform" }}
      >
        {PANELS.map((panel) => (
          <div
            key={panel.name}
            className="flex h-screen w-screen flex-shrink-0 flex-col items-center justify-center gap-6 px-6"
          >
            {panel.icon ? (
              <div className="relative h-24 w-24 overflow-hidden rounded-3xl">
                <Image src={panel.icon} alt={`${panel.name}アイコン`} fill sizes="96px" />
              </div>
            ) : (
              <div className={`h-24 w-24 rounded-3xl ${panel.accent}`} />
            )}
            <div className="text-center">
              <p className="text-display-3 font-medium text-white">
                minimal {panel.name}
              </p>
              <p className="mt-2 text-body text-white/60">{panel.copy}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
