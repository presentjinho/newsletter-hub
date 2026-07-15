/**
 * 리더 추출 텍스트에서 마크다운·잡음을 제거하고
 * 본문 + 선택적 링크 목록으로 나눈다.
 */

export type CleanedReader = {
  title: string;
  body: string;
  links: { label: string; url: string }[];
};

const URL_RE = /https?:\/\/[^\s<>"')\]]+/gi;

function normalizeUrl(raw: string): string {
  return raw.replace(/[),.;!?]+$/g, '');
}

/** jina / raw markdown → 읽기용 순수 문장 */
export function cleanReaderText(raw: string): CleanedReader {
  let text = raw || '';
  const links: { label: string; url: string }[] = [];
  const seen = new Set<string>();

  const pushLink = (label: string, url: string) => {
    const u = normalizeUrl(url);
    if (!u.startsWith('http') || seen.has(u)) return;
    seen.add(u);
    const lab = (label || u).replace(/\s+/g, ' ').trim().slice(0, 80);
    links.push({ label: lab || u, url: u });
  };

  // jina 메타 블록 제거
  text = text
    .replace(/^Title:\s*.+$/gim, '')
    .replace(/^URL Source:\s*.+$/gim, '')
    .replace(/^Published Time:\s*.+$/gim, '')
    .replace(/^Markdown Content:\s*/gim, '')
    .replace(/^Warning:\s*.+$/gim, '');

  // 이미지 ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\((https?:[^)\s]+)\)/g, (_, alt: string, url: string) => {
    pushLink(alt || '이미지', url);
    return '';
  });

  // 마크다운 링크 [label](url)
  text = text.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, (_, label: string, url: string) => {
    pushLink(label, url);
    return label;
  });

  // 레퍼런스 링크 [1]: url
  text = text.replace(/^\s*\[[^\]]+\]:\s*(https?:\/\/\S+)\s*$/gim, (_, url: string) => {
    pushLink('참고 링크', url);
    return '';
  });

  // 자동 링크 <https://...>
  text = text.replace(/<(https?:\/\/[^>]+)>/g, (_, url: string) => {
    pushLink(url, url);
    return '';
  });

  // 남은 맨 URL → 링크로 빼고 본문에서 제거
  text = text.replace(URL_RE, (url: string) => {
    pushLink(url, url);
    return '';
  });

  // 헤딩 # ## ### → 제목 느낌의 줄 (기호 제거)
  text = text.replace(/^\s{0,3}#{1,6}\s*/gm, '');

  // 강조 *bold* **bold** _em_ __em__
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');
  text = text.replace(/_([^_]+)_/g, '$1');
  text = text.replace(/~~([^~]+)~~/g, '$1');
  text = text.replace(/`([^`]+)`/g, '$1');

  // 인용 >
  text = text.replace(/^\s*>+\s?/gm, '');

  // 리스트 기호
  text = text.replace(/^\s*[-*+]\s+/gm, '· ');
  text = text.replace(/^\s*\d+\.\s+/gm, '· ');

  // 수평선
  text = text.replace(/^\s*([-*_]){3,}\s*$/gm, '');

  // HTML 잔여
  text = text.replace(/<[^>]+>/g, ' ');

  // 공백 정리
  text = text
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

  // 첫 줄을 제목 후보
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let title = '';
  if (lines.length) {
    title = lines[0].slice(0, 120);
    // 짧은 첫 줄이면 제목으로 쓰고 본문에서 유지 (중복 OK)
  }

  // 너무 짧은 줄바꿈 문장 합치기 약간
  const body = lines.join('\n\n');

  return { title, body, links: links.slice(0, 40) };
}

/** 한국어가 거의 없으면 번역 대상 */
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
  // MyMemory free (CORS OK, 길이 제한 ~500)
  const url = `https://api.mymemory.translated.net/get?q=${q}&langpair=autodetect|ko`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`translate ${res.status}`);
  const data = await res.json();
  const out = data?.responseData?.translatedText;
  if (!out || typeof out !== 'string') throw new Error('empty translation');
  // quota 메시지 필터
  if (/MYMEMORY WARNING/i.test(out)) throw new Error('quota');
  return out;
}

/** 긴 본문을 쪼개 한국어로 번역 (실패 시 원문 일부 유지) */
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

  // 너무 많으면 앞부분만 (무료 API 한도)
  const limited = chunks.slice(0, 24);
  const out: string[] = [];
  for (let i = 0; i < limited.length; i++) {
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    try {
      const t = await translateChunk(limited[i], signal);
      out.push(t);
    } catch {
      out.push(limited[i]);
    }
    onProgress?.(Math.round(((i + 1) / limited.length) * 100));
    // rate limit 완화
    await new Promise(r => setTimeout(r, 120));
  }
  if (chunks.length > limited.length) {
    out.push('\n…(이하 생략 — 전문은 새 탭 원문 또는 번역 탭)');
  }
  return out.join('\n\n');
}
