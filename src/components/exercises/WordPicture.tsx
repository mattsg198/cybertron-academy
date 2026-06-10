import { useState } from 'react'
import type { Exercise } from '../../types'
import { speak } from '../../lib/speech'
import { sfx } from '../../lib/sfx'
import { ExProps, Prompt, SpeakerButton, State, stateClass } from './shared'

type T = Extract<Exercise, { type: 'wordPicture' }>

export default function WordPicture({ ex, done, onDone }: ExProps<T>) {
  const [picked, setPicked] = useState<string | null>(null)

  const choose = (label: string) => {
    if (done) return
    const correct = label === ex.answer
    setPicked(label)
    speak(ex.prompt)
    correct ? sfx.correct() : sfx.wrong()
    onDone(correct)
  }

  const cell = (label: string): State => {
    if (!done) return 'idle'
    if (label === ex.answer) return 'correct'
    if (label === picked) return 'wrong'
    return 'idle'
  }

  return (
    <div>
      <Prompt>
        <span className="flex items-center gap-3">
          Which one is <span className="text-energon">“{ex.prompt}”</span>?
          <SpeakerButton text={ex.prompt} />
        </span>
      </Prompt>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {ex.options.map((o) => (
          <button
            key={o.label}
            onClick={() => choose(o.label)}
            disabled={done}
            className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-7 transition ${stateClass(
              cell(o.label),
            )}`}
          >
            <span className="text-6xl">{o.emoji}</span>
            <span className="text-lg font-bold">{o.label}</span>
          </button>
        ))}
      </div>

      {done && (
        <p className="mt-4 text-center text-energon font-semibold">
          {ex.prompt} = {ex.zh}
        </p>
      )}
    </div>
  )
}
