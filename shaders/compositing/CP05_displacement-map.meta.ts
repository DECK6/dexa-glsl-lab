import type { ShaderMeta } from '../../src/types'

export default {
  id: 'CP05',
  slug: 'displacement-map',
  title: 'DISPLACEMENT MAP',
  category: 'compositing',
  tags: ['compositing', 'displacement', 'warp', 'input'],
  description: '보조 입력의 RG 성분을 벡터 변위로 해석해 원본 좌표를 비선형 재매핑',
} satisfies ShaderMeta
