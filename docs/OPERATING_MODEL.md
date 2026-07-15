# 운영 모델

## 지금: 무료 디렉터리

- GitHub Pages: 목록, 한국어 안내, 검색·필터, 공식 구독 링크
- GitHub Actions: 매일 공식 링크 상태를 확인하고 `data/link-status.json` 갱신
- GitHub Issues: 신규 뉴스레터·정보 수정 제보
- 원칙: 다른 발행사의 메일 구독·해지를 대행하지 않는다. 해당 발행사의 공식 흐름으로 보낸다.

## 형식(type) 확장

뉴스레터 외에 매거진(웹 정기 콘텐츠), 사이트(꾸준히 갱신되는 정보 플랫폼)를 `type` 필드로 구분해 같은 디렉터리에 함께 담는다. 개인 X(트위터) 계정은 개명·비활성화·삭제가 잦고 검증 가능한 발행 주체가 없어 목록에서 제외한다 — 공식 발행 주체가 있는 소스만 다룬다.

## 분야 확장 원칙

새 분야를 추가할 때는 검색으로 후보를 찾고, `curl`로 실제 200 응답(또는 403/405처럼 봇 차단이지만 살아있는 응답)을 확인한 것만 반영한다. 도메인이 죽었거나(DNS 실패) 특정 경로가 404인 후보는 제외하고 대체 공식 URL을 찾는다.

## 개인 읽기함을 원할 때

- `kill-the-news`: 뉴스레터마다 개인 수신 주소를 만들고 RSS로 읽는 Cloudflare Workers 도구. Cloudflare 계정과 도메인이 필요하다.
- FreshRSS: RSS 피드를 읽고 태그·모바일 클라이언트·다중 사용자를 지원하는 자가 호스팅 리더.
- 이 조합은 개인이 자신의 수신 주소로 구독하는 방식이다. 디렉터리가 모든 사용자 메일을 수집하지 않는다.

## 자체 뉴스레터를 발송할 때

- Listmonk: PostgreSQL 기반 자가 호스팅 발송 도구. 대량 발송, API, 세그먼트가 필요할 때 선택.
- Keila: 폼·시각적 세그먼트·템플릿 UI가 더 중요한 소규모/비개발자 운영에 적합.
- 발송을 시작하기 전: 수신 동의, 더블 옵트인, SPF/DKIM/DMARC, 반송·불만 처리, 일회성 구독 취소를 준비한다.

## 국가 단위 확장 원칙

각 항목은 아래의 검증 가능한 필드를 갖는다.

- `country`: 발행 국가 또는 주 운영 지역
- `language`: 원문 언어와 한국어 안내 여부
- `category`, `interests`: 대분류와 세부 주제
- `url`: 공식 구독 또는 공식 아카이브 URL
- `trust`: 확인 가능한 신뢰·유료·광고 정보
- `lastChecked`: 자동 링크 검사 시각과 결과

새 국가를 추가할 때는 공식 발행 페이지, 공개 아카이브 또는 RSS, 최근 발행 증거를 함께 Issue에 제출한다. 링크만 있는 제보는 `검토 대기`로 두고, 검증 뒤에 공개 목록으로 올린다.

## 확인한 공식 출처

- Listmonk: https://github.com/knadh/listmonk
- Keila: https://github.com/pentacent/keila
- kill-the-news: https://kill-the.news/
- FreshRSS: https://github.com/FreshRSS/FreshRSS
- Miniflux: https://github.com/miniflux/v2
- NetNewsWire: https://github.com/Ranchero-Software/NetNewsWire
- FeedMe: https://github.com/Seanium/feedme
- awesome-newsletters: https://github.com/zudochkin/awesome-newsletters
- awesome-rss-feeds: https://github.com/plenaryapp/awesome-rss-feeds
- ALL-about-RSS: https://github.com/AboutRSS/ALL-about-RSS

## 읽기 스택 권장 흐름

1. 이 사이트에서 발견·필터·내 목록 저장
2. **내 목록 OPML** 또는 **검증 공공 출처 OPML** 내려받기
3. NetNewsWire / FreshRSS / Miniflux로 import
4. 이메일 뉴스레터만 필요하면 kill-the-news로 개인 RSS 브릿지 (선택)
5. 발송이 필요하면 Listmonk/Keila — 디렉터리 역할과 분리

조사 메모: [GITHUB_X_RESEARCH.md](GITHUB_X_RESEARCH.md)
## 재사용 등급 필드

공개 카탈로그의 각 항목에는 다음을 추가한다.

- `reuseLevel`: `A`(공식 링크와 자체 소개만), `B`(개별 콘텐츠 조건부 재사용), `C`(명시 오픈 라이선스·퍼블릭 도메인)
- `licenseUrl`: B/C 등급의 공식 라이선스 또는 재게시 정책 URL

기본값은 `A`다. 무료 공개라는 이유만으로 B/C를 부여하지 않는다. 상세 기준은 [REUSE_POLICY.md](REUSE_POLICY.md)를 따른다.
