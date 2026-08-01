# DEXA GLSL LAB — SPEC

순수 GLSL 프래그먼트 셰이더 200종 라이브 카탈로그. dexa.art/glsl 에 배포되며,
dexa-vfx-lab / dexa-gen-lab 과 같은 DEXA 셸(라이트 헤더, 필터 레일, 계기판 카드,
워크벤치 상세뷰)을 공유한다.

## §1 제품

- 갤러리: 20 카테고리 필터 + ID/제목/태그 검색, 호버/포커스 시에만 라이브 실행 (동시 3개)
- 상세: 640×640 라이브 스테이지 + 시드 재생성 + **라이브 코드 편집** (핵심 차별점)
- 어바웃: KO/EN 토글, GitHub 링크

## §2 런타임

- WebGL2, 풀스크린 트라이앵글(gl_VertexID, 버퍼 없음), 의존성 제로
- 캔버스는 항상 정사각 1:1 논리 픽셀, CSS로 슬롯에 맞춤
- `preserveDrawingBuffer: true` — 썸네일/E2E 캔버스 리드백용

## §3 셰이더 계약 (Shadertoy 스타일)

`.frag` 파일은 헬퍼 + `mainImage(out vec4, in vec2)` 만 담는다. 러너가 프렐류드
(버전/정밀도/유니폼/out)와 `main()`을 소유한다. `#line 1` 지시자로 컴파일 에러의
라인 번호가 작가 소스 기준이 된다.

러너 제공 유니폼:

| uniform | type | 의미 |
|---|---|---|
| iResolution | vec3 | 캔버스 해상도 (px, z=1) |
| iTime | float | 경과 시간 (초) |
| iMouse | vec4 | xy=현재(px, y위로+), zw=마지막 클릭 |
| iFrame | int | 프레임 카운터 |
| uSeed | float | 시드 (REGENERATE로 변경) |
| uColBg/uColInk/uColSignal/uColAccent/uColPaper/uColDim | vec3 | DEXA 팔레트 |

결정성: 같은 (iTime, uSeed) → 같은 프레임. 썸네일/스틸은 iTime=3.0, iFrame=90 고정.

## §4 레지스트리

`shaders/<category>/<ID>_<slug>.frag` + `<ID>_<slug>.meta.ts` 쌍 드롭인.
Vite `import.meta.glob` 자동 발견 — 중앙 매니페스트 없음.

카테고리(20) × 10종 = 200. ID = 프리픽스 + 01..10:

RM raymarch · SD sdf · FR fractal · NS noise · FL flow · PT pattern · TL tiling ·
TR truchet · CL color · LT light · WT water · FI fire · SM smoke · SP space ·
GE geometry · GL glitch · MO moire · WP warp · CA cellular · MN minimal

린트(`scripts/lint-registry.mjs`)가 빌드를 게이트한다:
쌍 불일치 / 중복·불일치 ID / 프리픽스-카테고리 불일치 / meta 필드 불일치,
`.frag` 계약 — mainImage 필수, iTime 참조 필수(정지 금지), uCol* 팔레트 사용 필수,
`#version`·`precision`·`uniform`·전역 `out`·`gl_FragColor`·`iChannel`·`texture()` 금지.

## §5 라우트

`#/` 갤러리 · `#/s/:id` 상세 · `#/about` 어바웃 · `#/p/:id?seed&size&thumb=1` 크롬리스
프리뷰 하네스(썸네일·E2E 전용, `__SHADER_READY__` 신호).

## §6 팔레트

`src/palette.ts` 가 단일 소스. 셰이더는 uCol* 유니폼으로만 색을 받는다.

## §7 라이브 편집

소스 패널 = textarea 에디터. 350ms 디바운스 재컴파일, 실패 시 이전 프로그램 유지 +
라인 번호 에러 배너, 성공 시 상태 칩 LIVE / LIVE — EDITED. RESET 으로 원본 복원.

## §8 검증

- `bun run build` = lint + tsc + vite build
- `bun run thumbs` = dist 프리뷰 서버에서 200장 스틸 렌더, 블랭크(MAD<0.8) 실패 처리
- `bun run test:e2e` = 셸 스모크 + 라이브 편집 + 전수 alive(논블랭크 + 프레임 변화)

## §9 배포

`bun run deploy` → dist + thumbs 를 `/Volumes/data/Dev/adxdeck-dexa-daily-main/glsl` 로
복사. git 커밋/푸시는 별도 명시 단계.
