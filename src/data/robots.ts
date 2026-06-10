import type { Robot } from '../types'

// Collectible Transformers. Unlocked by completing units.
export const ROBOTS: Robot[] = [
  {
    id: 'tr3',
    name: '汽车人探长',
    faction: 'autobot',
    emoji: '🕵️',
    altMode: '🚓',
    tagline: 'Autobot Inspector — your guide. Let’s crack the English case!',
    zh: '汽车人探长 · 你的向导',
  },
  {
    id: 'bumblebee',
    name: 'Bumblebee',
    faction: 'autobot',
    emoji: '🐝',
    altMode: '🚗',
    tagline: 'Fast, brave and full of energy!',
    zh: '大黄蜂 · 勇敢又充满能量',
  },
  {
    id: 'optimus',
    name: 'Optimus Prime',
    faction: 'autobot',
    emoji: '🦾',
    altMode: '🚚',
    tagline: 'The wise leader of the Autobots.',
    zh: '擎天柱 · 汽车人的领袖',
  },
  {
    id: 'ratchet',
    name: 'Ratchet',
    faction: 'autobot',
    emoji: '🩺',
    altMode: '🚑',
    tagline: 'The medic who fixes everyone.',
    zh: '救护车 · 修理大师',
  },
  {
    id: 'grimlock',
    name: 'Grimlock',
    faction: 'autobot',
    emoji: '🦖',
    altMode: '🦕',
    tagline: 'Me Grimlock STRONG!',
    zh: '钢锁 · 力大无穷',
  },
  {
    id: 'megatron',
    name: 'Megatron',
    faction: 'decepticon',
    emoji: '👾',
    altMode: '🔫',
    tagline: 'Boss of the Decepticons. Beat him!',
    zh: '威震天 · 狂派 Boss',
  },
]

export const robotById = (id: string): Robot =>
  ROBOTS.find((r) => r.id === id) ?? ROBOTS[0]
