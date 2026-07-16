# 카탈로그 정책

## 넣는 것
- **무료**(또는 무료 구간 명확)
- **정식·합법** 운영 (불법 복제·토렌트·성인 특화·혐오 자극 매체 제외)
- 가능하면 **공영·정부·국제기구·대학·협회·검증 매체**
- 소개는 한국어, 원문은 링크만

## 대시보드(실시간 리더) vs 디렉터리
| | 기본 필터 `뉴스·정보` | `전부` |
|--|--|--|
| deskRole `info` | O · 리더 O | O |
| deskRole `browse` | X | O (탐색만, 리더 X) |
| newsletter | X (뉴스레터 필터) | O |

갤러리(pixiv, Pinterest 등)는 **browse** — 사이트 열기로 보고, 리더 본문 추출 대상 아님.

## 파일
- `src/catalogExpand.ts` — 전 카테고리 확장
- `src/industryCatalog.ts` — 산업·교육·미술
- `src/data.ts` — 병합·`isInfoSource`
