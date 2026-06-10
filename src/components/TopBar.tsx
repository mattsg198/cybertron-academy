import { useGameStore } from '../store/useGameStore'

export default function TopBar({ onOpenCollection }: { onOpenCollection: () => void }) {
  const energon = useGameStore((s) => s.energon)
  const streak = useGameStore((s) => s.streak)
  const robots = useGameStore((s) => s.unlockedRobots.length)
  const energonToday = useGameStore((s) => s.energonToday)
  const goal = useGameStore((s) => s.dailyGoal)
  const goalPct = Math.min(100, Math.round((energonToday / goal) * 100))

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0a0f2c]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 text-lg">
        <div className="flex items-center gap-1.5 font-extrabold">
          <span className="text-spark text-xl">🔥</span>
          <span>{streak}</span>
        </div>
        <div className="flex items-center gap-1.5 font-extrabold">
          <span className="text-energon text-xl">⚡</span>
          <span>{energon}</span>
        </div>

        {/* daily goal ring */}
        <div className="flex flex-1 items-center gap-2">
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-spark to-energon transition-all"
              style={{ width: `${goalPct}%` }}
            />
          </div>
          <span className="text-xs text-white/50">{goalPct}%</span>
        </div>

        <button
          onClick={onOpenCollection}
          className="flex items-center gap-1.5 rounded-full border border-cyber/40 bg-cyber/10 px-3 py-1.5 font-bold text-cyber active:scale-95"
        >
          🤖 <span>{robots}</span>
        </button>
      </div>
    </header>
  )
}
