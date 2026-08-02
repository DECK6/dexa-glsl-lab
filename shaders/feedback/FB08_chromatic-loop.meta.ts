import type { ShaderMeta } from '../../src/types'

export default {
  id: 'FB08',
  slug: 'chromatic-loop',
  title: 'CHROMATIC LOOP',
  category: 'feedback',
  tags: ['feedback', 'chromatic', 'loop', 'buffer'],
  description: '이전 프레임을 공간 변환·감쇠·재주입해 서로 다른 재귀 영상 기억을 형성: CHROMATIC LOOP 알고리즘.',
} satisfies ShaderMeta
