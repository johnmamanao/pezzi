export const MAX_VIDEO_FRAMES = 150

export type VideoDetails = {
  duration: number
  width: number
  height: number
  fps: number
  totalFrames: number
  importFrames: number
}

async function openVideo(file: File): Promise<{ video: HTMLVideoElement; url: string }> {
  const url = URL.createObjectURL(file)
  const video = document.createElement('video')
  video.preload = 'auto'
  video.muted = true
  video.playsInline = true
  video.src = url
  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve()
      video.onerror = () => reject(new Error('Video could not be decoded by this browser.'))
      video.load()
    })
    if (!Number.isFinite(video.duration) || video.duration <= 0 || !video.videoWidth || !video.videoHeight) {
      throw new Error('Video has no usable picture or duration.')
    }
    return { video, url }
  } catch (error) {
    URL.revokeObjectURL(url)
    throw error
  }
}

function closeVideo(video: HTMLVideoElement, url: string) {
  video.removeAttribute('src')
  video.load()
  URL.revokeObjectURL(url)
}

async function readFps(file: File): Promise<number> {
  try {
    const { Input, BlobSource, ALL_FORMATS } = await import('mediabunny')
    const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS })
    try {
      if (!(await input.canRead())) return 24
      const track = await input.getPrimaryVideoTrack()
      const stats = await track?.computePacketStats(120)
      return stats?.averagePacketRate && Number.isFinite(stats.averagePacketRate) ? stats.averagePacketRate : 24
    } finally {
      input.dispose()
    }
  } catch {
    return 24
  }
}

export async function probeVideo(file: File): Promise<VideoDetails> {
  if (!file.type.startsWith('video/') && !/\.(mp4|mov|m4v|webm)$/i.test(file.name)) {
    throw new Error('Choose an MP4, MOV, M4V, or WebM video.')
  }
  const { video, url } = await openVideo(file)
  try {
    const fps = Math.min(60, Math.max(1, await readFps(file)))
    const totalFrames = Math.max(1, Math.round(video.duration * fps))
    return {
      duration: video.duration,
      width: video.videoWidth,
      height: video.videoHeight,
      fps,
      totalFrames,
      importFrames: Math.min(MAX_VIDEO_FRAMES, totalFrames),
    }
  } finally {
    closeVideo(video, url)
  }
}

async function seek(video: HTMLVideoElement, time: number) {
  if (Math.abs(video.currentTime - time) < 0.0005) return
  await new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => { cleanup(); reject(new Error('Video seek timed out.')) }, 8000)
    const onSeeked = () => { cleanup(); resolve() }
    const onError = () => { cleanup(); reject(new Error('Could not read a video frame.')) }
    const cleanup = () => {
      window.clearTimeout(timer)
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', onError)
    }
    video.addEventListener('seeked', onSeeked)
    video.addEventListener('error', onError)
    video.currentTime = time
  })
  if ('requestVideoFrameCallback' in video) {
    await Promise.race([
      new Promise<void>(resolve => video.requestVideoFrameCallback(() => resolve())),
      new Promise<void>(resolve => window.setTimeout(resolve, 120)),
    ])
  }
}

export async function captureVideoFrames(file: File, details: VideoDetails, onProgress: (done: number) => void): Promise<HTMLCanvasElement[]> {
  const { video, url } = await openVideo(file)
  const frames: HTMLCanvasElement[] = []
  // The renderer samples at most 120 columns; 360px keeps three source pixels per cell.
  const scale = Math.min(1, 360 / Math.max(video.videoWidth, video.videoHeight))
  const width = Math.max(1, Math.round(video.videoWidth * scale))
  const height = Math.max(1, Math.round(video.videoHeight * scale))
  try {
    for (let i = 0; i < details.importFrames; i++) {
      await seek(video, Math.min(i / details.fps, Math.max(0, video.duration - 0.001)))
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Could not create a canvas for video import.')
      context.drawImage(video, 0, 0, width, height)
      frames.push(canvas)
      onProgress(i + 1)
      if (i % 5 === 4) await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    }
    return frames
  } finally {
    closeVideo(video, url)
  }
}
