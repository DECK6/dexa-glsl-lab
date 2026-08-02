import type { ShaderMeta } from '../../src/types'

export default {
  id: 'KC06',
  slug: 'unsharp-mask',
  title: 'UNSHARP MASK',
  category: 'convolution',
  tags: ['convolution', 'unsharp', 'detail', 'input'],
  description: '저주파 블러를 원본에서 빼고 가산해 국소 선명도와 테두리 대비를 증폭',
} satisfies ShaderMeta
