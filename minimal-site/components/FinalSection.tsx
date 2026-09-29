"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, getMediaFlags } from "@/lib/gsap";

const WORDS = ["Less.", "But better.", "minimal"];

export default function FinalSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const wordRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const { reduced } = getMediaFlags();

      if (reduced) {
        gsap.set(wordRefs.current, { opacity: 0 });
        gsap.set(wordRefs.current[wordRefs.current.length - 1], { opacity: 1 });
        return;
      }

      gsap.set(wordRefs.current, { opacity: 0, y: 14 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=200%",
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
        },
      });

      // 演出は最小限。フェードのみ。ここは「静寂」のセクションにする。
      WORDS.forEach((_, i) => {
        const el = wordRefs.current[i];
        if (!el) return;
        tl.to(el, { opacity: 1, y: 0, duration: 0.3, ease: "power1.out" }, i * 0.28);
        if (i < WORDS.length - 1) {
          tl.to(el, { opacity: 0, duration: 0.15 }, i * 0.28 + 0.22);
        }
      });
      tl.to({}, { duration: 0.3 }); // 最後の「minimal」を長く見つめさせる間
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <section
        id="about"
        ref={sectionRef}
        className="relative flex h-screen w-full items-center justify-center bg-white"
      >
        <div className="relative flex h-24 items-center justify-center">
          {WORDS.map((word, i) => (
            <span
              key={word}
              ref={(el) => {
                wordRefs.current[i] = el;
              }}
              className={`absolute whitespace-nowrap ${
                word === "minimal"
                  ? "text-display-1 font-semibold text-ink"
                  : "text-display-2 font-normal text-graphite"
              }`}
            >
              {word}
            </span>
          ))}
        </div>
      </section>

      <footer id="final" className="border-t border-line bg-white px-6 py-16 sm:px-10">
        <div className="mx-auto flex max-w-wide flex-col items-start justify-between gap-10 sm:flex-row sm:items-end">
          <div>
            <p className="text-body text-graphite">
              必要なものだけで、毎日を整える。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#"
                className="rounded-full border border-ink px-5 py-2.5 text-[13px] text-ink transition-colors duration-300 hover:bg-ink hover:text-white"
              >
                App Storeでダウンロード
              </a>
            </div>
          </div>
          <nav className="flex gap-8 text-[13px] text-graphite">
            <a href="#schedule" className="hover:text-ink">Schedule</a>
            <a href="#todo" className="hover:text-ink">Todo</a>
            <a href="#finance" className="hover:text-ink">Finance</a>
          </nav>
        </div>
        <p className="mx-auto mt-16 max-w-wide text-caption text-graphite/70">
          © {new Date().getFullYear()} minimal
        </p>
      </footer>
    </>
  );
}
