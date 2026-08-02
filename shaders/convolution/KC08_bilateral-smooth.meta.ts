import type { ShaderMeta } from '../../src/types'

export default {
  id: 'KC08',
  slug: 'bilateral-smooth',
  title: 'BILATERAL SMOOTH',
  category: 'convolution',
  tags: ['convolution', 'bilateral', 'edge-aware', 'input'],
  description: '공간 거리와 색 차이를 함께 가중해 경계를 보존하면서 영역 내부만 평활화',
} satisfies ShaderMeta
