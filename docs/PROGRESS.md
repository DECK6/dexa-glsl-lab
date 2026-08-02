# PROGRESS — 200종 집필 원장

게이트: `bun run lint:registry && bun run audit:shaders && bun run build`.
전체 완료 후 썸네일 200장, 카테고리 접촉 시트, E2E 전수를 최종 감사한다.

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

합계: **200/200** — 20개 카테고리 × 각 10종.

## 2026-08-02 최종 감사 증거

- `bun run lint:registry` — `OK (200 meta / 200 frag)`.
- `bun run audit:shaders` — 200종 GLSL 실컴파일·256×256 렌더, 20개 카테고리 각 10종, blank/frozen/근접복제 hard gate 통과.
- `bun run typecheck` — 종료 코드 0.
- `bun run build` — registry lint + TypeScript + Vite, 415 modules transformed, 종료 코드 0.
- `bun run thumbs` — `OK (200 stills → public/thumbs)`; 0-byte 파일 0개.
- `bun run audit:contacts` — 20개 카테고리 접촉 시트 생성 후 200장 직접 시각 감사 통과.
- `bun run test:e2e -- --reporter=dot` — 셸·라이브 편집·200종 alive 전수, **203 passed (3.7m)**.

세부 감사 기준·근접쌍 판정·교정 내역은 `docs/QUALITY_AUDIT.md`에 기록한다.

## 전달 경계

- 인계된 dirty worktree에 reset/checkout/삭제를 적용하지 않았고, 기존 셰이더를 먼저 전수 조사한 뒤 결손만 보완했다.
- 마스터의 별도 승인 후 카탈로그 소스를 `70b88d8` (`feat: complete 200-shader GLSL catalog`)로 커밋했다. 인계된 루트 임시 스크립트 `.check-pattern.mjs`와 `.thumb-pattern.mjs`는 수정·삭제하지 않고 커밋에서도 제외했다.
- `bun run deploy`로 `/Volumes/data/Dev/adxdeck-dexa-daily-main/glsl`에 신규 배포했다. 배포본은 403개 파일, 셰이더 청크 200개, 썸네일 200개, 0-byte 0개이며 source `dist/`와 SHA-256 전수 일치한다.
- 배포본을 직접 정적 서버로 실행한 Aside 브라우저 감사에서 카드 200개, 썸네일 200개, console/page/network error 0개와 CA01 WebGL 상세 렌더를 확인했다.
- 소스 저장소에는 Git remote가 없으며, 승인 범위에 포함되지 않은 source push와 adxdeck commit/push는 실행하지 않았다.
