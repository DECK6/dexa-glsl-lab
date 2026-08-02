# QUALITY AUDIT — 500 SHADERS

감사일: 2026-08-02
범위: `shaders/`의 `.frag` 500개와 `.meta.ts` 500개, `public/thumbs/` 500장, 카테고리 접촉 시트 50장.

## 판정 방법

`scripts/audit-runtime.mjs`가 production build의 실제 preview route를 열어 Core/Buffer/Input 전 tier를 production runner로 실행한다. Buffer는 ping-pong FBO, Input은 category별 결정적 fixture를 그대로 사용한다. 별도의 `audit:core`는 Core 350종을 author-source 직접 컴파일 경로로 교차 확인한다.

- 스틸 luminance MAD `< 0.8`: blank 실패.
- 두 live 프레임 motion MAE `< 0.02`: production-runner frozen 실패. Core 직접 감사는 3.0/3.6초 MAE `< 0.05` 실패.
- 스틸 쌍 raw MAE `< 1.0`이면서 상관계수 `> 0.995`: 근접 동일 이미지 실패.
- 주석·숫자 리터럴을 정규화한 5-token shingle Jaccard `>= 0.82`: 단순 파라미터 변형 실패.
- 통과 후 `scripts/contact-sheets.mjs`로 카테고리별 5×2 접촉 시트 50장을 생성하고 5개 오버뷰로 묶어 구도·실루엣·팔레트·카테고리 내 차별성을 직접 확인했다.

## 전수 결과

| runtime | 수량 | 검증한 고유 범위 | 판정 |
|---|---:|---|---|
| Core | 350 | 기존 단일 패스 200 + 수학/세계/표현 확장 150 | PASS |
| Buffer | 100 | 자동자, PDE 근사, 상태 피드백, 점진 누적, 안료 매질 | PASS |
| Input | 50 | 커널, 비전, 두 입력 합성, 환경 투영, 오디오 분석 | PASS |
| **전체** | **500** | runtime 3종, domain 5개, category 50개 | **PASS** |

### 신규 30개 카테고리

| 카테고리군 | 직접 확인한 차별 축 | 판정 |
|---|---|---|
| complex/curve/plot/optics/material | 복소 사상·곡선 패밀리·함수 플롯·회절/굴절·재질 미세구조 | PASS |
| terrain/atmosphere/volume/architecture/organic | 지형 형성과 층리·대기 현상·체적 절편·구축 구조·생체 성장 | PASS |
| typography/cartography/particle/mechanism/topology | 문자 골격·지도/등고선·입자계·기계 운동·매듭/매니폴드 | PASS |
| automata/reaction/fluid/wave-sim/growth | 이산 상태·반응식·수송/와류·파동 경계·누적 성장 | PASS |
| swarm/erosion/feedback/progressive/digital-paint | 집단장·퇴적/침식·재귀 영상·통계 수렴·수분/안료 | PASS |
| convolution/vision/compositing/environment/audio | 공간 커널·특징 분석·매트/블렌드·환경 재투영·주파수/파형 | PASS |

### 기존 Core 200

| 카테고리 | 수량 | 직접 확인한 차별 축 | 판정 |
|---|---:|---|---|
| raymarch | 10 | 토러스·자이로이드·구 군집·반사 상자·기둥·매듭·사막·캡슐·중공 큐브·메타볼 | PASS |
| sdf | 10 | 다각 모핑·동심환·별·soft union·육각·기어·파동띠·십자·꽃잎·윤곽 궤도 | PASS |
| fractal | 10 | Julia·Mandelbrot·Kali fold·tree IFS·Burning Ship·Sierpinski·orbit trap·Newton·Phoenix·Apollonian | PASS |
| noise | 10 | fBm·curl·ridge·marble·static·Worley·caustic·turbulence·contour·domain warp | PASS |
| flow | 10 | 벡터류·쌍와류·흡입 나선·전단층·curl ribbon·자력선·jet·swarm·wake·lava blob | PASS |
| pattern | 10 | 줄무늬·점행렬·직조·갈매기·동심박동·원근 체커·비늘·격자·로제트·다이아몬드 | PASS |
| tiling | 10 | 육각·삼각 flip·벽돌·pentagrid·pinwheel·rhombille·quadtree·Voronoi·herringbone·Penrose | PASS |
| truchet | 10 | 사분원·대각선·rope arc·육각망·직조·직교 switch·삼각 chain·나선·파동·회로 | PASS |
| color | 10 | gradient·palette cycle·duotone·heat·banding·glow·ink bleed·spectrum·dither·neon | PASS |
| light | 10 | god ray·spot·lens flare·soft shadow·orb·slice·laser grid·candle·aurora·strobe | PASS |
| water | 10 | ripple·swell·caustic floor·rain·under-light·interference·shore·drop·river·tide | PASS |
| fire | 10 | flame·ember·ring burn·candle array·wildfire·spark wheel·plasma·coal·whirl·afterburner | PASS |
| smoke | 10 | plume·fog·incense·cloud shear·vortex·dust·breath·rings·chimneys·ink dispersion | PASS |
| space | 10 | starfield·nebula·galaxy·planet·black hole·comet·ring world·pulsar·asteroid·solar flare | PASS |
| geometry | 10 | wire cube·triangle fan·polygon SDF·fold·compass·linkage·prism·superformula·tunnel·graph | PASS |
| glitch | 10 | scan tear·block shift·RGB split·sync loss·datamosh·pixel sort·CRT·tile corruption·bitplane·tape | PASS |
| moire | 10 | ring·line·radial·grid·curve·dot·twist·zoom·wave lattice·spiral 간섭 | PASS |
| warp | 10 | lens·twist·ripple·mirror fold·melt·barrel·sine bands·kaleido·pinch·rubber sheet | PASS |
| cellular | 10 | Voronoi flow·division·bubble·crystal·mosaic·organic net·crack·vein·coral·honeycomb | PASS |
| minimal | 10 | breath line·dot·orbit·edge·gradient·metronome·corner fold·quiet grid·signal·horizon | PASS |

## 기존 Core 200 근접쌍 검토

- 최고 스틸 상관쌍 `FI01/SM01`: `r=0.9109`, `MAE=14.14`. 세로 plume 실루엣은 공유하지만 FI01은 단일 화염 taper와 heat ramp, SM01은 domain-warped fBm 밀도장으로 구조·명도·운동이 다르다.
- `LT08/SM01`: `r=0.8715`, `MAE=20.09`. 촛불 오브젝트와 난류 연기 기둥으로 직접 시각 구분된다.
- `CL08/RM07`: `r=0.8080`, `MAE=20.91`. 원형 색상 sweep과 3D 사막 raymarch로 알고리즘·공간성이 다르다.
- 최고 코드 유사쌍 `FR02/FR05`: Jaccard `0.587`. escape-time 골격은 공유하지만 Mandelbrot와 Burning Ship 변환, 카메라, 색상 결과가 다르며 실패 기준 `0.82`보다 충분히 낮다.

따라서 근접 중복 또는 숫자만 바꾼 변형으로 반려할 쌍은 없다.

## 500 production-runner 근접쌍 검토

- 최고 시각 상관쌍 `KC02/KC06`: `r=0.9463`, `MAE=4.59`. 같은 image fixture를 쓰지만 KC02는 9탭 box 평균, KC06은 원본-블러 차분을 되더하는 unsharp mask로 커널과 결과 경계가 다르다.
- `KC08/KC09`: `r=0.9280`, `MAE=3.36`. edge-aware bilateral 가중 평균과 RGB별 오프셋 chromatic kernel로 알고리즘이 분리된다.
- `EV01/EV10`: `r=0.9216`, `MAE=43.49`. 위도 재투영과 filmic tone mapping이며 큰 절대 오차로 직접 구분된다.
- 최고 코드 유사쌍 `CP02/CP03`: Jaccard `0.716`. chroma-distance matte와 luminance matte로 핵심 키 함수가 다르고 실패 기준 `0.82` 아래다.
- 500종 전체에서 raw MAE `<1.0` + 상관계수 `>0.995`인 근접 동일 출력과 Jaccard `>=0.82`인 단순 파라미터 변형은 0건이다.

## 감사 중 발견·교정한 결함

- `MN09`: GLSL 예약어 `active`를 사용해 컴파일 실패 → `activation`으로 교정.
- `WT03`: 기존 caustic 식이 3초 스틸을 거의 균일하게 포화 → 유한한 folded-sine ridge와 넓은 grout 대비로 교정.
- `MN07`: 0.6초 motion MAE가 `0.049`로 문턱 미달 → fold와 shadow 위상 이동을 강화.
- `GE08`: 반경 정규화가 superformula 변화를 상쇄해 frozen → 범위 보존 clamp로 교정.
- `FR03`: 자동 gate는 통과했지만 접촉 시트에서 백색 클리핑 확인 → additive 합성을 단계적 palette mix로 교정하고 재감사.
- `PR08`: 잘못된 `*.vec2` 문법을 발견해 벡터 곱으로 교정.
- `OR02`, `VL09`, `CM08`, `TY01/02/08`, `VL08`: 신규 Core 감사에서 blank/frozen 판정 → source field가 실제 화면 좌표와 시간 위상에 반영되도록 구도 교정.
- `RX01/02/04/05/07/10`: 반응장이 균일 수렴해 contact 대비가 약함 → 각 반응의 구조 scaffold를 추가하되 상태식은 유지.
- `RX03`: 90-frame thumbnail에서 균일 수렴 → excitable wavefront 표시를 추가.
- `RX09`: GLSL 예약어 `active`/`interface`와 균일 wave-pinning 출력 → 안전한 식별자와 공간 극성 경계로 교정.
- `DP08`, `ER02`, `ER04`, `WS01`: blank/frozen 또는 약한 스틸 → 용제 전선·talus scan·퇴적 fan·막 파동 ring을 강화.
- Environment/Vison/Growth 접촉 시트: 자동 hard gate는 통과했으나 fixture 지배 또는 성장 부족 확인 → EV04/05/07/09, VS04/08, GR02/03/07을 알고리즘 고유 실루엣으로 재구성.

최종 `bun run audit:core`, `bun run audit:shaders`, 썸네일 500장 재생성, 접촉 시트 50장 재확인, E2E **503개**를 모두 교정 이후 다시 실행했다.
