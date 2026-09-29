// 実機の「Today」画面デザインをHTML/CSSで再現したもの。
// スクリーンショットをそのまま貼るのではなく、実際のUIと同じ構造・比率で
// コード上に再構築することで、他の演出（拡大・回転・重なり）と自然になじませる。
const SLOTS = [
  { time: "06:00", label: "朝" },
  { time: "09:00", label: "午前" },
  { time: "12:00", label: "昼" },
  { time: "16:00", label: "午後" },
  { time: "20:00", label: "夜" },
];

export default function ScheduleUI() {
  return (
    <div className="flex h-full flex-col bg-white px-4 pb-3 pt-5">
      {/* ヘッダー */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-[20px] font-extrabold leading-none tracking-tight text-ink">
            Today
          </h3>
          <p className="mt-1.5 text-[10px] text-graphite">9.3 Thu</p>
        </div>
        <div className="flex gap-1.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-mist text-[10px] text-ink">
            •••
          </span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-mist text-[12px] text-ink">
            +
          </span>
        </div>
      </div>

      {/* タイムライン */}
      <div className="mt-4 flex flex-1 flex-col gap-2.5 overflow-hidden">
        {SLOTS.map((slot, i) => (
          <div key={slot.time} className="flex gap-2">
            <div className="flex w-7 flex-shrink-0 flex-col items-center">
              <span className="text-[8px] leading-none text-graphite">{slot.time}</span>
              <span className="mt-1.5 h-1 w-1 rounded-full bg-graphite/50" />
              {i < SLOTS.length - 1 && (
                <span className="mt-1 w-px flex-1 bg-line" />
              )}
            </div>
            <div className="flex-1 rounded-xl bg-mist px-3 py-2">
              <p className="text-[12px] font-bold leading-tight text-ink">
                {slot.label}
              </p>
              <p className="mt-0.5 text-[9px] leading-tight text-graphite/70">
                予定なし
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Today / Tomorrow セグメント */}
      <div className="mt-2 flex gap-1 rounded-full bg-mist p-1">
        <div className="flex-1 rounded-full bg-ink py-1.5 text-center text-[10px] font-medium text-white">
          Today
        </div>
        <div className="flex-1 rounded-full py-1.5 text-center text-[10px] text-graphite">
          Tomorrow
        </div>
      </div>
    </div>
  );
}
