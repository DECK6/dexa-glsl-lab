import { CATEGORIES, SHADERS, type ShaderEntry } from '../registry'
import { DOMAINS, categoryById } from '../catalog'
import type { DomainId, RuntimeTier } from '../catalog'
import { mountShader, type ShaderHandle } from '../runner'
import type { CategoryId } from '../types'
import { siteHeader } from './shell'

const CARD_SIZE = 320
const CARD_SEED = 7
const MAX_LIVE = 3
const LEAVE_DELAY = 300

interface LiveCard {
  entry: ShaderEntry
  slot: HTMLElement
  handle: ShaderHandle | null
  disposed: boolean
}

export function mountGallery(root: HTMLElement): { destroy: () => void } {
  let category: CategoryId | null = null
  let domain: DomainId | null = null
  let runtime: RuntimeTier | null = null
  let query = ''

  root.innerHTML = `
    ${siteHeader('gallery')}
    <main class="gallery-layout">
      <aside class="filters mono" aria-label="Shader filters">
        <div class="filter-heading">
          <span>FILTERS</span>
          <button type="button" data-role="reset">RESET</button>
        </div>
        <fieldset>
          <legend>DOMAIN</legend>
          <div class="filter-options" data-role="domains"></div>
        </fieldset>
        <fieldset>
          <legend>RUNTIME</legend>
          <div class="filter-options" data-role="runtimes"></div>
        </fieldset>
        <fieldset>
          <legend>CATEGORY</legend>
          <div class="filter-groups" data-role="categories"></div>
        </fieldset>
      </aside>
      <section class="gallery-content" aria-labelledby="gallery-title">
        <div class="gallery-toolbar">
          <div>
            <p class="eyebrow mono">PURE GLSL / WEBGL2 / LIVE CATALOG</p>
            <h1 id="gallery-title">LIVE SHADERS<span>.</span></h1>
          </div>
          <label class="search-field mono">
            SEARCH
            <input type="search" placeholder="ID / TITLE / TAG" autocomplete="off" />
          </label>
          <p class="result-count mono" data-role="count"></p>
        </div>
        <div class="grid-viewport">
          <div class="effect-grid" data-role="grid"></div>
          <div class="empty-state" data-role="empty" hidden>
            <p class="mono">NO SHADER ON SIGNAL</p>
            <span>Reset the filters or try another search.</span>
          </div>
        </div>
      </section>
    </main>
  `

  const categoryRow = root.querySelector<HTMLElement>('[data-role="categories"]')!
  const domainRow = root.querySelector<HTMLElement>('[data-role="domains"]')!
  const runtimeRow = root.querySelector<HTMLElement>('[data-role="runtimes"]')!
  const grid = root.querySelector<HTMLElement>('[data-role="grid"]')!
  const countEl = root.querySelector<HTMLElement>('[data-role="count"]')!
  const emptyEl = root.querySelector<HTMLElement>('[data-role="empty"]')!
  const search = root.querySelector<HTMLInputElement>('.search-field input')!
  const reset = root.querySelector<HTMLButtonElement>('[data-role="reset"]')!

  const live = new Map<string, LiveCard>()
  const leaveTimers = new Map<string, number>()

  function unmount(id: string) {
    const card = live.get(id)
    if (!card) return
    live.delete(id)
    card.disposed = true
    card.handle?.destroy()
    card.slot.classList.remove('is-live')
    card.slot.replaceChildren()
  }

  function evict() {
    while (live.size >= MAX_LIVE) {
      const oldest = live.keys().next()
      if (oldest.done) break
      unmount(oldest.value)
    }
  }

  async function activate(entry: ShaderEntry, slot: HTMLElement) {
    const id = entry.meta.id
    const timer = leaveTimers.get(id)
    if (timer) {
      clearTimeout(timer)
      leaveTimers.delete(id)
    }
    if (live.has(id)) return

    evict()
    const card: LiveCard = { entry, slot, handle: null, disposed: false }
    live.set(id, card)
    slot.classList.add('is-live')

    try {
      const handle = await mountShader(slot, entry, { seed: CARD_SEED, size: CARD_SIZE })
      if (card.disposed) handle.destroy()
      else card.handle = handle
    } catch (error) {
      console.error(`gallery: ${id} failed to mount`, error)
      unmount(id)
    }
  }

  function scheduleUnmount(id: string) {
    if (!live.has(id) || leaveTimers.has(id)) return
    leaveTimers.set(
      id,
      window.setTimeout(() => {
        leaveTimers.delete(id)
        unmount(id)
      }, LEAVE_DELAY),
    )
  }

  const cards = SHADERS.map((entry) => {
    const { id, title } = entry.meta
    const info = categoryById(entry.meta.category)!
    const card = document.createElement('a')
    card.className = 'effect-card'
    card.href = `#/s/${id}`
    card.innerHTML = `
      <div class="preview-bezel">
        <div class="stage live-preview">
          <img class="live-thumbnail" alt="" loading="lazy" src="${import.meta.env.BASE_URL}thumbs/${id}.jpg" />
          <div class="card-live"></div>
        </div>
      </div>
      <p class="effect-label mono"><span>${id} / ${title}</span><b class="runtime-badge" data-runtime="${info.runtime}">${info.runtime}</b></p>
    `
    const stage = card.querySelector<HTMLElement>('.live-preview')!
    const slot = card.querySelector<HTMLElement>('.card-live')!
    const thumb = card.querySelector<HTMLImageElement>('.live-thumbnail')!
    thumb.addEventListener('error', () => {
      thumb.remove()
      stage.classList.add('is-empty')
    })
    card.addEventListener('pointerenter', () => void activate(entry, slot))
    card.addEventListener('pointerleave', () => scheduleUnmount(id))
    card.addEventListener('focus', () => void activate(entry, slot))
    card.addEventListener('blur', () => scheduleUnmount(id))
    grid.appendChild(card)
    return { entry, card }
  })

  function choice(label: string, active: boolean, onClick: () => void) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = active ? 'filter-choice is-active' : 'filter-choice'
    button.setAttribute('aria-pressed', String(active))
    const span = document.createElement('span')
    span.textContent = label
    button.appendChild(span)
    button.addEventListener('click', onClick)
    return button
  }

  function renderChoices() {
    domainRow.replaceChildren(...DOMAINS.map((item) =>
      choice(item.label, domain === item.id, () => {
        domain = domain === item.id ? null : item.id
        render()
      }),
    ))
    runtimeRow.replaceChildren(...(['core', 'buffer', 'input'] as const).map((item) =>
      choice(item.toUpperCase(), runtime === item, () => {
        runtime = runtime === item ? null : item
        render()
      }),
    ))
    categoryRow.replaceChildren(...DOMAINS.map((domainItem) => {
      const group = document.createElement('section')
      group.className = 'filter-group'
      const heading = document.createElement('p')
      heading.textContent = domainItem.label
      const options = document.createElement('div')
      options.className = 'filter-options'
      options.replaceChildren(...CATEGORIES.filter((item) => item.domain === domainItem.id).map((item) =>
        choice(item.label, category === item.id, () => {
          category = category === item.id ? null : item.id
          domain = null
          render()
        }),
      ))
      group.append(heading, options)
      return group
    }))
  }

  function matches(entry: ShaderEntry) {
    const { meta } = entry
    const info = categoryById(meta.category)!
    if (category && meta.category !== category) return false
    if (domain && info.domain !== domain) return false
    if (runtime && info.runtime !== runtime) return false
    if (!query) return true
    const needle = query.toLowerCase()
    return [meta.id, meta.title, meta.slug, ...meta.tags].some((value) =>
      value.toLowerCase().includes(needle),
    )
  }

  function render() {
    renderChoices()
    let visible = 0
    for (const { entry, card } of cards) {
      const show = matches(entry)
      card.hidden = !show
      if (show) visible++
      else unmount(entry.meta.id)
    }
    countEl.textContent = `${visible} / ${SHADERS.length}`
    emptyEl.hidden = visible > 0
    grid.hidden = visible === 0
  }

  search.addEventListener('input', () => {
    query = search.value.trim()
    render()
  })
  reset.addEventListener('click', () => {
    category = null
    domain = null
    runtime = null
    query = ''
    search.value = ''
    render()
  })

  render()

  return {
    destroy: () => {
      for (const timer of leaveTimers.values()) clearTimeout(timer)
      leaveTimers.clear()
      for (const id of [...live.keys()]) unmount(id)
      root.replaceChildren()
    },
  }
}
