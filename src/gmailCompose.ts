/**
 * Gmail 연동: OAuth/서버 없음.
 * 브라우저에 Google 세션이 있으면 작성 창, 없으면 Google 로그인 후 메일로 이어짐.
 */

const GMAIL_COMPOSE =
  'https://mail.google.com/mail/?view=cm&fs=1&tf=1';
const GMAIL_HOME = 'https://mail.google.com/mail/';
const GOOGLE_CHOOSER =
  'https://accounts.google.com/AccountChooser?continue=';

/** 대략적인 compose URL 한도 (브라우저·Gmail 공통 안전선) */
const MAX_BODY_CHARS = 1600;

export function isValidEmail(email: string): boolean {
  const e = email.trim();
  if (!e) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export function openInNewTab(url: string): boolean {
  // <a> 클릭이 window.open(…, 'noopener')보다 팝업 차단·제스처 유지에 유리
  try {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    return true;
  } catch {
    try {
      window.open(url, '_blank');
      return true;
    } catch {
      return false;
    }
  }
}

/** Google 계정 선택/로그인 → Gmail 홈 (로그인 확인용) */
export function openGoogleMailLogin(): boolean {
  return openInNewTab(GOOGLE_CHOOSER + encodeURIComponent(GMAIL_HOME));
}

export type ComposeOpts = {
  to?: string;
  subject: string;
  body: string;
};

export function buildGmailComposeUrl(opts: ComposeOpts): string {
  let body = opts.body || '';
  if (body.length > MAX_BODY_CHARS) {
    body =
      body.slice(0, MAX_BODY_CHARS) +
      '\n\n…(길이 제한으로 잘림. 앱에서 「복사」 후 붙여넣기 하세요)';
  }
  const to = (opts.to || '').trim();
  const q = [
    to ? `to=${encodeURIComponent(to)}` : 'to=',
    `su=${encodeURIComponent(opts.subject || '')}`,
    `body=${encodeURIComponent(body)}`
  ].join('&');
  return `${GMAIL_COMPOSE}&${q}`;
}

/**
 * 로그인 안 된 경우에도 AccountChooser → compose 로 이어지게 할 수 있음.
 * continue 가 너무 길면 Gmail이 거절할 수 있어, 본문이 짧을 때만 chooser 경유.
 */
export function buildGmailComposeUrlWithLogin(opts: ComposeOpts): string {
  const compose = buildGmailComposeUrl(opts);
  if (compose.length < 1800) {
    return GOOGLE_CHOOSER + encodeURIComponent(compose);
  }
  return compose;
}

export type OpenComposeResult = {
  ok: boolean;
  url: string;
  truncated: boolean;
  emailOk: boolean;
  usedLoginChooser: boolean;
};

export function openGmailCompose(
  opts: ComposeOpts,
  options?: { preferLoginChooser?: boolean }
): OpenComposeResult {
  const rawLen = (opts.body || '').length;
  const truncated = rawLen > MAX_BODY_CHARS;
  const emailOk = !opts.to?.trim() || isValidEmail(opts.to || '');
  const prefer = options?.preferLoginChooser !== false;
  const url =
    prefer && buildGmailComposeUrl(opts).length < 1800
      ? buildGmailComposeUrlWithLogin(opts)
      : buildGmailComposeUrl(opts);
  const ok = openInNewTab(url);
  return {
    ok,
    url,
    truncated,
    emailOk,
    usedLoginChooser: url.includes('AccountChooser')
  };
}
