import { useState } from 'react'
import type { Exercise } from '../../types'
import { sfx } from '../../lib/sfx'
import { ExProps, Prompt, SpeakerButton, State, stateClass } from './shared'

type T = Extract<Exercise, { type: 'read' }>

export default function ReadComprehend({ ex, done, onDone }: ExProps<T>) {
  const [picked, setPicked] = useState<string | null>(null)

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
      <Prompt>
        <span className="flex items-center gap-3">
          Read and answer <SpeakerButton text={ex.passage} label="Read aloud" />
        </span>
      </Prompt>

      <div className="mb-5 rounded-2xl border-2 border-cyber/30 bg-cyber/5 p-5 text-lg leading-relaxed text-white/90">
        {ex.passage}
      </div>

      <p className="mb-3 font-bold text-white/90">{ex.question}</p>
      <div className="flex flex-col gap-3">
        {ex.options.map((o) => (
          <button
            key={o}
            onClick={() => choose(o)}
            disabled={done}
            className={`rounded-2xl border-2 p-5 text-left text-lg font-semibold transition ${stateClass(cell(o))}`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}
