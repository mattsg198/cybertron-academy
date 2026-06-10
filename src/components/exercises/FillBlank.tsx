import { useState } from 'react'
import type { Exercise } from '../../types'
import { speak } from '../../lib/speech'
import { sfx } from '../../lib/sfx'
import { ExProps, Prompt, State, stateClass } from './shared'

type T = Extract<Exercise, { type: 'fillBlank' }>

export default function FillBlank({ ex, done, onDone }: ExProps<T>) {
  const [picked, setPicked] = useState<string | null>(null)

  const choose = (opt: string) => {
    if (done) return
    const correct = opt === ex.answer
    setPicked(opt)
    speak(`${ex.before} ${ex.answer} ${ex.after}`.replace(/\s+/g, ' '))
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
      <Prompt>Fill in the blank</Prompt>

      <div className="mb-6 rounded-2xl border-2 border-white/15 bg-white/5 p-5 text-center text-xl font-semibold leading-relaxed">
        {ex.before}
        <span className="mx-1 inline-block min-w-[3rem] rounded-md border-b-2 border-energon px-2 text-energon">
          {done ? ex.answer : '____'}
        </span>
        {ex.after}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {ex.options.map((o) => (
          <button
            key={o}
            onClick={() => choose(o)}
            disabled={done}
            className={`rounded-2xl border-2 p-5 text-xl font-bold transition ${stateClass(cell(o))}`}
          >
            {o}
          </button>
        ))}
      </div>

      {done && <p className="mt-4 text-center text-energon font-semibold">💡 {ex.zh}</p>}
    </div>
  )
}
