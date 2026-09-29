// 実機の「TODAY」ToDo画面デザインをHTML/CSSで再現したもの。
// スクリーンショットをそのまま貼るのではなく、実際のUIと同じ構造・比率で
// コード上に再構築する。タスクの内容は個人的なものではなく、
// minimalのブランドトーンに合う一般的な項目に置き換えている。
const TASKS = ["読書", "散歩", "水を飲む", "日記を書く", "早く寝る"];

export default function TodoUI() {
  return (
    <div className="flex h-full flex-col bg-white px-4 pb-3 pt-5">
      {/* ヘッダー */}
      <div className="flex items-start justify-between">
        <h3 className="text-[20px] font-extrabold uppercase leading-none tracking-tight text-ink">
          Today
        </h3>
        <span className="text-[11px] tracking-widest text-graphite">•••</span>
      </div>

      {/* タスクリスト */}
      <div className="mt-4 flex flex-1 flex-col overflow-hidden">
        {TASKS.map((task, i) => (
          <div key={task}>
            <div className="flex items-center gap-2.5 py-2.5">
              <span className="h-4 w-4 flex-shrink-0 rounded-full border-[1.5px] border-graphite/40" />
              <span className="text-[12.5px] font-semibold leading-tight text-ink">
                {task}
              </span>
            </div>
            {i < TASKS.length - 1 && <div className="h-px w-full bg-line" />}
          </div>
        ))}
      </div>

      {/* 追加ボタン */}
      <div className="flex items-center justify-between rounded-full border border-dashed border-line px-3 py-2.5">
        <span className="text-[10px] text-graphite/70">+ やることを追加</span>
        <span className="text-[9px] tracking-widest text-graphite/50">•••</span>
      </div>

      {/* タブ */}
      <div className="mt-2.5 flex items-center gap-4">
        <div className="flex flex-col items-start gap-1">
          <span className="h-[2px] w-4 rounded-full bg-ink" />
          <span className="text-[10px] font-semibold text-ink">Today</span>
        </div>
        <span className="text-[10px] text-graphite/60">Done</span>
      </div>
    </div>
  );
}
