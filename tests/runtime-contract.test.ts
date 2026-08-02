import { describe, expect, test } from 'bun:test'
import { buildFragmentSource, thumbnailFrameCount } from '../src/runtime-contract'

const body = `
void mainBuffer(out vec4 state, in vec2 fragCoord) {
  state = texture(iChannel0, fragCoord / iResolution.xy);
}
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  fragColor = texture(iChannel0, fragCoord / iResolution.xy);
}
`

describe('tiered GLSL runtime contract', () => {
  test('keeps core on the original mainImage entry point', () => {
    const source = buildFragmentSource('core', 'image', body)
    expect(source).toContain('#version 300 es')
    expect(source).toContain('void main() { mainImage(outColor, gl_FragCoord.xy); }')
    expect(source).not.toContain('uniform sampler2D iChannel0;')
    expect(() => buildFragmentSource('core', 'buffer', body)).toThrow()
  })

  test('compiles buffer state and image stages from one author source', () => {
    const state = buildFragmentSource('buffer', 'buffer', body)
    const image = buildFragmentSource('buffer', 'image', body)
    expect(state).toContain('uniform sampler2D iChannel0;')
    expect(state).toContain('uniform vec3 iChannelResolution[2];')
    expect(state).toContain('void main() { mainBuffer(outColor, gl_FragCoord.xy); }')
    expect(image).toContain('void main() { mainImage(outColor, gl_FragCoord.xy); }')
  })

  test('gives input shaders channels without a state pass', () => {
    const source = buildFragmentSource('input', 'image', body)
    expect(source).toContain('uniform sampler2D iChannel1;')
    expect(() => buildFragmentSource('input', 'buffer', body)).toThrow()
  })

  test('uses deterministic buffer warm-up for still capture', () => {
    expect(thumbnailFrameCount('core')).toBe(1)
    expect(thumbnailFrameCount('input')).toBe(1)
    expect(thumbnailFrameCount('buffer')).toBe(90)
  })
})
