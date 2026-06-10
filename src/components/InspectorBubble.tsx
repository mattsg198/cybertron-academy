import { useMemo } from 'react'
import { useGameStore } from '../store/useGameStore'
import { robotById } from '../data/robots'
import RobotAvatar from './RobotAvatar'

const inspector = robotById('tr3')
const DEFAULTS = [
  '准备好今天的任务了吗?出发破案!',
  '每天进步一点点,变身超能特工!',
  '探长在等你,一起解开英语密码~',
  '今天也要元气满满哦,伙计!',
]
const dayDiff = (a: string, b: string) =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000)

// 汽车人探长情感化问候——根据连击 / 久未登录 / 今日进度说不同的话。
export default function InspectorBubble() {
  const streak = useGameStore((s) => s.streak)
  const lastPlayed = useGameStore((s) => s.lastPlayed)
  const energonToday = useGameStore((s) => s.energonToday)
  const dailyGoal = useGameStore((s) => s.dailyGoal)

  const msg = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const playedToday = lastPlayed === today
    const goalMet = playedToday && energonToday >= dailyGoal

    if (goalMet) return `今日目标达成,${streak >= 3 ? '神探' : '干得漂亮'}!⭐`
    if (lastPlayed && !playedToday) {
      const gap = dayDiff(lastPlayed, today)
      if (gap >= 2) return '好久不见,探长!快回来一起破案~ 🔍'
      return '新的一天,保持住连击!🔥'
    }
    if (streak >= 7) return `连续 ${streak} 天,你是真正的神探!🔥`
    if (streak >= 3) return `已坚持 ${streak} 天,继续冲!`
    return DEFAULTS[new Date().getDate() % DEFAULTS.length]
  }, [streak, lastPlayed, energonToday, dailyGoal])

  return (
    <div className="mx-auto flex w-full max-w-4xl items-center gap-2">
      <RobotAvatar robot={inspector} sizeClass="text-2xl" />
      <div className="relative rounded-2xl rounded-bl-sm border border-cyber/30 bg-cyber/10 px-3 py-1.5 text-sm font-bold text-cyber">
        {msg}
      </div>
    </div>
  )
}
