import { useMemo, useState } from 'react'
import type { Exercise } from '../../types'
import { speak } from '../../lib/speech'
import { sfx } from '../../lib/sfx'
import { ExProps, Prompt, SpeakerButton } from './shared'

type T = Extract<Exercise, { type: 'spell' }>

// Colours for morpheme chunks (词头 / 词根 / 词尾 …)
const PART_COLORS = ['#00d9ff', '#ffd34e', '#ff7a18', '#9b5cff']

interface Tile {
  ch: string
  pos: number // source position in the word (also its colour key)
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function SpellWord({ ex, done, onDone }: ExProps<T>) {
  // Pre-place some leading letters as a scaffold (long words spell only part).
  const given = ex.prefill ?? (ex.word.length >= 7 ? Math.floor(ex.word.length / 3) : 0)

  // Map each letter position -> colour (by morpheme chunk), if parts given.
  const colorOf = useMemo(() => {
    const map: (string | undefined)[] = Array(ex.word.length).fill(undefined)
    if (ex.parts && ex.parts.join('') === ex.word) {
      let p = 0
      ex.parts.forEach((seg, segIdx) => {
        for (let k = 0; k < seg.length; k++) map[p++] = PART_COLORS[segIdx % PART_COLORS.length]
      })
    }
    return map
  }, [ex.word, ex.parts])

  // Letters the child must place (positions given..end), scrambled into a bank.
  const bank = useMemo(() => {
    const tiles: Tile[] = []
    for (let i = given; i < ex.word.length; i++) tiles.push({ ch: ex.word[i], pos: i })
    const s = shuffle(tiles)
    if (s.map((t) => t.ch).join('') === ex.word.slice(given) && s.length > 1) {
      ;[s[0], s[1]] = [s[1], s[0]]
    }
    return s
  }, [ex.word, given])

  const [built, setBuilt] = useState<Tile[]>([])
  const usedPos = new Set(built.map((t) => t.pos))
  const full = ex.word.slice(0, given) + built.map((t) => t.ch).join('')

  const add = (t: Tile) => {
    if (done || usedPos.has(t.pos)) return
    sfx.tap()
    setBuilt([...built, t])
  }
  const removeAt = (i: number) => {
    if (done) return
    sfx.tap()
    setBuilt(built.filter((_, idx) => idx !== i))
  }

  // Hint: drop the next correct letter into place.
  const hint = () => {
    if (done) return
    const nextPos = given + built.length
    if (nextPos >= ex.word.length) return
    const tile = bank.find((t) => t.pos === nextPos)
    if (tile && !usedPos.has(tile.pos)) {
      sfx.tap()
      setBuilt([...built, tile])
    }
  }

  const check = () => {
    if (done) return
    const correct = full === ex.word
    if (correct) speak(ex.word)
    correct ? sfx.correct() : sfx.wrong()
    onDone(correct)
  }

  const letterTile = (color: string | undefined, locked: boolean) => ({
    color: color ?? '#eaf2ff',
    borderColor: color ? `${color}aa` : 'rgba(255,255,255,0.25)',
    background: locked ? (color ? `${color}22` : 'rgba(255,255,255,0.06)') : color ? `${color}1f` : 'rgba(255,255,255,0.10)',
  })

  return (
    <div>
      <Prompt>
        <span className="flex items-center gap-3">
          Spell the word <SpeakerButton text={ex.word} />
        </span>
      </Prompt>

      <div className="mb-4 flex flex-col items-center">
        <span className="text-6xl">{ex.emoji}</span>
        <span className="mt-1 text-white/60">{ex.zh}</span>
      </div>

      {/* answer line: locked prefill + built letters */}
      <div className="mb-5 flex min-h-[4rem] flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/20 p-3">
        {ex.word
          .slice(0, given)
          .split('')
          .map((ch, i) => (
            <div
              key={`g${i}`}
              className="flex h-14 w-12 items-center justify-center rounded-xl border-2 text-2xl font-bold"
              style={letterTile(colorOf[i], true)}
            >
              {ch}
            </div>
          ))}
        {built.length === 0 && given === 0 && (
          <span className="text-white/30">tap letters →</span>
        )}
        {built.map((t, i) => (
          <button
            key={`b${i}`}
            onClick={() => removeAt(i)}
            disabled={done}
            className="h-14 w-12 rounded-xl border-2 text-2xl font-bold"
            style={letterTile(colorOf[t.pos], false)}
          >
            {t.ch}
          </button>
        ))}
      </div>

      {/* letter bank */}
      <div className="flex flex-wrap justify-center gap-2">
        {bank.map((t) => (
          <button
            key={t.pos}
            onClick={() => add(t)}
            disabled={done || usedPos.has(t.pos)}
            className={`h-14 w-14 rounded-xl border-2 text-2xl font-bold transition active:scale-95 ${
              usedPos.has(t.pos) ? 'opacity-25' : ''
            }`}
            style={letterTile(colorOf[t.pos], false)}
          >
            {t.ch}
          </button>
        ))}
      </div>

      {!done && (
        <div className="mt-6 flex gap-3">
          <button
            onClick={hint}
            className="rounded-2xl border-2 border-white/20 bg-white/5 px-5 py-4 text-lg font-bold text-white/80 active:scale-95"
          >
            💡 提示
          </button>
          <button
            onClick={check}
            disabled={full.length !== ex.word.length}
            className="flex-1 rounded-2xl bg-energon py-4 text-xl font-extrabold text-[#1a1300] disabled:opacity-40"
          >
            Check
          </button>
        </div>
      )}
      {done && (
        <p className="mt-4 text-center font-semibold text-energon">
          {ex.word} = {ex.zh}
        </p>
      )}
    </div>
  )
}
