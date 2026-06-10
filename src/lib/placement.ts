import type { Lesson } from '../types'

// ============================================================
// 定级扫描 (Placement Scan) — a quick ~10-question diagnostic that
// places the child at the right sector. Questions ramp A1 → A2.
// No SRS cards attached, so it doesn't pollute the 错题本.
// ============================================================

export function makePlacementLesson(): Lesson {
  return {
    id: `placement-${Date.now()}`,
    title: '定级扫描 · Placement Scan',
    emoji: '🛰️',
    tier: 1,
    skills: ['vocab', 'grammar', 'read'],
    cefr: 'A2',
    exercises: [
      // — A1 基础 —
      {
        type: 'wordPicture',
        prompt: 'apple',
        zh: '苹果',
        answer: 'apple',
        options: [
          { label: 'apple', emoji: '🍎' },
          { label: 'dog', emoji: '🐶' },
          { label: 'car', emoji: '🚗' },
          { label: 'book', emoji: '📖' },
        ],
      },
      {
        type: 'fillBlank',
        before: 'This is a cat. ',
        after: ' name is Tom.',
        options: ['Its', 'It', 'He'],
        answer: 'Its',
        zh: 'Its = 它的',
      },
      {
        type: 'fillBlank',
        before: 'I have two ',
        after: '.',
        options: ['dog', 'dogs', 'doges'],
        answer: 'dogs',
        zh: 'two → 复数 dogs',
      },
      // — A1→A2 —
      {
        type: 'fillBlank',
        before: 'She ',
        after: ' to school every day.',
        options: ['go', 'goes', 'going'],
        answer: 'goes',
        zh: '第三人称单数 goes',
      },
      {
        type: 'fillBlank',
        before: 'There ',
        after: ' some apples on the table.',
        options: ['is', 'are', 'am'],
        answer: 'are',
        zh: 'apples 复数 → There are',
      },
      {
        type: 'fillBlank',
        before: 'We don’t have ',
        after: ' milk.',
        options: ['some', 'any', 'a'],
        answer: 'any',
        zh: '否定句用 any',
      },
      // — A2 —
      {
        type: 'fillBlank',
        before: 'Look! He ',
        after: ' football now.',
        options: ['plays', 'is playing', 'play'],
        answer: 'is playing',
        zh: 'now → 现在进行时',
      },
      {
        type: 'fillBlank',
        before: 'A bus is ',
        after: ' than a bike.',
        options: ['big', 'bigger', 'biggest'],
        answer: 'bigger',
        zh: '比较级 bigger than',
      },
      {
        type: 'fillBlank',
        before: 'I go swimming ',
        after: ' Sunday.',
        options: ['on', 'in', 'at'],
        answer: 'on',
        zh: '星期几用 on',
      },
      {
        type: 'read',
        passage:
          'Sam gets up at seven. He has breakfast, then goes to school by bus. After school he plays tennis with his friends.',
        question: 'How does Sam go to school?',
        answer: 'By bus',
        options: ['By car', 'By bus', 'On foot'],
      },
    ],
  }
}

export interface Placement {
  unitId: string
  label: string
  zh: string
}

/** Map a first-attempt score to a starting sector. */
export function recommendPlacement(correct: number, total: number): Placement {
  const acc = total ? correct / total : 0
  if (acc >= 0.8) return { unitId: 'u4', label: 'Free-Time Sector', zh: '休闲扇区（A2 进阶）' }
  if (acc >= 0.6) return { unitId: 'u3', label: 'Sector Map', zh: '城区地图（A2 中段）' }
  if (acc >= 0.4) return { unitId: 'u2', label: 'Energon Market', zh: '能量集市（A2 起步）' }
  return { unitId: 'u1', label: 'Daily Drive', zh: '日常巡航（打基础）' }
}
