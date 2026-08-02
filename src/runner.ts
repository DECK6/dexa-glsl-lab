import { categoryById } from './catalog'
import type { InputFixture, RuntimeTier } from './catalog'
import { DEXA_PALETTE } from './palette'
import type { ShaderEntry } from './registry'
import { buildFragmentSource, thumbnailFrameCount } from './runtime-contract'
import type { RenderStage } from './runtime-contract'

declare global {
  interface Window {
    /** set once the active shader has produced its first deterministic or live frame */
    __SHADER_READY__?: boolean
  }
}

export interface MountOptions {
  seed: number
  /** logical canvas edge in px — always 1:1. CSS scales it to the slot. */
  size: number
  /** deterministic still: render the tier-specific capture sequence, then stop */
  thumb?: boolean
  /** inferred from the catalog for normal mounts; exposed for the editor harness */
  runtime?: RuntimeTier
  input?: InputFixture
}

export interface CompileError {
  /** 1-based line in the author-visible .frag source */
  line: number
  message: string
}

export type CompileResult = { ok: true } | { ok: false; errors: CompileError[] }

export interface ShaderHandle {
  destroy: () => void
  /** atomically swap every required program; failure keeps the previous bundle alive */
  recompile: (body: string) => CompileResult
  setSeed: (seed: number) => void
}

export const THUMB_TIME = 3
export const THUMB_FRAME = 90

const INPUT_SIZE = 256

const VERT = `#version 300 es
void main() {
  vec2 v = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(v * 2.0 - 1.0, 0.0, 1.0);
}
`

interface UniformMap {
  resolution: WebGLUniformLocation | null
  time: WebGLUniformLocation | null
  timeDelta: WebGLUniformLocation | null
  mouse: WebGLUniformLocation | null
  frame: WebGLUniformLocation | null
  seed: WebGLUniformLocation | null
  bg: WebGLUniformLocation | null
  ink: WebGLUniformLocation | null
  signal: WebGLUniformLocation | null
  accent: WebGLUniformLocation | null
  paper: WebGLUniformLocation | null
  dim: WebGLUniformLocation | null
  channel0: WebGLUniformLocation | null
  channel1: WebGLUniformLocation | null
  channelResolution: WebGLUniformLocation | null
}

interface ProgramState {
  program: WebGLProgram
  uniforms: UniformMap
}

type ProgramCompile =
  | { ok: true; state: ProgramState }
  | { ok: false; errors: CompileError[] }

interface TextureBinding {
  texture: WebGLTexture
  width: number
  height: number
}

function hexToVec3(hex: string): [number, number, number] {
  const value = parseInt(hex.slice(1), 16)
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255]
}

function parseErrors(log: string): CompileError[] {
  const errors: CompileError[] = []
  for (const line of log.split('\n')) {
    const match = line.match(/ERROR:\s*\d+:(\d+):\s*(.*)/)
    if (match) errors.push({ line: Math.max(1, Number(match[1])), message: match[2]!.trim() })
  }
  if (!errors.length && log.trim()) errors.push({ line: 1, message: log.trim() })
  return errors
}

function fixturePixels(kind: InputFixture, channel: number): Uint8Array {
  const pixels = new Uint8Array(INPUT_SIZE * INPUT_SIZE * 4)
  for (let y = 0; y < INPUT_SIZE; y++) {
    for (let x = 0; x < INPUT_SIZE; x++) {
      const u = (x + 0.5) / INPUT_SIZE
      const v = (y + 0.5) / INPUT_SIZE
      const px = u * 2 - 1
      const py = v * 2 - 1
      const offset = (y * INPUT_SIZE + x) * 4
      let r = 0
      let g = 0
      let b = 0

      if (kind === 'image') {
        const checker = (Math.floor(u * 8) + Math.floor(v * 8)) % 2
        const disk = Math.hypot(px + 0.28, py - 0.12) < 0.28 ? 1 : 0
        const diagonal = Math.abs(py - 0.55 * px) < 0.045 ? 1 : 0
        r = 28 + 82 * checker + 120 * disk
        g = 42 + 90 * (1 - checker) + 90 * diagonal
        b = 58 + 145 * diagonal + 55 * disk
      } else if (kind === 'camera') {
        const bars = Math.floor(u * 7)
        const colors = [
          [235, 228, 208], [231, 189, 54], [72, 205, 208], [82, 184, 78],
          [202, 74, 188], [221, 66, 55], [62, 84, 210],
        ]
        const color = colors[Math.min(colors.length - 1, bars)]!
        const chart = v > 0.22 ? 1 : 0.35 + 0.65 * Number((Math.floor(u * 12) % 2) === 0)
        r = color[0]! * chart
        g = color[1]! * chart
        b = color[2]! * chart
      } else if (kind === 'composite') {
        if (channel === 0) {
          const rings = 0.5 + 0.5 * Math.cos(38 * Math.hypot(px + 0.18, py) - 2.4)
          r = 24 + 220 * rings
          g = 35 + 110 * (1 - rings)
          b = 50 + 160 * u
        } else {
          const mask = Math.max(0, Math.min(1, 1 - 1.8 * Math.hypot(px - 0.22, py + 0.08)))
          const stripes = 0.55 + 0.45 * Math.sin(48 * (u + v))
          r = g = b = 255 * mask * stripes
        }
      } else if (kind === 'environment') {
        const horizon = Math.max(0, Math.min(1, 0.5 + py * 1.7))
        const sun = Math.exp(-55 * ((u - 0.72) ** 2 + (v - 0.66) ** 2))
        const ground = Math.max(0, -py)
        r = 20 + 90 * horizon + 145 * sun + 35 * ground
        g = 28 + 125 * horizon + 112 * sun + 22 * ground
        b = 42 + 180 * horizon + 62 * sun
      } else {
        const band = Math.exp(-8 * u) * (0.55 + 0.45 * Math.sin(74 * u) ** 2)
        const wave = 0.5 + 0.28 * Math.sin(35 * u) + 0.16 * Math.sin(91 * u + 0.7)
        const trace = Math.exp(-900 * (v - wave) ** 2)
        r = 255 * band
        g = 255 * trace
        b = 255 * (0.25 + 0.75 * Math.sin(12 * u) ** 2) * band
      }

      pixels[offset] = Math.max(0, Math.min(255, Math.round(r)))
      pixels[offset + 1] = Math.max(0, Math.min(255, Math.round(g)))
      pixels[offset + 2] = Math.max(0, Math.min(255, Math.round(b)))
      pixels[offset + 3] = 255
    }
  }
  return pixels
}

export async function mountShader(
  container: HTMLElement,
  entry: ShaderEntry,
  options: MountOptions,
): Promise<ShaderHandle> {
  const body = await entry.source()
  const category = categoryById(entry.meta.category)
  return mountShaderSource(container, body, {
    ...options,
    runtime: category?.runtime ?? 'core',
    input: category?.input,
  })
}

export function mountShaderSource(
  container: HTMLElement,
  body: string,
  options: MountOptions,
): ShaderHandle {
  const runtime = options.runtime ?? 'core'
  const inputKind = options.input ?? 'image'
  const canvas = document.createElement('canvas')
  canvas.width = options.size
  canvas.height = options.size
  const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false })
  if (!gl) throw new Error('WebGL2 not available')

  const vert = gl.createShader(gl.VERTEX_SHADER)!
  gl.shaderSource(vert, VERT)
  gl.compileShader(vert)
  if (!gl.getShaderParameter(vert, gl.COMPILE_STATUS)) {
    throw new Error(`vertex compile failed — ${gl.getShaderInfoLog(vert) ?? 'unknown error'}`)
  }

  function uniformsFor(program: WebGLProgram): UniformMap {
    return {
      resolution: gl!.getUniformLocation(program, 'iResolution'),
      time: gl!.getUniformLocation(program, 'iTime'),
      timeDelta: gl!.getUniformLocation(program, 'iTimeDelta'),
      mouse: gl!.getUniformLocation(program, 'iMouse'),
      frame: gl!.getUniformLocation(program, 'iFrame'),
      seed: gl!.getUniformLocation(program, 'uSeed'),
      bg: gl!.getUniformLocation(program, 'uColBg'),
      ink: gl!.getUniformLocation(program, 'uColInk'),
      signal: gl!.getUniformLocation(program, 'uColSignal'),
      accent: gl!.getUniformLocation(program, 'uColAccent'),
      paper: gl!.getUniformLocation(program, 'uColPaper'),
      dim: gl!.getUniformLocation(program, 'uColDim'),
      channel0: gl!.getUniformLocation(program, 'iChannel0'),
      channel1: gl!.getUniformLocation(program, 'iChannel1'),
      channelResolution: gl!.getUniformLocation(program, 'iChannelResolution[0]'),
    }
  }

  function compileProgram(nextBody: string, stage: RenderStage): ProgramCompile {
    const frag = gl!.createShader(gl!.FRAGMENT_SHADER)!
    gl!.shaderSource(frag, buildFragmentSource(runtime, stage, nextBody))
    gl!.compileShader(frag)
    if (!gl!.getShaderParameter(frag, gl!.COMPILE_STATUS)) {
      const errors = parseErrors(gl!.getShaderInfoLog(frag) ?? '')
      gl!.deleteShader(frag)
      return { ok: false, errors }
    }
    const program = gl!.createProgram()!
    gl!.attachShader(program, vert)
    gl!.attachShader(program, frag)
    gl!.linkProgram(program)
    gl!.deleteShader(frag)
    if (!gl!.getProgramParameter(program, gl!.LINK_STATUS)) {
      const errors = parseErrors(gl!.getProgramInfoLog(program) ?? '')
      gl!.deleteProgram(program)
      return { ok: false, errors }
    }
    return { ok: true, state: { program, uniforms: uniformsFor(program) } }
  }

  let imageProgram: ProgramState | null = null
  let bufferProgram: ProgramState | null = null
  let seed = options.seed
  let stateRead = 0
  let stateFrame = 0

  function createTexture(
    width: number,
    height: number,
    pixels: Uint8Array | null,
    linear: boolean,
  ): TextureBinding {
    const texture = gl!.createTexture()!
    gl!.bindTexture(gl!.TEXTURE_2D, texture)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, linear ? gl!.LINEAR : gl!.NEAREST)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, linear ? gl!.LINEAR : gl!.NEAREST)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE)
    gl!.texImage2D(
      gl!.TEXTURE_2D,
      0,
      gl!.RGBA,
      width,
      height,
      0,
      gl!.RGBA,
      gl!.UNSIGNED_BYTE,
      pixels,
    )
    return { texture, width, height }
  }

  const inputTextures: TextureBinding[] = runtime === 'core'
    ? []
    : [
        createTexture(INPUT_SIZE, INPUT_SIZE, fixturePixels(inputKind, 0), true),
        createTexture(INPUT_SIZE, INPUT_SIZE, fixturePixels(inputKind, 1), true),
      ]
  const stateTextures: TextureBinding[] = runtime === 'buffer'
    ? [
        createTexture(canvas.width, canvas.height, null, false),
        createTexture(canvas.width, canvas.height, null, false),
      ]
    : []
  const framebuffer = runtime === 'buffer' ? gl.createFramebuffer() : null

  function attach(texture: TextureBinding) {
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, framebuffer)
    gl!.framebufferTexture2D(
      gl!.FRAMEBUFFER,
      gl!.COLOR_ATTACHMENT0,
      gl!.TEXTURE_2D,
      texture.texture,
      0,
    )
    if (gl!.checkFramebufferStatus(gl!.FRAMEBUFFER) !== gl!.FRAMEBUFFER_COMPLETE) {
      throw new Error('buffer framebuffer is incomplete')
    }
  }

  function resetState() {
    stateRead = 0
    stateFrame = 0
    if (!framebuffer) return
    for (const texture of stateTextures) {
      attach(texture)
      gl!.viewport(0, 0, texture.width, texture.height)
      gl!.clearColor(0, 0, 0, 1)
      gl!.clear(gl!.COLOR_BUFFER_BIT)
    }
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, null)
  }

  function compile(nextBody: string): CompileResult {
    const nextImage = compileProgram(nextBody, 'image')
    if (!nextImage.ok) return nextImage
    let nextBuffer: ProgramState | null = null
    if (runtime === 'buffer') {
      const compiled = compileProgram(nextBody, 'buffer')
      if (!compiled.ok) {
        gl!.deleteProgram(nextImage.state.program)
        return compiled
      }
      nextBuffer = compiled.state
    }
    if (imageProgram) gl!.deleteProgram(imageProgram.program)
    if (bufferProgram) gl!.deleteProgram(bufferProgram.program)
    imageProgram = nextImage.state
    bufferProgram = nextBuffer
    resetState()
    return { ok: true }
  }

  const initial = compile(body)
  if (!initial.ok) {
    for (const texture of [...inputTextures, ...stateTextures]) gl.deleteTexture(texture.texture)
    if (framebuffer) gl.deleteFramebuffer(framebuffer)
    gl.deleteShader(vert)
    canvas.remove()
    const [first] = initial.errors
    throw new Error(`GLSL compile failed — line ${first?.line}: ${first?.message}`)
  }
  container.appendChild(canvas)

  const mouse = { x: 0, y: 0, cx: 0, cy: 0 }
  const onMove = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * canvas.width
    mouse.y = (1 - (event.clientY - rect.top) / rect.height) * canvas.height
  }
  const onDown = (event: PointerEvent) => {
    onMove(event)
    mouse.cx = mouse.x
    mouse.cy = mouse.y
  }
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerdown', onDown)

  function bindTexture(unit: number, binding: TextureBinding | undefined) {
    gl!.activeTexture(gl!.TEXTURE0 + unit)
    gl!.bindTexture(gl!.TEXTURE_2D, binding?.texture ?? null)
  }

  function draw(
    state: ProgramState,
    target: TextureBinding | null,
    channel0: TextureBinding | undefined,
    channel1: TextureBinding | undefined,
    time: number,
    delta: number,
    frame: number,
  ) {
    if (target) attach(target)
    else gl!.bindFramebuffer(gl!.FRAMEBUFFER, null)
    gl!.viewport(0, 0, target?.width ?? canvas.width, target?.height ?? canvas.height)
    gl!.useProgram(state.program)
    bindTexture(0, channel0)
    bindTexture(1, channel1)
    const uniforms = state.uniforms
    gl!.uniform3f(uniforms.resolution, canvas.width, canvas.height, 1)
    gl!.uniform1f(uniforms.time, time)
    gl!.uniform1f(uniforms.timeDelta, delta)
    gl!.uniform4f(uniforms.mouse, mouse.x, mouse.y, mouse.cx, mouse.cy)
    gl!.uniform1i(uniforms.frame, frame)
    gl!.uniform1f(uniforms.seed, seed)
    gl!.uniform3fv(uniforms.bg, hexToVec3(DEXA_PALETTE.bg))
    gl!.uniform3fv(uniforms.ink, hexToVec3(DEXA_PALETTE.ink))
    gl!.uniform3fv(uniforms.signal, hexToVec3(DEXA_PALETTE.signal))
    gl!.uniform3fv(uniforms.accent, hexToVec3(DEXA_PALETTE.accent))
    gl!.uniform3fv(uniforms.paper, hexToVec3(DEXA_PALETTE.paper))
    gl!.uniform3fv(uniforms.dim, hexToVec3(DEXA_PALETTE.dim))
    gl!.uniform1i(uniforms.channel0, 0)
    gl!.uniform1i(uniforms.channel1, 1)
    gl!.uniform3fv(
      uniforms.channelResolution,
      new Float32Array([
        channel0?.width ?? 0, channel0?.height ?? 0, 1,
        channel1?.width ?? 0, channel1?.height ?? 0, 1,
      ]),
    )
    gl!.drawArrays(gl!.TRIANGLES, 0, 3)
  }

  function render(time: number, frame: number, delta: number) {
    if (!imageProgram) return
    if (runtime === 'buffer' && bufferProgram) {
      const writeIndex = stateRead === 0 ? 1 : 0
      const previous = stateTextures[stateRead]!
      const next = stateTextures[writeIndex]!
      draw(bufferProgram, next, previous, inputTextures[1], time, delta, stateFrame)
      stateRead = writeIndex
      stateFrame++
      draw(imageProgram, null, stateTextures[stateRead], inputTextures[1], time, delta, stateFrame)
      return
    }
    draw(imageProgram, null, inputTextures[0], inputTextures[1], time, delta, frame)
  }

  function renderThumbnail() {
    resetState()
    const frames = thumbnailFrameCount(runtime)
    for (let index = 0; index < frames; index++) {
      const time = runtime === 'buffer' ? ((index + 1) / frames) * THUMB_TIME : THUMB_TIME
      const frame = runtime === 'buffer' ? index : THUMB_FRAME
      render(time, frame, THUMB_TIME / frames)
    }
  }

  let raf = 0
  let destroyed = false

  if (options.thumb) {
    renderThumbnail()
    window.__SHADER_READY__ = true
  } else {
    const start = performance.now()
    let previous = start
    let frame = 0
    const loop = (now: number) => {
      if (destroyed) return
      const delta = Math.min(0.05, Math.max(1 / 240, (now - previous) / 1000))
      previous = now
      render((now - start) / 1000, frame++, delta)
      if (frame === 1) window.__SHADER_READY__ = true
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
  }

  return {
    destroy() {
      destroyed = true
      cancelAnimationFrame(raf)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerdown', onDown)
      if (imageProgram) gl.deleteProgram(imageProgram.program)
      if (bufferProgram) gl.deleteProgram(bufferProgram.program)
      for (const texture of [...inputTextures, ...stateTextures]) gl.deleteTexture(texture.texture)
      if (framebuffer) gl.deleteFramebuffer(framebuffer)
      gl.deleteShader(vert)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      canvas.remove()
    },
    recompile(nextBody: string): CompileResult {
      if (destroyed) return { ok: true }
      const result = compile(nextBody)
      if (result.ok && options.thumb) renderThumbnail()
      return result
    },
    setSeed(nextSeed: number) {
      seed = nextSeed
      resetState()
      if (options.thumb) renderThumbnail()
    },
  }
}
