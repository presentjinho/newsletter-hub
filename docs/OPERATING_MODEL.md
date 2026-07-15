# 운영 모델

## 지금: 무료 디렉터리

- GitHub Pages: 목록, 한국어 안내, 검색·필터, 공식 구독 링크
- GitHub Actions: 매일 공식 링크 상태를 확인하고 `data/link-status.json` 갱신
- GitHub Issues: 신규 뉴스레터·정보 수정 제보
- 원칙: 다른 발행사의 메일 구독·해지를 대행하지 않는다. 해당 발행사의 공식 흐름으로 보낸다.

## 형식(type) 확장

뉴스레터 외에 매거진(웹 정기 콘텐츠), 사이트(꾸준히 갱신되는 정보 플랫폼), X 계정(개인·기관)을 `type` 필드로 구분해 같은 디렉터리에 함께 담는다. 개인 X 계정은 개명·비활성화·삭제가 잦아 다른 형식보다 신뢰도가 낮다는 점을 `trust` 배지에 명시하고, 링크 상태 체크 대상에도 동일하게 포함한다.

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
