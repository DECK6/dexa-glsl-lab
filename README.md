# DEXA GLSL LAB

**500 differentiated GLSL works** in a live WebGL2 catalog with an in-browser editor.

**Live:** https://dexa.art/glsl/

<p align="center">
  <img src="https://dexa.art/glsl/thumbs/CA01.jpg" alt="Voronoi Flow" width="32%">
  <img src="https://dexa.art/glsl/thumbs/FR03.jpg" alt="Kali Weave" width="32%">
  <img src="https://dexa.art/glsl/thumbs/RM01.jpg" alt="Orbit Torus" width="32%">
</p>

## What it is

DEXA GLSL LAB is a browser-based catalog for watching, studying, and editing fragment shaders. Every work is animated, seed-aware, palette-controlled, and presented with its complete author source.

- **500 shaders** — Core 350 + Buffer 100 + Input 50, organized as 50 categories with 10 distinct works each
- **Live gallery** — filter by domain, runtime tier, or category; search by ID/title/tag; preview on hover or keyboard focus
- **Workbench detail** — regenerate the seed, navigate related works, copy the source, and watch edits recompile after a 350 ms debounce
- **Resilient live editing** — compile errors report author-source line numbers while the last valid program keeps rendering
- **Three runtime tiers** — single-pass Core, stateful ping-pong Buffer, and deterministic texture-driven Input
- **Deterministic captures** — fixed seed, fixtures, palette, viewport, and a 90-frame Buffer warm-up make audits reproducible
- **Drop-in registry** — add a matching metadata/fragment pair and Vite discovers it without a central manifest

## Shader contract

Every `.frag` contains a Shadertoy-style image entry point:

```glsl
void mainImage(out vec4 fragColor, in vec2 fragCoord)
```

The WebGL2 runner owns the version, precision, uniforms, output, and final `main()`. Author shaders use runner-provided values without redeclaring them:

| input | type | purpose |
|---|---|---|
| `iResolution` | `vec3` | square canvas resolution in pixels |
| `iTime` | `float` | elapsed animation time |
| `iTimeDelta` | `float` | frame delta for stateful simulation |
| `iMouse` | `vec4` | pointer and last-click coordinates |
| `iFrame` | `int` | frame counter |
| `uSeed` | `float` | deterministic variation seed |
| `uColBg` … `uColDim` | `vec3` | central DEXA palette uniforms |
| `iChannel0/1` | `sampler2D` | Buffer state or deterministic Input fixtures |
| `iChannelResolution` | `vec3[2]` | channel dimensions |

Buffer works additionally provide `mainBuffer(out vec4, in vec2)`; the runner advances two RGBA8 state textures before `mainImage`. Input works sample deterministic image, camera, composite, environment, or audio fixtures. Registry lint enforces the tier-specific channel contract, animation, palette use, exact metadata pairs, and each category's `01..10` range.

## Categories

| domain | categories |
|---|---|
| FORM | SDF, Pattern, Tiling, Truchet, Geometry, Minimal, Curve, Plot, Typography, Mechanism, Topology |
| FIELD | Fractal, Noise, Flow, Color, Moire, Warp, Cellular, Complex, Optics, Material, Particle |
| WORLD | Raymarch, Light, Water, Fire, Smoke, Space, Terrain, Atmosphere, Volume, Architecture, Organic, Cartography |
| SIM | Automata, Reaction, Fluid, Wave Sim, Growth, Swarm, Erosion, Feedback, Progressive, Digital Paint |
| MEDIA | Glitch, Convolution, Vision, Compositing, Environment, Audio |

Each category contains 10 works. The implementation and quality ledgers are documented in [`docs/PROGRESS.md`](docs/PROGRESS.md) and [`docs/QUALITY_AUDIT.md`](docs/QUALITY_AUDIT.md).

## Develop

```bash
bun install
bun run dev             # gallery at http://localhost:5173/glsl/
bun run lint:registry   # file pairs, tier contract, and 50 × 10 inventory
bun run audit:shaders   # production runner, blank, motion, and near-duplicate gates
bun run typecheck
bun run build
bun run thumbs          # render all 500 deterministic thumbnails
bun run audit:contacts  # build 50 labeled category contact sheets
bun run test:e2e        # product shell, live editor, and 500-shader alive checks
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
- Dependency-free WebGL2 full-screen-triangle runner with ping-pong framebuffer state
- Hash routing for gallery, detail, ABOUT, and chromeless preview harnesses
- Generated deterministic fixtures for image, camera, composite, environment, and audio inputs
- Shared Ink + Cyan + Orange DEXA palette supplied as uniforms
- Lazy shader/source modules with a three-context gallery runtime budget
- Playwright thumbnail, live-edit, and alive-render gates
- Static deployment at the `/glsl/` base path

## Docs

- [`docs/SPEC.md`](docs/SPEC.md) — product architecture, runtime contract, routes, and deployment
- [`docs/AUTHORING.md`](docs/AUTHORING.md) — shader and metadata authoring contract
- [`docs/PROGRESS.md`](docs/PROGRESS.md) — 500-work implementation and delivery ledger
- [`docs/QUALITY_AUDIT.md`](docs/QUALITY_AUDIT.md) — automated thresholds, visual review, and corrected regressions

Accepted through strict registry lint, production-runner compile and duplicate gates for all 500 shaders, TypeScript, production build, 500 thumbnails, 50 category contact sheets, and 503 Playwright checks.
