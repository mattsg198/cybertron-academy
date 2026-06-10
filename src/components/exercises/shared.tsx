import { speak, ttsSupported } from '../../lib/speech'

/** Props every exercise component receives from the lesson engine. */
export interface ExProps<T> {
  ex: T
  done: boolean
  onDone: (correct: boolean) => void
}

export type State = 'idle' | 'correct' | 'wrong'

export function stateClass(s: State): string {
  if (s === 'correct') return 'border-emerald-400 bg-emerald-400/15 text-emerald-100'
  if (s === 'wrong') return 'border-rose-400 bg-rose-400/15 text-rose-100'
  return 'border-white/15 bg-white/5 hover:border-cyber hover:bg-white/10'
}

/** A round speaker button that reads text aloud. */
export function SpeakerButton({
  text,
  big = false,
  label = 'Listen',
}: {
  text: string
  big?: boolean
  label?: string
}) {
  if (!ttsSupported) return null
  return (
    <button
      onClick={() => speak(text)}
      className={`inline-flex items-center justify-center rounded-full bg-cyber/20 border border-cyber/50 text-cyber active:scale-95 transition ${
        big ? 'h-20 w-20 text-3xl animate-glow' : 'h-11 w-11 text-xl'
      }`}
      aria-label={label}
    >
      🔊
    </button>
  )
}

export function Prompt({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl font-extrabold text-white/90 mb-6">{children}</h2>
}
