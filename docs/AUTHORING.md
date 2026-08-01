# 셰이더 집필 계약 (AUTHORING)

리포: `/Volumes/data/Dev/dexa-glsl-lab`. 작품 = `shaders/<category>/<ID>_<slug>.frag` + `<ID>_<slug>.meta.ts` 한 쌍.

## .frag 규칙

- 내용: 헬퍼 함수 + `void mainImage(out vec4 fragColor, in vec2 fragCoord)` — 정확히 이 시그니처.
- 러너가 프렐류드를 소유한다. 다음을 **절대 쓰지 마라**: `#version`, `precision`, `uniform` 선언, 전역 `out` 선언, `gl_FragColor`, `iChannel*`, `texture(...)`.
- 사용 가능한 유니폼(선언 없이 그냥 사용): `iResolution`(vec3, px), `iTime`(float, 초), `iMouse`(vec4), `iFrame`(int), `uSeed`(float), 팔레트 `uColBg`/`uColInk`/`uColSignal`/`uColAccent`/`uColPaper`/`uColDim`(vec3).
- **필수**: `iTime` 사용(무한 애니메이션 — 멈추는 화면 금지), 팔레트 유니폼 `uCol*` 최소 1개 사용.
- 색은 오직 팔레트 유니폼 조합으로만. vec3 리터럴 색상 지양(밝기 스칼라 곱은 허용).
- `uSeed`를 해시/오프셋에 섞어 REGENERATE 시 변주가 보이면 가산점.
- GLSL ES 3.00 문법: `float`/`int` 암시 변환 없음(`1.0` vs `1`), 루프 인덱스는 상수 한계.

## 품질 게이트 (자동 검증에 걸리는 것)

- **iTime=3.0 고정 스틸이 썸네일**이다. 3초 시점에 화면이 거의 균일(블랭크)하면 실패 — 느린 페이드인 금지, 3초에 이미 뚜렷한 그림이 있어야 한다.
- 3초 이후에도 프레임이 계속 변해야 한다(frozen 검사).
- 640×640 정사각 기준. `fragCoord / iResolution.y` 계열로 종횡비 안전하게.
- 다크 배경(`uColBg`) 위 시안(`uColSignal`)·오렌지(`uColAccent`)·페이퍼(`uColPaper`) 발광이 DEXA 룩이다. 화면 대부분이 순수 배경색이면 밋밋해서 반려된다.

## .meta.ts 형식 (정확히 이 형태)

```ts
import type { ShaderMeta } from '../../src/types'

export default {
  id: 'SD01',
  slug: 'circle-morph',
  title: 'CIRCLE MORPH',
  category: 'sdf',
  tags: ['sdf', 'morph', 'polygon'],
  description: '원이 다각형으로 모핑하는 2D SDF 스터디',
} satisfies ShaderMeta
```

- `id`/`slug`는 파일명과 정확히 일치. `category`는 폴더명. `title`은 대문자 영문. `description`은 한국어 한 문장. `tags` 3~5개 소문자.

## 자가 검증 (완료 전 필수)

```bash
cd /Volumes/data/Dev/dexa-glsl-lab
node scripts/lint-registry.mjs   # 에러 0이어야 함
```

참고 예제: `shaders/raymarch/RM01_orbit-torus.frag`, `shaders/noise/NS01_fbm-drift.frag`, `shaders/minimal/MN01_breath-line.frag`
