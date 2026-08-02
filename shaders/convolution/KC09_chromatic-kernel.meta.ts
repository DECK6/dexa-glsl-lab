import type { ShaderMeta } from '../../src/types'

export default {
  id: 'KC09',
  slug: 'chromatic-kernel',
  title: 'CHROMATIC KERNEL',
  category: 'convolution',
  tags: ['convolution', 'chromatic', 'channels', 'input'],
  description: 'RGB 채널마다 다른 오프셋 커널을 적용해 색수차와 가장자리 분리를 구성',
} satisfies ShaderMeta
