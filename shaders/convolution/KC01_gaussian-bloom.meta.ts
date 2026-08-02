import type { ShaderMeta } from '../../src/types'

export default {
  id: 'KC01',
  slug: 'gaussian-bloom',
  title: 'GAUSSIAN BLOOM',
  category: 'convolution',
  tags: ['convolution', 'gaussian', 'input', 'blur'],
  description: '결정적 이미지 입력의 저주파 광량을 가우시안 커널로 모아 원본 가장자리 위에 부드럽게 되돌리는 필터',
} satisfies ShaderMeta
