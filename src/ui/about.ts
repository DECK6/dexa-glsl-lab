import { siteHeader } from './shell'

const COPY = {
  ko: {
    heroBody:
      '순수 GLSL 프래그먼트 셰이더 200종을 브라우저에서 감상하고, 소스를 직접 고쳐 즉시 반영되는 결과를 확인하는 라이브 셰이더 카탈로그입니다.',
    sections: [
      {
        index: '01 / BROWSE',
        title: '갤러리 탐색',
        body: '레이마칭부터 모아레까지 20개 카테고리를 필터링하고 제목, ID, 태그를 검색합니다. 정지 썸네일은 가볍게 유지되고 포커스한 작품만 라이브로 실행됩니다.',
      },
      {
        index: '02 / EDIT',
        title: '라이브 편집',
        body: '상세 화면의 소스 패널이 곧 에디터입니다. GLSL을 고치면 즉시 재컴파일되어 화면에 반영되고, 실패하면 라인 번호와 함께 에러가 표시됩니다.',
      },
      {
        index: '03 / READ',
        title: '셰이더 읽기',
        body: '모든 작품은 Shadertoy 스타일 mainImage 하나로 완결된 .frag 파일입니다. 러너가 유니폼 프렐류드를 소유하므로 소스는 알고리즘만 담습니다.',
      },
      {
        index: '04 / EXTEND',
        title: '새 작품 추가',
        body: '카테고리 폴더에 .frag와 메타 파일 쌍을 드롭하면 갤러리가 자동으로 발견합니다. 레지스트리 린트가 파일명, 메타 계약, 팔레트 사용을 검사합니다.',
      },
    ],
    sourceLabel: '전체 소스, 200종 카탈로그, 설계 계약은 GitHub에 공개되어 있습니다.',
  },
  en: {
    heroBody:
      'A live shader catalog for exploring 200 pure GLSL fragment shaders in the browser and editing their source with instant recompilation.',
    sections: [
      {
        index: '01 / BROWSE',
        title: 'Browse the gallery',
        body: 'Filter across 20 categories from raymarching to moiré, then search by title, ID, or tag. Thumbnails stay light; only focused works run live.',
      },
      {
        index: '02 / EDIT',
        title: 'Edit it live',
        body: 'The source panel on the detail page is the editor. Change the GLSL and it recompiles instantly; failures surface as inline errors with line numbers.',
      },
      {
        index: '03 / READ',
        title: 'Read the shader',
        body: 'Every work is one self-contained .frag file built around a Shadertoy-style mainImage. The runner owns the uniform prelude, so sources hold only the algorithm.',
      },
      {
        index: '04 / EXTEND',
        title: 'Add a work',
        body: 'Drop a matching .frag and metadata pair into a category folder and the gallery discovers it automatically. Registry lint enforces naming, metadata, and palette contracts.',
      },
    ],
    sourceLabel: 'The full source, 200-shader catalog, and architecture contract are public on GitHub.',
  },
} as const

export function mountAbout(root: HTMLElement): { destroy: () => void } {
  let lang: keyof typeof COPY = 'ko'

  function render() {
    const copy = COPY[lang]
    root.innerHTML = `
      ${siteHeader('about')}
      <main class="about-page">
        <header class="about-hero">
          <div class="about-hero-top">
            <p class="eyebrow mono">DEXA GLSL LAB / FIELD GUIDE</p>
            <div class="lang-toggle mono" role="group" aria-label="Language">
              <button type="button" data-lang="ko" class="${lang === 'ko' ? 'active' : ''}">KO</button>
              <button type="button" data-lang="en" class="${lang === 'en' ? 'active' : ''}">EN</button>
            </div>
          </div>
          <h1>SHADE LIVE.<br />EDIT THE SOURCE<span>.</span></h1>
          <p data-role="hero-body"></p>
        </header>
        <div class="about-grid" data-role="about-grid"></div>
        <aside class="about-note mono">
          <span>RUNTIME CONTRACT</span>
          640×640 SQUARE / WEBGL2 / SHADERTOY-STYLE UNIFORMS / LIVE RECOMPILE / FIXED-TIME THUMBNAILS
        </aside>
        <aside class="about-note mono">
          <span>SOURCE</span>
          <a href="https://github.com/DECK6/dexa-glsl-lab" target="_blank" rel="noopener noreferrer" class="about-repo-link">GITHUB.COM/DECK6/DEXA-GLSL-LAB ↗</a>
          <b data-role="source-label"></b>
        </aside>
      </main>
    `

    root.querySelector<HTMLElement>('[data-role="hero-body"]')!.textContent = copy.heroBody
    root.querySelector<HTMLElement>('[data-role="source-label"]')!.textContent = copy.sourceLabel
    const grid = root.querySelector<HTMLElement>('[data-role="about-grid"]')!
    for (const section of copy.sections) {
      const item = document.createElement('section')
      item.innerHTML = '<span class="about-index mono"></span><h2></h2><p></p>'
      item.querySelector<HTMLElement>('.about-index')!.textContent = section.index
      item.querySelector<HTMLElement>('h2')!.textContent = section.title
      item.querySelector<HTMLElement>('p')!.textContent = section.body
      grid.appendChild(item)
    }

    for (const button of root.querySelectorAll<HTMLButtonElement>('[data-lang]')) {
      button.addEventListener('click', () => {
        const next = button.dataset.lang as keyof typeof COPY
        if (next === lang) return
        lang = next
        render()
      })
    }
  }

  render()
  return { destroy: () => root.replaceChildren() }
}
