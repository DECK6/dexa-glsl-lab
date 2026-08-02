import type { ShaderMeta } from '../../src/types'

export default {
  id: 'FB10',
  slug: 'recursive-window',
  title: 'RECURSIVE WINDOW',
  category: 'feedback',
  tags: ['feedback', 'window', 'inception', 'buffer'],
  description: '이전 프레임을 공간 변환·감쇠·재주입해 서로 다른 재귀 영상 기억을 형성: RECURSIVE WINDOW 알고리즘.',
} satisfies ShaderMeta
