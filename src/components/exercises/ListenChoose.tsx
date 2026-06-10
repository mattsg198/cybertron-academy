import { useEffect, useState } from 'react'
import type { Exercise } from '../../types'
import { speak, ttsSupported } from '../../lib/speech'
import { sfx } from '../../lib/sfx'
import { ExProps, Prompt, SpeakerButton, State, stateClass } from './shared'

type T = Extract<Exercise, { type: 'listen' }>

export default function ListenChoose({ ex, done, onDone }: ExProps<T>) {
  const [picked, setPicked] = useState<string | null>(null)

  // Auto-play the audio when the exercise appears.
  useEffect(() => {
    const t = setTimeout(() => speak(ex.audio), 350)
    return () => clearTimeout(t)
  }, [ex.audio])

  const choose = (opt: string) => {
    if (done) return
    const correct = opt === ex.answer
    setPicked(opt)
    correct ? sfx.correct() : sfx.wrong()
    onDone(correct)
  }

  const cell = (opt: string): State => {
    if (!done) return 'idle'
    if (opt === ex.answer) return 'correct'
    if (opt === picked) return 'wrong'
    return 'idle'
  }

  return (
    <div>
      <Prompt>{ex.question}</Prompt>

      <div className="flex justify-center mb-6">
        <SpeakerButton text={ex.audio} big label="Play again" />
      </div>
      {!ttsSupported && (
        <p className="text-center text-sm text-white/50 mb-4">
          (Audio: <b className="text-cyber">{ex.audio}</b>)
        </p>
      )}

      <div className="grid grid-cols-4 gap-3">
        {ex.options.map((o) => (
          <button
            key={o}
            onClick={() => choose(o)}
            disabled={done}
            className={`rounded-2xl border-2 p-5 text-5xl transition ${stateClass(cell(o))}`}
          >
            {o}
          </button>
        ))}
      </div>

      {done && (
        <p className="mt-4 text-center text-energon font-semibold">
          You heard: “{ex.audio}”
        </p>
      )}
    </div>
  )
}
