import type { ShaderMeta } from '../../src/types'

export default {
  id: 'KC03',
  slug: 'sobel-gradient',
  title: 'SOBEL GRADIENT',
  category: 'convolution',
  tags: ['convolution', 'sobel', 'edge', 'input'],
  description: '수평·수직 Sobel 커널의 벡터 크기와 방향으로 입력 윤곽을 추출',
} satisfies ShaderMeta
