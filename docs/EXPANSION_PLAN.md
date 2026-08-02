# EXPANSION PLAN — 500 SHADERS

상태: **구현·전수 검증 완료** (2026-08-02). 최종 전달 커밋·배포 증거는 `docs/PROGRESS.md`에 기록한다.

목표: 기존 20개 카테고리·200종을 변경 없이 보존하고, 신규 30개 카테고리·300종을 추가해 **Core 350 + Buffer 100 + Input 50 = 500종**을 완성한다.

## 제품 원칙

- 기존 200종의 ID, 파일, 출력, 썸네일은 회귀시키지 않는다.
- 각 카테고리는 10종을 유지한다. 기존 카테고리를 25종으로 늘리지 않고 새로운 알고리즘 영역을 10종 단위로 분리한다.
- 연구 사례는 알고리즘 범위와 검증 기준에만 사용하고 외부 셰이더 코드를 복사하지 않는다.
- 모든 작품은 작가가 읽고 편집할 수 있는 GLSL 소스를 제공한다.
- `core`, `buffer`, `input`을 UI와 메타데이터에서 명시해 단일 패스와 상태·입력 기반 작품을 혼동하지 않는다.

## 카탈로그 구조

### Core +150

| prefix | category | 차별 축 |
|---|---|---|
| CX | complex | 복소함수 domain coloring, conformal map, root/pole field |
| CV | curve | Bézier, spline, clothoid, roulette, curve distance |
| PL | plot | implicit/parametric plot, phase portrait, scalar graph |
| OP | optics | Fresnel, refraction, diffraction, interference, thin film |
| MT | material | BRDF, anisotropy, subsurface approximation, procedural surface |
| TE | terrain | height field, strata, canyon, cave, contour relief |
| AT | atmosphere | sky scattering, cloud layers, weather, aurora volume |
| VL | volume | density integration, isosurface, transfer function, tomography |
| AR | architecture | façade, arcade, vault, stair, corridor, city grammar |
| OR | organic | phyllotaxis, shell, tissue, membrane, branching morphology |
| TY | typography | vector glyph, segment display, plotter stroke, kinetic type |
| CM | cartography | projection, contour, route, grid, topographic symbol |
| PR | particle | analytic orbit, ballistic trail, attractor, emitter field |
| MC | mechanism | cam, escapement, gear train, linkage, pendulum system |
| TP | topology | knot, braid, manifold chart, hyperbolic disk, linked field |

### Buffer +100

| prefix | category | 차별 축 |
|---|---|---|
| AU | automata | Life 계열, cyclic/excitable/lattice automata |
| RX | reaction | 서로 다른 reaction–diffusion 계와 kinetics |
| FD | fluid | advection, pressure, vorticity, buoyancy, obstacle flow |
| WS | wave-sim | wave equation, membrane, ripple, spring lattice |
| GR | growth | DLA, Eden, slime trail, branching, crystal deposition |
| SW | swarm | boid, particle-life, chemotaxis, force/agent field |
| ER | erosion | hydraulic, thermal, aeolian, sediment transport |
| FB | feedback | temporal echo, slit scan, recursive transform, trail feedback |
| PG | progressive | accumulation, Monte Carlo integration, path-like refinement |
| DP | digital-paint | pigment transport, wet edge, brush deposition, paper soak |

### Input +50

| prefix | category | 입력 계약 |
|---|---|---|
| KC | convolution | 고정 이미지 fixture + kernel/filter sampling |
| VS | vision | 고정 camera-chart fixture + detection/measurement |
| CP | compositing | image + mask/second input + blend/color pipeline |
| EV | environment | deterministic equirectangular environment input |
| AD | audio | deterministic waveform/spectrum data texture |

## 런타임 계약

- `core`: 기존 `mainImage` 단일 패스. texture channel 금지.
- `buffer`: 같은 작가 소스에 `mainBuffer`와 `mainImage`를 둔다. WebGL2 RGBA8 ping-pong framebuffer가 이전 state를 `iChannel0`으로 제공한다.
- `input`: `mainImage`가 `iChannel0`/`iChannel1`의 결정적 내장 fixture를 읽는다. fixture 종류는 category config가 소유한다.
- 공통 추가 uniform: `iTimeDelta`, `iChannelResolution[2]`.
- 썸네일은 core는 기존 `iTime=3.0`, buffer는 고정 step warm-up, input은 고정 시간·fixture로 재현한다.

## UI 정보 구조

50개 카테고리를 다섯 상위 domain으로 묶는다.

- FORM: 수학적 형태·곡선·패턴·타이포그래피
- FIELD: 노이즈·흐름·색·광학·재료·좌표장
- WORLD: 지형·대기·볼륨·자연·공간·건축
- SIM: buffer 기반 상태·시간 시뮬레이션
- MEDIA: 이미지·비전·합성·환경·오디오 입력

## 실행 wave

1. W0 — catalog config, metadata, lint, runner, deterministic fixture, 실패 회귀 테스트.
2. W1 — Core CX–MT 50종.
3. W2 — Core TE–OR 50종.
4. W3 — Core TY–TP 50종.
5. W4 — Buffer AU–GR 50종.
6. W5 — Buffer SW–DP 50종.
7. W6 — Input KC–AD 50종.
8. W7 — 500 thumbnails, 50 contact sheets, all-pairs duplicate audit, E2E 503+, docs, deploy.

각 wave는 registry lint, 실제 WebGL compile/render, blank/frozen, 코드 근접복제, 카테고리 접촉 시트 검토를 통과해야 다음 wave로 넘어간다.

## 최종 acceptance

- 정확히 500 `.frag` + 500 `.meta.ts`, 50 categories × 10.
- Core 350 / Buffer 100 / Input 50 계수 일치.
- 500종 WebGL2 compile/link/render, blank/frozen 0.
- 124,750개 전체 시각 쌍 및 코드 유사도 hard gate 통과.
- buffer/input 결정성 재실행 hash 일치.
- thumbnail 500장, 0-byte 0, contact sheet 50장 직접 감사.
- typecheck/build PASS, Playwright product/live-edit + 500 alive PASS.
- README, SPEC, AUTHORING, PROGRESS, QUALITY_AUDIT와 AKM devlog 정합성.
- 승인된 source/adxdeck commit·push와 `https://dexa.art/glsl/` 공개 브라우저 검증.

## 조사 기준선

- The Book of Shaders: image processing, convolution, ping-pong, Conway, ripple, reaction diffusion, normal/bump/environment mapping.
- Khronos ShaderToy WebGL2 BOF: `texelFetch`, render-to-texture, simulation state와 multi-pass.
- WebGL2 Fundamentals: framebuffer render-to-texture, image processing, GPGPU texture state.
- NVIDIA GPU Gems: fluid simulation, volume rendering, procedural terrain/water/light transport.
