import type { ShaderMeta } from '../../src/types'

export default {
  id: 'VL10',
  slug: 'shadow-volume',
  title: 'SHADOW VOLUME',
  category: 'volume',
  tags: ['volume', 'shadow', 'light-transport', 'density'],
  description: '절차 밀도장을 통과한 광선 감쇠를 별도 방향으로 적분해 내부 그림자가 떠 있는 볼륨',
} satisfies ShaderMeta
