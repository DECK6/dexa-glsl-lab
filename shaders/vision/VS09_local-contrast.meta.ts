import type { ShaderMeta } from '../../src/types'

export default {
  id: 'VS09',
  slug: 'local-contrast',
  title: 'LOCAL CONTRAST',
  category: 'vision',
  tags: ['vision', 'contrast', 'adaptive', 'input'],
  description: '주변 평균 대비 현재 픽셀 편차를 측정해 적응형 대비 지도를 생성',
} satisfies ShaderMeta
