# PROGRESS — 500종 집필·검증 원장

구조: **Core 350 + Buffer 100 + Input 50 = 500**. 50개 카테고리마다 정확히 10종이다.
게이트: `bun run lint:registry && bun run audit:shaders && bun run build && bun run thumbs && bun run audit:contacts && bun run test:e2e`.

## 500 카탈로그 원장

| runtime | 카테고리 | 수량 | 상태 |
|---|---|---:|---|
| Core | 기존 20 + complex/curve/plot/optics/material/terrain/atmosphere/volume/architecture/organic/typography/cartography/particle/mechanism/topology | 350 | 35 × 10 완료 |
| Buffer | automata/reaction/fluid/wave-sim/growth/swarm/erosion/feedback/progressive/digital-paint | 100 | 10 × 10 완료 |
| Input | convolution/vision/compositing/environment/audio | 50 | 5 × 10 완료 |
| **합계** | **50 카테고리** | **500** | **500 meta / 500 frag** |

### 신규 300 상세 원장

| 범위 | 카테고리 | 상태 | 차별 축 |
|---|---|---|---|
| CX–MT | complex, curve, plot, optics, material | 50/50 | 복소 사상·곡선 구성·함수 도식·파동 광학·표면 반응 |
| TE–OR | terrain, atmosphere, volume, architecture, organic | 50/50 | 지형·대기층·밀도장·공간 구조·생체 형태 |
| TY–TP | typography, cartography, particle, mechanism, topology | 50/50 | 활자 구조·지도 투영·입자 궤적·기구학·위상 불변량 |
| AU–DP | 10개 Buffer 카테고리 | 100/100 | 자동자·반응확산·유체·파동·성장·군집·침식·피드백·누적·안료 |
| KC–AD | 5개 Input 카테고리 | 50/50 | 커널·비전·합성·환경 투영·오디오 분석 |

## 기존 Core 200 보존 원장

| 카테고리 | 프리픽스 | 상태 | 비고 |
|---|---|---|---|
| raymarch | RM | 10/10 | 3D 거리장·재질·카메라 구도 전수 감사 통과 |
| sdf | SD | 10/10 | 기준 커밋 수록분, 전수 재감사 통과 |
| fractal | FR | 10/10 | escape-time·fold·IFS 계열 분리, FR03 노출 교정 |
| noise | NS | 10/10 | fBm·curl·ridge·Worley·domain warp 계열 분리 |
| flow | FL | 10/10 | streamline·vortex·shear·plume·wake 계열 분리 |
| pattern | PT | 10/10 | stripe·dot·weave·chevron·rosette 계열 분리 |
| tiling | TL | 10/10 | 기존 10개 셰이더 보존, 누락 메타 10개 복원 |
| truchet | TR | 10/10 | 기존 5개 보존, 삼각·나선·파동·회로 타일 확장 |
| color | CL | 10/10 | gradient·duotone·quantize·dither·neon 계열 분리 |
| light | LT | 10/10 | ray·spot·flare·shadow·volumetric 계열 분리 |
| water | WT | 10/10 | ripple·swell·caustic·rain·shore 계열 분리 |
| fire | FI | 10/10 | 화염·불씨·연소환·플라스마·제트 등 8종 보완 |
| smoke | SM | 10/10 | plume·fog·thread·shear·ring·chimney·ink 계열 분리 |
| space | SP | 10/10 | star·nebula·galaxy·planet·black-hole 계열 분리 |
| geometry | GE | 10/10 | 투영·다각형·접기·기구학·초공식·그래프 신규 완성 |
| glitch | GL | 10/10 | digital·analog·CRT·datamosh·bitplane·tape 계열 분리 |
| moire | MO | 10/10 | line·dot·radial·twist·zoom 간섭 계열 분리 |
| warp | WP | 10/10 | bulge·twist·ripple·fold·pinch·elastic 계열 분리 |
| cellular | CA | 10/10 | Voronoi·bubble·crystal·mosaic·vein 계열 분리 |
| minimal | MN | 10/10 | 선·점·궤도·모서리·메트로놈 등 절제 구도 분리 |

기존 범위 합계: **200/200** — 20개 카테고리 × 각 10종. 전체 합계는 **500/500**.

## 2026-08-02 기존 200 기준선 감사 증거

- `bun run lint:registry` — `OK (200 meta / 200 frag)`.
- `bun run audit:shaders` — 200종 GLSL 실컴파일·256×256 렌더, 20개 카테고리 각 10종, blank/frozen/근접복제 hard gate 통과.
- `bun run typecheck` — 종료 코드 0.
- `bun run build` — registry lint + TypeScript + Vite, 415 modules transformed, 종료 코드 0.
- `bun run thumbs` — `OK (200 stills → public/thumbs)`; 0-byte 파일 0개.
- `bun run audit:contacts` — 20개 카테고리 접촉 시트 생성 후 200장 직접 시각 감사 통과.
- `bun run test:e2e -- --reporter=dot` — 셸·라이브 편집·200종 alive 전수, **203 passed (3.7m)**.

세부 감사 기준·근접쌍 판정·교정 내역은 `docs/QUALITY_AUDIT.md`에 기록한다.

## 2026-08-02 500 확장 최종 감사 증거

- `bun run lint:registry` — `OK (500 meta / 500 frag)`; 50개 category 모두 10/10.
- `bun run test:unit` — catalog/runtime contract **8 passed**, 27 assertions.
- `bun run audit:core` — Core 350종 직접 WebGL 컴파일·비공백·모션·중복 hard gate 통과.
- `bun run audit:shaders` — production runner에서 **500종** 실행, runtime `core:350 buffer:100 input:50`, 50개 category 각 10종, 실패 0.
- `bun run typecheck && bun run build` — TypeScript 종료 코드 0, Vite **1017 modules transformed**, production build 성공.
- `bun run thumbs` — `OK (500 stills → public/thumbs)`; JPG 500개, 0-byte 0개.
- `bun run audit:contacts` — `OK (50 sheets)`; 5개 오버뷰와 교정 대상 contact sheet를 직접 눈검사.
- `bun run test:e2e -- --reporter=dot` — 제품 셸·필터·라이브 편집·500종 alive 전수, **503 passed (8.5m)**.
- 기존 미추적 `.check-pattern.mjs`, `.thumb-pattern.mjs`는 조사·수정·삭제·커밋 대상에서 제외했다.

## 전달 경계

- 인계된 dirty worktree에 reset/checkout/삭제를 적용하지 않았고, 기존 셰이더를 먼저 전수 조사한 뒤 결손만 보완했다.
- 마스터의 별도 승인 후 카탈로그 소스를 `70b88d8` (`feat: complete 200-shader GLSL catalog`)로 커밋했다. 인계된 루트 임시 스크립트 `.check-pattern.mjs`와 `.thumb-pattern.mjs`는 수정·삭제하지 않고 커밋에서도 제외했다.
- `bun run deploy`로 `/Volumes/data/Dev/adxdeck-dexa-daily-main/glsl`에 신규 배포했다. 배포본은 403개 파일, 셰이더 청크 200개, 썸네일 200개, 0-byte 0개이며 source `dist/`와 SHA-256 전수 일치한다.
- 배포본을 직접 정적 서버로 실행한 Aside 브라우저 감사에서 카드 200개, 썸네일 200개, console/page/network error 0개와 CA01 WebGL 상세 렌더를 확인했다.
- 마스터의 추가 승인에 따라 공개 소스 저장소 [`DECK6/dexa-glsl-lab`](https://github.com/DECK6/dexa-glsl-lab)을 생성하고 `master`를 push했다. 카탈로그 `70b88d8`, 배포 원장 `7432495`, GEN/VFX LAB 형식을 따른 README `c26805e`가 원격에 반영됐다.
- adxdeck에는 `47d2c4b` (`feat: publish DEXA GLSL LAB`)로 `glsl/` 403개 파일만 격리 커밋·push했다. GitHub Pages run `30728923245`의 build/deploy/report-build-status가 모두 성공했다.
- 공개 [`https://dexa.art/glsl/`](https://dexa.art/glsl/)과 대표 썸네일·해시 자산의 HTTP 200을 확인했다. 공개 페이지를 새로 연 Aside 브라우저 감사에서도 카드 200개, 썸네일 200개, console/page/network error 0개와 CA01 696×696 WebGL·라이브 편집 UI를 확인했다.

### 500 확장 전달 기록

- 마스터가 확정한 **Core 350 + Buffer 100 + Input 50** 구조로 50개 카테고리·500종을 완성했다. 기존 200종은 보존했고 신규 300종과 3단계 런타임 계약을 추가했다.
- 공개 소스 저장소 `DECK6/dexa-glsl-lab`의 `master`에 `55462b1` (`feat: expand GLSL catalog to 500 works`)을 push했다. 원격 `master` SHA는 `55462b164b38ba41d90824b0e9b17440f5454922`와 일치한다.
- 공유 작업 트리와 격리한 새 clone에서 빌드 산출물과 `glsl/`을 전수 비교한 뒤, `DECK6/adxdeck`의 `07a544f` (`feat: publish 500-work GLSL LAB`)로 `glsl/`만 push했다. 배포본은 1,003개 파일, 썸네일 500개, 0-byte 0개이며 로컬 `dist/`와 byte-for-byte 일치한다.
- GitHub Pages run [`30731651509`](https://github.com/DECK6/adxdeck/actions/runs/30731651509)의 build·report-build-status·deploy가 모두 성공했다.
- 공개 [`https://dexa.art/glsl/`](https://dexa.art/glsl/)과 신규 `AD01` 썸네일이 HTTP 200이다. Aside 실서비스 감사에서 전체 `500 / 500`, 런타임 필터 `350 / 100 / 50`, 카테고리별 10종, Buffer `AU01`, Input `AD01`, 신규 Core `AR01`의 696×696 WebGL 렌더·상세 소스 편집기·관련 작품, 한/영 About의 500종 문구를 확인했다.
- 인계된 `.check-pattern.mjs`, `.thumb-pattern.mjs`는 수정·삭제·stage·commit하지 않고 계속 보존한다.
