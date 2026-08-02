import type { ShaderMeta } from '../../src/types'

export default {
  id: 'PG01',
  slug: 'monte-carlo-disk',
  title: 'MONTE CARLO DISK',
  category: 'progressive',
  tags: ['progressive', 'monte-carlo', 'sampling', 'buffer'],
  description: '프레임별 확률 표본과 통계를 누적해 즉시 계산과 다른 점진적 수렴 이미지를 생성: MONTE CARLO DISK 알고리즘.',
} satisfies ShaderMeta
