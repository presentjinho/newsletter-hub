/**
 * 외부 사이트 열기 — 팝업 차단·빈 탭 튕김 완화
 */
export function openExternal(url: string): boolean {
  if (!url || !/^https?:\/\//i.test(url)) return false;
  try {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.referrerPolicy = 'no-referrer';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    return true;
  } catch {
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
      return true;
    } catch {
      return false;
    }
  }
}

/** 앵커에 붙일 공통 속성 */
export const externalAnchorProps = {
  target: '_blank' as const,
  rel: 'noopener noreferrer',
  referrerPolicy: 'no-referrer' as const,
};
