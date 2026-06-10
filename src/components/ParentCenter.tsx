import { useEffect, useMemo, useState } from 'react'
import { CURRICULUM, lessonByIds } from '../data/curriculum'
import { englishVoices, currentVoiceName, setVoice, speak } from '../lib/speech'
import {
  useGameStore,
  srsStats,
  totalLessons,
  STREAK_MILESTONES,
  type GradeTier,
} from '../store/useGameStore'

const MEDAL: Record<GradeTier, string> = { gold: '🥇', silver: '🥈', bronze: '🥉', fail: '💢' }

export default function ParentCenter({ onStartPlacement }: { onStartPlacement: () => void }) {
  const results = useGameStore((s) => s.results)
  const examGrades = useGameStore((s) => s.examGrades)
  const vouchers = useGameStore((s) => s.vouchers)
  const srs = useGameStore((s) => s.srs)
  const streak = useGameStore((s) => s.streak)
  const studyTotalSec = useGameStore((s) => s.studyTotalSec)
  const studyByDay = useGameStore((s) => s.studyByDay)
  const lastCheckIn = useGameStore((s) => s.lastCheckIn)
  const unlockedRobots = useGameStore((s) => s.unlockedRobots)
  const redeemVoucher = useGameStore((s) => s.redeemVoucher)
  const reset = useGameStore((s) => s.reset)

  // —— lightweight parent gate so the child can't redeem / reset by accident ——
  const [gate] = useState(() => ({ a: 6 + Math.floor(Math.random() * 7), b: 4 + Math.floor(Math.random() * 6) }))
  const [pass, setPass] = useState(false)
  const [val, setVal] = useState('')

  // —— voice picker (TTS quality) ——
  const [voices, setVoices] = useState(englishVoices())
  const [voiceName, setVoiceName] = useState(currentVoiceName())
  useEffect(() => {
    const refresh = () => {
      setVoices(englishVoices())
      setVoiceName(currentVoiceName())
    }
    refresh()
    if (typeof speechSynthesis !== 'undefined') speechSynthesis.onvoiceschanged = refresh
  }, [])
  const chooseVoice = (name: string) => {
    setVoice(name)
    setVoiceName(currentVoiceName())
    speak('Hello! I am your Autobot teacher.')
  }

  const stats = srsStats(srs)
  const doneCount = Object.keys(results).length
  const todayKey = new Date().toISOString().slice(0, 10)
  const fmt = (sec: number) => (sec >= 3600 ? `${(sec / 3600).toFixed(1)}h` : `${Math.round(sec / 60)}m`)
  const last7 = useMemo(() => {
    const out: { day: string; sec: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10)
      out.push({ day: d.slice(5), sec: studyByDay[d] ?? 0 })
    }
    return out
  }, [studyByDay])
  const maxSec = Math.max(60, ...last7.map((d) => d.sec))
  const stars = useMemo(
    () => Object.values(results).reduce((n, r) => n + r.stars, 0),
    [results],
  )

  if (!pass) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="text-6xl">🔒</div>
        <h2 className="text-2xl font-black">家长验证</h2>
        <p className="text-white/60">请算一算：{gate.a} + {gate.b} = ?</p>
        <input
          inputMode="numeric"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="w-32 rounded-2xl border-2 border-white/20 bg-white/5 py-3 text-center text-2xl font-black focus:border-cyber focus:outline-none"
          placeholder="?"
        />
        <button
          onClick={() => Number(val) === gate.a + gate.b && setPass(true)}
          className="rounded-2xl bg-cyber px-8 py-3 text-lg font-black text-black active:scale-95"
        >
          进入
        </button>
      </div>
    )
  }

  return (
    <div className="no-scrollbar h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-6 py-6">
        <h1 className="mb-4 text-3xl font-black">👤 家长中心</h1>

        {/* overview */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { n: `${doneCount}/${totalLessons}`, label: '已完成关卡', tone: 'text-cyber' },
            { n: stars, label: '总星星 ⭐', tone: 'text-energon' },
            { n: streak, label: '连续天数 🔥', tone: 'text-rose-300' },
            { n: unlockedRobots.length, label: '解锁伙伴 🤖', tone: 'text-emerald-300' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center">
              <div className={`text-2xl font-black ${s.tone}`}>{s.n}</div>
              <div className="text-xs text-white/55">{s.label}</div>
            </div>
          ))}
        </div>

        {/* study time */}
        <h2 className="mb-2 text-lg font-black">⏱️ 学习用时</h2>
        <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
          <div className="mb-3 flex gap-6">
            <div>
              <div className="text-2xl font-black text-energon">{fmt(studyByDay[todayKey] ?? 0)}</div>
              <div className="text-xs text-white/55">今日</div>
            </div>
            <div>
              <div className="text-2xl font-black text-cyber">{fmt(studyTotalSec)}</div>
              <div className="text-xs text-white/55">累计</div>
            </div>
          </div>
          <div className="flex items-end gap-2" style={{ height: 72 }}>
            {last7.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-cyber to-energon"
                    style={{ height: `${(d.sec / maxSec) * 100}%`, minHeight: d.sec ? 4 : 0 }}
                    title={`${Math.round(d.sec / 60)} 分钟`}
                  />
                </div>
                <div className="text-[9px] text-white/45">{d.day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* daily check-in & streak milestones */}
        <h2 className="mb-2 text-lg font-black">🔥 打卡与坚持</h2>
        <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
          <div className="mb-3 flex items-center gap-6">
            <div>
              <div className="text-2xl font-black text-energon">🔥 {streak} 天</div>
              <div className="text-xs text-white/55">当前连续打卡</div>
            </div>
            <div>
              <div className="text-sm font-black">
                {lastCheckIn === todayKey ? (
                  <span className="text-emerald-300">✅ 今日已打卡</span>
                ) : (
                  <span className="text-white/60">今日未打卡</span>
                )}
              </div>
              <div className="text-xs text-white/45">达成每日目标即可打卡领能量</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {STREAK_MILESTONES.map((m) => {
              const done = streak >= m.days
              return (
                <div
                  key={m.days}
                  className={`rounded-xl border px-3 py-1.5 text-center text-xs ${
                    done
                      ? 'border-energon/50 bg-energon/10 text-energon'
                      : 'border-white/10 bg-white/[0.03] text-white/45'
                  }`}
                  title={`${m.label} → +${m.bonus} 能量`}
                >
                  <span className="font-black">{done ? '✓' : m.emoji} {m.days}天</span>
                  <span className="ml-1 opacity-70">+{m.bonus}⚡</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* per-sector progress */}
        <h2 className="mb-2 text-lg font-black">📊 各扇区进度</h2>
        <div className="mb-5 space-y-2">
          {CURRICULUM.map((u) => {
            const done = u.lessons.filter((l) => results[l.id]).length
            const pct = Math.round((done / u.lessons.length) * 100)
            return (
              <div key={u.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-bold">{u.zh}</span>
                  <span className="text-white/55">{done}/{u.lessons.length}{u.kind === 'exam' && examGrades[u.lessons[0].id] ? ` · ${MEDAL[examGrades[u.lessons[0].id]]}` : ''}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: u.color }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* SRS summary */}
        <div className="mb-5 grid grid-cols-4 gap-3">
          {[
            { n: stats.collected, label: '错题本', tone: 'text-rose-300' },
            { n: stats.learning, label: '学习中', tone: 'text-cyber' },
            { n: stats.mastered, label: '已掌握', tone: 'text-emerald-300' },
            { n: stats.total, label: '总词条', tone: 'text-white' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center">
              <div className={`text-2xl font-black ${s.tone}`}>{s.n}</div>
              <div className="text-xs text-white/55">{s.label}</div>
            </div>
          ))}
        </div>

        {/* blind-box vouchers */}
        <h2 className="mb-2 text-lg font-black">🎁 盲盒奖励券</h2>
        {vouchers.length === 0 ? (
          <p className="mb-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/55">
            还没有奖励券。在 KET 模考中达到 🥈银牌（≥80%）即可获得一张布鲁可盲盒券。
          </p>
        ) : (
          <div className="mb-5 space-y-2">
            {vouchers.map((v) => {
              const title = lessonByIds('u5', v.lessonId)?.title ?? v.lessonId
              return (
                <div
                  key={v.lessonId}
                  className="flex items-center justify-between rounded-2xl border border-energon/30 bg-energon/5 px-4 py-3"
                >
                  <div>
                    <div className="font-bold">
                      {v.tier === 'gold' ? '🥇 金牌 · 隐藏款盲盒' : '🥈 银牌 · 标准盲盒'}
                    </div>
                    <div className="text-xs text-white/50">{title}</div>
                  </div>
                  {v.redeemed ? (
                    <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-bold text-emerald-300">
                      ✓ 已发放
                    </span>
                  ) : (
                    <button
                      onClick={() => redeemVoucher(v.lessonId)}
                      className="rounded-full bg-energon px-4 py-2 text-sm font-black text-black active:scale-95"
                    >
                      发放实体盲盒
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* voice settings */}
        <h2 className="mb-2 text-lg font-black">🔊 发音设置</h2>
        <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={voiceName}
              onChange={(e) => chooseVoice(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border-2 border-white/20 bg-[#0a0f2c] px-3 py-2 text-sm font-bold focus:border-cyber focus:outline-none"
            >
              {voices.length === 0 && <option value="">（未检测到语音）</option>}
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} · {v.lang}
                </option>
              ))}
            </select>
            <button
              onClick={() => speak('Hello! I am your Autobot teacher.')}
              className="rounded-xl bg-cyber px-4 py-2 text-sm font-black text-black active:scale-95"
            >
              🔊 试听
            </button>
          </div>
          <p className="mt-2 text-xs text-white/50">
            已自动选最清晰的嗓音。iPad 上想更自然：设置 → 辅助功能 → 朗读内容 → 语音 → 英语，下载「增强/Siri」语音，回来这里选它即可。
          </p>
        </div>

        {/* tools */}
        <h2 className="mb-2 text-lg font-black">🛠️ 工具</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={onStartPlacement}
            className="rounded-2xl border-2 border-cyber/50 bg-cyber/10 px-4 py-4 text-left active:scale-[0.98]"
          >
            <div className="text-lg font-black">🛰️ 定级扫描</div>
            <div className="text-xs text-white/55">10 题快速诊断，自动把孩子放到合适的起点扇区。</div>
          </button>
          <button
            onClick={() => {
              if (confirm('确定要清空所有进度吗？此操作无法撤销。')) reset()
            }}
            className="rounded-2xl border-2 border-rose-400/40 bg-rose-400/5 px-4 py-4 text-left active:scale-[0.98]"
          >
            <div className="text-lg font-black text-rose-300">♻️ 重置进度</div>
            <div className="text-xs text-white/55">清空星星、能量、错题本与奖励券，从头开始。</div>
          </button>
        </div>
      </div>
    </div>
  )
}
