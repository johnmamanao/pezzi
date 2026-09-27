'use client'

import { useEffect, useRef } from 'react'
import { defaultConfig, palettes, shapeNames, tileShape } from './mosaic'
import { galleryShapes } from './galleryShapes'
import type { MosaicConfig, MosaicFrame } from './mosaic'

function ShapePreview({ kind, frame }: { kind: number; frame: MosaicFrame }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const ring = frame.config?.ringThickness ?? defaultConfig.ringThickness
  const radius = frame.config?.cornerRadius ?? defaultConfig.cornerRadius
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, 64, 64)
    ctx.fillStyle = '#c6b9ff'
    tileShape(ctx, 3, 3, 58, 58, kind, frame.shapeStyle, 'transparent', ring, radius)
  }, [kind, frame.shapeStyle, ring, radius])
  return <canvas ref={ref} width={64} height={64} className="shape-symbol" aria-hidden="true" />
}

function Slider({ label, value, min = 0, max = 100, step = 1, hint, disabled, onChange }: { label: string; value: number; min?: number; max?: number; step?: number; hint?: string; disabled?: boolean; onChange: (value: number) => void }) {
  return <label className="config-slider"><span className="config-label"><span>{label}</span><strong>{value}</strong></span>{hint && <small>{hint}</small>}<input type="range" min={min} max={max} step={step} value={value} disabled={disabled} onChange={event => onChange(Number(event.target.value))} /></label>
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="config-toggle"><span><strong>{label}</strong>{hint && <small>{hint}</small>}</span><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} /></label>
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="config-color"><span>{label}</span><input type="color" value={value} onChange={event => onChange(event.target.value)} /><code>{value}</code></label>
}

const blendModes: [GlobalCompositeOperation, string][] = [['source-over', 'Normal'], ['multiply', 'Multiply'], ['screen', 'Screen'], ['overlay', 'Overlay']]
function Blend({ value, onChange }: { value: GlobalCompositeOperation; onChange: (value: GlobalCompositeOperation) => void }) {
  return <label className="config-select">Blend<select value={value} onChange={event => onChange(event.target.value as GlobalCompositeOperation)}>{blendModes.map(([mode, label]) => <option key={mode} value={mode}>{label}</option>)}</select></label>
}

export function StudioConfig({ section, frame, update, updateFrame, randomize, randomizeAll }: {
  section: 'pattern' | 'color' | 'effects'
  frame: MosaicFrame; update: (change: Partial<MosaicConfig>) => void; updateFrame: (change: Partial<MosaicFrame>) => void
  randomize: () => void; randomizeAll: () => void
}) {
  const config = { ...defaultConfig, ...frame.config }
  const palette = palettes[frame.palette]
  const colors = config.colors.length ? config.colors : [...palette.colors]
  const changeColor = (at: number, color: string) => update({ colors: colors.map((item, index) => index === at ? color : item) })
  const randomColor = () => `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`
  const shapeButton = (id: number, name: string) => <button key={id} type="button" aria-pressed={config.shapes.includes(id)} onClick={() => update({ shapes: config.shapes.includes(id) ? config.shapes.filter(item => item !== id) : [...config.shapes, id] })}><ShapePreview kind={id} frame={frame} />{name}</button>
  function loadImage(file: File | undefined, key: 'backgroundImage' | 'textureImage' | 'customShape') {
    if (!file || !file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => { updateFrame({ [key]: image }); if (key === 'customShape' && !config.shapes.includes(24)) update({ shapes: [...config.shapes, 24] }); URL.revokeObjectURL(url) }
    image.onerror = () => URL.revokeObjectURL(url)
    image.src = url
  }
  return <>
    {section === 'pattern' && <>
    <section className="tool-section config-section" aria-labelledby="layout-config"><div className="tool-heading"><h2 id="layout-config">Layout</h2><span>Compose the pattern</span></div>
      <div className="config-actions"><button type="button" onClick={randomize}>Randomize layout</button><button type="button" onClick={randomizeAll}>Surprise me</button></div>
      <div className="config-subhead"><strong>Shape library</strong><small>Choose what can appear</small></div>
      <div className="shape-list" role="group" aria-label="Enabled mosaic shapes">{galleryShapes.map(shape => shapeButton(shape.id, shape.name))}{shapeNames.slice(0, 4).map((name, at) => shapeButton(at, name))}</div>
      <button className="config-wide-action gallery-mix" type="button" onClick={() => update({ shapes: [...defaultConfig.shapes], shapeMix: 100, gap: Math.max(12, config.gap) })}>Use gallery mix</button>
      <details className="more-shapes"><summary>More shapes</summary><div className="shape-list" role="group" aria-label="Additional mosaic shapes">{shapeNames.slice(4).map((name, at) => shapeButton(at + 4, name))}</div></details>
      <label className="config-upload">{frame.customShape ? 'Replace your shape' : 'Add your own shape'}<input type="file" accept="image/png,image/svg+xml,image/webp" onChange={event => loadImage(event.target.files?.[0], 'customShape')} /></label>
      {frame.customShape && <div className="config-actions"><button type="button" onClick={() => update({ shapes: config.shapes.includes(24) ? config.shapes.filter(item => item !== 24) : [...config.shapes, 24] })}>{config.shapes.includes(24) ? 'Hide your shape' : 'Use your shape'}</button><button type="button" onClick={() => { updateFrame({ customShape: undefined }); update({ shapes: config.shapes.filter(item => item !== 24) }) }}>Remove shape</button></div>}
      <Slider label="Shape mix" hint="0 uses boxes · 100 uses your selection" value={config.shapeMix} onChange={shapeMix => update({ shapeMix })} />
      <Slider label="Ring thickness" value={config.ringThickness} disabled={!config.shapes.includes(3)} onChange={ringThickness => update({ ringThickness })} />
      <Slider label="Fill amount" value={config.fillAmount} onChange={fillAmount => update({ fillAmount })} />
      <Slider label="Scale blend" min={0} max={6} value={config.scaleBlend} onChange={scaleBlend => update({ scaleBlend })} />
      <Slider label="Distribution" hint="Left ← even → right" value={config.distribution} onChange={distribution => update({ distribution })} />
    </section>
    <section className="tool-section config-section" aria-labelledby="size-config"><div className="tool-heading"><h2 id="size-config">Size</h2><span>Give tiles breathing room</span></div>
      <Slider label="Max height" min={10} value={config.maxHeight} onChange={maxHeight => update({ maxHeight })} />
      <Toggle label="Random height" checked={config.randomHeight} onChange={randomHeight => update({ randomHeight })} />
      <Slider label="Max width" min={10} value={config.maxWidth} onChange={maxWidth => update({ maxWidth })} />
      <Toggle label="Random width" checked={config.randomWidth} onChange={randomWidth => update({ randomWidth })} />
      <Slider label="Gap" hint="Space between individual tiles" value={config.gap} onChange={gap => update({ gap })} />
    </section>
    </>}
    {section === 'color' && <>
    <section className="tool-section config-section" aria-labelledby="color-config"><div className="tool-heading"><h2 id="color-config">Custom colors</h2><span>Build your own palette</span></div>
      <div className="color-list">{colors.map((color, at) => <div className="color-item" key={at}><ColorInput label={`Color ${at + 1}`} value={color} onChange={value => changeColor(at, value)} />{colors.length > 1 && <button type="button" aria-label={`Remove color ${at + 1}`} onClick={() => update({ colors: colors.filter((_, index) => index !== at), colorWeights: config.colorWeights.filter((_, index) => index !== at) })}>×</button>}<Slider label="Amount" value={config.colorWeights[at] ?? 100} onChange={value => update({ colorWeights: colors.map((_, index) => index === at ? value : config.colorWeights[index] ?? 100) })} /></div>)}</div>
      <div className="config-actions"><button type="button" onClick={() => update({ colors: [...colors, randomColor()], colorWeights: [...colors.map((_, at) => config.colorWeights[at] ?? 100), 100] })}>Add color</button><button type="button" onClick={() => update({ colors: colors.map(randomColor) })}>Random colors</button></div>
      <button className="config-wide-action" type="button" onClick={() => navigator.clipboard.writeText(colors.join(', '))}>Copy palette</button>
    </section>
    <section className="tool-section config-section" aria-labelledby="background-config"><div className="tool-heading"><h2 id="background-config">Background</h2><span>Set the foundation</span></div>
      <ColorInput label="Canvas color" value={config.background || palette.background} onChange={background => update({ background })} />
      <Toggle label="Transparent" hint="Leave the empty spaces clear in PNG" checked={config.transparent} onChange={transparent => update({ transparent })} />
      <label className="config-upload">{frame.backgroundImage ? 'Change background image' : 'Upload background image'}<input type="file" accept="image/*" onChange={event => loadImage(event.target.files?.[0], 'backgroundImage')} /></label>
      {frame.backgroundImage && <button className="config-wide-action" type="button" onClick={() => updateFrame({ backgroundImage: undefined })}>Remove background image</button>}
    </section>
    </>}
    {section === 'effects' && <>
    <section className="tool-section config-section" aria-labelledby="overlay-config"><div className="tool-heading"><h2 id="overlay-config">Overlays</h2><span>Layer in detail</span></div>
      <Toggle label="Grid lines" checked={config.grid} onChange={grid => update({ grid })} />
      {config.grid && <div className="config-nested"><ColorInput label="Line color" value={config.gridColor} onChange={gridColor => update({ gridColor })} /><Slider label="Stroke" min={1} max={8} value={config.gridStroke} onChange={gridStroke => update({ gridStroke })} /><Slider label="Opacity" value={config.gridOpacity} onChange={gridOpacity => update({ gridOpacity })} /><Slider label="Density" min={1} max={6} value={config.gridDensity} onChange={gridDensity => update({ gridDensity })} /><Slider label="Line randomness" hint="Bend the straight grid" value={config.gridRandomness} onChange={gridRandomness => update({ gridRandomness })} /><Blend value={config.gridBlend} onChange={gridBlend => update({ gridBlend })} /></div>}
      <Toggle label="Crosses" hint="Small marks at tile intersections" checked={config.crosses} onChange={crosses => update({ crosses })} />
      {config.crosses && <div className="config-nested"><ColorInput label="Cross color" value={config.crossColor} onChange={crossColor => update({ crossColor })} /><Slider label="Density" min={1} max={6} value={config.crossDensity} onChange={crossDensity => update({ crossDensity })} /><Slider label="Stroke" min={1} max={8} value={config.crossStroke} onChange={crossStroke => update({ crossStroke })} /><Slider label="Size" min={2} max={45} value={config.crossSize} onChange={crossSize => update({ crossSize })} /><Slider label="Opacity" value={config.crossOpacity} onChange={crossOpacity => update({ crossOpacity })} /><Slider label="Cross randomness" hint="Omit some marks" value={config.crossRandomness} onChange={crossRandomness => update({ crossRandomness })} /><Blend value={config.crossBlend} onChange={crossBlend => update({ crossBlend })} /></div>}
      <Toggle label="Data fields" hint="Sparse coordinate labels" checked={config.dataFields} onChange={dataFields => update({ dataFields })} />
      {config.dataFields && <div className="config-nested"><label className="config-select">Value type<select value={config.dataType} onChange={event => update({ dataType: event.target.value as MosaicConfig['dataType'] })}><option value="grid">Grid coordinates</option><option value="serial">Serial index</option><option value="random">Random numbers</option></select></label><Slider label="Spawn rate" min={1} max={5} value={config.dataRate} onChange={dataRate => update({ dataRate })} /><Slider label="Label size" min={1} max={6} value={config.dataSize} onChange={dataSize => update({ dataSize })} /><ColorInput label="Label color" value={config.dataColor} onChange={dataColor => update({ dataColor })} /><Blend value={config.dataBlend} onChange={dataBlend => update({ dataBlend })} /></div>}
      <Slider label="Blur" hint="Softens the finished mosaic" max={100} value={config.blur} onChange={blur => update({ blur })} />
      {config.blur > 0 && <div className="config-nested"><Slider label="Grid density" min={1} max={12} value={config.blurDensity} onChange={blurDensity => update({ blurDensity })} /><Slider label="Blur randomness" value={config.blurRandomness} onChange={blurRandomness => update({ blurRandomness })} /></div>}
      <label className="config-upload">{frame.textureImage ? 'Change texture image' : 'Upload texture image'}<input type="file" accept="image/*" onChange={event => loadImage(event.target.files?.[0], 'textureImage')} /></label>
      {frame.textureImage && <><Slider label="Texture opacity" value={config.textureOpacity} onChange={textureOpacity => update({ textureOpacity })} /><Blend value={config.textureBlend} onChange={textureBlend => update({ textureBlend })} /><button className="config-wide-action" type="button" onClick={() => updateFrame({ textureImage: undefined })}>Remove texture</button></>}
    </section>
    <section className="tool-section config-section" aria-labelledby="finish-config"><div className="tool-heading"><h2 id="finish-config">Finish</h2><span>Fine tune the image</span></div>
      <Slider label="Brightness" min={-100} value={config.brightness} onChange={brightness => update({ brightness })} />
      <Slider label="Saturation" min={-100} value={config.saturation} onChange={saturation => update({ saturation })} />
      <Slider label="Hue" min={-180} max={180} value={config.hue} onChange={hue => update({ hue })} />
      <Slider label="Contrast" min={-100} value={config.contrast} onChange={contrast => update({ contrast })} />
      <Slider label="Grain" value={config.grain} onChange={grain => update({ grain })} />
      <Slider label="Corner radius" value={config.cornerRadius} onChange={cornerRadius => update({ cornerRadius })} />
      <Toggle label="Wireframe peel" hint="Outline the smallest shapes" checked={config.wireframe} onChange={wireframe => update({ wireframe })} />
      <Toggle label="Invert all" checked={config.invert} onChange={invert => update({ invert })} />
    </section>
    </>}
  </>
}
