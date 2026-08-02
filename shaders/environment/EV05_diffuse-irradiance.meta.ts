import type { ShaderMeta } from '../../src/types'

export default {
  id: 'EV05',
  slug: 'diffuse-irradiance',
  title: 'DIFFUSE IRRADIANCE',
  category: 'environment',
  tags: ['environment', 'irradiance', 'diffuse', 'input'],
  description: '반구 방향의 다중 탭을 평균해 저주파 확산 조명과 환경색 에너지를 근사',
} satisfies ShaderMeta
