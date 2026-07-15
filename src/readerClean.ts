/**
 * 리더 추출 텍스트 정리:
 * - 본문: 마크다운·URL·잡기호 제거한 순수 문장
 * - 링크: 이미지/트래킹/CDN 잡링크 제외, 읽을 만한 페이지만 짧은 제목으로
 */

export type ReaderLink = {
  label: string;
  url: string;
  host: string;
  kind: 'article' | 'video' | 'social' | 'other';
};

export type CleanedReader = {
  title: string;
  body: string;
  links: ReaderLink[];
};

const URL_RE = /https?:\/\/[^\s<>"')\]]+/gi;

const IMAGE_EXT = /\.(avif|bmp|gif|jpe?g|png|svg|webp|ico|tiff?)(\?|#|$)/i;
const ASSET_EXT = /\.(css|js|mjs|map|woff2?|ttf|eot|otf|mp3|mp4|webm|m4a|wav|pdf)(\?|#|$)/i;

/** 호스트/경로가 이미지·CDN·광고·트래킹이면 버림 */
const JUNK_HOST = [
  'doubleclick', 'googlesyndication', 'googleadservices', 'google-analytics', 'googletagmanager',
  'facebook.com/tr', 'fbcdn', 'analytics', 'scorecardresearch', 'chartbeat', 'hotjar',
  'segment.io', 'mixpanel', 'newrelic', 'sentry.io', 'cookiebot', 'onetrust',
  'cloudfront.net', 'akamaihd', 'fastly', 'imgix', 'cloudinary', 'imagekit',
  'twimg.com', 'cdninstagram', 'pinimg', 'staticflickr',
  'wp-content/uploads', 'wp-includes', 'media.guim', 'i.guim', 'assets.',
  'gravatar', 'disqus', 'outbrain', 'taboola', 'criteo', 'amazon-adsystem',
  'fonts.g', 'typekit', 'gstatic.com', 'ggpht.com',
  'sprite', 'favicon', 'logo.', '/logo', 'pixel.', '1x1', 'tracking',
  'data:image', 'blob:',
];

const SOCIAL_HOST = ['twitter.com', 'x.com', 'facebook.com', 'instagram.com', 'linkedin.com', 't.me', 'youtube.com', 'youtu.be', 'tiktok.com', 'reddit.com'];

function normalizeUrl(raw: string): string {
  let u = raw.trim();
  u = u.replace(/[),.;!?'"\]]+$/g, '');
  // trailing markdown junk
  u = u.replace(/\)+$/g, '');
  try {
    const parsed = new URL(u);
    // strip common tracking params
    const drop = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid', 'mc_cid', 'mc_eid', 'ref', 'ref_src'];
    drop.forEach(k => parsed.searchParams.delete(k));
    // drop empty search
    const s = parsed.searchParams.toString();
    parsed.search = s ? `?${s}` : '';
    // remove hash noise
    if (parsed.hash && parsed.hash.length > 40) parsed.hash = '';
    return parsed.toString();
  } catch {
    return u;
  }
}

function isJunkUrl(url: string, label = ''): boolean {
  const lower = url.toLowerCase();
  const lab = (label || '').toLowerCase();
  if (!lower.startsWith('http')) return true;
  if (IMAGE_EXT.test(lower) || ASSET_EXT.test(lower)) return true;
  if (JUNK_HOST.some(j => lower.includes(j))) return true;
  if (/\/(images?|img|static|assets|media|uploads?|thumb|thumbs|icons?|sprites?)\//i.test(lower)) {
    // allow if looks like article path after media — but most are assets
    if (IMAGE_EXT.test(lower) || /\/\d+x\d+\//.test(lower) || /format=auto|quality=\d|w=\d{2,4}/i.test(lower)) return true;
    if (!/\/(news|article|story|post|blog|20\d{2})\//i.test(lower)) return true;
  }
  // data-heavy query image CDNs
  if (/[?&](w|h|width|height|fit|crop|auto)=/i.test(lower) && /cdn|image|img|media/i.test(lower)) return true;
  // label is clearly image
  if (/^(image|img|photo|thumbnail|icon|logo|banner|avatar)$/i.test(lab.trim())) return true;
  // extremely long query strings usually trackers/CDN
  try {
    const u = new URL(url);
    if (u.search.length > 180) return true;
    if (u.pathname.length > 200 && /%2F|%3A/i.test(u.pathname)) return true;
  } catch {
    return true;
  }
  return false;
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function kindOf(url: string): ReaderLink['kind'] {
  const h = hostOf(url).toLowerCase();
  if (SOCIAL_HOST.some(s => h === s || h.endsWith('.' + s))) {
    if (h.includes('youtube') || h.includes('youtu.be')) return 'video';
    return 'social';
  }
  if (/youtube|youtu\.be|vimeo|dailymotion/.test(h)) return 'video';
  return 'article';
}

/** URL → 짧은 읽기 제목 (전체 URL 노출 안 함) */
export function prettyLinkLabel(url: string, hint = ''): string {
  const cleanHint = hint
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/[#*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleanHint && cleanHint.length >= 3 && cleanHint.length <= 90 && !/^https?:/i.test(cleanHint)) {
    // hint가 의미 있으면 우선
    if (!/^(link|url|here|click|source|image|img|photo)$/i.test(cleanHint)) {
      return cleanHint;
    }
  }

  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    let path = decodeURIComponent(u.pathname).replace(/\/+$/, '');
    const segs = path.split('/').filter(Boolean);
    // 마지막 의미 있는 세그먼트
    let last = segs[segs.length - 1] || '';
    last = last.replace(/\.(html?|php|aspx?)$/i, '');
    last = last.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
    // slug가 너무 길거나 해시면 호스트만
    if (!last || last.length < 2 || /^[a-f0-9]{12,}$/i.test(last) || last.length > 60) {
      return host;
    }
    // 숫자 id만이면 호스트
    if (/^\d+$/.test(last)) return host;
    // Title Case-ish
    const title = last.length > 48 ? `${last.slice(0, 48)}…` : last;
    return `${title} · ${host}`;
  } catch {
    return cleanHint || '링크';
  }
}

function pushLink(
  bag: ReaderLink[],
  seen: Set<string>,
  label: string,
  url: string
) {
  const u = normalizeUrl(url);
  if (isJunkUrl(u, label)) return;
  // canonical key without trailing slash
  const key = u.replace(/\/$/, '').toLowerCase();
  if (seen.has(key)) return;
  seen.add(key);
  bag.push({
    label: prettyLinkLabel(u, label),
    url: u,
    host: hostOf(u),
    kind: kindOf(u)
  });
}

/** jina / raw → 읽기용 순수 문장 + 정제 링크 */
export function cleanReaderText(raw: string): CleanedReader {
  let text = raw || '';
  const links: ReaderLink[] = [];
  const seen = new Set<string>();

  // jina 메타
  text = text
    .replace(/^Title:\s*.+$/gim, '')
    .replace(/^URL Source:\s*.+$/gim, '')
    .replace(/^Published Time:\s*.+$/gim, '')
    .replace(/^Markdown Content:\s*/gim, '')
    .replace(/^Warning:\s*.+$/gim, '')
    .replace(/^Warning\s*.+$/gim, '');

  // 이미지 마크다운 — 본문·링크 목록 모두에서 제외
  text = text.replace(/!\[([^\]]*)\]\((https?:[^)\s]+)\)/g, '');

  // HTML img
  text = text.replace(/<img[^>]*>/gi, '');

  // 마크다운 링크 → 라벨만 본문, 좋은 링크만 목록
  text = text.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, (_, label: string, url: string) => {
    pushLink(links, seen, label, url);
    return label;
  });

  // 레퍼런스 정의는 본문에서 삭제, 링크만 검토
  text = text.replace(/^\s*\[[^\]]+\]:\s*(https?:\/\/\S+)\s*$/gim, (_, url: string) => {
    pushLink(links, seen, '', url);
    return '';
  });

  text = text.replace(/<(https?:\/\/[^>]+)>/g, (_, url: string) => {
    pushLink(links, seen, '', url);
    return '';
  });

  // 남은 bare URL
  text = text.replace(URL_RE, (url: string) => {
    pushLink(links, seen, '', url);
    return '';
  });

  // 헤딩/강조/목록
  text = text.replace(/^\s{0,3}#{1,6}\s*/gm, '');
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');
  text = text.replace(/_([^_]+)_/g, '$1');
  text = text.replace(/~~([^~]+)~~/g, '$1');
  text = text.replace(/`([^`]+)`/g, '$1');
  text = text.replace(/^\s*>+\s?/gm, '');
  text = text.replace(/^\s*[-*+]\s+/gm, '· ');
  text = text.replace(/^\s*\d+\.\s+/gm, '· ');
  text = text.replace(/^\s*([-*_]){3,}\s*$/gm, '');
  text = text.replace(/<[^>]+>/g, ' ');

  // 빈 괄호·깨진 마크다운 잔재
  text = text
    .replace(/!\[[^\]]*\]/g, '')
    .replace(/\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[\]/g, '')
    .replace(/\(\s*\)/g, '')
    .replace(/【[^】]*】/g, '');

  text = text
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

  // 거의 URL만 남은 줄 제거
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(l => {
      if (!l) return false;
      if (/^https?:\/\//i.test(l)) return false;
      if (l.length < 2) return false;
      // 점·기호만
      if (/^[\s·\-–—*•|#]+$/.test(l)) return false;
      return true;
    });

  const title = lines[0] ? lines[0].slice(0, 120) : '';
  const body = lines.join('\n\n');

  // 링크 정렬: article 먼저, 같은 호스트 묶음
  const ranked = [...links].sort((a, b) => {
    const order = { article: 0, video: 1, social: 2, other: 3 };
    if (order[a.kind] !== order[b.kind]) return order[a.kind] - order[b.kind];
    return a.host.localeCompare(b.host) || a.label.localeCompare(b.label, 'ko');
  });

  // 최대 개수 제한 (UI 깔끔)
  return { title, body, links: ranked.slice(0, 20) };
}

export function likelyNeedsKorean(text: string, languageHint?: string): boolean {
  if (languageHint && /한국어/.test(languageHint) && !/영어|일본|중국|독|프|다국어|아랍/.test(languageHint)) {
    return false;
  }
  const sample = text.slice(0, 800);
  const hangul = (sample.match(/[가-힣]/g) || []).length;
  const latin = (sample.match(/[A-Za-z]/g) || []).length;
  if (hangul > 30 && hangul > latin * 0.4) return false;
  if (latin < 40) return hangul < 10;
  return hangul < latin * 0.15;
}

async function translateChunk(text: string, signal: AbortSignal): Promise<string> {
  const q = encodeURIComponent(text);
  const url = `https://api.mymemory.translated.net/get?q=${q}&langpair=autodetect|ko`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`translate ${res.status}`);
  const data = await res.json();
  const out = data?.responseData?.translatedText;
  if (!out || typeof out !== 'string') throw new Error('empty translation');
  if (/MYMEMORY WARNING/i.test(out)) throw new Error('quota');
  return out;
}

export async function translateToKorean(
  text: string,
  signal: AbortSignal,
  onProgress?: (pct: number) => void
): Promise<string> {
  const max = 420;
  const chunks: string[] = [];
  let rest = text.trim();
  while (rest.length) {
    if (rest.length <= max) {
      chunks.push(rest);
      break;
    }
    let cut = rest.lastIndexOf('\n', max);
    if (cut < max * 0.4) cut = rest.lastIndexOf(' ', max);
    if (cut < max * 0.4) cut = max;
    chunks.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }

  const limited = chunks.slice(0, 24);
  const out: string[] = [];
  for (let i = 0; i < limited.length; i++) {
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    try {
      out.push(await translateChunk(limited[i], signal));
    } catch {
      out.push(limited[i]);
    }
    onProgress?.(Math.round(((i + 1) / limited.length) * 100));
    await new Promise(r => setTimeout(r, 120));
  }
  if (chunks.length > limited.length) {
    out.push('\n…(이하 생략 — 전문은 새 탭 원문 또는 번역 탭)');
  }
  return out.join('\n\n');
}
