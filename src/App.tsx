'use client'

import { memo, useEffect, useRef, useState } from 'react'
import { aspectSizes, defaultConfig, drawMosaic, MAX_GRID_DENSITY, newFrame, palettes } from './mosaic'
import type { Aspect, MosaicConfig, MosaicFrame, ShapeStyle } from './mosaic'
import { StudioConfig } from './StudioConfig'
import { FpsChooser } from './FpsChooser'
import { FooterMosaic } from './FooterMosaic'
import { captureVideoFrames, MAX_VIDEO_FRAMES, probeVideo } from './video'
import type { VideoDetails } from './video'

const root = '/'
const studioUrl = '/studio'
const studioTools = [
  { id: 'pattern', label: 'Pattern' },
  { id: 'color', label: 'Color' },
  { id: 'media', label: 'Media' },
  { id: 'effects', label: 'Effects' },
  { id: 'project', label: 'Project' },
] as const
type StudioTool = typeof studioTools[number]['id']

function StudioToolIcon({ name }: { name: StudioTool }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return <svg viewBox="0 0 24 24" width="23" height="23" aria-hidden="true" {...common}>
    {name === 'pattern' && <><rect x="3" y="3" width="7" height="7" rx="2" /><circle cx="17.5" cy="6.5" r="3.5" /><path d="M6.5 14 10 21H3l3.5-7ZM14 14h7v7h-7z" /></>}
    {name === 'color' && <><path d="M12 3a9 9 0 1 0 0 18h1.2a2 2 0 0 0 1.4-3.4 1.9 1.9 0 0 1 1.3-3.3h1.6A3.5 3.5 0 0 0 21 10.8 9 9 0 0 0 12 3Z" /><circle cx="7.5" cy="10" r=".7" fill="currentColor" /><circle cx="11" cy="7" r=".7" fill="currentColor" /><circle cx="16" cy="8" r=".7" fill="currentColor" /><circle cx="7.5" cy="14.5" r=".7" fill="currentColor" /></>}
    {name === 'media' && <><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="8" cy="9" r="1.5" /><path d="m4 17 5-5 3.5 3.5 2.5-2.5 5 5M16 6l3 2-3 2V6Z" /></>}
    {name === 'effects' && <><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2ZM19 17l.7 1.3L21 19l-1.3.7L19 21l-.7-1.3L17 19l1.3-.7L19 17Z" /></>}
    {name === 'project' && <><path d="M5 3h12l4 4v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /><path d="M7 3v6h9V3M7 21v-8h10v8M10 16h4" /></>}
  </svg>
}

function Mark({ small = false }: { small?: boolean }) {
  return <span className={small ? 'mark mark-small' : 'mark'} aria-hidden="true"><i /><i /><i /><i /></span>
}

function Brand({ light = false }: { light?: boolean }) {
  return <a className={light ? 'brand brand-light' : 'brand'} href={root} aria-label="Pezzi home"><Mark /> <span>pezzi</span></a>
}

const MosaicCanvas = memo(function MosaicCanvas({ frame, aspect, image, className = '', thumbnail = false }: {
  frame: MosaicFrame
  aspect: Aspect
  image?: HTMLImageElement | null
  className?: string
  thumbnail?: boolean
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const render = () => drawMosaic(canvas, frame, aspect, image, thumbnail ? [160, 90] : undefined)
    if (!thumbnail || typeof IntersectionObserver === 'undefined') { render(); return }
    const observer = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) { observer.disconnect(); render() }
    }, { rootMargin: '160px' })
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [frame, aspect, image, thumbnail])
  return <canvas ref={ref} className={className} role="img" aria-label={`Mosaic artwork in the ${palettes[frame.palette].name} palette`} />
})

export function Landing() {
  const [heroSubject, setHeroSubject] = useState(0)
  const [videoPlaying, setVideoPlaying] = useState(true)
  const heroVideoRef = useRef<HTMLVideoElement>(null)
  const heroSubjects = [
    { name: 'sneaker', description: 'A sneaker becomes a moving mosaic' },
    { name: 'camera', description: 'A camera becomes a moving mosaic' },
    { name: 'teapot', description: 'A teapot becomes a moving mosaic' },
  ]
  const featured = heroSubjects[heroSubject]
  const surroundingSubjects = heroSubjects.map((subject, index) => ({ ...subject, index })).filter(subject => subject.index !== heroSubject)
  useEffect(() => {
    const video = heroVideoRef.current
    if (!video) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { video.pause(); setVideoPlaying(false) }
    else { void video.play().catch(() => setVideoPlaying(false)) }
  }, [heroSubject])
  function toggleHeroVideo() {
    const video = heroVideoRef.current
    if (!video) return
    if (video.paused) { void video.play().then(() => setVideoPlaying(true)).catch(() => setVideoPlaying(false)) }
    else { video.pause(); setVideoPlaying(false) }
  }
  return <div className="landing" id="top">
    <header className="site-header">
      <Brand />
      <nav aria-label="Main navigation"><a href="#the-idea">The idea</a><a href="#motion">Motion</a></nav>
      <a className="header-action" href={studioUrl}><span aria-hidden="true">✦</span> open pezzi</a>
    </header>

    <main>
      <section className="desktop-hero" aria-labelledby="hero-title">
        <div className="desktop-doodle doodle-one" aria-hidden="true">✳</div>
        <div className="desktop-doodle doodle-two" aria-hidden="true">◈</div>
        {surroundingSubjects.map((subject, slot) => <button key={subject.name} type="button" className={`hero-peek hero-peek-${slot + 1}`} onClick={() => setHeroSubject(subject.index)} aria-label={`Show ${subject.name} in the main player`}>
          <span className="window-bar"><span className="window-dots"><i /><i /><i /></span><span>{subject.name}-study.webm</span><span className="peek-arrow" aria-hidden="true">↗</span></span>
          <video key={subject.name} autoPlay muted loop playsInline preload="metadata" poster={`/demos/${subject.name}-hd.png`} onPlay={event => { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) event.currentTarget.pause() }} aria-hidden="true"><source src={`/demos/${subject.name}-hd.webm`} type="video/webm" /></video>
          <span className="peek-label">{subject.name} / view sample</span>
        </button>)}
        <div className="hero-center">
          <Mark />
          <h1 id="hero-title">pezzi</h1>
          <p>your moments, remade in tiny pieces</p>
          <div className="desktop-actions"><a className="primary-action clicky-pill clicky-pill-blue" href={studioUrl}><Mark small /> open the studio</a><button className="clicky-pill clicky-pill-silver" type="button" onClick={() => setHeroSubject(index => (index + 1) % heroSubjects.length)}><span aria-hidden="true">↻</span> see another object</button></div>
          <small>bring a photo or video · play with every frame</small>
        </div>
        <div className="hero-window hero-movie">
          <div className="window-bar"><span className="window-dots"><i /><i /><i /></span><span>{featured.name}-study.webm</span><span className="window-live"><i /> made in pezzi</span></div>
          <div className="hero-video-wrap">
            <video key={featured.name} ref={heroVideoRef} autoPlay muted loop playsInline preload="auto" poster={`/demos/${featured.name}-hd.png`} onPlay={() => setVideoPlaying(true)} onPause={() => setVideoPlaying(false)} aria-label={featured.description}><source src={`/demos/${featured.name}-hd.webm`} type="video/webm" /></video>
            <div className="hero-video-caption"><span><b>01—03</b> / {featured.name} in motion</span><button type="button" onClick={toggleHeroVideo} aria-label={videoPlaying ? 'Pause mosaic video' : 'Play mosaic video'}>{videoPlaying ? 'Ⅱ pause' : '▶ play'}</button></div>
          </div>
        </div>
        <span className="desktop-caption caption-left">one object, a thousand little pieces ↗</span>
        <span className="desktop-caption caption-right">these loops were made with the pezzi engine</span>
      </section>

      <section className="idea-section" id="the-idea">
        <div className="idea-intro"><span className="section-kicker">FROM MOMENT TO MOSAIC</span><h2>Start with a moment.<br /><em>Make it yours.</em></h2><p>Drop in a photo or a clip. Choose the pieces, colors, and rhythm. Watch your familiar moment become something new.</p></div>
        <div className="sample-wall">
          <div className="sample sample-left"><video autoPlay muted loop playsInline preload="metadata" poster="/demos/poppy-hd.png" onPlay={event => { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) event.currentTarget.pause() }} aria-label="A poppy flower moving as a mosaic"><source src="/demos/poppy-hd.webm" type="video/webm" /></video><span>01 / a flower in motion</span></div>
          <div className="sample sample-right"><video autoPlay muted loop playsInline preload="metadata" poster="/demos/lemon-hd.png" onPlay={event => { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) event.currentTarget.pause() }} aria-label="A lemon moving as a mosaic"><source src="/demos/lemon-hd.webm" type="video/webm" /></video><span>02 / a little bit of citrus</span></div>
        </div>
      </section>

      <section className="motion-section" id="motion">
        <div className="process-panel" aria-label="How Pezzi makes a moving mosaic"><div className="process-heading"><Mark small /><span>FROM OBJECT TO LOOP</span></div><div className="process-step"><b>01</b><div><strong>Bring your moment</strong><p>Start with an image or a short video.</p></div><span aria-hidden="true">↗</span></div><div className="process-step"><b>02</b><div><strong>Make your pieces</strong><p>Adjust density, shape, color, and spacing.</p></div><span aria-hidden="true">✳</span></div><div className="process-step"><b>03</b><div><strong>Let it move</strong><p>Preview the sequence and export a loop.</p></div><span aria-hidden="true">▶</span></div></div>
        <div className="motion-copy"><span className="section-kicker">WHEN ONE FRAME ISN'T ENOUGH</span><h2>Give it<br /><em>a pulse.</em></h2><p>Build a sequence of mosaic frames and watch your artwork find its rhythm. Export a still or a moving loop from the studio.</p><a className="text-link" href={studioUrl}>Make a moving mosaic <span aria-hidden="true">↗</span></a></div>
      </section>

    </main>
    <footer className="site-footer">
      <FooterMosaic />
      <div className="footer-invitation">
        <Mark />
        <h2>Ready to remix<br />a moment?</h2>
        <p>Bring one photo or clip. Make a mosaic that moves your way.</p>
        <a className="clicky-pill clicky-pill-blue" href={studioUrl}><Mark small /> open the studio <span aria-hidden="true">↗</span></a>
      </div>
      <div className="footer-bottom">
        <a className="footer-wordmark" href="#top" aria-label="Pezzi, back to top">pezzi<span aria-hidden="true">✳</span></a>
        <nav className="footer-links" aria-label="Footer"><a href="#the-idea">The idea</a><a href="#motion">Motion</a><a href={studioUrl}>Studio</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav>
        <p>Your media stays in your browser. © pezzi {new Date().getFullYear()}</p>
      </div>
    </footer>
  </div>
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function Studio() {
  const [frames, setFrames] = useState<MosaicFrame[]>(() => [newFrame({ seed: 19835 })])
  const [index, setIndex] = useState(0)
  const [aspect, setAspect] = useState<Aspect>('wide')
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [imageName, setImageName] = useState('')
  const [playing, setPlaying] = useState(false)
  const [playbackFps, setPlaybackFps] = useState(12)
  const [recording, setRecording] = useState(false)
  const [importing, setImporting] = useState(false)
  const [pendingVideo, setPendingVideo] = useState<{ file: File; details: VideoDetails } | null>(null)
  const [message, setMessage] = useState('')
  const [toolsOpen, setToolsOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTool, setActiveTool] = useState<StudioTool>('pattern')
  const toolPanelRef = useRef<HTMLDivElement>(null)
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null)
  const playheadRef = useRef(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)
  const projectRef = useRef<HTMLInputElement>(null)
  const previewCacheRef = useRef(new Map<string, { frame: MosaicFrame; aspect: Aspect; image: HTMLImageElement | null; canvas: HTMLCanvasElement }>())
  const current = frames[index]
  const loopDuration = (frames.length / playbackFps).toFixed(2)

  function selectTool(tool: StudioTool) {
    if (tool === activeTool) {
      if (window.matchMedia('(max-width: 760px)').matches) setToolsOpen(false)
      else setSidebarCollapsed(value => !value)
      return
    }
    setActiveTool(tool)
    setSidebarCollapsed(false)
    if (toolPanelRef.current) toolPanelRef.current.scrollTop = 0
  }

  function changePlaybackFps(fps: number) {
    setPlaybackFps(fps)
    if (frames.length > 1) { if (!playing) playheadRef.current = index; setPlaying(true) }
    setMessage('')
  }

  function togglePlayback() {
    if (playing) { setIndex(playheadRef.current); setPlaying(false) }
    else { playheadRef.current = index; setPlaying(true) }
  }

  function previewFor(frame: MosaicFrame) {
    const cached = previewCacheRef.current.get(frame.id)
    if (cached?.frame === frame && cached.aspect === aspect && cached.image === image) return cached.canvas
    const [width, height] = aspectSizes[aspect]
    const scale = Math.min(1, 520 / Math.max(width, height))
    const preview = document.createElement('canvas')
    drawMosaic(preview, frame, aspect, image, [Math.round(width * scale), Math.round(height * scale)])
    previewCacheRef.current.set(frame.id, { frame, aspect, image, canvas: preview })
    return preview
  }

  useEffect(() => {
    const canvas = canvasElement
    if (!canvas || !current) return
    if (playing && frames.length > 1) return
    drawMosaic(canvas, current, aspect, image)
  }, [canvasElement, current, aspect, image, playing, frames.length])

  useEffect(() => {
    if (frames.length < 2) return
    const frameIds = new Set(frames.map(frame => frame.id))
    for (const id of previewCacheRef.current.keys()) if (!frameIds.has(id)) previewCacheRef.current.delete(id)
    let cancelled = false
    let idleId = 0
    let startTimer = 0
    let position = 0
    const schedule = (callback: IdleRequestCallback) => window.requestIdleCallback
      ? window.requestIdleCallback(callback)
      : window.setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 12 } as IdleDeadline), 16)
    const prepare = (deadline: IdleDeadline) => {
      if (cancelled) return
      const start = position
      while (position < frames.length && (position === start || deadline.timeRemaining() > 4)) {
        previewFor(frames[position])
        position++
      }
      if (position < frames.length) idleId = schedule(prepare)
    }
    startTimer = window.setTimeout(() => { idleId = schedule(prepare) }, 180)
    return () => { cancelled = true; window.clearTimeout(startTimer); if (idleId) { if (window.cancelIdleCallback) window.cancelIdleCallback(idleId); else window.clearTimeout(idleId) } }
  }, [frames, aspect, image])

  useEffect(() => {
    if (!playing || frames.length < 2 || !canvasElement) return
    let animation = 0
    let previous = performance.now()
    let accumulated = 0
    let lastUiUpdate = 0
    const [width, height] = aspectSizes[aspect]
    if (canvasElement.width !== width) canvasElement.width = width
    if (canvasElement.height !== height) canvasElement.height = height
    const ctx = canvasElement.getContext('2d')
    const showFrame = (at: number) => {
      if (!ctx) return
      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(previewFor(frames[at]), 0, 0, width, height)
    }
    showFrame(playheadRef.current % frames.length)
    const advance = (now: number) => {
      accumulated += Math.min(now - previous, 250)
      previous = now
      const frameLength = 1000 / playbackFps
      if (accumulated >= frameLength) {
        const steps = Math.floor(accumulated / frameLength)
        accumulated -= steps * frameLength
        playheadRef.current = (playheadRef.current + steps) % frames.length
        showFrame(playheadRef.current)
        if (now - lastUiUpdate >= 125) { setIndex(playheadRef.current); lastUiUpdate = now }
      }
      animation = window.requestAnimationFrame(advance)
    }
    animation = window.requestAnimationFrame(advance)
    return () => window.cancelAnimationFrame(animation)
  }, [playing, frames, playbackFps, canvasElement, aspect, image])

  function updateLook(change: Partial<MosaicFrame>) {
    setFrames(previous => previous.map(frame => ({ ...frame, ...change })))
  }
  function updateConfig(change: Partial<MosaicConfig>) {
    setFrames(previous => previous.map(frame => ({ ...frame, config: { ...defaultConfig, ...frame.config, ...change } })))
  }
  function remix() {
    const seed = Math.floor(Math.random() * 1_000_000)
    setFrames(previous => previous.map((frame, at) => ({ ...frame, seed: seed + at * 73 })))
  }
  function randomizeAll() {
    const seed = Math.floor(Math.random() * 1_000_000)
    const change = { fillAmount: 65 + Math.floor(Math.random() * 36), scaleBlend: Math.floor(Math.random() * 7), gap: Math.floor(Math.random() * 18), shapeMix: 35 + Math.floor(Math.random() * 66) }
    setFrames(previous => previous.map((frame, at) => ({ ...frame, seed: seed + at * 73, config: { ...defaultConfig, ...frame.config, ...change } })))
  }
  function addFrame() {
    if (frames.length >= MAX_VIDEO_FRAMES) return
    setPlaying(false)
    const next = newFrame({ ...current, seed: current.seed + 651 })
    setFrames(previous => [...previous, next])
    setIndex(frames.length)
  }
  function duplicateFrame() {
    if (frames.length >= MAX_VIDEO_FRAMES) return
    setPlaying(false)
    const next = newFrame({ ...current })
    setFrames(previous => [...previous, next])
    setIndex(frames.length)
  }
  function removeFrame() {
    if (frames.length === 1) return
    setPlaying(false)
    setFrames(previous => previous.filter((_, at) => at !== index))
    setIndex(value => Math.max(0, value - 1))
  }
  function importImage(file?: File) {
    if (!file) return
    if (!file.type.startsWith('image/')) { setMessage('Choose an image file to use its colors.'); return }
    const url = URL.createObjectURL(file)
    const source = new Image()
    source.onload = () => {
      setFrames(previous => previous.map(frame => ({ ...frame, source: undefined })))
      setImage(source)
      setImageName(file.name)
      setMessage('Photo colors are ready to remix.')
      URL.revokeObjectURL(url)
    }
    source.onerror = () => { setMessage('This image could not be opened. Try another file.'); URL.revokeObjectURL(url) }
    source.src = url
  }
  async function selectVideo(file?: File) {
    if (!file) return
    setMessage('Reading video details…')
    try {
      setPendingVideo({ file, details: await probeVideo(file) })
      setMessage('')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'This video could not be read.')
    } finally {
      if (videoRef.current) videoRef.current.value = ''
    }
  }
  async function importVideo() {
    if (!pendingVideo || importing) return
    const { file, details } = pendingVideo
    setPendingVideo(null)
    setImporting(true)
    setPlaying(false)
    setMessage(`Reading frame 0 of ${details.importFrames}…`)
    try {
      const sources = await captureVideoFrames(file, details, done => setMessage(`Reading frame ${done} of ${details.importFrames}…`))
      const imported = sources.map((source, at) => newFrame({
        seed: 21000 + at * 73,
        palette: current.palette,
        density: current.density,
        shapeStyle: current.shapeStyle,
        config: { ...defaultConfig, ...current.config },
        backgroundImage: current.backgroundImage,
        textureImage: current.textureImage,
        customShape: current.customShape,
        source,
      }))
      setFrames(imported)
      setIndex(0)
      setAspect(details.width / details.height > 1.3 ? 'wide' : details.height / details.width > 1.3 ? 'portrait' : 'square')
      setPlaybackFps(Math.min(30, Math.max(1, Math.round(details.fps))))
      setImage(null)
      setImageName('')
      setMessage(`Imported ${imported.length} video frames from ${file.name}.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Video import failed. Try another clip.')
    } finally {
      setImporting(false)
    }
  }
  function exportPng() {
    const canvas = document.createElement('canvas')
    drawMosaic(canvas, current, aspect, image)
    canvas.toBlob(blob => {
      if (blob) { download(blob, 'pezzi-mosaic.png'); setMessage('PNG saved to your downloads.') }
      else setMessage('The PNG could not be prepared. Try again.')
    }, 'image/png')
  }
  function imageData(image?: HTMLImageElement) {
    if (!image) return undefined
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth; canvas.height = image.naturalHeight
    canvas.getContext('2d')?.drawImage(image, 0, 0)
    return canvas.toDataURL('image/png')
  }
  function saveProject() {
    const data = {
      format: 'pezzi-project', version: 1, aspect, playbackFps, index, image: imageData(image ?? undefined), imageName,
      frames: frames.map(frame => ({ ...frame, source: frame.source?.toDataURL('image/png'), backgroundImage: imageData(frame.backgroundImage), textureImage: imageData(frame.textureImage), customShape: imageData(frame.customShape) })),
    }
    download(new Blob([JSON.stringify(data)], { type: 'application/json' }), 'pezzi-project.json')
    setMessage('Project saved to your downloads.')
  }
  function decodeImage(data?: string): Promise<HTMLImageElement | undefined> {
    if (!data || !data.startsWith('data:image/')) return Promise.resolve(undefined)
    return new Promise((resolve, reject) => {
      const result = new Image()
      result.onload = () => resolve(result)
      result.onerror = () => reject(new Error('A project image could not be decoded.'))
      result.src = data
    })
  }
  async function loadProject(file?: File) {
    if (!file) return
    try {
      const data = JSON.parse(await file.text())
      if (!['pezzi-project', 'tessloop-project'].includes(data?.format) || !Array.isArray(data.frames) || !data.frames.length || data.frames.length > MAX_VIDEO_FRAMES) throw new Error('Choose a Pezzi project file.')
      const restored = await Promise.all(data.frames.map(async (entry: MosaicFrame & { source?: string; backgroundImage?: string; textureImage?: string; customShape?: string }) => {
        const sourceImage = await decodeImage(entry.source)
        const source = sourceImage ? document.createElement('canvas') : undefined
        if (source && sourceImage) { source.width = sourceImage.naturalWidth; source.height = sourceImage.naturalHeight; source.getContext('2d')?.drawImage(sourceImage, 0, 0) }
        return { ...entry, density: Math.max(6, Math.min(MAX_GRID_DENSITY, Math.round(Number(entry.density) || 18))), source, backgroundImage: await decodeImage(entry.backgroundImage), textureImage: await decodeImage(entry.textureImage), customShape: await decodeImage(entry.customShape), config: { ...defaultConfig, ...entry.config } } as MosaicFrame
      }))
      setFrames(restored)
      setAspect(['wide', 'square', 'classic', 'portrait'].includes(data.aspect) ? data.aspect : 'wide')
      setIndex(Math.max(0, Math.min(restored.length - 1, Number(data.index) || 0)))
      setPlaybackFps(Math.max(1, Math.min(30, Math.round(Number(data.playbackFps) || 12))))
      setImage(await decodeImage(data.image) ?? null)
      setImageName(typeof data.imageName === 'string' ? data.imageName : '')
      setPlaying(false)
      setMessage(`Loaded ${restored.length} project frames.`)
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Project could not be loaded.') }
    finally { if (projectRef.current) projectRef.current.value = '' }
  }
  async function copySettings() {
    try { await navigator.clipboard.writeText(JSON.stringify({ format: 'pezzi-look', palette: current.palette, density: current.density, shapeStyle: current.shapeStyle, config: { ...defaultConfig, ...current.config } })); setMessage('Look copied to clipboard.') }
    catch { setMessage('Clipboard access was unavailable.') }
  }
  async function pasteSettings() {
    try {
      const data = JSON.parse(await navigator.clipboard.readText())
      if (!['pezzi-look', 'tessloop-look'].includes(data?.format) || !Number.isFinite(data.density) || !data.config) throw new Error('Clipboard does not contain a Pezzi look.')
      updateLook({ palette: Math.max(0, Math.min(palettes.length - 1, Number(data.palette) || 0)), density: Math.max(6, Math.min(MAX_GRID_DENSITY, Math.round(data.density))), shapeStyle: ['playful', 'rounded', 'graphic'].includes(data.shapeStyle) ? data.shapeStyle : 'playful', config: { ...defaultConfig, ...data.config } })
      setMessage('Look pasted across the sequence.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Look could not be pasted.') }
  }
  function resetCanvas() {
    if (!window.confirm('Start a new mosaic? Your current unsaved work will be cleared.')) return
    setFrames([newFrame()]); setIndex(0); setAspect('wide'); setImage(null); setImageName(''); setPlaybackFps(12); setPlaying(false); setMessage('New canvas ready.')
  }
  async function exportVideo() {
    if (recording) return
    if (typeof MediaRecorder === 'undefined' || !HTMLCanvasElement.prototype.captureStream) {
      setMessage('Video export is not supported by this browser. PNG export is available.')
      return
    }
    setPlaying(false)
    setRecording(true)
    setMessage('Recording your mosaic loop…')
    const canvas = document.createElement('canvas')
    const [width, height] = aspectSizes[aspect]
    canvas.width = width
    canvas.height = height
    const stream = canvas.captureStream(playbackFps)
    const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm'
    const chunks: BlobPart[] = []
    try {
      const recorder = new MediaRecorder(stream, { mimeType: mime })
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data) }
      const stopped = new Promise<void>(resolve => { recorder.onstop = () => resolve() })
      recorder.start()
      for (let cycle = 0; cycle < 3; cycle++) {
        for (const frame of frames) {
          drawMosaic(canvas, frame, aspect, image)
          await new Promise(resolve => window.setTimeout(resolve, 1000 / playbackFps))
        }
      }
      recorder.stop()
      await stopped
      const videoBlob = new Blob(chunks, { type: 'video/webm' })
      if (!videoBlob.size) throw new Error('Empty video recording')
      download(videoBlob, 'pezzi-loop.webm')
      setMessage('Video saved to your downloads.')
    } catch {
      setMessage('Video export failed. Try saving a PNG instead.')
    } finally {
      stream.getTracks().forEach(track => track.stop())
      setRecording(false)
    }
  }

  return <div className="studio">
    <header className="studio-header"><Brand /><span className="studio-title"><i /> Untitled mosaic</span><div className="studio-header-actions"><a className="studio-home" href={root}>Back to site</a><button type="button" className="export-main" onClick={exportPng}>Export PNG <span aria-hidden="true">↗</span></button></div></header>
    <div className={sidebarCollapsed ? 'studio-layout is-sidebar-collapsed' : 'studio-layout'}>
      {toolsOpen && <button className="tools-scrim" type="button" onClick={() => setToolsOpen(false)} aria-label="Close tools" />}
      <aside className={toolsOpen ? 'studio-sidebar is-open' : 'studio-sidebar'} aria-label="Mosaic controls">
        <nav className="studio-tool-rail" aria-label="Studio settings">
          {studioTools.map(tool => <button key={tool.id} type="button" className={activeTool === tool.id ? 'tool-rail-button is-active' : 'tool-rail-button'} aria-label={`${tool.label} controls`} aria-pressed={activeTool === tool.id} aria-expanded={activeTool === tool.id && !sidebarCollapsed} aria-controls="studio-tool-panel" title={tool.label} onClick={() => selectTool(tool.id)}><StudioToolIcon name={tool.id} /><span>{tool.label}</span></button>)}
        </nav>
        <div className="studio-tool-panel" id="studio-tool-panel" ref={toolPanelRef} hidden={sidebarCollapsed}>
          <div className="sidebar-mobile-top"><span>TOOLS</span><button className="sidebar-close" type="button" onClick={() => setToolsOpen(false)} aria-label="Close tools">×</button></div>
          {frames.length > 1 && activeTool !== 'project' && <p className="look-scope-note">Look changes update every frame automatically.</p>}
          {activeTool === 'pattern' && <>
            <div className="tool-section"><div className="tool-heading"><h2>Shape</h2><span>Choose a direction</span></div><div className="segmented" role="group" aria-label="Shape style">{([['playful', 'Playful'], ['rounded', 'Soft'], ['graphic', 'Graphic']] as [ShapeStyle, string][]).map(([value, label]) => <button type="button" key={value} className={current.shapeStyle === value ? 'is-active' : ''} aria-pressed={current.shapeStyle === value} onClick={() => updateLook({ shapeStyle: value })}>{label}</button>)}</div><p className="shape-style-hint" aria-live="polite">{current.shapeStyle === 'rounded' ? 'Rounder forms with more breathing room.' : current.shapeStyle === 'graphic' ? 'Sharp shapes that fill the grid.' : 'A lively mix of crisp shapes.'}</p><label className="density-label" htmlFor="density"><span>Grid density</span><strong>{current.density} columns</strong></label><input id="density" type="range" min="6" max={MAX_GRID_DENSITY} step="1" value={current.density} onChange={event => updateLook({ density: Number(event.target.value) })} /></div>
            <StudioConfig section="pattern" frame={current} update={updateConfig} updateFrame={updateLook} randomize={remix} randomizeAll={randomizeAll} />
          </>}
          {activeTool === 'color' && <>
            <div className="tool-section"><div className="tool-heading"><h2>Palette</h2><span>Set the mood</span></div><div className="palette-list">{palettes.map((palette, at) => <button key={palette.name} type="button" className={current.palette === at ? 'palette-choice is-active' : 'palette-choice'} aria-pressed={current.palette === at} onClick={() => updateLook({ palette: at })}><span className="palette-dots">{palette.colors.slice(0, 4).map((color, dot) => <i key={dot} style={{ background: color }} />)}</span><span>{palette.name}</span><span className="palette-check" aria-hidden="true">{current.palette === at ? '✓' : ''}</span></button>)}</div></div>
            <StudioConfig section="color" frame={current} update={updateConfig} updateFrame={updateLook} randomize={remix} randomizeAll={randomizeAll} />
          </>}
          {activeTool === 'media' && <div className="tool-section source-section"><div className="tool-heading"><h2>Source</h2><span>Bring your own media</span></div><input ref={fileRef} type="file" accept="image/*" hidden onChange={event => importImage(event.target.files?.[0])} /><button className="source-button" type="button" onClick={() => fileRef.current?.click()}><span aria-hidden="true">↑</span>{imageName ? 'Change image' : 'Import image'}</button>{imageName && <div className="source-file"><span title={imageName}>{imageName}</span><button type="button" onClick={() => { setImage(null); setImageName(''); if (fileRef.current) fileRef.current.value = '' }} aria-label="Remove imported image">×</button></div>}<input ref={videoRef} type="file" accept="video/mp4,video/quicktime,video/x-m4v,video/webm,.mp4,.mov,.m4v,.webm" hidden onChange={event => void selectVideo(event.target.files?.[0])} /><button className="source-button video-source-button" type="button" onClick={() => videoRef.current?.click()} disabled={importing}><span aria-hidden="true">▣</span> Import video</button><p>Video becomes editable mosaic frames. Files stay in your browser.</p></div>}
          {activeTool === 'effects' && <StudioConfig section="effects" frame={current} update={updateConfig} updateFrame={updateLook} randomize={remix} randomizeAll={randomizeAll} />}
          {activeTool === 'project' && <section className="tool-section config-section" aria-labelledby="project-config"><div className="tool-heading"><h2 id="project-config">Project</h2><span>Keep your work</span></div><div className="config-actions"><button type="button" onClick={saveProject}>Save project</button><button type="button" onClick={() => projectRef.current?.click()}>Load project</button></div><input ref={projectRef} type="file" accept="application/json,.json" hidden onChange={event => void loadProject(event.target.files?.[0])} /><div className="config-actions"><button type="button" onClick={() => void copySettings()}>Copy look</button><button type="button" onClick={() => void pasteSettings()}>Paste look</button></div><button className="config-wide-action" type="button" onClick={resetCanvas}>Reset canvas</button><p className="project-note">Projects and looks stay on your device.</p></section>}
        </div>
      </aside>
      <main className="studio-main">
        <div className="workbar"><div className="workbar-left"><button className="mobile-tools" type="button" onClick={() => setToolsOpen(true)} aria-label="Open tools">☷ <span>Tools</span></button><span className="workbar-label">ARTBOARD</span><div className="aspect-switch" role="group" aria-label="Canvas shape">{([['wide', '16:9'], ['square', '1:1'], ['classic', '3:4'], ['portrait', '9:16']] as [Aspect, string][]).map(([value, label]) => <button type="button" key={value} className={aspect === value ? 'is-active' : ''} aria-pressed={aspect === value} onClick={() => setAspect(value)}>{label}</button>)}</div></div><button className="remix-button" type="button" onClick={remix}><span aria-hidden="true">↻</span> Remix</button></div>
        <div className={`workspace aspect-${aspect}`}><canvas ref={setCanvasElement} className="studio-canvas" role="img" aria-label="Your mosaic artwork" /></div>
        <div className="studio-bottom"><div className="timeline-head"><div><span className="timeline-kicker">SEQUENCE</span><h2>Frame by frame.</h2></div><div className="timeline-actions"><FpsChooser value={playbackFps} onChange={changePlaybackFps} disabled={recording} frameCount={frames.length} /><button type="button" onClick={togglePlayback} disabled={frames.length < 2} aria-label={playing ? 'Pause animation' : 'Play animation'}>{playing ? '❚❚' : '▶'} <span>{playing ? 'Pause' : 'Play'}</span></button><button type="button" onClick={duplicateFrame} disabled={frames.length >= MAX_VIDEO_FRAMES}>Duplicate</button><button type="button" onClick={removeFrame} disabled={frames.length < 2}>Remove</button></div></div><div className="frame-strip" role="group" aria-label="Mosaic frames">{frames.map((frame, at) => <button key={frame.id} type="button" className={at === index ? 'frame-thumb is-active' : 'frame-thumb'} onClick={() => { playheadRef.current = at; setIndex(at); setPlaying(false) }} aria-pressed={at === index} aria-label={`Frame ${at + 1}`}><MosaicCanvas frame={frame} aspect="wide" image={image} thumbnail /><span>{String(at + 1).padStart(2, '0')}</span></button>)}<button className="add-frame" type="button" onClick={addFrame} disabled={frames.length >= MAX_VIDEO_FRAMES} aria-label="Add mosaic frame"><span>+</span>Add frame</button></div><div className="export-row"><span role="status">{message || (frames.length === 1 ? '1 frame · Add a frame to preview motion' : `${frames.length} frames · ${playbackFps} FPS · ${loopDuration}s loop`)}</span><button type="button" onClick={exportVideo} disabled={recording}>{recording ? 'Recording…' : 'Export moving loop ↗'}</button></div></div>
      </main>
    </div>
    {pendingVideo && <div className="import-backdrop" onClick={() => setPendingVideo(null)}><div className="import-dialog" role="dialog" aria-modal="true" aria-labelledby="import-title" onClick={event => event.stopPropagation()}><span className="section-kicker">VIDEO TO MOSAIC</span><h2 id="import-title">Import this clip?</h2><p className="import-filename">{pendingVideo.file.name}</p><div className="import-stats"><span>{pendingVideo.details.duration.toFixed(1)} sec</span><span>{Math.round(pendingVideo.details.fps)} fps</span><span>{pendingVideo.details.width} × {pendingVideo.details.height}</span><span>{pendingVideo.details.importFrames} frames</span></div>{pendingVideo.details.totalFrames > pendingVideo.details.importFrames && <p className="import-note">The first 150 frames will be imported, preserving the clip’s pace.</p>}<p className="import-note">Importing replaces the current timeline.</p><div className="import-actions"><button type="button" onClick={() => setPendingVideo(null)}>Cancel</button><button type="button" onClick={() => void importVideo()}>Import frames ↗</button></div></div></div>}
  </div>
}
