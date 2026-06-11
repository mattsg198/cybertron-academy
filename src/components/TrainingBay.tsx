import { WORD_PACKS, totalWords, type WordPack } from '../data/wordbank'
import { robotById } from '../data/robots'
import { useGameStore, srsStats } from '../store/useGameStore'
import { ARCADE_GAMES } from '../lib/arcade'
import { TOKEN_ENERGON } from '../data/shop'
import type { Skill } from '../lib/specialize'
import RobotAvatar from './RobotAvatar'

export default function TrainingBay({
  onStartVocab,
  onStartReview,
  onStartSkill,
  onStartGame,
}: {
  onStartVocab: (pack: WordPack) => void
  onStartReview: () => void
  onStartSkill: (skill: Skill) => void
  onStartGame: (gameId: string) => void
}) {
  const inspector = robotById('tr3')
  const srs = useGameStore((s) => s.srs)
  const arcadeBest = useGameStore((s) => s.arcadeBest)
  const tokens = useGameStore((s) => s.tokens)
  const tokenProg = useGameStore((s) => s.tokenProg)
  const stats = srsStats(srs)
  const hasReview = stats.collected > 0 || stats.due > 0

  return (
    <div className="no-scrollbar h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <h1 className="mb-4 text-3xl font-black">⚡ 专项训练</h1>

        {/* inspector intro */}
        <div className="mb-5 flex items-center gap-4 rounded-3xl border border-cyber/30 bg-cyber/5 p-4">
          <span className="text-5xl">
            <RobotAvatar robot={inspector} sizeClass="text-5xl" />
          </span>
          <div>
            <p className="font-black text-cyber">汽车人探长：单挑专项，越练越强！</p>
            <p className="text-sm text-white/70">词库共 {totalWords} 词，按主题刷；错题靠间隔复习记牢。</p>
          </div>
        </div>

        {/* ⚡竞技场 — 反应速度小游戏 */}
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-black">⚡ 竞技场 · Arcade</h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="rounded-full bg-energon/15 px-3 py-1 font-black text-energon">🎟️ {tokens}</span>
            <span className="text-white/45">下一张 {tokenProg}/{TOKEN_ENERGON}⚡</span>
          </div>
        </div>
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {ARCADE_GAMES.map((g) => (
            <button
              key={g.id}
              onClick={g.ready ? () => onStartGame(g.id) : undefined}
              disabled={!g.ready}
              className={`relative rounded-2xl border-2 px-4 py-4 text-left transition ${
                g.ready
                  ? 'border-spark/40 bg-spark/10 hover:scale-[1.02] active:scale-95'
                  : 'border-white/10 bg-white/[0.03] opacity-60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-3xl">{g.emoji}</span>
                <span className="font-black">{g.name}</span>
              </div>
              <div className="mt-1 text-xs text-white/55">{g.desc}</div>
              {g.ready ? (
                <div className="mt-1 text-xs font-bold text-energon">🏆 最佳 {arcadeBest[g.id] ?? 0}</div>
              ) : (
                <span className="absolute right-2 top-2 rounded-full bg-white/10 px-1.5 text-[10px] text-white/50">
                  soon
                </span>
              )}
            </button>
          ))}
        </div>

        {/* SRS stats */}
        <div className="mb-5 grid grid-cols-4 gap-3">
          {[
            { n: stats.collected, label: '错题本', tone: 'text-rose-300' },
            { n: stats.due, label: '待复习', tone: 'text-energon' },
            { n: stats.learning, label: '学习中', tone: 'text-cyber' },
            { n: stats.mastered, label: '已掌握', tone: 'text-emerald-300' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center">
              <div className={`text-2xl font-black ${s.tone}`}>{s.n}</div>
              <div className="text-xs text-white/55">{s.label}</div>
            </div>
          ))}
        </div>

        {/* 错题修复站 (functional) + others (soon) */}
        <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <button
            onClick={hasReview ? onStartReview : undefined}
            disabled={!hasReview}
            className={`relative rounded-2xl border-2 px-4 py-5 text-center transition ${
              hasReview
                ? 'border-rose-400/50 bg-rose-400/10 hover:scale-[1.03] active:scale-95'
                : 'border-white/10 bg-white/[0.03] opacity-50'
            }`}
          >
            <div className="text-3xl">🔧</div>
            <div className="mt-1 text-sm font-bold">错题修复站</div>
            <div className="text-[11px] text-white/55">
              {hasReview ? `${stats.collected + stats.due} 项待修复` : '暂无错题 🎉'}
            </div>
          </button>
          {[
            { icon: '📡', label: '听力专项', skill: 'listen' as Skill, sub: '听音选图' },
            { icon: '🎙️', label: '口语专项', skill: 'speak' as Skill, sub: '开口跟读' },
            { icon: '⚙️', label: '语法专项', skill: 'grammar' as Skill, sub: '填空+排句' },
          ].map((c) => (
            <button
              key={c.label}
              onClick={() => onStartSkill(c.skill)}
              className="relative rounded-2xl border-2 border-cyber/40 bg-cyber/5 px-4 py-5 text-center transition hover:scale-[1.03] active:scale-95"
            >
              <div className="text-3xl">{c.icon}</div>
              <div className="mt-1 text-sm font-bold">{c.label}</div>
              <div className="text-[11px] text-white/55">{c.sub}</div>
            </button>
          ))}
        </div>

        {/* vocabulary packs */}
        <h2 className="mb-3 text-xl font-black">⚡ 词汇专项 · Energon Word Bank</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {WORD_PACKS.map((pack) => (
            <button
              key={pack.id}
              onClick={() => onStartVocab(pack)}
              className="flex flex-col items-center gap-1 rounded-3xl border-2 border-white/15 bg-white/5 p-5 transition hover:border-cyber hover:bg-white/10 active:scale-95"
            >
              <span className="text-5xl">{pack.emoji}</span>
              <span className="mt-1 font-extrabold">{pack.name}</span>
              <span className="text-sm text-white/60">{pack.zh}</span>
              <span className="mt-1 rounded-full bg-cyber/15 px-2.5 py-0.5 text-xs font-bold text-cyber">
                {pack.words.length} 词
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
