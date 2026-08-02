import type { RuntimeTier } from './catalog'

export type RenderStage = 'image' | 'buffer'

const BASE_HEADER = `#version 300 es
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform float iTimeDelta;
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
`

const CHANNEL_HEADER = `uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform vec3 iChannelResolution[2];
`

export function buildFragmentSource(
  runtime: RuntimeTier,
  stage: RenderStage,
  authorSource: string,
): string {
  if (stage === 'buffer' && runtime !== 'buffer') {
    throw new Error(`${runtime} shaders do not have a buffer stage`)
  }
  const channels = runtime === 'core' ? '' : CHANNEL_HEADER
  const entry = stage === 'buffer' ? 'mainBuffer' : 'mainImage'
  return `${BASE_HEADER}${channels}#line 1
${authorSource}
void main() { ${entry}(outColor, gl_FragCoord.xy); }
`
}

export function thumbnailFrameCount(runtime: RuntimeTier): number {
  return runtime === 'buffer' ? 90 : 1
}
