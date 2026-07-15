/**
 * 대부분의 뉴스·공공 사이트는 X-Frame-Options / CSP frame-ancestors 로
 * iframe 임베드를 막는다. 브라우저에는 "연결을 거부했습니다"로 보인다.
 * 해결: iframe을 기본 끄고, 새 탭 + 메모 워크플로를 기본으로 한다.
 */

/** 임베드가 거의 항상 거부되는 호스트 (부분 일치) */
const BLOCKED_HOST_SNIPPETS = [
  'dw.com',
  'bbc.',
  'bbc.com',
  'theatlantic.com',
  'wired.com',
  'nature.com',
  'foreignaffairs.com',
  'nytimes.com',
  'washingtonpost.com',
  'reuters.com',
  'bloomberg.com',
  'ft.com',
  'economist.com',
  'cnn.com',
  'aljazeera.com',
  'france24.com',
  'nhk.or.jp',
  'abc.net.au',
  'cbc.ca',
  'channelnewsasia.com',
  'chinadaily.com',
  'xinhuanet.com',
  'news.cn',
  'cgtn.com',
  'github.com',
  'github.blog',
  'google.',
  'youtube.com',
  'facebook.com',
  'twitter.com',
  'x.com',
  'instagram.com',
  'linkedin.com',
  'substack.com',
  'medium.com',
  'notion.so',
  'nasa.gov',
  'noaa.gov',
  'usgs.gov',
  'nist.gov',
  'nih.gov',
  'loc.gov',
  'si.edu',
  'europa.eu',
  'ec.europa.eu',
  'esa.int',
  'who.int',
  'un.org',
  'imf.org',
  'worldbank.org',
  'ourworldindata.org',
  'propublica.org',
  'theconversation.com',
  'quantamagazine.org',
  'archive.org',
  'jaxa.jp',
  'boj.or.jp',
  'meti.go.jp',
  'kbs.co.kr',
  'korea.kr',
  'kdca.go.kr',
  'chosun.com',
  'naver.com',
  'daum.net',
  'kakao.com',
];

/** 드물게 iframe이 되는 경우만 시도 (기본은 차단 목록 우선) */
export function canAttemptIframe(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return !BLOCKED_HOST_SNIPPETS.some((s) => host.includes(s));
  } catch {
    return false;
  }
}

export function embedBlockReason(url: string): string {
  if (!canAttemptIframe(url)) {
    return '이 사이트는 보안 정책으로 페이지 안 미리보기를 막습니다. 새 탭에서 원문을 열고, 옆에서 메모하세요.';
  }
  return '미리보기를 시도할 수 있지만, 일부 환경에서는 여전히 거부될 수 있습니다.';
}
