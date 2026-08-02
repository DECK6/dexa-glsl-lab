import type { ShaderMeta } from '../../src/types'

export default {
  id: 'KC10',
  slug: 'kuwahara-painter',
  title: 'KUWAHARA PAINTER',
  category: 'convolution',
  tags: ['convolution', 'kuwahara', 'painterly', 'input'],
  description: '사분면별 평균과 분산을 비교해 저분산 영역을 선택하는 회화적 Kuwahara 근사',
} satisfies ShaderMeta
