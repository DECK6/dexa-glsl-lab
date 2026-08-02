import type { ShaderMeta } from '../../src/types'

export default {
  id: 'VS01',
  slug: 'luma-threshold',
  title: 'LUMA THRESHOLD',
  category: 'vision',
  tags: ['vision', 'threshold', 'segmentation', 'input'],
  description: '가변 명도 임계값으로 전경과 배경을 이진 분할하고 경계 대역을 표시',
} satisfies ShaderMeta
