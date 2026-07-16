/**
 * 다중 추출기: jina → allorigins → corsproxy → codetabs
 * HTML이면 스크립트 제거 후 텍스트 추출.
 */

function stripHtml(html: string): string {
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');

  // article/main 우선
  const article =
    text.match(/<article[\s\S]*?<\/article>/i)?.[0] ||
    text.match(/<main[\s\S]*?<\/main>/i)?.[0] ||
    text;

  text = article
    .replace(/<\/(p|div|h[1-6]|li|br|tr|section|header|footer)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

  return text;
}

function normalizeFetched(text: string): string {
  let t = text.trim();
  if (/<html[\s>]/i.test(t) || /<body[\s>]/i.test(t) || /<\/(p|div|article)>/i.test(t)) {
    t = stripHtml(t);
  }
  t = t.trim();
  if (t.length > 80000) {
    t = `${t.slice(0, 80000)}\n\n…(이하 생략 — 전체는 새 탭 원문)`;
  }
  return t;
}

type Strategy = {
  name: string;
  url: string;
  headers?: Record<string, string>;
};

function buildStrategies(pageUrl: string): Strategy[] {
  const u = pageUrl.startsWith('http') ? pageUrl : `https://${pageUrl}`;
  return [
    {
      name: 'jina',
      url: `https://r.jina.ai/${u}`,
      headers: { Accept: 'text/plain', 'X-Return-Format': 'text' }
    },
    {
      name: 'jina-md',
      url: `https://r.jina.ai/${u}`,
      headers: { Accept: 'text/markdown' }
    },
    {
      name: 'allorigins',
      url: `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`
    },
    {
      name: 'corsproxy',
      url: `https://corsproxy.io/?${encodeURIComponent(u)}`
    },
    {
      name: 'codetabs',
      url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`
    }
  ];
}

async function tryOne(s: Strategy, signal: AbortSignal): Promise<string> {
  const res = await fetch(s.url, { signal, headers: s.headers });
  if (!res.ok) throw new Error(`${s.name} HTTP ${res.status}`);
  const text = normalizeFetched(await res.text());
  if (text.length < 40) throw new Error(`${s.name}: too short`);
  // 에러 페이지 휴리스틱
  if (/just a moment|attention required|access denied|cf-browser-verification/i.test(text) && text.length < 400) {
    throw new Error(`${s.name}: blocked page`);
  }
  return text;
}

/** 세션 동안 성공한 추출기 우선 */
let preferred: string | null = null;

export async function fetchReadable(url: string, signal: AbortSignal): Promise<string> {
  const strategies = buildStrategies(url);
  const ordered = preferred
    ? [
        ...strategies.filter(s => s.name === preferred),
        ...strategies.filter(s => s.name !== preferred)
      ]
    : strategies;

  let lastErr: Error | null = null;
  for (const s of ordered) {
    try {
      const text = await tryOne(s, signal);
      preferred = s.name;
      return text;
    } catch (e) {
      if ((e as Error).name === 'AbortError') throw e;
      lastErr = e as Error;
    }
  }
  throw lastErr || new Error('읽기 실패');
}

export function lastFetcherName(): string | null {
  return preferred;
}
