import './theme/dexa-theme.css'
import './style.css'
import { mountAbout } from './ui/about'
import { mountDetail } from './ui/detail'
import { mountGallery } from './ui/gallery'
import { mountPreview } from './ui/preview'

interface View {
  destroy: () => void
}

const app = document.querySelector<HTMLElement>('#app')!
let current: View | null = null

function route() {
  current?.destroy()
  current = null

  const raw = location.hash.replace(/^#/, '') || '/'
  const [path, search = ''] = raw.split('?')
  const segments = path.split('/').filter(Boolean)
  const params = new URLSearchParams(search)

  if (segments[0] === 's' && segments[1]) {
    current = mountDetail(app, segments[1])
  } else if (segments[0] === 'about') {
    current = mountAbout(app)
  } else if (segments[0] === 'p' && segments[1]) {
    current = mountPreview(app, segments[1], params)
  } else {
    current = mountGallery(app)
  }

  window.scrollTo(0, 0)
}

window.addEventListener('hashchange', route)
route()
