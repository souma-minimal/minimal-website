import { forwardRef } from "react";

type FinanceUIProps = {
  numberRef?: React.Ref<HTMLSpanElement>;
  categoryRefs?: (el: HTMLDivElement | null, index: number) => void;
};

const CATEGORIES = ["サブスク", "外食", "交際費", "家賃"];

const FinanceUI = forwardRef<HTMLDivElement, FinanceUIProps>(
  ({ numberRef, categoryRefs }, ref) => {
    return (
      <div ref={ref} className="flex h-full flex-col p-5">
        <span className="text-[11px] font-medium text-ink">今月の残高</span>
        <div className="mt-2 font-mono text-[26px] font-medium text-ink">
          ¥<span ref={numberRef}>0</span>
        </div>
        <div className="mt-4 flex h-14 items-end gap-1.5">
          {[40, 65, 30, 80, 55, 90, 70].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-accent-finance/70"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="mt-4 flex flex-1 flex-col gap-2">
          {CATEGORIES.map((cat, i) => (
            <div
              key={cat}
              ref={(el) => categoryRefs?.(el, i)}
              className="flex items-center justify-between border-b border-line pb-1.5 text-[10px] text-graphite"
            >
              <span>{cat}</span>
              <span className="font-mono">— </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

FinanceUI.displayName = "FinanceUI";
export default FinanceUI;
