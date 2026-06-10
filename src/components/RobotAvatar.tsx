import { useState } from 'react'
import type { Robot } from '../types'
import { assetUrl } from '../data/assets'

// Module-level cache of asset paths that 404'd, so we don't retry every render.
const missing = new Set<string>()

/**
 * Renders an official asset for a robot if one exists, else the emoji fallback.
 *
 * Drop a file at `public/robots/<id>.png` (e.g. a BlooKo 布鲁可 product photo
 * or licensed Transformers art) and it appears automatically — no code change.
 * Until then, the cheerful emoji stands in.
 */
export default function RobotAvatar({
  robot,
  className = '',
  sizeClass = 'text-6xl',
}: {
  robot: Robot
  className?: string
  sizeClass?: string
}) {
  const src = assetUrl(robot.image ?? `robots/${robot.id}.png`)
  const [failed, setFailed] = useState(missing.has(src))

  if (failed) {
    return <span className={`${sizeClass} ${className}`}>{robot.emoji}</span>
  }

  return (
    <img
      src={src}
      alt={robot.name}
      draggable={false}
      onError={() => {
        missing.add(src)
        setFailed(true)
      }}
      className={`inline-block object-contain ${sizeClass} ${className}`}
      style={{ width: '1.2em', height: '1.2em' }}
    />
  )
}
