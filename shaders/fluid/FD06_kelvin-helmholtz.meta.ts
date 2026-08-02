import type { ShaderMeta } from '../../src/types'

export default {
  id: 'FD06',
  slug: 'kelvin-helmholtz',
  title: 'KELVIN-HELMHOLTZ',
  category: 'fluid',
  tags: ['fluid', 'shear', 'instability', 'buffer'],
  description: '속도·밀도 피드백으로 유체 수송의 서로 다른 경계 조건과 와류 구조를 전개: KELVIN-HELMHOLTZ 알고리즘.',
} satisfies ShaderMeta
