# QUALITY AUDIT — 200 SHADERS

감사일: 2026-08-02
범위: `shaders/`의 `.frag` 200개와 `.meta.ts` 200개, `public/thumbs/` 200장.

## 판정 방법

`scripts/audit-shaders.mjs`가 모든 작가 소스를 실제 러너 프렐류드와 결합해 WebGL2로 컴파일하고, seed 7의 `iTime=3.0` 및 `3.6` 프레임을 256×256에서 렌더한다.

- 스틸 luminance MAD `< 0.8`: blank 실패.
- 두 프레임 motion MAE `< 0.05`: frozen 실패.
- 스틸 쌍 raw MAE `< 1.0`이면서 상관계수 `> 0.995`: 근접 동일 이미지 실패.
- 주석·숫자 리터럴을 정규화한 5-token shingle Jaccard `>= 0.82`: 단순 파라미터 변형 실패.
- 통과 후 `scripts/contact-sheets.mjs`로 카테고리별 5×2 접촉 시트 20장을 생성해 구도·실루엣·팔레트·카테고리 내 차별성을 직접 확인했다.

## 전수 결과

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

## 근접쌍 검토

- 최고 스틸 상관쌍 `FI01/SM01`: `r=0.9109`, `MAE=14.14`. 세로 plume 실루엣은 공유하지만 FI01은 단일 화염 taper와 heat ramp, SM01은 domain-warped fBm 밀도장으로 구조·명도·운동이 다르다.
- `LT08/SM01`: `r=0.8715`, `MAE=20.09`. 촛불 오브젝트와 난류 연기 기둥으로 직접 시각 구분된다.
- `CL08/RM07`: `r=0.8080`, `MAE=20.91`. 원형 색상 sweep과 3D 사막 raymarch로 알고리즘·공간성이 다르다.
- 최고 코드 유사쌍 `FR02/FR05`: Jaccard `0.587`. escape-time 골격은 공유하지만 Mandelbrot와 Burning Ship 변환, 카메라, 색상 결과가 다르며 실패 기준 `0.82`보다 충분히 낮다.

따라서 근접 중복 또는 숫자만 바꾼 변형으로 반려할 쌍은 없다.

## 감사 중 발견·교정한 결함

- `MN09`: GLSL 예약어 `active`를 사용해 컴파일 실패 → `activation`으로 교정.
- `WT03`: 기존 caustic 식이 3초 스틸을 거의 균일하게 포화 → 유한한 folded-sine ridge와 넓은 grout 대비로 교정.
- `MN07`: 0.6초 motion MAE가 `0.049`로 문턱 미달 → fold와 shadow 위상 이동을 강화.
- `GE08`: 반경 정규화가 superformula 변화를 상쇄해 frozen → 범위 보존 clamp로 교정.
- `FR03`: 자동 gate는 통과했지만 접촉 시트에서 백색 클리핑 확인 → additive 합성을 단계적 palette mix로 교정하고 재감사.

최종 `bun run audit:shaders`, 썸네일 재생성, 접촉 시트 재확인, E2E 203개를 모두 교정 이후 다시 실행했다.
