import type { ShaderMeta } from '../../src/types'

export default {
  id: 'FD02',
  slug: 'vorticity-confinement',
  title: 'VORTICITY CONFINEMENT',
  category: 'fluid',
  tags: ['fluid', 'vorticity', 'curl', 'buffer'],
  description: '속도·밀도 피드백으로 유체 수송의 서로 다른 경계 조건과 와류 구조를 전개: VORTICITY CONFINEMENT 알고리즘.',
} satisfies ShaderMeta
