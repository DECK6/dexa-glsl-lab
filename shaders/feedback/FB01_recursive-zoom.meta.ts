import type { ShaderMeta } from '../../src/types'

export default {
  id: 'FB01',
  slug: 'recursive-zoom',
  title: 'RECURSIVE ZOOM',
  category: 'feedback',
  tags: ['feedback', 'zoom', 'recursion', 'buffer'],
  description: '이전 프레임을 공간 변환·감쇠·재주입해 서로 다른 재귀 영상 기억을 형성: RECURSIVE ZOOM 알고리즘.',
} satisfies ShaderMeta
