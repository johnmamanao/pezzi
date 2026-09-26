export type Aspect = 'wide' | 'square' | 'classic' | 'portrait'
export type ShapeStyle = 'playful' | 'rounded' | 'graphic'
export const MAX_GRID_DENSITY = 120
export const shapeNames = ['Boxes', 'Spheres', 'Triangles', 'Rings', 'Wedges', 'Spots', 'Quads', 'Checks', 'Clovers', 'Dots', 'Xs', 'Arcs', 'Stars', 'Blooms', 'Flowers', 'Blossoms', 'Moons', 'Steps', 'Chevrons', 'Gates', 'Waves', 'Arches', 'Tiles', 'Scallops'] as const
export type MosaicConfig = {
  shapes: number[]; shapeMix: number; ringThickness: number; fillAmount: number
  scaleBlend: number; distribution: number; maxHeight: number; maxWidth: number
  randomHeight: boolean; randomWidth: boolean; gap: number
  colors: string[]; colorWeights: number[]; background: string; transparent: boolean
  grid: boolean; gridColor: string; gridOpacity: number; gridStroke: number; gridDensity: number; gridRandomness: number; gridBlend: GlobalCompositeOperation
  crosses: boolean; crossColor: string; crossOpacity: number; crossSize: number; crossStroke: number; crossDensity: number; crossRandomness: number; crossBlend: GlobalCompositeOperation
  dataFields: boolean; dataType: 'grid' | 'serial' | 'random'; dataRate: number; dataSize: number; dataColor: string; dataBlend: GlobalCompositeOperation
  blur: number; blurDensity: number; blurRandomness: number; textureOpacity: number; textureBlend: GlobalCompositeOperation; brightness: number; saturation: number
  hue: number; contrast: number; grain: number; cornerRadius: number
  wireframe: boolean; invert: boolean
}

export const defaultConfig: MosaicConfig = {
  shapes: [0, 1, 2, 3, 4, 5, 6, 7], shapeMix: 70, ringThickness: 50,
  fillAmount: 90, scaleBlend: 3, distribution: 50, maxHeight: 100, maxWidth: 100,
  randomHeight: false, randomWidth: false, gap: 4, colors: [], colorWeights: [],
  background: '', transparent: false, grid: false, gridColor: '#ffffff', gridOpacity: 50,
  gridStroke: 1, gridDensity: 1, gridRandomness: 0, gridBlend: 'source-over',
  crosses: false, crossColor: '#ffffff', crossOpacity: 70, crossSize: 18, crossStroke: 1,
  crossDensity: 1, crossRandomness: 0, crossBlend: 'source-over',
  dataFields: false, dataType: 'grid', dataRate: 1, dataSize: 3, dataColor: '#ffffff', dataBlend: 'source-over',
  blur: 0, blurDensity: 6, blurRandomness: 0, textureOpacity: 35, textureBlend: 'multiply', brightness: 0, saturation: 0,
  hue: 0, contrast: 0, grain: 0, cornerRadius: 18, wireframe: false, invert: false,
}

export type MosaicFrame = {
  id: string
  seed: number
  palette: number
  density: number
  shapeStyle: ShapeStyle
  source?: HTMLCanvasElement
  backgroundImage?: HTMLImageElement
  textureImage?: HTMLImageElement
  customShape?: HTMLImageElement
  config?: MosaicConfig
}

export const palettes = [
  { name: 'Daydream', background: '#26243c', colors: ['#c5f277', '#ff8976', '#b5a5ff', '#f5e9d1', '#7ccaff'] },
  { name: 'Sorbet', background: '#f7eadd', colors: ['#393069', '#fa6e78', '#ffbc67', '#a571ed', '#f071b8'] },
  { name: 'Garden', background: '#183d37', colors: ['#d1e8a1', '#f6ad7f', '#83c6ad', '#f8e9cc', '#96b6f9'] },
  { name: 'Night swim', background: '#101e38', colors: ['#66cdd6', '#eae8e1', '#fa8d74', '#a9a2f2', '#bbec77'] },
] as const

export const aspectSizes: Record<Aspect, [number, number]> = {
  wide: [1200, 675],
  square: [1000, 1000],
  classic: [900, 1200],
  portrait: [675, 1200],
}

export function newFrame(overrides: Partial<MosaicFrame> = {}): MosaicFrame {
  return {
    seed: Math.floor(Math.random() * 1_000_000),
    palette: 0,
    density: 18,
    shapeStyle: 'playful',
    ...overrides,
    id: crypto.randomUUID(),
  }
}

function randomFrom(seed: number) {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radius: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, radius)
  ctx.fill()
}

function tileShape(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, kind: number, style: ShapeStyle, bg: string, ringThickness = 50, cornerRadius = 18) {
  const size = Math.min(w, h)
  const inset = style === 'graphic' ? 0 : size * 0.035
  x += inset
  y += inset
  w -= inset * 2
  h -= inset * 2
  const cx = x + w / 2
  const cy = y + h / 2
  const cutout = (draw: () => void) => { ctx.save(); if (bg === 'transparent') ctx.globalCompositeOperation = 'destination-out'; else ctx.fillStyle = bg; draw(); ctx.restore() }
  if (style === 'rounded') {
    if (kind === 0) {
      roundedRect(ctx, x, y, w, h, Math.min(w, h) * Math.max(.38, cornerRadius / 100))
      return
    }
    if (kind === 2) {
      ctx.beginPath()
      ctx.moveTo(x + w * .13, y + h * .78)
      ctx.quadraticCurveTo(x - w * .03, y + h, x + w * .25, y + h)
      ctx.lineTo(x + w * .79, y + h)
      ctx.quadraticCurveTo(x + w, y + h, x + w, y + h * .78)
      ctx.lineTo(x + w, y + h * .23)
      ctx.quadraticCurveTo(x + w, y - h * .03, x + w * .78, y + h * .18)
      ctx.closePath(); ctx.fill()
      return
    }
    if (kind === 4) {
      ctx.beginPath(); ctx.ellipse(cx, cy, w * .49, h * .49, -.45, 0, Math.PI * 2); ctx.fill()
      return
    }
    if (kind === 6 || kind === 7) {
      const positions = kind === 6 ? [[.25, .25], [.75, .25], [.25, .75], [.75, .75]] : [[.25, .25], [.75, .75]]
      for (const [px, py] of positions) { ctx.beginPath(); ctx.arc(x + w * px, y + h * py, Math.min(w, h) * .225, 0, Math.PI * 2); ctx.fill() }
      return
    }
  }
  if (kind === 0) {
    roundedRect(ctx, x, y, w, h, style === 'graphic' ? 1 : size * cornerRadius / 100)
  } else if (kind === 1) {
    ctx.beginPath()
    ctx.arc(cx, cy, Math.min(w, h) / 2, 0, Math.PI * 2)
    ctx.fill()
  } else if (kind === 3) {
    ctx.beginPath()
    ctx.arc(cx, cy, Math.min(w, h) / 2, 0, Math.PI * 2)
    ctx.fill()
    cutout(() => { ctx.beginPath(); ctx.arc(cx, cy, Math.min(w, h) * (0.48 - ringThickness * .0045), 0, Math.PI * 2); ctx.fill() })
  } else if (kind === 2) {
    ctx.beginPath()
    ctx.moveTo(x, y + h)
    ctx.lineTo(x + w, y + h)
    ctx.lineTo(x + w, y)
    ctx.closePath()
    ctx.fill()
  } else if (kind === 4) {
    ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, size, 0, Math.PI / 2); ctx.closePath(); ctx.fill()
  } else if (kind === 5) {
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) { ctx.beginPath(); ctx.arc(x + w * (a + .5) / 3, y + h * (b + .5) / 3, size * .09, 0, Math.PI * 2); ctx.fill() }
  } else if (kind === 6) {
    for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) roundedRect(ctx, x + a * w * .52, y + b * h * .52, w * .46, h * .46, size * .08)
  } else if (kind === 7) {
    roundedRect(ctx, x, y, w * .49, h * .49, size * .06); roundedRect(ctx, x + w * .51, y + h * .51, w * .49, h * .49, size * .06)
  } else if (kind === 8 || kind === 14 || kind === 15) {
    for (let n = 0; n < (kind === 8 ? 4 : kind === 14 ? 5 : 6); n++) {
      const angle = n * Math.PI * 2 / (kind === 8 ? 4 : kind === 14 ? 5 : 6)
      ctx.beginPath(); ctx.ellipse(cx + Math.cos(angle) * size * .22, cy + Math.sin(angle) * size * .22, size * .22, size * .15, angle, 0, Math.PI * 2); ctx.fill()
    }
  } else if (kind === 9) {
    for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) { ctx.beginPath(); ctx.arc(x + w * (a + .5) / 2, y + h * (b + .5) / 2, size * .13, 0, Math.PI * 2); ctx.fill() }
  } else if (kind === 10) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.PI / 4); roundedRect(ctx, -size * .12, -size * .49, size * .24, size * .98, size * .08); roundedRect(ctx, -size * .49, -size * .12, size * .98, size * .24, size * .08); ctx.restore()
  } else if (kind === 11 || kind === 19 || kind === 23) {
    ctx.beginPath(); ctx.arc(cx, cy, size * .48, 0, Math.PI, true); ctx.lineTo(x, y + h); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill()
    if (kind === 11 || kind === 19) cutout(() => { ctx.beginPath(); ctx.arc(cx, cy, size * .24, 0, Math.PI, true); ctx.fill() })
  } else if (kind === 12 || kind === 13) {
    const points = kind === 12 ? 5 : 8
    ctx.beginPath()
    for (let n = 0; n < points * 2; n++) { const a = -Math.PI / 2 + n * Math.PI / points; const r = size * (n % 2 ? .22 : .49); const px = cx + Math.cos(a) * r; const py = cy + Math.sin(a) * r; if (!n) ctx.moveTo(px, py); else ctx.lineTo(px, py) }
    ctx.closePath(); ctx.fill()
  } else if (kind === 16) {
    ctx.beginPath(); ctx.arc(cx, cy, size * .47, 0, Math.PI * 2); ctx.fill(); cutout(() => { ctx.beginPath(); ctx.arc(cx + size * .22, cy - size * .14, size * .42, 0, Math.PI * 2); ctx.fill() })
  } else if (kind === 17) {
    roundedRect(ctx, x, y, w * .48, h * .45, size * .06); roundedRect(ctx, x + w * .52, y + h * .5, w * .48, h * .5, size * .06)
  } else if (kind === 18) {
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(cx, cy); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + h * .38); ctx.lineTo(cx, y + h * .85); ctx.lineTo(x, y + h * .38); ctx.closePath(); ctx.fill()
  } else if (kind === 20) {
    ctx.beginPath(); ctx.moveTo(x, cy); ctx.bezierCurveTo(x + w * .25, y - h * .15, x + w * .3, y + h * 1.15, cx, cy); ctx.bezierCurveTo(x + w * .75, y - h * .15, x + w * .8, y + h * 1.15, x + w, cy); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.closePath(); ctx.fill()
  } else if (kind === 21) {
    ctx.beginPath(); ctx.arc(cx, y + h, size * .48, Math.PI, Math.PI * 2); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.closePath(); ctx.fill()
  } else {
    for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) roundedRect(ctx, x + a * w * .52, y + b * h * .52, w * .46, h * .46, size * .08)
  }
}

const sampledColorCache = new WeakMap<HTMLImageElement | HTMLCanvasElement, Map<string, Uint8ClampedArray>>()

function sampleImageColors(image: HTMLImageElement | HTMLCanvasElement, cols: number, rows: number): Uint8ClampedArray {
  const key = `${cols}x${rows}`
  const cached = sampledColorCache.get(image)?.get(key)
  if (cached) return cached
  const sample = document.createElement('canvas')
  sample.width = cols
  sample.height = rows
  const context = sample.getContext('2d', { willReadFrequently: true })!
  const scale = Math.max(cols / image.width, rows / image.height)
  const width = image.width * scale
  const height = image.height * scale
  context.drawImage(image, (cols - width) / 2, (rows - height) / 2, width, height)
  const colors = context.getImageData(0, 0, cols, rows).data
  let sizes = sampledColorCache.get(image)
  if (!sizes) { sizes = new Map(); sampledColorCache.set(image, sizes) }
  sizes.set(key, colors)
  return colors
}

export function drawMosaic(
  canvas: HTMLCanvasElement,
  frame: MosaicFrame,
  aspect: Aspect,
  image?: HTMLImageElement | null,
  outputSize?: [number, number],
) {
  const [width, height] = outputSize ?? aspectSizes[aspect]
  if (canvas.width !== width) canvas.width = width
  if (canvas.height !== height) canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const palette = palettes[frame.palette] ?? palettes[0]
  const config = { ...defaultConfig, ...frame.config }
  const background = config.background || palette.background
  ctx.clearRect(0, 0, width, height)
  if (!config.transparent) { ctx.fillStyle = background; ctx.fillRect(0, 0, width, height) }
  if (!config.transparent && frame.backgroundImage?.complete && frame.backgroundImage.naturalWidth) {
    const img = frame.backgroundImage
    const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight)
    const w = img.naturalWidth * scale, h = img.naturalHeight * scale
    ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h)
  }
  const cols = Math.max(6, Math.min(MAX_GRID_DENSITY, Math.round(frame.density)))
  const rows = Math.round(cols * height / width)
  const tileW = width / cols
  const tileH = height / rows
  const rng = randomFrom(frame.seed)
  const source = frame.source ?? image
  const sampled = source && (source instanceof HTMLCanvasElement || (source.complete && source.naturalWidth)) ? sampleImageColors(source, cols, rows) : null
  const colors = config.colors.length ? config.colors : [...palette.colors]
  const weights = colors.map((_, at) => config.colorWeights[at] ?? 100)
  const weightTotal = weights.reduce((sum, weight) => sum + Math.max(0, weight), 0)
  const pickColor = (random = rng) => { let value = random() * weightTotal; for (let at = 0; at < weights.length; at++) { value -= Math.max(0, weights[at]); if (value <= 0) return colors[at] } return colors[0] }
  const shapes = config.shapes.length ? config.shapes : [0]
  const customCache = new Map<string, HTMLCanvasElement>()
  const customScratch = document.createElement('canvas'); customScratch.width = 96; customScratch.height = 96
  const customTile = (color: string) => {
    if (!frame.customShape?.complete || !frame.customShape.naturalWidth) return undefined
    if (customCache.has(color)) return customCache.get(color)
    const tile = customCache.size < 32 ? document.createElement('canvas') : customScratch; tile.width = 96; tile.height = 96
    const tileContext = tile.getContext('2d')!
    tileContext.drawImage(frame.customShape, 0, 0, 96, 96)
    tileContext.globalCompositeOperation = 'source-in'; tileContext.fillStyle = color; tileContext.fillRect(0, 0, 96, 96)
    if (customCache.size < 32) customCache.set(color, tile)
    return tile
  }
  const tileRandom = rng

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const sampleAt = (row * cols + col) * 4
      const positionBias = ((col / Math.max(1, cols - 1)) - .5) * (config.distribution - 50) / 100
      const omit = tileRandom() > Math.min(1, Math.max(0, config.fillAmount / 100 + positionBias))
      const kind = tileRandom() * 100 > config.shapeMix ? 0 : shapes[Math.floor(tileRandom() * shapes.length)]
      if (omit || (sampled && sampled[sampleAt + 3] < 48)) continue
      let color: string = pickColor(tileRandom)
      if (sampled) color = `rgb(${sampled[sampleAt]} ${sampled[sampleAt + 1]} ${sampled[sampleAt + 2]})`
      const scaleRange = config.scaleBlend / 6 * .35
      const scale = 1 - tileRandom() * scaleRange
      const heightScale = (config.randomHeight ? .35 + tileRandom() * .65 : 1) * config.maxHeight / 100 * scale
      const widthScale = (config.randomWidth ? .35 + tileRandom() * .65 : 1) * config.maxWidth / 100 * scale
      const gap = Math.min(tileW, tileH) * config.gap / 200
      const styleScale = frame.shapeStyle === 'rounded' ? .82 : 1
      const w = Math.max(1, (tileW - gap * 2) * widthScale * styleScale)
      const h = Math.max(1, (tileH - gap * 2) * heightScale * styleScale)
      const x = col * tileW + (tileW - w) / 2
      const y = row * tileH + (tileH - h) / 2
      ctx.fillStyle = color
      if (config.wireframe && scale < .88) { ctx.strokeStyle = color; ctx.lineWidth = Math.max(1, Math.min(tileW, tileH) * .05); ctx.strokeRect(x, y, w, h) }
      else if (kind === 24 && frame.customShape) { const tile = customTile(color); if (tile) ctx.drawImage(tile, x, y, w, h) }
      else tileShape(ctx, x, y, w, h, kind, frame.shapeStyle, config.transparent ? 'transparent' : background, config.ringThickness, config.cornerRadius)
    }
  }
  if (config.grid) {
    const jitter = randomFrom(frame.seed + 4901)
    const offset = Math.min(tileW, tileH) * config.gridRandomness / 250
    ctx.save(); ctx.globalAlpha = config.gridOpacity / 100; ctx.globalCompositeOperation = config.gridBlend; ctx.strokeStyle = config.gridColor; ctx.lineWidth = config.gridStroke
    for (let col = 0; col <= cols; col += config.gridDensity) { ctx.beginPath(); ctx.moveTo(col * tileW, 0); for (let row = 1; row < rows; row++) ctx.lineTo(col * tileW + (jitter() - .5) * offset, row * tileH); ctx.lineTo(col * tileW, height); ctx.stroke() }
    for (let row = 0; row <= rows; row += config.gridDensity) { ctx.beginPath(); ctx.moveTo(0, row * tileH); for (let col = 1; col < cols; col++) ctx.lineTo(col * tileW, row * tileH + (jitter() - .5) * offset); ctx.lineTo(width, row * tileH); ctx.stroke() }
    ctx.restore()
  }
  if (config.crosses) {
    const crossRandom = randomFrom(frame.seed + 2480)
    ctx.save(); ctx.globalAlpha = config.crossOpacity / 100; ctx.globalCompositeOperation = config.crossBlend; ctx.strokeStyle = config.crossColor; ctx.lineWidth = Math.max(1, config.crossStroke)
    const arm = Math.min(tileW, tileH) * config.crossSize / 100
    for (let row = 1; row < rows; row += config.crossDensity) for (let col = 1; col < cols; col += config.crossDensity) { if (crossRandom() * 100 < config.crossRandomness) continue; const x = col * tileW, y = row * tileH; ctx.beginPath(); ctx.moveTo(x - arm, y); ctx.lineTo(x + arm, y); ctx.moveTo(x, y - arm); ctx.lineTo(x, y + arm); ctx.stroke() }
    ctx.restore()
  }
  if (config.dataFields) {
    const dataRandom = randomFrom(frame.seed + 904)
    const stride = Math.max(1, 6 - config.dataRate)
    ctx.save(); ctx.fillStyle = config.dataColor; ctx.globalAlpha = .72; ctx.globalCompositeOperation = config.dataBlend; ctx.font = `${Math.max(10, Math.round(tileH * config.dataSize / 15))}px monospace`
    for (let row = 0; row < rows; row += stride) for (let col = 0; col < cols; col += stride) { const label = config.dataType === 'serial' ? String(row * cols + col).padStart(3, '0') : config.dataType === 'random' ? String(Math.floor(dataRandom() * 1000)).padStart(3, '0') : `${String(col).padStart(2, '0')}:${String(row).padStart(2, '0')}`; ctx.fillText(label, col * tileW + 3, row * tileH + Math.max(14, tileH * .2)) }
    ctx.restore()
  }
  if (frame.textureImage?.complete && frame.textureImage.naturalWidth) {
    ctx.save(); ctx.globalAlpha = config.textureOpacity / 100; ctx.globalCompositeOperation = config.textureBlend
    ctx.drawImage(frame.textureImage, 0, 0, width, height); ctx.restore()
  }
  if (config.blur || config.brightness || config.saturation || config.hue || config.contrast || config.invert) {
    const copy = document.createElement('canvas'); copy.width = width; copy.height = height; copy.getContext('2d')?.drawImage(canvas, 0, 0)
    ctx.clearRect(0, 0, width, height)
    ctx.filter = `blur(${config.blur * config.blurDensity / 72}px) brightness(${100 + config.brightness}%) saturate(${100 + config.saturation}%) hue-rotate(${config.hue}deg) contrast(${100 + config.contrast}%) invert(${config.invert ? 100 : 0}%)`
    ctx.drawImage(copy, 0, 0); ctx.filter = 'none'
    if (config.blurRandomness) { const patchRandom = randomFrom(frame.seed + 440); ctx.save(); ctx.globalAlpha = config.blurRandomness / 100; for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) if (patchRandom() > .5) ctx.drawImage(copy, col * tileW, row * tileH, tileW, tileH, col * tileW, row * tileH, tileW, tileH); ctx.restore() }
  }
  if (config.grain) {
    const grain = randomFrom(frame.seed + 845)
    ctx.save(); ctx.globalAlpha = config.grain / 400; ctx.fillStyle = '#ffffff'
    for (let n = 0; n < width * height / 250; n++) ctx.fillRect(grain() * width, grain() * height, 1 + grain() * 2, 1 + grain() * 2)
    ctx.restore()
  }
}
