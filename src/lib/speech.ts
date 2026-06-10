// ============================================================
// Web Speech API wrappers — Text-to-Speech (listening) and
// Speech-to-Text (speaking). Browser-native, no backend needed.
// Gracefully degrades when a browser lacks support.
// ============================================================

let preferredVoice: SpeechSynthesisVoice | null = null
const VOICE_KEY = 'tts-voice' // parent-chosen voice name (localStorage)

// High-quality / natural voices to prefer (Apple Siri+enhanced, Google, MS Neural).
const GOOD = /siri|samantha|karen|daniel|moira|tessa|serena|fiona|allison|ava|susan|zoe|google|natural|neural|premium|enhanced|aria|jenny|libby|sonia|ryan|nicky|aaron|emma/i
// macOS novelty / robotic voices that sound awful — avoid.
const BAD = /albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|jester|organ|trinoids|whisper|wobble|zarvox|fred|junior|kathy|ralph|superstar|grandma|grandpa|reed|rocko|sandy|shelley|flo|eddy|bruce|vicki|agnes/i

function voiceScore(v: SpeechSynthesisVoice): number {
  let s = 0
  if (BAD.test(v.name)) s -= 100
  if (GOOD.test(v.name)) s += 6
  if (/enhanced|premium|natural|neural/i.test(v.name)) s += 4
  if (!v.localService) s += 2 // online voices are usually higher quality
  if (v.lang === 'en-GB' || v.lang === 'en-US') s += 2
  return s
}

/** English voices, best first. */
export function englishVoices(): SpeechSynthesisVoice[] {
  if (typeof speechSynthesis === 'undefined') return []
  return speechSynthesis
    .getVoices()
    .filter((v) => v.lang.toLowerCase().startsWith('en'))
    .sort((a, b) => voiceScore(b) - voiceScore(a))
}

function pickVoice(): SpeechSynthesisVoice | null {
  const en = englishVoices()
  if (!en.length) return null
  // Honour a parent-saved choice if it still exists.
  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(VOICE_KEY) : null
  if (saved) {
    const found = en.find((v) => v.name === saved)
    if (found) return found
  }
  // Default preference: Google US English (Chrome); else best-scored voice.
  const google = en.find((v) => /google us english/i.test(v.name))
  return google ?? en[0]
}

if (typeof speechSynthesis !== 'undefined') {
  preferredVoice = pickVoice()
  speechSynthesis.onvoiceschanged = () => {
    preferredVoice = pickVoice()
  }
}

/** Parent picks a specific voice (persisted); pass '' to reset to auto. */
export function setVoice(name: string): void {
  if (typeof localStorage !== 'undefined') {
    if (name) localStorage.setItem(VOICE_KEY, name)
    else localStorage.removeItem(VOICE_KEY)
  }
  preferredVoice = pickVoice()
}

export function currentVoiceName(): string {
  return preferredVoice?.name ?? ''
}

export function speak(text: string, opts: { rate?: number } = {}): void {
  if (typeof speechSynthesis === 'undefined') return
  if (!preferredVoice) preferredVoice = pickVoice() // voices may load late
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = preferredVoice?.lang ?? 'en-GB'
  if (preferredVoice) u.voice = preferredVoice
  u.rate = opts.rate ?? 0.9 // gently slowed for young learners
  u.pitch = 1.0 // natural pitch (high pitch sounded tinny)
  speechSynthesis.speak(u)
}

export const ttsSupported = typeof speechSynthesis !== 'undefined'

// ---- Speech recognition (STT) ----
type SR = typeof window & {
  SpeechRecognition?: any
  webkitSpeechRecognition?: any
}

export const sttSupported =
  typeof window !== 'undefined' &&
  !!((window as SR).SpeechRecognition || (window as SR).webkitSpeechRecognition)

export interface ListenResult {
  transcript: string
  ok: boolean
}

/** Listen once and resolve with the transcript. */
export function listenOnce(): Promise<ListenResult> {
  return new Promise((resolve) => {
    const Ctor =
      (window as SR).SpeechRecognition || (window as SR).webkitSpeechRecognition
    if (!Ctor) {
      resolve({ transcript: '', ok: false })
      return
    }
    const rec = new Ctor()
    rec.lang = 'en-US'
    rec.interimResults = false
    rec.maxAlternatives = 3
    let done = false
    const finish = (r: ListenResult) => {
      if (done) return
      done = true
      resolve(r)
    }
    rec.onresult = (e: any) => {
      const alts = e.results[0]
      let best = ''
      for (let i = 0; i < alts.length; i++) best += ' ' + alts[i].transcript
      finish({ transcript: best.trim(), ok: true })
    }
    rec.onerror = () => finish({ transcript: '', ok: false })
    rec.onend = () => finish({ transcript: '', ok: true })
    try {
      rec.start()
    } catch {
      finish({ transcript: '', ok: false })
    }
  })
}

/** Loose phonetic-ish match: ignores case, punctuation, articles. */
export function scoreSpeech(target: string, said: string): number {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter((w) => w && !['a', 'an', 'the', 'please'].includes(w))
  const t = norm(target)
  const s = norm(said)
  if (!t.length) return 0
  const hit = t.filter((w) => s.includes(w)).length
  return hit / t.length
}
