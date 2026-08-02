import type { ShaderMeta } from '../../src/types'

export default {
  id: 'KC02',
  slug: 'box-filter',
  title: 'BOX FILTER',
  category: 'convolution',
  tags: ['convolution', 'box', 'blur', 'input'],
  description: '9탭 균등 평균으로 입력 영상의 고주파를 억제하는 박스 컨볼루션',
} satisfies ShaderMeta
