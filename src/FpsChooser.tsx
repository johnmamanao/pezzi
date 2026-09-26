'use client'

import { useEffect, useRef, useState } from 'react'

const presets = [4, 8, 12, 24, 30]

export function FpsChooser({ value, onChange, disabled, frameCount }: {
  value: number
  onChange: (fps: number) => void
  disabled: boolean
  frameCount: number
}) {
  const [open, setOpen] = useState(false)
  const [tick, setTick] = useState(0)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        pickerRef.current?.querySelector<HTMLButtonElement>('.fps-trigger')?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (!open || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setTick(previous => (previous + 1) % 8), 1000 / value)
    return () => window.clearInterval(timer)
  }, [open, value])

  const frameTime = Math.round(1000 / value)
  const loopTime = (frameCount / value).toFixed(2)

  return <div className="fps-picker" ref={pickerRef}>
    <button className="fps-trigger" type="button" aria-label={`Playback speed, ${value} frames per second`} aria-haspopup="dialog" aria-expanded={open} disabled={disabled} onClick={() => setOpen(previous => !previous)}>
      <span className="fps-trigger-label">FPS</span><strong>{value}</strong><span className="fps-chevron" aria-hidden="true">⌄</span>
    </button>
    {open && <div className="fps-popover" role="dialog" aria-label="Playback speed">
      <div className="fps-popover-heading"><div><span>PLAYBACK SPEED</span><strong>{value} <small>fps</small></strong></div><span className="fps-frame-time">{frameTime} ms / frame</span></div>
      <div className="fps-speed-preview" aria-label={`Speed preview at ${value} frames per second`}>
        {Array.from({ length: 8 }, (_, at) => <i key={at} className={tick === at ? 'is-active' : ''} />)}
      </div>
      <p className="fps-context">{frameCount > 1 ? `${frameCount} frames make a ${loopTime}s loop. Playback updates as you choose.` : 'Add another frame to play the artwork. The strip above previews the speed.'}</p>
      <div className="fps-presets" role="group" aria-label="Common frame rates">
        {presets.map(fps => <button key={fps} type="button" className={value === fps ? 'is-selected' : ''} aria-pressed={value === fps} onClick={() => onChange(fps)}>{fps}</button>)}
      </div>
      <label className="fps-range-label" htmlFor="fps-range"><span>Fine tune</span><strong>{value} fps</strong></label>
      <input id="fps-range" className="fps-range" type="range" min="1" max="30" step="1" value={value} onChange={event => onChange(Number(event.target.value))} aria-label="Fine tune frames per second" />
      <div className="fps-range-ends"><span>1 fps</span><span>30 fps</span></div>
    </div>}
  </div>
}
