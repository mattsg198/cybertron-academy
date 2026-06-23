// ============================================================
// KET 词库索引。词包按主题拆到 src/data/wordpacks/*.ts,
// 加词只改对应主题文件即可(省 token、好维护)。
// ============================================================

export interface WordEntry {
  word: string
  zh: string
  emoji?: string
}

export interface WordPack {
  id: string
  name: string
  zh: string
  emoji: string
  words: WordEntry[]
}

import { foodPacks } from './wordpacks/food'
import { naturePacks } from './wordpacks/nature'
import { peoplePacks } from './wordpacks/people'
import { homePacks } from './wordpacks/home'
import { placesPacks } from './wordpacks/places'
import { wordsPacks } from './wordpacks/words'
import { schoolPacks } from './wordpacks/school'
import { morePacks } from './wordpacks/more'

export const WORD_PACKS: WordPack[] = [
  ...foodPacks,
  ...naturePacks,
  ...peoplePacks,
  ...homePacks,
  ...placesPacks,
  ...wordsPacks,
  ...schoolPacks,
  ...morePacks,
]

export const packById = (id: string) => WORD_PACKS.find((p) => p.id === id)

export const totalWords = WORD_PACKS.reduce((n, p) => n + p.words.length, 0)
