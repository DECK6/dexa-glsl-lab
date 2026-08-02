import type { ShaderMeta } from '../../src/types'

export default {
  id: 'AU08',
  slug: 'majority-vote',
  title: 'MAJORITY VOTE',
  category: 'automata',
  tags: ['automata', 'majority', 'consensus', 'domains'],
  description: '주변 다수 상태를 채택하되 이동 편향을 넣어 합의 도메인이 성장하고 충돌하는 격자',
} satisfies ShaderMeta
