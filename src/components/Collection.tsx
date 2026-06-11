import { motion } from 'framer-motion'
import { ROBOTS, robotById } from '../data/robots'
import { THEMES, SHIELD_COST, SHIELD_MAX, TOKEN_COST } from '../data/shop'
import { useGameStore } from '../store/useGameStore'
import { speak } from '../lib/speech'
import { sfx } from '../lib/sfx'
import RobotAvatar from './RobotAvatar'

export default function Collection() {
  const unlocked = useGameStore((s) => s.unlockedRobots)
  const energon = useGameStore((s) => s.energon)
  const shields = useGameStore((s) => s.shields)
  const tokens = useGameStore((s) => s.tokens)
  const buyToken = useGameStore((s) => s.buyToken)
  const cosmetics = useGameStore((s) => s.cosmetics)
  const activeTheme = useGameStore((s) => s.activeTheme)
  const buyShield = useGameStore((s) => s.buyShield)
  const buyCosmetic = useGameStore((s) => s.buyCosmetic)
  const equipTheme = useGameStore((s) => s.equipTheme)
  const inspector = robotById('tr3')

  return (
    <div className="no-scrollbar h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-black">🕵️ 探长商店 · Inspector’s Shop</h1>
          <div className="rounded-full bg-energon/15 px-4 py-1.5 text-lg font-black text-energon">
            ⚡ {energon}
          </div>
        </div>

        {/* shopkeeper greeting */}
        <div className="mb-6 flex items-center gap-4 rounded-3xl border border-cyber/30 bg-cyber/5 p-4">
          <span className="animate-float text-5xl">
            <RobotAvatar robot={inspector} sizeClass="text-5xl" />
          </span>
          <div>
            <p className="font-black text-cyber">汽车人探长：欢迎光临！</p>
            <p className="text-sm text-white/70">用能量买装备、换皮肤；把救回来的伙伴摆上货架。</p>
          </div>
        </div>

        {/* 连击护盾 */}
        <h2 className="mb-2 text-xl font-black">🛡️ 连击护盾</h2>
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-white/12 bg-white/5 px-4 py-3">
          <div>
            <div className="font-bold">连击护盾 ×{shields}</div>
            <div className="text-xs text-white/55">漏练一天自动顶上,连击不清零(最多 {SHIELD_MAX} 个)</div>
          </div>
          <button
            onClick={() => {
              if (buyShield()) sfx.transform()
            }}
            disabled={energon < SHIELD_COST || shields >= SHIELD_MAX}
            className={`rounded-full px-4 py-2 text-sm font-black ${
              energon >= SHIELD_COST && shields < SHIELD_MAX
                ? 'bg-cyber text-black active:scale-95'
                : 'bg-white/10 text-white/40'
            }`}
          >
            {shields >= SHIELD_MAX ? '已满' : `购买 ${SHIELD_COST} ⚡`}
          </button>
        </div>

        {/* 游戏券 */}
        <h2 className="mb-2 text-xl font-black">🎟️ 游戏券</h2>
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-white/12 bg-white/5 px-4 py-3">
          <div>
            <div className="font-bold">游戏券 ×{tokens}</div>
            <div className="text-xs text-white/55">进竞技场每局 1 张;每天免费送 1 张,学习赚能量也会自动攒券</div>
          </div>
          <button
            onClick={() => {
              if (buyToken()) sfx.transform()
            }}
            disabled={energon < TOKEN_COST}
            className={`rounded-full px-4 py-2 text-sm font-black ${
              energon >= TOKEN_COST ? 'bg-cyber text-black active:scale-95' : 'bg-white/10 text-white/40'
            }`}
          >
            购买 {TOKEN_COST} ⚡
          </button>
        </div>

        {/* 地图主题皮肤 */}
        <h2 className="mb-2 text-xl font-black">🎨 地图主题</h2>
        <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {THEMES.map((t) => {
            const owned = cosmetics.includes(t.id)
            const active = activeTheme === t.id
            return (
              <div key={t.id} className="rounded-2xl border border-white/12 p-3" style={{ background: t.bg }}>
                <div className="text-3xl">{t.emoji}</div>
                <div className="mt-1 text-sm font-bold">{t.zh}</div>
                <button
                  onClick={() => {
                    if (owned) equipTheme(t.id)
                    else if (buyCosmetic(t.id, t.cost)) {
                      sfx.transform()
                      equipTheme(t.id)
                    }
                  }}
                  disabled={!owned && energon < t.cost}
                  className={`mt-2 w-full rounded-full px-2 py-1 text-xs font-black ${
                    active
                      ? 'bg-emerald-400 text-black'
                      : owned
                        ? 'bg-white/15 text-white'
                        : energon >= t.cost
                          ? 'bg-energon text-[#1a1300] active:scale-95'
                          : 'bg-white/10 text-white/40'
                  }`}
                >
                  {active ? '使用中 ✓' : owned ? '使用' : `${t.cost} ⚡`}
                </button>
              </div>
            )
          })}
        </div>

        {/* 伙伴收藏 */}
        <h2 className="mb-3 text-xl font-black">
          🤖 伙伴收藏 <span className="text-base font-bold text-white/45">{unlocked.length}/{ROBOTS.length}</span>
        </h2>
        <div className="grid grid-cols-3 gap-5 sm:grid-cols-4 lg:grid-cols-6">
          {ROBOTS.map((r, i) => {
            const has = unlocked.includes(r.id)
            return (
              <motion.button
                key={r.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => {
                  if (!has) return
                  sfx.transform()
                  speak(`${r.name}. ${r.tagline}`)
                }}
                className={`rounded-3xl border-2 p-5 text-center transition ${
                  has
                    ? r.faction === 'decepticon'
                      ? 'border-fuchsia-400/40 bg-fuchsia-500/10 hover:scale-[1.03]'
                      : 'border-cyber/40 bg-cyber/10 hover:scale-[1.03]'
                    : 'border-white/10 bg-white/[0.03]'
                }`}
              >
                <div className="text-7xl">
                  {has ? <RobotAvatar robot={r} sizeClass="text-7xl" /> : '❓'}
                </div>
                <div className="mt-2 text-xl font-black">{has ? r.name : '???'}</div>
                {has && (
                  <>
                    <div className="text-2xl">{r.altMode}</div>
                    <p className="mt-1 text-sm text-white/60">{r.zh}</p>
                  </>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
