import type { ShaderMeta } from '../../src/types'

export default {
  id: 'WS03',
  slug: 'shallow-water',
  title: 'SHALLOW WATER',
  category: 'wave-sim',
  tags: ['wave-sim', 'shallow-water', 'heightfield', 'buffer'],
  description: '높이와 속도 상태를 누적해 경계·매질·발진원에 따른 파동 전파를 시뮬레이션: SHALLOW WATER 알고리즘.',
} satisfies ShaderMeta
