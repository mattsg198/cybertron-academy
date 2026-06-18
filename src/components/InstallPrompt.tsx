import { useEffect, useState } from 'react'

// 引导用户把应用装到桌面/主屏。Android/桌面 Chrome 用原生安装事件;iOS Safari 给手动步骤。
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<{ prompt: () => void; userChoice: Promise<unknown> } | null>(null)
  const [show, setShow] = useState(false)
  const [ios, setIos] = useState(false)

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true
    if (standalone) return // 已安装
    if (localStorage.getItem('install-dismissed')) return

    const ua = navigator.userAgent
    const isIos = /iphone|ipad|ipod/i.test(ua)
    const isSafari = /safari/i.test(ua) && !/crios|fxios|chrome|android/i.test(ua)
    if (isIos && isSafari) {
      setIos(true)
      setShow(true)
      return
    }
    const onBip = (e: Event) => {
      e.preventDefault()
      setDeferred(e as unknown as { prompt: () => void; userChoice: Promise<unknown> })
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', onBip)
    return () => window.removeEventListener('beforeinstallprompt', onBip)
  }, [])

  if (!show) return null

  const dismiss = () => {
    setShow(false)
    localStorage.setItem('install-dismissed', '1')
  }
  const install = async () => {
    if (!deferred) return
    deferred.prompt()
    await deferred.userChoice
    dismiss()
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl items-center gap-3 rounded-2xl border border-energon/40 bg-energon/10 px-4 py-2">
      <span className="text-2xl">📲</span>
      <div className="flex-1 text-sm leading-snug">
        {ios ? (
          <>把学院装到主屏:点 Safari 底部 <b>分享</b> → <b>添加到主屏幕</b>,全屏离线玩!</>
        ) : (
          <>把「赛博坦学院」安装到桌面,像 App 一样一点即开、可离线!</>
        )}
      </div>
      {!ios && (
        <button onClick={install} className="shrink-0 rounded-full bg-energon px-4 py-1.5 text-sm font-black text-[#1a1300] active:scale-95">
          安装
        </button>
      )}
      <button onClick={dismiss} className="shrink-0 text-lg text-white/40 hover:text-white" aria-label="关闭">
        ✕
      </button>
    </div>
  )
}
