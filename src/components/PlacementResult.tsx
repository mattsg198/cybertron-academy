import type { Placement } from '../lib/placement'

export default function PlacementResult({
  placement,
  correct,
  total,
  onContinue,
}: {
  placement: Placement
  correct: number
  total: number
  onContinue: () => void
}) {
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-5 px-8 text-center">
      <div className="text-7xl">🛰️</div>
      <h1 className="text-3xl font-black">定级扫描完成！</h1>
      <p className="text-lg text-white/70">
        答对 <span className="font-black text-energon">{correct}</span> / {total} 题
      </p>
      <div className="rounded-3xl border-2 border-cyber/40 bg-cyber/10 px-8 py-6">
        <p className="mb-1 text-sm text-white/55">推荐起点</p>
        <p className="text-2xl font-black text-cyber">{placement.label}</p>
        <p className="mt-1 text-white/70">{placement.zh}</p>
      </div>
      <p className="max-w-md text-sm text-white/50">
        之前的扇区已自动标记完成，孩子可以直接从这里开始；当然也能回到地图复习任何关卡。
      </p>
      <button
        onClick={onContinue}
        className="rounded-2xl bg-cyber px-10 py-3 text-lg font-black text-black active:scale-95"
      >
        进入地图 ▶
      </button>
    </div>
  )
}
