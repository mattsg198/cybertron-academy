import { motion } from 'framer-motion'
import { ROBOTS, robotById } from '../data/robots'
import { useGameStore } from '../store/useGameStore'
import { speak } from '../lib/speech'
import { sfx } from '../lib/sfx'
import RobotAvatar from './RobotAvatar'

export default function Collection() {
  const unlocked = useGameStore((s) => s.unlockedRobots)
  const inspector = robotById('tr3')

  return (
    <div className="no-scrollbar h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <h1 className="mb-4 text-3xl font-black">🕵️ 探长商店 · Inspector’s Shop</h1>

        {/* shopkeeper greeting */}
        <div className="mb-6 flex items-center gap-4 rounded-3xl border border-cyber/30 bg-cyber/5 p-4">
          <span className="animate-float text-5xl">
            <RobotAvatar robot={inspector} sizeClass="text-5xl" />
          </span>
          <div>
            <p className="font-black text-cyber">汽车人探长：欢迎光临！</p>
            <p className="text-sm text-white/70">
              把威震天抓走的伙伴一个个救回来，摆上货架吧！已收集 {unlocked.length}/{ROBOTS.length}。
            </p>
          </div>
        </div>

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
