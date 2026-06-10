// ============================================================
// Cybertron Academy — type system
// Engine and content are separated: every exercise is plain data,
// rendered by a matching component. Add a topic = edit curriculum.ts.
// ============================================================

/** A picture option rendered with an emoji "illustration". */
export interface PicOption {
  label: string
  emoji: string
}

/** Identifies the SRS card an exercise trains (a word or a grammar item). */
export interface SrsRef {
  id: string // 'w:apple' | 'u1l2#3'
  kind: 'word' | 'item'
  ref: string // the word, or a label
  topic?: string
}

/** Discriminated union of all 8 exercise types. */
type ExerciseKind =
  // 1. 看图识词 — vocabulary recognition (word -> picture)
  | {
      type: 'wordPicture'
      prompt: string // the English word to learn
      zh: string // Chinese gloss shown after answering
      options: PicOption[]
      answer: string // label of correct option
    }
  // 2. 听音选择 — listening (TTS reads audio, pick the match)
  | {
      type: 'listen'
      audio: string // text spoken aloud
      question: string
      options: string[]
      answer: string
    }
  // 3. 开口说 — speaking (speech recognition scores the utterance)
  | {
      type: 'speak'
      prompt: string // word/phrase to say
      zh: string
    }
  // 4. 拼单词 — spelling (reorder scrambled letters)
  | {
      type: 'spell'
      word: string
      zh: string
      emoji: string
      /** Morpheme chunks for colour-coding (词头/词根/词尾). Concat must equal word. */
      parts?: string[]
      /** Letters pre-placed for the child. Defaults to auto-scaffold for long words. */
      prefill?: number
    }
  // 5. 排句子 — grammar / word order (drag words into a sentence)
  | {
      type: 'sentenceBuild'
      audio: string // the full correct sentence (also spoken)
      zh: string
      words: string[] // shuffled bank
    }
  // 6. 填空 — grammar (articles, plurals, tense, prepositions)
  | {
      type: 'fillBlank'
      before: string
      after: string
      options: string[]
      answer: string
      zh: string
    }
  // 7. 读短文 — reading comprehension
  | {
      type: 'read'
      passage: string
      question: string
      options: string[]
      answer: string
    }
  // 8. 单词对对碰 — match pairs (vocabulary, fast & playful)
  | {
      type: 'wordMatch'
      zh: string
      pairs: { en: string; cn: string }[] // 3–6 pairs
    }

/** An exercise plus the optional SRS card it trains. */
export type Exercise = ExerciseKind & { card?: SrsRef }

export type SkillTag = 'listen' | 'speak' | 'read' | 'vocab' | 'grammar'

export type CEFR = 'A1' | 'A2' | 'B1'

/** A boss battle shell (HP bar + hit FX) wrapped around a lesson. */
export interface BossInfo {
  name: string
  emoji: string
  zh?: string
  /** Short story shown on a pre-battle intro screen. */
  intro?: string
  /** Asset slot under public/ (e.g. 'bosses/soundwave.png'); falls back to emoji. */
  image?: string
}

export interface Lesson {
  id: string
  title: string
  emoji: string
  /** Which spiral layer: 1=recognise, 2=use, 3=integrate/boss */
  tier: 1 | 2 | 3
  /** A small Sector Boss battle (mini-boss); the KET mock uses the unit-level boss. */
  boss?: BossInfo
  skills: SkillTag[]
  /** Tags for focused-practice filtering; items inherit these from their lesson. */
  topic?: string // e.g. 'routine', 'food', 'places', 'hobbies'
  grammar?: string // e.g. 'present-simple', 'some-any', 'there-is-are'
  cefr?: CEFR
  exercises: Exercise[]
}

export interface Unit {
  id: string
  name: string
  zh: string
  color: string // accent color for the node
  rewardRobotId: string // robot unlocked when unit is completed
  /** 'sector' = normal learning zone; 'exam' = a graded 大关卡 (KET mock / rank-up). */
  kind?: 'sector' | 'exam'
  lessons: Lesson[]
}

export interface Robot {
  id: string
  name: string
  faction: 'autobot' | 'decepticon'
  emoji: string // fallback "illustration" when no image is present
  /**
   * Optional path to an official asset, e.g. a BlooKo (布鲁可) product photo
   * or licensed Transformers art. Drop a file at public/robots/<id>.png and
   * the UI uses it automatically; falls back to `emoji` if the file is absent.
   */
  image?: string
  altMode: string // emoji of vehicle form
  tagline: string
  zh: string
}
