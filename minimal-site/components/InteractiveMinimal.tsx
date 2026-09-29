"use client";

import { useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

// 日常にある「必要以上のもの」の例。ここをタップして消していく体験そのものが
// minimalのブランドメッセージを、説明ではなく行為として伝える。
const ITEMS = ["通知", "広告", "会議", "SNS", "締め切り", "雑念", "選択肢", "例外"];

export default function InteractiveMinimal() {
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const allRemoved = removed.size === ITEMS.length;

  const handleRemove = (item: string) => {
    const el = itemRefs.current[item];
    if (!el || removed.has(item)) return;
    gsap.to(el, {
      opacity: 0,
      scale: 0.6,
      y: 10,
      duration: 0.35,
      ease: "power2.in",
      onComplete: () => {
        setRemoved((prev) => new Set(prev).add(item));
      },
    });
  };

  return (
    <section className="relative flex min-h-[70vh] w-full flex-col items-center justify-center gap-10 bg-white px-6 py-24 text-center">
      <p className="text-body text-graphite">
        気になるものを、タップして消してみてください。
      </p>

      <div className="relative flex min-h-[9rem] w-full max-w-2xl flex-wrap items-center justify-center gap-3">
        {ITEMS.map((item) =>
          removed.has(item) ? null : (
            <button
              key={item}
              ref={(el) => {
                itemRefs.current[item] = el;
              }}
              onClick={() => handleRemove(item)}
              className="rounded-full border border-line bg-mist px-5 py-2.5 text-[14px] text-graphite transition-colors duration-300 hover:border-ink hover:text-ink"
            >
              {item}
            </button>
          )
        )}
      </div>

      <p
        aria-hidden={!allRemoved}
        className={`text-display-3 font-medium text-ink transition-opacity duration-700 ${
          allRemoved ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        これが、minimalのはじまり方です。
      </p>
    </section>
  );
}
