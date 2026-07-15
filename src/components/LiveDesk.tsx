import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  ExternalLink,
  FileText,
  Mail,
  Languages,
  Eye,
  ZoomIn,
  ZoomOut,
  BookOpen,
  Loader2,
  AlertCircle,
  Globe2
} from 'lucide-react';
import { Newsletter, Note } from '../types';
import { canAttemptIframe } from '../embedPolicy';

interface LiveDeskProps {
  newsletters: Newsletter[];
  activeSourceId: string;
  onSelectSource: (id: string) => void;
  onOpenNote: (sourceId: string, noteId?: string) => void;
  onQuickGmail: (sourceId: string) => void;
  getNotesForSource: (sourceId: string) => Note[];
  onRefreshLinkStatus: () => void;
  linkSyncStatus: string;
}

type ViewMode = 'reader' | 'iframe';

/** 앱 안에 ‘진짜 브라우저’를 넣는 건 GH Pages 웹에서는 불가.
 *  iframe 차단 사이트는 리더 추출(텍스트)로 앱 내 열람 + 확대.
 */
async function fetchReadable(url: string, signal: AbortSignal): Promise<string> {
  const endpoints = [
    `https://r.jina.ai/${url}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
  ];
  let lastErr: Error | null = null;
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        signal,
        headers: endpoint.includes('jina')
          ? { Accept: 'text/plain' }
          : undefined
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      let text = await res.text();
      // HTML이 오면 태그 대충 제거
      if (/<html[\s>]/i.test(text) || /<body[\s>]/i.test(text)) {
        text = text
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/<style[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
      text = text.trim();
      if (text.length < 40) throw new Error('내용이 너무 짧음');
      // 과도한 길이 컷
      if (text.length > 80000) text = `${text.slice(0, 80000)}\n\n…(이하 생략 — 전체는 새 탭 원문)`;
      return text;
    } catch (e) {
      if ((e as Error).name === 'AbortError') throw e;
      lastErr = e as Error;
    }
  }
  throw lastErr || new Error('읽기 실패');
}

export default function LiveDesk({
  newsletters,
  activeSourceId,
  onSelectSource,
  onOpenNote,
  onQuickGmail,
  getNotesForSource,
  onRefreshLinkStatus,
  linkSyncStatus
}: LiveDeskProps) {
  const [timeStr, setTimeStr] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('reader');
  const [readerText, setReaderText] = useState('');
  const [readerLoading, setReaderLoading] = useState(false);
  const [readerError, setReaderError] = useState('');
  const [zoom, setZoom] = useState(() => {
    const z = Number(localStorage.getItem('letter-reader-zoom') || '125');
    return Number.isFinite(z) ? Math.min(200, Math.max(100, z)) : 125;
  });

  useEffect(() => {
    const tick = () => {
      setTimeStr(
        new Intl.DateTimeFormat('ko-KR', {
          weekday: 'short',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).format(new Date())
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('letter-reader-zoom', String(zoom));
  }, [zoom]);

  const activeNewsletter = newsletters.find(n => n.id === activeSourceId);
  const sourceNotes = activeSourceId ? getNotesForSource(activeSourceId) : [];

  const loadReader = useCallback(async (url: string) => {
    const ctrl = new AbortController();
    setReaderLoading(true);
    setReaderError('');
    setReaderText('');
    try {
      const text = await fetchReadable(url, ctrl.signal);
      setReaderText(text);
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        setReaderError(
          '앱 안 리더로 불러오지 못했습니다. 사이트 차단·네트워크 제한일 수 있어요. 새 탭 원문을 사용하세요.'
        );
      }
    } finally {
      setReaderLoading(false);
    }
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    setViewMode('reader');
    if (!activeNewsletter) {
      setReaderText('');
      setReaderError('');
      return;
    }
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    const ctrl = new AbortController();
    (async () => {
      setReaderLoading(true);
      setReaderError('');
      setReaderText('');
      try {
        const text = await fetchReadable(activeNewsletter.url, ctrl.signal);
        if (!cancelled) setReaderText(text);
      } catch (e) {
        if (!cancelled && (e as Error).name !== 'AbortError') {
          setReaderError(
            '앱 안 리더로 불러오지 못했습니다. 새 탭에서 원문을 열어 주세요.'
          );
        }
      } finally {
        if (!cancelled) setReaderLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [activeNewsletter?.id, activeNewsletter?.url]);

  const openOriginal = () => {
    if (activeNewsletter) window.open(activeNewsletter.url, '_blank', 'noopener,noreferrer');
  };

  const openTranslate = () => {
    if (!activeNewsletter) return;
    const u = `https://translate.google.com/translate?sl=auto&tl=ko&u=${encodeURIComponent(activeNewsletter.url)}`;
    window.open(u, '_blank', 'noopener,noreferrer');
  };

  const zoomIn = () => setZoom(z => Math.min(200, z + 10));
  const zoomOut = () => setZoom(z => Math.max(100, z - 10));
  const zoomReset = () => setZoom(125);

  return (
    <section className="live-desk p-8 md:p-14 border-b border-white/15" id="live">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-6">
          <div className="lg:col-span-7">
            <p className="text-xs font-bold tracking-widest live-accent mb-2">
              LIVE DESK · 앱 안 리더
            </p>
            <h2 className="font-serif text-3xl md:text-5xl tracking-tight leading-tight mb-3 text-[var(--live-fg)]">
              원문을 안에서 읽고<br />바로 메모해요
            </h2>
            <p className="text-sm text-[var(--live-muted)] leading-relaxed max-w-2xl">
              일반 웹사이트는 보안 때문에 iframe(페이지 끼워 넣기)을 막습니다.
              그래서 <strong className="text-[var(--live-fg)]">앱 안 리더</strong>로 본문 텍스트를 불러와 크게 읽고,
              전체 UI가 필요하면 새 탭을 씁니다. (크롬을 통째로 넣는 건 웹 호스팅에선 불가)
            </p>
            <p className="text-xs live-accent mt-2">
              지금 {timeStr} · {linkSyncStatus}
            </p>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-[var(--live-muted)] font-bold uppercase tracking-wider">
                출처 선택
              </span>
              <select
                value={activeSourceId}
                onChange={e => onSelectSource(e.target.value)}
                className="w-full bg-black/40 border border-white/25 text-[var(--live-fg)] p-3 text-sm focus:outline-none focus:border-[#a8e0c0] rounded-sm"
              >
                <option value="">출처를 선택하세요...</option>
                {newsletters.map(n => (
                  <option key={n.id} value={n.id} className="bg-[var(--live-bg)] text-[var(--live-fg)]">
                    {n.name} · {n.category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <button
                type="button"
                onClick={onRefreshLinkStatus}
                className="px-3 py-2 bg-white/10 hover:bg-white/15 text-xs font-bold live-accent border border-white/15 rounded-sm cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                상태 동기화
              </button>
              {activeNewsletter && (
                <>
                  <button
                    type="button"
                    onClick={openOriginal}
                    className="px-3 py-2 bg-white/10 text-xs font-bold text-[var(--live-fg)] border border-white/20 rounded-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 live-accent" />
                    원문 새 탭
                  </button>
                  {activeNewsletter.origin === '글로벌' && (
                    <button
                      type="button"
                      onClick={openTranslate}
                      className="px-3 py-2 bg-white/10 text-xs font-bold text-[var(--live-fg)] border border-white/20 rounded-sm cursor-pointer flex items-center gap-1.5"
                    >
                      <Languages className="w-3.5 h-3.5" />
                      번역 탭
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onOpenNote(activeNewsletter.id)}
                    className="px-3 py-2 bg-white/10 text-xs font-bold text-[var(--live-fg)] border border-white/20 rounded-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    메모
                  </button>
                  <button
                    type="button"
                    onClick={() => onQuickGmail(activeNewsletter.id)}
                    className="px-3 py-2 bg-[#cf4f39] text-xs font-bold text-[var(--live-fg)] rounded-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Gmail
                  </button>
                </>
              )}
            </div>

            {/* Zoom controls */}
            <div className="flex flex-wrap items-center gap-2 p-2 bg-black/30 border border-white/15 rounded-sm">
              <span className="text-[11px] font-bold text-[var(--live-muted)] uppercase tracking-wider mr-1">
                글자 확대
              </span>
              <button
                type="button"
                onClick={zoomOut}
                className="p-2 bg-white/10 border border-white/20 rounded-sm cursor-pointer text-[var(--live-fg)]"
                aria-label="축소"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold text-[var(--live-fg)] min-w-[3.5rem] text-center tabular-nums">
                {zoom}%
              </span>
              <button
                type="button"
                onClick={zoomIn}
                className="p-2 bg-white/10 border border-white/20 rounded-sm cursor-pointer text-[var(--live-fg)]"
                aria-label="확대"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={zoomReset}
                className="text-xs underline live-accent cursor-pointer bg-transparent border-0 font-bold"
              >
                기본(125%)
              </button>
              <input
                type="range"
                min={100}
                max={200}
                step={5}
                value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
                className="flex-1 min-w-[100px] accent-[#9fe0b8]"
                aria-label="읽기 배율"
              />
            </div>
          </div>
        </div>

        {activeNewsletter && (
          <div className="p-3 bg-black/25 border border-white/15 text-sm text-[var(--live-muted)] mb-4 flex flex-wrap gap-x-4 gap-y-2 items-center rounded-sm">
            <span className="font-bold text-[var(--live-fg)]">{activeNewsletter.name}</span>
            <span className="opacity-40">•</span>
            <span className={activeNewsletter.status === 'alive' ? 'live-accent' : 'text-[#c4b8a0]'}>
              {activeNewsletter.status === 'alive' ? '발행 중' : '확인 필요'}
            </span>
            <span className="opacity-40">•</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setViewMode('reader')}
                className={`px-2.5 py-1 text-xs font-bold rounded-sm border cursor-pointer flex items-center gap-1 ${
                  viewMode === 'reader'
                    ? 'bg-[#9fe0b8] text-[#0a100e] border-[#9fe0b8]'
                    : 'bg-transparent text-[var(--live-fg)] border-white/25'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                앱 안 리더
              </button>
              <button
                type="button"
                onClick={() => setViewMode('iframe')}
                className={`px-2.5 py-1 text-xs font-bold rounded-sm border cursor-pointer flex items-center gap-1 ${
                  viewMode === 'iframe'
                    ? 'bg-[#9fe0b8] text-[#0a100e] border-[#9fe0b8]'
                    : 'bg-transparent text-[var(--live-fg)] border-white/25'
                }`}
                title={canAttemptIframe(activeNewsletter.url) ? '일부 사이트만 가능' : '대부분 차단됨'}
              >
                <Eye className="w-3.5 h-3.5" />
                페이지 끼워보기
              </button>
            </div>
            <a
              href={activeNewsletter.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline live-accent break-all text-xs ml-auto"
            >
              {activeNewsletter.url}
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[480px]">
          <div className="lg:col-span-8 flex flex-col border border-white/20 bg-black/40 rounded-sm relative overflow-hidden min-h-[520px]">
            {!activeNewsletter ? (
              <div className="flex-1 flex flex-col items-center justify-center p-10">
                <Globe2 className="w-10 h-10 live-accent mb-3 opacity-80" />
                <p className="text-base text-[var(--live-muted)] text-center max-w-md leading-relaxed">
                  출처를 고르면 <strong className="text-[var(--live-fg)]">앱 안 리더</strong>로 본문을 불러옵니다.
                  글자 확대로 가독성을 올리세요.
                </p>
              </div>
            ) : viewMode === 'iframe' ? (
              <div className="flex flex-col flex-1">
                <iframe
                  src={activeNewsletter.url}
                  title={`${activeNewsletter.name} 원문`}
                  sandbox="allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox"
                  referrerPolicy="no-referrer"
                  className="w-full flex-1 min-h-[480px] border-0 bg-white"
                />
                <div className="p-3 text-xs text-[var(--live-muted)] bg-black/50 flex flex-wrap gap-3 justify-between items-center">
                  <span>
                    연결 거부 화면이 보이면 정상입니다. <strong className="text-[var(--live-fg)]">앱 안 리더</strong>로 전환하세요.
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewMode('reader')}
                    className="underline live-accent font-bold cursor-pointer bg-transparent border-0"
                  >
                    리더로 돌아가기
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col flex-1 min-h-[520px]">
                <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-white/10 bg-black/30">
                  <span className="text-xs font-bold live-accent flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    앱 안 리더 · 본문 추출
                  </span>
                  <button
                    type="button"
                    disabled={readerLoading}
                    onClick={() => activeNewsletter && loadReader(activeNewsletter.url)}
                    className="text-xs font-bold text-[var(--live-fg)] underline cursor-pointer bg-transparent border-0 disabled:opacity-50"
                  >
                    다시 불러오기
                  </button>
                </div>

                <div
                  className="flex-1 overflow-y-auto p-5 md:p-8 bg-[#0c1210]"
                  style={{ fontSize: `${zoom}%` }}
                >
                  {readerLoading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-[var(--live-muted)]">
                      <Loader2 className="w-8 h-8 animate-spin live-accent" />
                      <p className="text-sm">본문을 불러오는 중…</p>
                    </div>
                  )}
                  {!readerLoading && readerError && (
                    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center max-w-md mx-auto">
                      <AlertCircle className="w-8 h-8 text-[#ff9a8a]" />
                      <p className="text-sm text-[var(--live-muted)] leading-relaxed">{readerError}</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <button type="button" onClick={openOriginal} className="px-4 py-2 btn-mint text-sm rounded-sm cursor-pointer flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          새 탭 원문
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenNote(activeNewsletter.id)}
                          className="px-4 py-2 bg-white/10 text-[var(--live-fg)] text-sm font-bold border border-white/20 rounded-sm cursor-pointer"
                        >
                          메모만 쓰기
                        </button>
                      </div>
                    </div>
                  )}
                  {!readerLoading && !readerError && readerText && (
                    <article className="max-w-3xl mx-auto">
                      <h3
                        className="font-serif text-[var(--live-fg)] tracking-tight mb-4 leading-snug"
                        style={{ fontSize: '1.35em' }}
                      >
                        {activeNewsletter.name}
                      </h3>
                      <pre
                        className="whitespace-pre-wrap break-words font-sans text-[var(--live-fg)] leading-relaxed opacity-95"
                        style={{ fontSize: '0.95em', lineHeight: 1.75 }}
                      >
                        {readerText}
                      </pre>
                      <p className="mt-8 pt-4 border-t border-white/10 text-[0.7em] text-[var(--live-muted)] leading-relaxed">
                        리더는 열람 편의를 위한 요약·추출이며, 저작권은 원 발행사에 있습니다.
                        레이아웃·이미지는 새 탭 원문에서 확인하세요.
                      </p>
                    </article>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notes sidebar */}
          <div className="lg:col-span-4 border border-white/20 bg-black/25 p-5 flex flex-col rounded-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest live-accent mb-4">
              이 출처 최근 메모 ({sourceNotes.length})
            </h3>
            {activeSourceId ? (
              <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[480px] pr-1">
                {sourceNotes.length > 0 ? (
                  sourceNotes.map(note => (
                    <button
                      key={note.id}
                      type="button"
                      onClick={() => onOpenNote(activeSourceId, note.id)}
                      className="w-full text-left p-3 border border-white/15 hover:border-[#a8e0c0] hover:bg-white/5 transition rounded-sm flex flex-col gap-1 cursor-pointer"
                    >
                      <strong className="text-sm text-[var(--live-fg)] font-bold line-clamp-1">
                        {note.title || '제목 없는 메모'}
                      </strong>
                      <p className="text-xs text-[var(--live-muted)] line-clamp-2 leading-relaxed">
                        {note.body || '메모 내용이 비어 있습니다.'}
                      </p>
                    </button>
                  ))
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                    <p className="text-sm text-[var(--live-muted)] mb-3">아직 이 출처 메모가 없습니다.</p>
                    <button
                      type="button"
                      onClick={() => onOpenNote(activeSourceId)}
                      className="px-4 py-2 btn-mint text-sm rounded-sm cursor-pointer"
                    >
                      첫 메모 작성하기
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <p className="text-sm text-[var(--live-muted)] max-w-[220px] leading-relaxed">
                  출처를 고르면 메모가 여기 정렬됩니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
