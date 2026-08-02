import type { ShaderMeta } from '../../src/types'

export default {
  id: 'VL01',
  slug: 'density-sphere',
  title: 'DENSITY SPHERE',
  category: 'volume',
  tags: ['volume', 'density', 'ray-integral', 'sphere'],
  description: '구형 밀도 내부를 통과하는 시선 적분이 중심 농도와 외곽 흡수를 분리하는 절차 볼륨',
} satisfies ShaderMeta
