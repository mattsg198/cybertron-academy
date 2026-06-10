import { useState } from 'react'
import { assetUrl } from '../data/assets'

// 记住 404 过的路径,避免每次渲染重试。
const missing = new Set<string>()

/**
 * 渲染版权素材:`slot` 指向 public 下的相对路径(如 'bosses/soundwave.png')。
 * 文件存在 → 显示正版图;不存在 → 回退到 `emoji` 占位。替换 = 丢文件,无需改码。
 */
export default function AssetImage({
  slot,
  emoji,
  alt = '',
  sizeClass = 'text-6xl',
  className = '',
}: {
  slot?: string
  emoji: string
  alt?: string
  sizeClass?: string
  className?: string
}) {
  const url = slot ? assetUrl(slot) : ''
  const [failed, setFailed] = useState(!slot || missing.has(url))

  if (!slot || failed) {
    return <span className={`${sizeClass} ${className}`}>{emoji}</span>
  }
  return (
    <img
      src={url}
      alt={alt}
      draggable={false}
      onError={() => {
        missing.add(url)
        setFailed(true)
      }}
      className={`inline-block object-contain ${sizeClass} ${className}`}
      style={{ width: '1.2em', height: '1.2em' }}
    />
  )
}
