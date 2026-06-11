export type Tab = 'map' | 'training' | 'arcade' | 'garage' | 'parent'

const TABS: { id: Tab; icon: string; label: string; ready: boolean }[] = [
  { id: 'map', icon: '🗺️', label: '地图', ready: true },
  { id: 'training', icon: '⚡', label: '专项', ready: true },
  { id: 'arcade', icon: '🎮', label: '竞技场', ready: true },
  { id: 'garage', icon: '🕵️', label: '探长店', ready: true },
  { id: 'parent', icon: '👤', label: '家长', ready: true },
]

export default function TabBar({
  active,
  onChange,
}: {
  active: Tab
  onChange: (t: Tab) => void
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#0a0f2c]/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-stretch justify-around px-4 py-2">
        {TABS.map((t) => {
          const on = active === t.id
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={`relative flex min-w-20 flex-col items-center gap-0.5 rounded-2xl px-5 py-2 transition ${
                on ? 'bg-cyber/15 text-cyber' : 'text-white/55 hover:text-white/80'
              }`}
            >
              <span className="text-2xl">{t.icon}</span>
              <span className="text-xs font-bold">{t.label}</span>
              {!t.ready && (
                <span className="absolute right-1 top-1 rounded-full bg-white/10 px-1 text-[9px] text-white/50">
                  soon
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
