import type { ShaderMeta } from '../../src/types'

export default {
  id: 'FD01',
  slug: 'semi-lagrangian-dye',
  title: 'SEMI-LAGRANGIAN DYE',
  category: 'fluid',
  tags: ['fluid', 'advection', 'dye', 'buffer'],
  description: '속도·밀도 피드백으로 유체 수송의 서로 다른 경계 조건과 와류 구조를 전개: SEMI-LAGRANGIAN DYE 알고리즘.',
} satisfies ShaderMeta
