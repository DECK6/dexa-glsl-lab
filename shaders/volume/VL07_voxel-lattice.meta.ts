import type { ShaderMeta } from '../../src/types'

export default {
  id: 'VL07',
  slug: 'voxel-lattice',
  title: 'VOXEL LATTICE',
  category: 'volume',
  tags: ['volume', 'voxel', 'lattice', 'depth'],
  description: '삼차원 격자 교차점의 밀도를 깊이 순서로 누적해 회전하는 복셀 결정 구조를 만드는 볼륨',
} satisfies ShaderMeta
