import { useMemo, useState } from 'react'
import type { Exercise } from '../../types'
import { speak } from '../../lib/speech'
import { sfx } from '../../lib/sfx'
import { ExProps, Prompt, SpeakerButton } from './shared'

type T = Extract<Exercise, { type: 'sentenceBuild' }>

interface Tile {
  w: string
  id: number
}

function shuffle(words: string[]): Tile[] {
  const tiles = words.map((w, id) => ({ w, id }))
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[tiles[i], tiles[j]] = [tiles[j], tiles[i]]
  }
  return tiles
}

export default function SentenceBuild({ ex, done, onDone }: ExProps<T>) {
  const bank = useMemo(() => shuffle(ex.words), [ex.audio])
  const [built, setBuilt] = useState<Tile[]>([])
  const usedIds = new Set(built.map((t) => t.id))
  const target = ex.words.join(' ')

  const add = (t: Tile) => {
    if (done || usedIds.has(t.id)) return
    sfx.tap()
    setBuilt([...built, t])
  }
  const removeAt = (i: number) => {
    if (done) return
    sfx.tap()
    setBuilt(built.filter((_, idx) => idx !== i))
  }

  // Hint: drop the next correct word into place.
  const hint = () => {
    if (done) return
    const nextW = ex.words[built.length]
    if (nextW === undefined) return
    const tile = bank.find((t) => t.w === nextW && !usedIds.has(t.id))
    if (tile) {
      sfx.tap()
      setBuilt([...built, tile])
    }
  }

  const check = () => {
    if (done) return
    const guess = built.map((t) => t.w).join(' ')
    const correct = guess === target
    if (correct) speak(ex.audio)
    correct ? sfx.correct() : sfx.wrong()
    onDone(correct)
  }

  return (
    <div>
      <Prompt>
        <span className="flex items-center gap-3">
          Build the sentence <SpeakerButton text={ex.audio} />
        </span>
      </Prompt>
      <p className="mb-4 text-white/60">{ex.zh}</p>

      <div className="mb-5 flex min-h-[3.5rem] flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-white/20 p-3">
        {built.length === 0 && <span className="text-white/30">tap words →</span>}
        {built.map((t, i) => (
          <button
            key={t.id}
            onClick={() => removeAt(i)}
            disabled={done}
            className="rounded-xl bg-cyber/20 border-2 border-cyber/60 px-4 py-3 text-lg font-bold text-white"
          >
            {t.w}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {bank.map((t) => (
          <button
            key={t.id}
            onClick={() => add(t)}
            disabled={done || usedIds.has(t.id)}
            className={`rounded-xl border-2 px-4 py-3 text-lg font-bold transition ${
              usedIds.has(t.id)
                ? 'opacity-25 border-white/10 bg-white/5'
                : 'border-white/25 bg-white/10 hover:border-cyber active:scale-95'
            }`}
          >
            {t.w}
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
            disabled={built.length !== ex.words.length}
            className="flex-1 rounded-2xl bg-energon py-4 text-xl font-extrabold text-[#1a1300] disabled:opacity-40"
          >
            Check
          </button>
        </div>
      )}
      {done && (
        <p className="mt-4 text-center text-energon font-semibold">✅ {target}</p>
      )}
    </div>
  )
}
