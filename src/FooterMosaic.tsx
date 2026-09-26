'use client'

import { useEffect, useRef } from 'react'

const ink = '#0e1019'
const upper = '#242332'
const accents = ['#b9a6ff', '#82cafa', '#c5f277', '#ff8c7c']

function hash(value: number) {
  const x = Math.sin(value * 127.1) * 43758.5453
  return x - Math.floor(x)
}

function drawPiece(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, kind: number) {
  const size = Math.min(width, height)
  const centerX = x + width / 2
  const centerY = y + height / 2
  context.beginPath()
  if (kind === 0) {
    context.fillRect(x, y, Math.ceil(width), Math.ceil(height))
  } else if (kind === 1) {
    context.arc(centerX, centerY, size * 0.46, 0, Math.PI * 2)
    context.fill()
  } else if (kind === 2) {
    context.moveTo(x, y + height)
    context.lineTo(x, y)
    context.lineTo(x + width, y + height)
    context.closePath()
    context.fill()
  } else if (kind === 3) {
    context.lineWidth = Math.max(3, size * 0.22)
    context.arc(centerX, centerY, size * 0.34, 0, Math.PI * 2)
    context.strokeStyle = context.fillStyle
    context.stroke()
  } else if (kind === 4) {
    const square = size * 0.34
    const offset = size * 0.24
    for (const dx of [-1, 1]) for (const dy of [-1, 1]) {
      context.fillRect(centerX + dx * offset - square / 2, centerY + dy * offset - square / 2, square, square)
    }
  } else {
    context.roundRect(centerX - size * 0.43, centerY - size * 0.43, size * 0.86, size * 0.86, size * 0.2)
    context.fill()
  }
}

export function FooterMosaic() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d', { alpha: false })
    if (!canvas || !context) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let width = 0
    let height = 0
    let inView = false
    let frame = 0
    let lastPaint = 0

    function paint(time: number) {
      if (!context) return
      const columns = Math.ceil(width / 20)
      const rows = 9
      const cellWidth = width / columns
      const cellHeight = height / rows
      const seconds = time * 0.001

      const backdrop = context.createLinearGradient(0, 0, 0, height)
      backdrop.addColorStop(0, upper)
      backdrop.addColorStop(0.48, '#20202e')
      backdrop.addColorStop(0.78, '#151721')
      backdrop.addColorStop(1, ink)
      context.fillStyle = backdrop
      context.fillRect(0, 0, width, height)
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const value = hash(column * 11 + row * 113)
          const coverage = [0.01, 0.035, 0.1, 0.22, 0.4, 0.6, 0.78, 0.91, 1][row]
          const x = column * cellWidth
          const y = row * cellHeight
          const kind = 1 + Math.floor(hash(column * 47 + row * 19 + 5) * 5)

          if (value < coverage) {
            context.fillStyle = ink
            context.fillRect(x, y, Math.ceil(cellWidth), Math.ceil(cellHeight))
            if (row < 6 && hash(column * 61 + row * 43 + 3) > 0.77) {
              context.fillStyle = upper
              drawPiece(context, x, y, cellWidth, cellHeight, kind)
            }
          } else if (row > 1 && row < 7 && hash(column * 29 + row * 59 + 7) > 0.79) {
            context.fillStyle = ink
            drawPiece(context, x, y, cellWidth, cellHeight, kind)
          }

          if (row > 0 && row < 8 && hash(column * 83 + row * 31 + 9) > 0.94) {
            const glow = motion.matches ? 0.6 : 0.32 + 0.55 * (0.5 + 0.5 * Math.sin(seconds * 1.6 + column * 0.7))
            context.globalAlpha = glow
            context.fillStyle = accents[Math.floor(hash(column + row * 37) * accents.length)]
            drawPiece(context, x, y, cellWidth, cellHeight, 1 + Math.floor(hash(column * 23 + row * 71) * 5))
            context.globalAlpha = 1
          }
        }
      }
    }

    function tick(time: number) {
      if (time - lastPaint > 50) {
        paint(time)
        lastPaint = time
      }
      frame = requestAnimationFrame(tick)
    }

    function syncPlayback() {
      cancelAnimationFrame(frame)
      frame = 0
      if (inView && !document.hidden && !motion.matches) frame = requestAnimationFrame(tick)
      else paint(0)
    }

    function resize() {
      const bounds = canvas!.getBoundingClientRect()
      width = Math.max(1, bounds.width)
      height = Math.max(1, bounds.height)
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas!.width = Math.round(width * ratio)
      canvas!.height = Math.round(height * ratio)
      context!.setTransform(ratio, 0, 0, ratio, 0, 0)
      paint(0)
    }

    const resizeObserver = new ResizeObserver(resize)
    const visibilityObserver = new IntersectionObserver(entries => {
      inView = Boolean(entries[0]?.isIntersecting)
      syncPlayback()
    }, { threshold: 0.05 })
    resizeObserver.observe(canvas)
    visibilityObserver.observe(canvas)
    document.addEventListener('visibilitychange', syncPlayback)
    motion.addEventListener('change', syncPlayback)
    resize()

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      document.removeEventListener('visibilitychange', syncPlayback)
      motion.removeEventListener('change', syncPlayback)
    }
  }, [])

  return <canvas ref={canvasRef} className="footer-pixel-edge" aria-hidden="true" />
}
