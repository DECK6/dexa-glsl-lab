import type { ShaderMeta } from '../../src/types'

export default {
  id: 'VS07',
  slug: 'depth-edges',
  title: 'DEPTH EDGES',
  category: 'vision',
  tags: ['vision', 'depth', 'contours', 'input'],
  description: '명도를 의사 깊이로 보고 불연속과 등심선을 결합해 깊이 경계를 강조',
} satisfies ShaderMeta
