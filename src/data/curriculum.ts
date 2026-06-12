import type { CEFR, Exercise, SkillTag, Unit } from '../types'
import { dailyDrive } from './sectors/dailyDrive'
import { energonMarket } from './sectors/energonMarket'
import { sectorMap } from './sectors/sectorMap'
import { freeTime } from './sectors/freeTime'
import { rewind } from './sectors/rewind'
import { ketMock } from './sectors/ketMock'

// ============================================================
// CURRICULUM index — KET (Cambridge A2 Key) aligned.
// Content lives in src/data/sectors/*.ts (one file per sector) so the
// bank stays small & easy to extend. This file just composes them and
// exposes the lookup / flat-pool / validation APIs.
// Authoring guide: src/data/README.md
// ============================================================

export const CURRICULUM: Unit[] = [dailyDrive, energonMarket, sectorMap, freeTime, rewind, ketMock]

export const unitById = (id: string) => CURRICULUM.find((u) => u.id === id)

/** One-line Chinese learning goal per lesson (shown with the English title). */
const LESSON_GOALS: Record<string, string> = {
  u1l1: '日常作息词', u1l2: '一般现在时', u1l3: '说说我的一天', u1l4: '认识时间·几点了', u1l5: '频率副词',
  u2l1: '食物饮料词', u2l2: 'some/any·数量', u2l3: '购物对话', u2l4: '点单 Can I have…', u2l5: '问价·much/many',
  u3l1: '城市地点词', u3l2: 'there is/are', u3l3: '问路·方向', u3l4: '方位介词', u3l5: '交通 + 问路',
  u4l1: '爱好词', u4l2: '现在进行时', u4l3: '一起玩·句型', u4l4: 'can/can’t 能力', u4l5: '进行时疑问句',
  u6l1: 'was/were · 过去时间词', u6l2: '规则过去式 -ed', u6l3: '不规则过去式', u6l4: "did/didn't 疑问否定", u6l5: '过去时综合·上周末',
  u5l1: 'KET 综合模考',
}
export const goalOf = (lessonId: string): string => LESSON_GOALS[lessonId] ?? ''

export const lessonByIds = (unitId: string, lessonId: string) =>
  unitById(unitId)?.lessons.find((l) => l.id === lessonId)

/** Find a grammar/skill exercise by its SRS card id `lessonId#idx` (for review). */
export function itemByCardId(cardId: string): Exercise | null {
  const [lessonId, idxStr] = cardId.split('#')
  const idx = Number(idxStr)
  for (const u of CURRICULUM) {
    const l = u.lessons.find((x) => x.id === lessonId)
    if (l && l.exercises[idx]) {
      return {
        ...l.exercises[idx],
        card: { id: cardId, kind: 'item', ref: l.title, topic: l.topic },
      }
    }
  }
  return null
}

/** Flat ordered list of [unitId, lessonId] for unlock/progress logic. */
export const lessonOrder: { unitId: string; lessonId: string }[] = CURRICULUM.flatMap((u) =>
  u.lessons.map((l) => ({ unitId: u.id, lessonId: l.id })),
)

// ---- Flat item pool (for 专项练习 / 错题本 filtering) ----

/** Stable id of an item = `${lessonId}#${index}`. Append items, don't reorder,
 *  to keep mistake-history stable. */
export const itemKey = (lessonId: string, index: number) => `${lessonId}#${index}`

export interface BankItem {
  id: string
  unitId: string
  lessonId: string
  index: number
  type: Exercise['type']
  skills: SkillTag[]
  topic?: string
  grammar?: string
  cefr?: CEFR
  exercise: Exercise
}

/** Every exercise across the whole curriculum, tagged from its lesson. */
export function allItems(): BankItem[] {
  const out: BankItem[] = []
  for (const u of CURRICULUM) {
    for (const l of u.lessons) {
      l.exercises.forEach((exercise, index) => {
        out.push({
          id: itemKey(l.id, index),
          unitId: u.id,
          lessonId: l.id,
          index,
          type: exercise.type,
          skills: l.skills,
          topic: l.topic,
          grammar: l.grammar,
          cefr: l.cefr,
          exercise,
        })
      })
    }
  }
  return out
}

/** Filter the pool by skill / topic / grammar / type — used by 专项练习. */
export function itemsBy(filter: {
  skill?: SkillTag
  topic?: string
  grammar?: string
  type?: Exercise['type']
}): BankItem[] {
  return allItems().filter(
    (it) =>
      (!filter.skill || it.skills.includes(filter.skill)) &&
      (!filter.topic || it.topic === filter.topic) &&
      (!filter.grammar || it.grammar === filter.grammar) &&
      (!filter.type || it.type === filter.type),
  )
}

// ---- Validation (dev-time guard against authoring mistakes) ----

export function validateCurriculum(): string[] {
  const errs: string[] = []
  const unitIds = new Set<string>()
  const lessonIds = new Set<string>()

  for (const u of CURRICULUM) {
    if (unitIds.has(u.id)) errs.push(`duplicate unit id: ${u.id}`)
    unitIds.add(u.id)

    for (const l of u.lessons) {
      if (lessonIds.has(l.id)) errs.push(`duplicate lesson id: ${l.id}`)
      lessonIds.add(l.id)
      if (!l.exercises.length) errs.push(`${l.id}: has no exercises`)

      l.exercises.forEach((ex, i) => {
        const at = `${l.id}#${i} (${ex.type})`
        switch (ex.type) {
          case 'wordPicture': {
            const labels = ex.options.map((o) => o.label)
            if (ex.options.length < 2) errs.push(`${at}: needs ≥2 options`)
            if (!labels.includes(ex.answer)) errs.push(`${at}: answer "${ex.answer}" not in options`)
            break
          }
          case 'listen':
          case 'fillBlank':
          case 'read':
            if (ex.options.length < 2) errs.push(`${at}: needs ≥2 options`)
            if (!ex.options.includes(ex.answer)) errs.push(`${at}: answer "${ex.answer}" not in options`)
            break
          case 'sentenceBuild':
            if (ex.words.length < 2) errs.push(`${at}: needs ≥2 words`)
            break
          case 'spell':
            if (ex.parts && ex.parts.join('') !== ex.word)
              errs.push(`${at}: parts ${JSON.stringify(ex.parts)} ≠ "${ex.word}"`)
            if (ex.prefill !== undefined && (ex.prefill < 0 || ex.prefill >= ex.word.length))
              errs.push(`${at}: prefill ${ex.prefill} out of range`)
            break
          case 'wordMatch':
            if (ex.pairs.length < 2 || ex.pairs.length > 6) errs.push(`${at}: pairs must be 2–6`)
            if (ex.pairs.some((p) => !p.en || !p.cn)) errs.push(`${at}: empty pair`)
            break
        }
      })
    }
  }
  return errs
}

// Run the guard in dev so authoring mistakes surface immediately.
if ((import.meta as { env?: { DEV?: boolean } }).env?.DEV) {
  const errs = validateCurriculum()
  if (errs.length) console.error('[curriculum] validation FAILED:\n' + errs.join('\n'))
  else console.info(`[curriculum] ✓ ${allItems().length} items valid`)
}
