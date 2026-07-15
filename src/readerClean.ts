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

  // CMS/워드프레스 잡 라벨 (Uncategorized 등) — 줄 단위·문장 안 모두 제거
  text = stripNoiseLabels(text);

  text = text
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

  // 줄 단위 필터 + 문단 재구성 (붙어 있는 글 분리)
  const rawLines = text.split(/\n+/).map(l => l.trim()).filter(Boolean);
  const kept: string[] = [];
  for (const line of rawLines) {
    if (isNoiseLine(line)) continue;
    if (/^https?:\/\//i.test(line)) continue;
    if (line.length < 2) continue;
    if (/^[\s·\-–—*•|#|/\\]+$/.test(line)) continue;
    kept.push(line);
  }

  const title = kept[0] ? kept[0].slice(0, 120) : '';
  const body = formatParagraphs(kept);

  const ranked = [...links].sort((a, b) => {
    const order = { article: 0, video: 1, social: 2, other: 3 };
    if (order[a.kind] !== order[b.kind]) return order[a.kind] - order[b.kind];
    return a.host.localeCompare(b.host) || a.label.localeCompare(b.label, 'ko');
  });

  return { title, body, links: ranked.slice(0, 20) };
}

/** 카테고리 없음·메뉴 찌꺼기 라벨 */
const NOISE_LABELS = [
  'uncategorized',
  'uncategorised',
  'no category',
  'no categories',
  'categorized',
  'categories',
  'category',
  'tags?',
  'tag cloud',
  'leave a comment',
  'leave a reply',
  'comments? off',
  'no comments?',
  '0 comments?',
  'share this',
  'share on',
  'related posts?',
  'you may also like',
  'read more',
  'continue reading',
  'click here',
  'home',
  'menu',
  'search',
  'subscribe',
  'sign up',
  'log ?in',
  'sign ?in',
  'cookie',
  'privacy policy',
  'terms of (use|service)',
  'all rights reserved',
  'advertisement',
  'sponsored',
  'newsletter',
  'skip to content',
  'skip to main',
  'breadcrumb',
  'posted (in|on)',
  'filed under',
  'written by',
  'by admin',
  'permalink',
  'print this',
  'email this',
  '미분류',
  '분류 없음',
  '카테고리 없음',
  '댓글 없음',
  '관련 글',
  '더 보기',
  '공유하기',
];

function stripNoiseLabels(text: string): string {
  let t = text;
  // 단독 줄 Uncategorized / 미분류
  for (const n of NOISE_LABELS) {
    t = t.replace(new RegExp(`^\\s*${n}\\s*$`, 'gim'), '');
  }
  // 줄 안 붙어 있는 경우: "UncategorizedSomething" / "Uncategorized | Foo"
  t = t.replace(/\bUncategorized\b/gi, ' ');
  t = t.replace(/\bUncategorised\b/gi, ' ');
  t = t.replace(/미분류/g, ' ');
  t = t.replace(/분류\s*없음/g, ' ');
  // Category: Foo / Tags: a, b
  t = t.replace(/^\s*(categor(y|ies)|tags?|topics?|section|channel)\s*[:：]\s*.+$/gim, '');
  t = t.replace(/^\s*(카테고리|태그|분류|토픽)\s*[:：]\s*.+$/gim, '');
  // 메뉴 나열처럼 | 로만 이어진 짧은 토큰 줄
  t = t.replace(/^[A-Za-z가-힣0-9 ]{1,18}(\s*[|›»>/\\]\s*[A-Za-z가-힣0-9 ]{1,18}){2,}\s*$/gm, '');
  return t;
}

function isNoiseLine(line: string): boolean {
  const s = line.trim();
  const lower = s.toLowerCase();
  if (!s) return true;
  if (/^uncategor/i.test(s)) return true;
  if (NOISE_LABELS.some(n => new RegExp(`^${n}$`, 'i').test(lower))) return true;
  // 날짜만 / 숫자+comments
  if (/^\d+\s*(comments?|replies?|views?|shares?)$/i.test(s)) return true;
  if (/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{4}$/i.test(s)) return true;
  // 글자 거의 없는 구분선
  if (s.length <= 3 && !/[가-힣A-Za-z]/.test(s)) return true;
  return false;
}

/**
 * 붙어 있는 글을 문단으로 재배치.
 * - 짧은 제목성 줄은 단독 문단
 * - 긴 줄은 문장 끝(. ? ! 。) 기준으로 적당히 나눔
 * - 한 덩어리가 너무 길면 줄바꿈
 */
function formatParagraphs(lines: string[]): string {
  const paras: string[] = [];

  for (const line of lines) {
    let L = line.replace(/\s+/g, ' ').trim();
    if (!L || isNoiseLine(L)) continue;

    // "UncategorizedTitle" 처럼 붙은 잔재 한 번 더
    L = L.replace(/^Uncategorized\s*/i, '').trim();
    if (!L) continue;

    // 짧은 헤드라인
    if (L.length <= 90 && !/[.!?。]\s/.test(L)) {
      paras.push(L);
      continue;
    }

    // 문장 단위 분리 후 2~3문장씩 묶기
    const sentences = splitSentences(L);
    if (sentences.length <= 1) {
      paras.push(...wrapLong(L, 280));
      continue;
    }
    let buf = '';
    let count = 0;
    for (const s of sentences) {
      if (!s) continue;
      if (!buf) {
        buf = s;
        count = 1;
      } else if (buf.length + s.length < 320 && count < 3) {
        buf = `${buf} ${s}`;
        count += 1;
      } else {
        paras.push(buf);
        buf = s;
        count = 1;
      }
    }
    if (buf) paras.push(buf);
  }

  // 연속 중복 문단 제거
  const dedup: string[] = [];
  for (const p of paras) {
    if (dedup.length && dedup[dedup.length - 1] === p) continue;
    dedup.push(p);
  }
  return dedup.join('\n\n');
}

function splitSentences(text: string): string[] {
  // 한국어/영문 문장 끝
  const parts = text
    .replace(/([.!?。…])\s+(?=[A-Z가-힣“"‘(0-9])/g, '$1\n')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);
  return parts.length ? parts : [text];
}

function wrapLong(text: string, max: number): string[] {
  if (text.length <= max) return [text];
  const out: string[] = [];
  let rest = text;
  while (rest.length > max) {
    let cut = rest.lastIndexOf(' ', max);
    if (cut < max * 0.5) cut = max;
    out.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) out.push(rest);
  return out;
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

const REGION_BLOCK_RE =
  /not available in your region|isn't available in your region|isn.?t available in your region|service isn.?t available|quota|MYMEMORY WARNING|PLEASE SELECT TWO DISTINCT|INVALID LANGUAGE|TOO MANY REQUESTS|RATE LIMIT|IP.*blocked|forbidden|access denied/i;

function isBadTranslation(out: string, _input: string): boolean {
  if (!out || !out.trim()) return true;
  if (REGION_BLOCK_RE.test(out)) return true;
  if (out.length < 40 && /region|available|error|invalid/i.test(out)) return true;
  return false;
}

async function translateChunk(text: string, signal: AbortSignal): Promise<string> {
  const attempts: Array<() => Promise<string>> = [
    async () => {
      const hosts = [
        'https://lingva.ml',
        'https://lingva.thedaviddelta.com',
        'https://translate.plausibility.cloud'
      ];
      for (const host of hosts) {
        const url = `${host}/api/v1/auto/ko/${encodeURIComponent(text)}`;
        const res = await fetch(url, { signal });
        if (!res.ok) continue;
        const data = await res.json();
        const out = data?.translation;
        if (typeof out === 'string' && !isBadTranslation(out, text)) return out;
      }
      throw new Error('lingva fail');
    },
    async () => {
      const endpoints = [
        'https://libretranslate.com/translate',
        'https://translate.argosopentech.com/translate'
      ];
      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: text, source: 'auto', target: 'ko', format: 'text' })
          });
          if (!res.ok) continue;
          const data = await res.json();
          const out = data?.translatedText;
          if (typeof out === 'string' && !isBadTranslation(out, text)) return out;
        } catch {
          /* next */
        }
      }
      throw new Error('libre fail');
    },
    async () => {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=autodetect|ko`;
      const res = await fetch(url, { signal });
      if (!res.ok) throw new Error(`mymemory ${res.status}`);
      const data = await res.json();
      const out = data?.responseData?.translatedText;
      if (typeof out !== 'string' || isBadTranslation(out, text)) {
        throw new Error(typeof out === 'string' ? out : 'mymemory bad');
      }
      return out;
    }
  ];

  let lastErr: Error | null = null;
  for (const run of attempts) {
    try {
      return await run();
    } catch (e) {
      lastErr = e as Error;
      if (signal.aborted) throw e;
    }
  }
  throw lastErr || new Error('all translators failed');
}

export function googleTranslateTextUrl(text: string): string {
  const q = text.slice(0, 4500);
  return `https://translate.google.com/?sl=auto&tl=ko&text=${encodeURIComponent(q)}&op=translate`;
}

export function googleTranslatePageUrl(pageUrl: string): string {
  return `https://translate.google.com/translate?sl=auto&tl=ko&u=${encodeURIComponent(pageUrl)}`;
}

export type TranslateResult = {
  text: string;
  partial: boolean;
};

export async function translateToKorean(
  text: string,
  signal: AbortSignal,
  onProgress?: (pct: number) => void
): Promise<TranslateResult> {
  const max = 400;
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

  const limited = chunks.slice(0, 20);
  const out: string[] = [];
  let success = 0;
  let regionBlocked = 0;

  for (let i = 0; i < limited.length; i++) {
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    try {
      const t = await translateChunk(limited[i], signal);
      if (isBadTranslation(t, limited[i])) regionBlocked += 1;
      else {
        out.push(t);
        success += 1;
      }
    } catch (e) {
      const msg = String((e as Error).message || e);
      if (REGION_BLOCK_RE.test(msg)) regionBlocked += 1;
    }
    onProgress?.(Math.round(((i + 1) / limited.length) * 100));
    await new Promise(r => setTimeout(r, 80));
  }

  if (success === 0) {
    throw new Error(regionBlocked > 0 ? 'REGION_BLOCKED' : 'TRANSLATE_FAILED');
  }
  if (chunks.length > limited.length) {
    out.push('\n…(이하 생략 — 전문은 사이트 또는 번역 탭에서 확인)');
  }
  return { text: out.join('\n\n'), partial: success < limited.length };
}
