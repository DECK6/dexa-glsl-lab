# DEXA GLSL LAB

**200 pure GLSL fragment shaders** in a live WebGL2 catalog with an in-browser editor.

**Live:** https://dexa.art/glsl/

<p align="center">
  <img src="https://dexa.art/glsl/thumbs/CA01.jpg" alt="Voronoi Flow" width="32%">
  <img src="https://dexa.art/glsl/thumbs/FR03.jpg" alt="Kali Weave" width="32%">
  <img src="https://dexa.art/glsl/thumbs/RM01.jpg" alt="Orbit Torus" width="32%">
</p>

## What it is

DEXA GLSL LAB is a browser-based catalog for watching, studying, and editing fragment shaders. Every work is animated, seed-aware, palette-controlled, and presented with its complete author source.

- **200 shaders** — 20 categories with 10 distinct works each
- **Live gallery** — filter by category, search by ID/title/tag, and preview on hover or keyboard focus with a three-context budget
- **Workbench detail** — regenerate the seed, navigate related works, copy the source, and watch edits recompile after a 350 ms debounce
- **Resilient live editing** — compile errors report author-source line numbers while the last valid program keeps rendering
- **Deterministic captures** — fixed time, frame, seed, palette, and square viewport make thumbnails and visual audits reproducible
- **Drop-in registry** — add a matching metadata/fragment pair and Vite discovers it without a central manifest

## Shader contract

Each `.frag` file contains helpers plus one Shadertoy-style entry point:

```glsl
void mainImage(out vec4 fragColor, in vec2 fragCoord)
```

The WebGL2 runner owns the version, precision, uniforms, output, and final `main()`. Author shaders use runner-provided values without redeclaring them:

| input | type | purpose |
|---|---|---|
| `iResolution` | `vec3` | square canvas resolution in pixels |
| `iTime` | `float` | elapsed animation time |
| `iMouse` | `vec4` | pointer and last-click coordinates |
| `iFrame` | `int` | frame counter |
| `uSeed` | `float` | deterministic variation seed |
| `uColBg` … `uColDim` | `vec3` | central DEXA palette uniforms |

Registry lint requires animation through `iTime`, at least one palette uniform, exact file-pair metadata, and the category's `01..10` ID range. It rejects author-owned preludes, channel textures, legacy outputs, and inline runner declarations.

## Categories

RAYMARCH · SDF · FRACTAL · NOISE · FLOW · PATTERN · TILING · TRUCHET · COLOR · LIGHT · WATER · FIRE · SMOKE · SPACE · GEOMETRY · GLITCH · MOIRE · WARP · CELLULAR · MINIMAL

Each category contains 10 works. The implementation and quality ledgers are documented in [`docs/PROGRESS.md`](docs/PROGRESS.md) and [`docs/QUALITY_AUDIT.md`](docs/QUALITY_AUDIT.md).

## Develop

```bash
bun install
bun run dev             # gallery at http://localhost:5173/glsl/
bun run lint:registry   # file pairs, metadata, authoring contract, 20 × 10 inventory
bun run audit:shaders   # WebGL compile, blank, motion, and near-duplicate gates
bun run typecheck
bun run build
bun run thumbs          # render all 200 deterministic thumbnails
bun run audit:contacts  # build 20 labeled category contact sheets
bun run test:e2e        # product shell, live editor, and 200-shader alive checks
bun run deploy          # copy the production site to the adxdeck /glsl target
```

## Add a shader

Create one matching pair:

```text
shaders/<category>/<ID>_<slug>.meta.ts
shaders/<category>/<ID>_<slug>.frag
```

Metadata is loaded eagerly for gallery discovery. Fragment source and raw editor text are loaded lazily when a preview or detail view needs them. See [`docs/AUTHORING.md`](docs/AUTHORING.md) for the complete palette, syntax, motion, and thumbnail contract.

## Architecture

- Vanilla TypeScript + Vite
- Dependency-free WebGL2 full-screen-triangle runner
- Hash routing for gallery, detail, ABOUT, and chromeless preview harnesses
- Shared Ink + Cyan + Orange DEXA palette supplied as uniforms
- Lazy shader/source modules with a three-context gallery runtime budget
- Playwright thumbnail, live-edit, and alive-render gates
- Static deployment at the `/glsl/` base path

## Docs

- [`docs/SPEC.md`](docs/SPEC.md) — product architecture, runtime contract, routes, and deployment
- [`docs/AUTHORING.md`](docs/AUTHORING.md) — shader and metadata authoring contract
- [`docs/PROGRESS.md`](docs/PROGRESS.md) — 200-work implementation and delivery ledger
- [`docs/QUALITY_AUDIT.md`](docs/QUALITY_AUDIT.md) — automated thresholds, visual review, and corrected regressions

Accepted through registry lint, WebGL compilation and duplicate gates for all 200 shaders, TypeScript, production build, 200 thumbnails, 20 category contact sheets, and 203 Playwright checks.
