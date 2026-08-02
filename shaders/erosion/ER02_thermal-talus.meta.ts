import type { ShaderMeta } from '../../src/types'

export default {
  id: 'ER02',
  slug: 'thermal-talus',
  title: 'THERMAL TALUS',
  category: 'erosion',
  tags: ['erosion', 'thermal', 'talus', 'buffer'],
  description: '고도·물·퇴적물 상태의 이동 규칙으로 지형이 깎이고 쌓이는 과정을 누적: THERMAL TALUS 알고리즘.',
} satisfies ShaderMeta
