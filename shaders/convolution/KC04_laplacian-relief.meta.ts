import type { ShaderMeta } from '../../src/types'

export default {
  id: 'KC04',
  slug: 'laplacian-relief',
  title: 'LAPLACIAN RELIEF',
  category: 'convolution',
  tags: ['convolution', 'laplacian', 'relief', 'input'],
  description: '중심과 직교 이웃의 2차 미분으로 밝기 곡률과 미세 릴리프를 강조',
} satisfies ShaderMeta
