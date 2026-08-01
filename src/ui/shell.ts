export type ShellPage = 'gallery' | 'detail' | 'about'

export function siteHeader(current: ShellPage): string {
  return `
    <header class="site-header">
      <a class="brand" href="#/" aria-label="DEXA GLSL LAB gallery">DEXA GLSL LAB<span>.</span></a>
      <nav class="site-nav mono" aria-label="GLSL LAB navigation">
        <a class="${current === 'gallery' ? 'is-current' : ''}" href="#/">GALLERY</a>
        <a class="${current === 'about' ? 'is-current' : ''}" href="#/about">ABOUT</a>
      </nav>
    </header>
  `
}
