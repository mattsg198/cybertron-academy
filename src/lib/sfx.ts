// ============================================================
// Tiny WebAudio sound effects — no audio files needed.
// Cheerful blips for correct/wrong/level-up.
// ============================================================

let ctx: AudioContext | null = null
function ac(): AudioContext | null {
  if (typeof AudioContext === 'undefined' && typeof (window as any).webkitAudioContext === 'undefined')
    return null
  if (!ctx) ctx = new (AudioContext || (window as any).webkitAudioContext)()
  return ctx
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.12) {
  const c = ac()
  if (!c) return
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  osc.connect(g)
  g.connect(c.destination)
  const t = c.currentTime + start
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(gain, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.start(t)
  osc.stop(t + dur)
}

export const sfx = {
  correct() {
    tone(660, 0, 0.12, 'triangle')
    tone(880, 0.09, 0.16, 'triangle')
  },
  wrong() {
    tone(200, 0, 0.18, 'sawtooth', 0.08)
    tone(150, 0.12, 0.22, 'sawtooth', 0.08)
  },
  tap() {
    tone(520, 0, 0.05, 'square', 0.05)
  },
  levelUp() {
    ;[523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.22, 'triangle', 0.12))
  },
  transform() {
    tone(300, 0, 0.3, 'sawtooth', 0.06)
    tone(600, 0.15, 0.3, 'square', 0.06)
    tone(900, 0.3, 0.35, 'triangle', 0.1)
  },
}
