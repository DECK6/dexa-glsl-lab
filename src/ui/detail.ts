import { SHADERS, byId, categoryLabel, type ShaderEntry } from '../registry'
import { categoryById } from '../catalog'
import { mountShader, type ShaderHandle } from '../runner'
import { siteHeader } from './shell'

const STAGE_SIZE = 640
const DEFAULT_SEED = 7
const RECOMPILE_DEBOUNCE = 350

export function mountDetail(root: HTMLElement, id: string): { destroy: () => void } {
  const found = byId(id)
  if (!found) {
    root.innerHTML = `
      ${siteHeader('detail')}
      <main class="not-found">
        <p class="mono">SHADER ${id} NOT FOUND</p>
        <a class="action-button mono" href="#/">BACK TO GALLERY</a>
      </main>
    `
    return { destroy: () => root.replaceChildren() }
  }

  const entry: ShaderEntry = found
  const { meta } = entry
  const category = categoryById(meta.category)!
  const position = SHADERS.findIndex((item) => item.meta.id === meta.id)
  const prev = SHADERS[(position - 1 + SHADERS.length) % SHADERS.length]!
  const next = SHADERS[(position + 1) % SHADERS.length]!
  const related = SHADERS.filter(
    (item) => item.meta.category === meta.category && item.meta.id !== meta.id,
  ).slice(0, 3)

  root.innerHTML = `
    ${siteHeader('detail')}
    <main class="detail-page">
      <div class="detail-title-row">
        <div>
          <p class="eyebrow mono">${meta.id} / ${categoryLabel(meta.category)} / ${category.runtime.toUpperCase()} RUNTIME</p>
          <h1>${meta.title}<span>.</span></h1>
        </div>
        <a class="text-link mono" href="#/">← BACK TO GALLERY</a>
      </div>

      <section class="detail-workbench">
        <div class="detail-preview-panel">
          <div class="preview-bezel detail-bezel">
            <div class="stage detail-stage" data-role="stage"></div>
          </div>
        </div>
        <aside class="param-panel">
          <div class="panel-heading mono"><span>SHADER CONTROL</span><span>${category.domain.toUpperCase()} / ${category.runtime.toUpperCase()}</span></div>
          <div class="param-list">
            <div class="param-control mono"><span>SEED</span><output data-role="seed"></output></div>
            <button type="button" class="action-button mono regen-button" data-role="regen">REGENERATE</button>
            <p class="detail-description" data-role="description"></p>
            <div class="tag-row mono" data-role="tags"></div>
          </div>
          <nav class="detail-nav mono">
            <a href="#/s/${prev.meta.id}">← ${prev.meta.id}</a>
            <a href="#/s/${next.meta.id}">${next.meta.id} →</a>
          </nav>
        </aside>
      </section>

      <section class="code-panel">
        <div class="section-heading">
          <div><p class="eyebrow mono">EDIT THE SHADER — LIVE</p><h2>SOURCE CODE</h2></div>
        </div>
        <div class="code-console">
          <div class="code-tabs mono">
            <button type="button" class="is-active">SHADER.FRAG</button>
            <span>${meta.id}_${meta.slug}.frag</span>
            <span class="edit-status" data-role="status"></span>
            <button type="button" class="copy-button" data-role="reset-code">RESET</button>
            <button type="button" class="copy-button" data-role="copy">COPY</button>
          </div>
          <div class="compile-errors mono" data-role="errors" hidden></div>
          <textarea class="code-editor mono" data-role="editor" spellcheck="false"
            aria-label="GLSL fragment shader source — edits recompile live">LOADING…</textarea>
        </div>
      </section>

      <section class="related-section">
        <div class="section-heading">
          <div><p class="eyebrow mono">SAME CATEGORY</p><h2>RELATED WORKS</h2></div>
        </div>
        <div class="related-grid" data-role="related"></div>
      </section>
    </main>
  `

  root.querySelector<HTMLElement>('[data-role="description"]')!.textContent = meta.description
  root.querySelector<HTMLElement>('[data-role="tags"]')!.replaceChildren(
    ...meta.tags.map((tag) => {
      const chip = document.createElement('span')
      chip.className = 'tag'
      chip.textContent = tag
      return chip
    }),
  )
  const relatedGrid = root.querySelector<HTMLElement>('[data-role="related"]')!
  for (const item of related) {
    const card = document.createElement('a')
    card.className = 'related-card mono'
    card.href = `#/s/${item.meta.id}`
    const number = document.createElement('span')
    number.textContent = item.meta.id
    const title = document.createElement('strong')
    title.textContent = item.meta.title
    const detail = document.createElement('small')
    const itemCategory = categoryById(item.meta.category)!
    detail.textContent = `${categoryLabel(item.meta.category)} / ${itemCategory.runtime.toUpperCase()}`
    card.append(number, title, detail)
    relatedGrid.appendChild(card)
  }

  const stage = root.querySelector<HTMLElement>('[data-role="stage"]')!
  const seedEl = root.querySelector<HTMLElement>('[data-role="seed"]')!
  const editor = root.querySelector<HTMLTextAreaElement>('[data-role="editor"]')!
  const errorsEl = root.querySelector<HTMLElement>('[data-role="errors"]')!
  const statusEl = root.querySelector<HTMLElement>('[data-role="status"]')!
  const regen = root.querySelector<HTMLButtonElement>('[data-role="regen"]')!
  const resetCode = root.querySelector<HTMLButtonElement>('[data-role="reset-code"]')!
  const copy = root.querySelector<HTMLButtonElement>('[data-role="copy"]')!

  let handle: ShaderHandle | null = null
  let disposed = false
  let seed = DEFAULT_SEED
  let original = ''
  let debounceTimer = 0

  seedEl.textContent = String(seed)

  function showErrors(errors: { line: number; message: string }[]) {
    errorsEl.hidden = false
    errorsEl.replaceChildren(
      ...errors.map((error) => {
        const row = document.createElement('p')
        row.textContent = `LINE ${error.line} — ${error.message}`
        return row
      }),
    )
    statusEl.textContent = 'COMPILE ERROR'
    statusEl.classList.add('is-error')
  }

  function clearErrors(edited: boolean) {
    errorsEl.hidden = true
    errorsEl.replaceChildren()
    statusEl.textContent = edited ? 'LIVE — EDITED' : 'LIVE'
    statusEl.classList.remove('is-error')
  }

  function recompileNow() {
    if (!handle || disposed) return
    const text = editor.value
    const result = handle.recompile(text)
    if (result.ok) clearErrors(text !== original)
    else showErrors(result.errors)
  }

  editor.addEventListener('input', () => {
    window.clearTimeout(debounceTimer)
    debounceTimer = window.setTimeout(recompileNow, RECOMPILE_DEBOUNCE)
  })

  // Keep tab as indentation inside the editor instead of moving focus.
  editor.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return
    event.preventDefault()
    const { selectionStart, selectionEnd, value } = editor
    editor.value = `${value.slice(0, selectionStart)}  ${value.slice(selectionEnd)}`
    editor.selectionStart = editor.selectionEnd = selectionStart + 2
    editor.dispatchEvent(new Event('input'))
  })

  regen.addEventListener('click', () => {
    seed = Math.floor(Math.random() * 1_000_000)
    seedEl.textContent = String(seed)
    handle?.setSeed(seed)
  })

  resetCode.addEventListener('click', () => {
    if (!original) return
    editor.value = original
    recompileNow()
  })

  copy.addEventListener('click', () => {
    if (!editor.value) return
    void navigator.clipboard.writeText(editor.value).then(() => {
      copy.textContent = 'COPIED'
      window.setTimeout(() => {
        if (!disposed) copy.textContent = 'COPY'
      }, 1200)
    })
  })

  void mountShader(stage, entry, { seed, size: STAGE_SIZE })
    .then((mounted) => {
      if (disposed) {
        mounted.destroy()
        return
      }
      handle = mounted
      statusEl.textContent = 'LIVE'
    })
    .catch((error) => console.error(`detail: ${meta.id} failed to mount`, error))

  void entry.source().then((text) => {
    if (disposed) return
    original = text
    editor.value = text
  })

  return {
    destroy: () => {
      disposed = true
      window.clearTimeout(debounceTimer)
      handle?.destroy()
      root.replaceChildren()
    },
  }
}
