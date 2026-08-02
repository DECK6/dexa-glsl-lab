import type { ShaderMeta } from '../../src/types'

export default {
  id: 'VS10',
  slug: 'motion-segment',
  title: 'MOTION SEGMENT',
  category: 'vision',
  tags: ['vision', 'motion', 'difference', 'input'],
  description: '시간 변위 표본의 색 차이를 이용해 움직임 후보 영역과 잔상을 분리',
} satisfies ShaderMeta
