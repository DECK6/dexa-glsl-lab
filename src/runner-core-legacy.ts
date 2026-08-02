// Preserved implementation of the original 200-work single-pass runner.
// The active tiered runner lives in runner.ts.
import { DEXA_PALETTE } from './palette'
import type { ShaderEntry } from './registry'

declare global {
  interface Window {
    /** set by the runner once the shader has produced its first (or thumb) frame */
    __SHADER_READY__?: boolean
  }
}

export interface MountOptions {
  seed: number
  /** logical canvas edge in px — always 1:1 (SPEC §2). CSS scales it to the slot. */
  size: number
  /** deterministic still: render one frame at THUMB_TIME, then stop */
  thumb?: boolean
}

export interface CompileError {
  /** 1-based line in the author-visible .frag source */
  line: number
  message: string
}

export type CompileResult = { ok: true } | { ok: false; errors: CompileError[] }

export interface ShaderHandle {
  destroy: () => void
  /** swap the fragment body; on failure the previous program keeps running */
  recompile: (body: string) => CompileResult
  setSeed: (seed: number) => void
}

/** fixed timestamp/frame used for thumbnails and deterministic stills (SPEC §5) */
export const THUMB_TIME = 3
export const THUMB_FRAME = 90

// Every .frag file is a Shadertoy-style body: helpers + mainImage(out vec4, in vec2).
// The runner owns the version/precision/uniform prelude so sources stay minimal.
const HEADER = `#version 300 es
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec4 iMouse;
uniform int iFrame;
uniform float uSeed;
uniform vec3 uColBg;
uniform vec3 uColInk;
uniform vec3 uColSignal;
uniform vec3 uColAccent;
uniform vec3 uColPaper;
uniform vec3 uColDim;
out vec4 outColor;
#line 1
`

const FOOTER = `
void main() { mainImage(outColor, gl_FragCoord.xy); }
`

const VERT = `#version 300 es
void main() {
  vec2 v = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(v * 2.0 - 1.0, 0.0, 1.0);
}
`

const UNIFORMS = [
  'iResolution',
  'iTime',
  'iMouse',
  'iFrame',
  'uSeed',
  'uColBg',
  'uColInk',
  'uColSignal',
  'uColAccent',
  'uColPaper',
  'uColDim',
] as const

type UniformName = (typeof UNIFORMS)[number]
type UniformMap = Record<UniformName, WebGLUniformLocation | null>

function hexToVec3(hex: string): [number, number, number] {
  const value = parseInt(hex.slice(1), 16)
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255]
}

// gl.getShaderInfoLog lines look like "ERROR: 0:12: 'foo' : syntax error".
// The `#line 1` directive in HEADER makes 12 already a 1-based author-source line.
function parseErrors(log: string): CompileError[] {
  const errors: CompileError[] = []
  for (const line of log.split('\n')) {
    const match = line.match(/ERROR:\s*\d+:(\d+):\s*(.*)/)
    if (match) errors.push({ line: Math.max(1, Number(match[1])), message: match[2]!.trim() })
  }
  if (!errors.length && log.trim()) errors.push({ line: 1, message: log.trim() })
  return errors
}

export async function mountShader(
  container: HTMLElement,
  entry: ShaderEntry,
  options: MountOptions,
): Promise<ShaderHandle> {
  const body = await entry.source()
  return mountShaderSource(container, body, options)
}

export function mountShaderSource(
  container: HTMLElement,
  body: string,
  options: MountOptions,
): ShaderHandle {
  const canvas = document.createElement('canvas')
  canvas.width = options.size
  canvas.height = options.size
  const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false })
  if (!gl) throw new Error('WebGL2 not available')

  const vert = gl.createShader(gl.VERTEX_SHADER)!
  gl.shaderSource(vert, VERT)
  gl.compileShader(vert)

  let program: WebGLProgram | null = null
  let uniforms: UniformMap | null = null

  function compile(nextBody: string): CompileResult {
    const frag = gl!.createShader(gl!.FRAGMENT_SHADER)!
    gl!.shaderSource(frag, HEADER + nextBody + FOOTER)
    gl!.compileShader(frag)
    if (!gl!.getShaderParameter(frag, gl!.COMPILE_STATUS)) {
      const errors = parseErrors(gl!.getShaderInfoLog(frag) ?? '')
      gl!.deleteShader(frag)
      return { ok: false, errors }
    }
    const next = gl!.createProgram()!
    gl!.attachShader(next, vert)
    gl!.attachShader(next, frag)
    gl!.linkProgram(next)
    gl!.deleteShader(frag)
    if (!gl!.getProgramParameter(next, gl!.LINK_STATUS)) {
      const errors = parseErrors(gl!.getProgramInfoLog(next) ?? '')
      gl!.deleteProgram(next)
      return { ok: false, errors }
    }
    if (program) gl!.deleteProgram(program)
    program = next
    uniforms = Object.fromEntries(
      UNIFORMS.map((name) => [name, gl!.getUniformLocation(next, name)]),
    ) as UniformMap
    return { ok: true }
  }

  const initial = compile(body)
  if (!initial.ok) {
    canvas.remove()
    const [first] = initial.errors
    throw new Error(`GLSL compile failed — line ${first?.line}: ${first?.message}`)
  }
  container.appendChild(canvas)

  let seed = options.seed
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

  function render(time: number, frame: number) {
    if (!program || !uniforms) return
    gl!.viewport(0, 0, canvas.width, canvas.height)
    gl!.useProgram(program)
    gl!.uniform3f(uniforms.iResolution, canvas.width, canvas.height, 1)
    gl!.uniform1f(uniforms.iTime, time)
    gl!.uniform4f(uniforms.iMouse, mouse.x, mouse.y, mouse.cx, mouse.cy)
    gl!.uniform1i(uniforms.iFrame, frame)
    gl!.uniform1f(uniforms.uSeed, seed)
    gl!.uniform3fv(uniforms.uColBg, hexToVec3(DEXA_PALETTE.bg))
    gl!.uniform3fv(uniforms.uColInk, hexToVec3(DEXA_PALETTE.ink))
    gl!.uniform3fv(uniforms.uColSignal, hexToVec3(DEXA_PALETTE.signal))
    gl!.uniform3fv(uniforms.uColAccent, hexToVec3(DEXA_PALETTE.accent))
    gl!.uniform3fv(uniforms.uColPaper, hexToVec3(DEXA_PALETTE.paper))
    gl!.uniform3fv(uniforms.uColDim, hexToVec3(DEXA_PALETTE.dim))
    gl!.drawArrays(gl!.TRIANGLES, 0, 3)
  }

  let raf = 0
  let destroyed = false

  if (options.thumb) {
    render(THUMB_TIME, THUMB_FRAME)
    window.__SHADER_READY__ = true
  } else {
    const start = performance.now()
    let frame = 0
    const loop = (now: number) => {
      if (destroyed) return
      render((now - start) / 1000, frame++)
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
      if (program) gl.deleteProgram(program)
      gl.deleteShader(vert)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      canvas.remove()
    },
    recompile(nextBody: string): CompileResult {
      if (destroyed) return { ok: true }
      const result = compile(nextBody)
      if (result.ok && options.thumb) render(THUMB_TIME, THUMB_FRAME)
      return result
    },
    setSeed(nextSeed: number) {
      seed = nextSeed
      if (options.thumb) render(THUMB_TIME, THUMB_FRAME)
    },
  }
}
