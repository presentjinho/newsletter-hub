# 개선 점검 (2026-07-16)

## 번역 중도 끊김 — 원인 (해결됨)

1. 청크 실패 시 **그 구간을 버리고** 다음으로 넘어감 → 본문 중간 공백/끊김
2. 최대 청크 하드캡 후 뒤 생략
3. MyMemory/Lingva 지역·쿼터 실패 (429 / region / 403)

## 적용한 수정 (누적)

- 실패 청크 = **원문 유지**
- 연속 실패 시 페이지 번역 모드 전환
- 성공 엔진 세션 기억 + sessionStorage 캐시
- **페이지 번역** 버튼을 권장 1순위 (문장 API는 실험)
- 문단·문장 기준 분할

## 이슈 처리 표 (2026-07-16)

| 항목 | 상태 | 구현 |
|------|------|------|
| 무료 번역 API 불안정 | 완화 | 다단 폴백 + 페이지 번역 권장. 자체 CF Worker는 선택(키 필요) |
| Google iframe 차단 | 해결 | 상단 EmbedFallbackBar · 새 탭 CTA 우선 |
| 리더 추출 품질 | 해결 | `readerFetch.ts` jina/allorigins/corsproxy/codetabs + HTML strip |
| 링크 검사 표시 | 해결 | Actions 일일 + 카드 `링크 OK · 시각` badge |
| 뉴스레터 vs 정보 | OK | 기본 정보 매체 |
| 접근성 | 해결 | skip-link, focus-ring, aria, sr-only labels |
| 모바일 필터 과다 | 해결 | 상세 필터 접기 (md 미만 기본 접힘) |
| 오프라인 | 해결 | `public/sw.js` 정적 셸 캐시 |
| 리더 스켈레톤 | 해결 | LiveDesk ReaderSkeleton |
| 구독/실시간 대비 | 해결 | 구독=빨강 우선, 실시간=초록 solid |

## UX 백로그

1. ~~번역 중도 끊김~~
2. ~~필터 UI 접기 (모바일)~~
3. ~~카드 마지막 확인 badge~~
4. ~~리더 로딩 스켈레톤~~
5. ~~구독/사이트/실시간 버튼 대비~~

## 선택 후속 (키/인프라 필요)

- Cloudflare Worker 번역 프록시 + 유료/무료 API 키
- jina 유료 플랜 또는 자체 리더블 프록시
- Lighthouse CI 접근성 수치 추적
