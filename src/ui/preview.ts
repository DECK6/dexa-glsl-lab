import { DEXA_PALETTE } from '../palette'
import { byId } from '../registry'
import { mountShader, type ShaderHandle } from '../runner'

const DEFAULT_SIZE = 640
const DEFAULT_SEED = 7

// Chrome-less harness for the thumbnail script and e2e alive test (SPEC §5).
export function mountPreview(
  root: HTMLElement,
  id: string,
  params: URLSearchParams,
): { destroy: () => void } {
  const entry = byId(id)
  const size = Number(params.get('size')) || DEFAULT_SIZE
  const seed = Number(params.get('seed')) || DEFAULT_SEED
  const thumb = params.get('thumb') === '1'

  document.body.classList.add('is-preview')
  document.body.style.background = DEXA_PALETTE.bg
  window.__SHADER_READY__ = false

  root.innerHTML = '<div class="stage preview-stage" data-role="stage"></div>'
  const stage = root.querySelector<HTMLElement>('[data-role="stage"]')!
  stage.style.width = `${size}px`
  stage.style.height = `${size}px`

  let handle: ShaderHandle | null = null
  let disposed = false

  if (!entry) {
    console.error(`preview: ${id} not found`)
  } else {
    void mountShader(stage, entry, { seed, size, thumb })
      .then((mounted) => {
        if (disposed) mounted.destroy()
        else handle = mounted
      })
      .catch((error) => console.error(`preview: ${id} failed to mount`, error))
  }

  return {
    destroy: () => {
      disposed = true
      handle?.destroy()
      document.body.classList.remove('is-preview')
      document.body.style.background = ''
      root.replaceChildren()
    },
  }
}
