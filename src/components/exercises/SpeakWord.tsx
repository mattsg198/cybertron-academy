import { useState } from 'react'
import type { Exercise } from '../../types'
import { listenOnce, scoreSpeech, speak, sttSupported } from '../../lib/speech'
import { sfx } from '../../lib/sfx'
import { ExProps, Prompt, SpeakerButton } from './shared'

type T = Extract<Exercise, { type: 'speak' }>

export default function SpeakWord({ ex, done, onDone }: ExProps<T>) {
  const [listening, setListening] = useState(false)
  const [heard, setHeard] = useState('')
  const [score, setScore] = useState(0)

  const record = async () => {
    if (done || listening) return
    setListening(true)
    speak(ex.prompt)
    await new Promise((r) => setTimeout(r, 900)) // let the model speak first
    const res = await listenOnce()
    setListening(false)
    const s = scoreSpeech(ex.prompt, res.transcript)
    setHeard(res.transcript)
    setScore(s)
    const ok = s >= 0.5
    ok ? sfx.correct() : sfx.wrong()
    onDone(ok)
  }

  const skip = () => {
    if (done) return
    sfx.correct()
    onDone(true) // gentle: no STT support -> trust the learner
  }

  return (
    <div className="text-center">
      <Prompt>
        <span className="flex items-center justify-center gap-3">
          Say it out loud! <SpeakerButton text={ex.prompt} />
        </span>
      </Prompt>

      <div className="rounded-2xl border-2 border-white/15 bg-white/5 p-6 mb-6">
        <p className="text-3xl font-extrabold text-energon">“{ex.prompt}”</p>
        <p className="mt-1 text-white/60">{ex.zh}</p>
      </div>

      {sttSupported ? (
        <button
          onClick={record}
          disabled={done || listening}
          className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 text-4xl transition ${
            listening
              ? 'border-rose-400 bg-rose-400/20 animate-pulse'
              : 'border-cyber bg-cyber/15 active:scale-95'
          }`}
        >
          {listening ? '👂' : '🎤'}
        </button>
      ) : (
        <button
          onClick={skip}
          disabled={done}
          className="mx-auto rounded-full border-2 border-cyber bg-cyber/15 px-6 py-4 text-lg font-bold text-cyber"
        >
          🎤 I said it!
        </button>
      )}
      <p className="mt-3 text-sm text-white/50">
        {listening ? 'Listening… speak now!' : sttSupported ? 'Tap the mic and speak' : 'Mic not available — say it, then tap'}
      </p>

      {done && heard && (
        <p className="mt-3 text-sm">
          I heard: <b className="text-white/80">“{heard}”</b> ·{' '}
          <span className={score >= 0.5 ? 'text-emerald-300' : 'text-rose-300'}>
            {Math.round(score * 100)}% match
          </span>
        </p>
      )}
    </div>
  )
}
