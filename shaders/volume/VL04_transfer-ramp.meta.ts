import type { ShaderMeta } from '../../src/types'

export default {
  id: 'VL04',
  slug: 'transfer-ramp',
  title: 'TRANSFER RAMP',
  category: 'volume',
  tags: ['volume', 'transfer-function', 'opacity', 'data'],
  description: '하나의 밀도장을 서로 다른 불투명도 구간으로 매핑해 전이함수 선택이 구조를 바꾸는 볼륨',
} satisfies ShaderMeta
