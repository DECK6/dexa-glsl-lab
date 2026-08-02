import type { ShaderMeta } from '../../src/types'

export default {
  id: 'PG10',
  slug: 'variance-heatmap',
  title: 'VARIANCE HEATMAP',
  category: 'progressive',
  tags: ['progressive', 'variance', 'statistics', 'buffer'],
  description: '프레임별 확률 표본과 통계를 누적해 즉시 계산과 다른 점진적 수렴 이미지를 생성: VARIANCE HEATMAP 알고리즘.',
} satisfies ShaderMeta
