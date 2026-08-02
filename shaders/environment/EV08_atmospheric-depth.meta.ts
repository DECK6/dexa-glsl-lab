import type { ShaderMeta } from '../../src/types'

export default {
  id: 'EV08',
  slug: 'atmospheric-depth',
  title: 'ATMOSPHERIC DEPTH',
  category: 'environment',
  tags: ['environment', 'atmosphere', 'fog', 'input'],
  description: '영상의 수직 의사 깊이에 지수 감쇠를 적용해 환경색 대기 원근과 안개층을 합성',
} satisfies ShaderMeta
