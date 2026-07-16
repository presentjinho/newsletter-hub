import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  RefreshCw,
  ExternalLink,
  FileText,
  Mail,
  Languages,
  ZoomIn,
  ZoomOut,
  BookOpen,
  Loader2,
  AlertCircle,
  Globe2,
  Link2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Newsletter, Note } from '../types';
import {
  cleanReaderText,
  likelyNeedsKorean,
  googleTranslatePageUrl,
  splitInfoBlocks,
  type CleanedReader
} from '../readerClean';
import { fetchReadable, lastFetcherName } from '../readerFetch';
import { isInfoSource } from '../data';
import { openExternal } from '../safeLink';
import { loadString, saveString, SLOTS } from '../browserStore';

/** 불안정·대부분 차단되는 UI는 숨김 (iframe 끼워보기, 무료 문장 번역 API) */
const SHOW_EXPERIMENTAL = false;

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

function ReaderSkeleton() {
  return (
    <div className="max-w-3xl mx-auto py-6 space-y-4 animate-pulse" aria-busy="true" aria-label="본문 불러오는 중">
      <div className="h-7 bg-white/10 rounded-sm w-3/4" />
      <div className="h-3 bg-white/10 rounded-sm w-1/3" />
      <div className="space-y-2 pt-4">
        <div className="h-3.5 bg-white/10 rounded-sm w-full" />
        <div className="h-3.5 bg-white/10 rounded-sm w-full" />
        <div className="h-3.5 bg-white/10 rounded-sm w-11/12" />
        <div className="h-3.5 bg-white/10 rounded-sm w-full" />
        <div className="h-3.5 bg-white/10 rounded-sm w-4/5" />
      </div>
      <div className="space-y-2 pt-6">
        <div className="h-3.5 bg-white/10 rounded-sm w-full" />
        <div className="h-3.5 bg-white/10 rounded-sm w-5/6" />
        <div className="h-3.5 bg-white/10 rounded-sm w-full" />
        <div className="h-3.5 bg-white/10 rounded-sm w-2/3" />
      </div>
      <p className="text-sm text-[var(--live-muted)] flex items-center gap-2 pt-4">
        <Loader2 className="w-4 h-4 animate-spin live-accent" aria-hidden="true" />
        다중 추출기로 본문 정리 중…
      </p>
    </div>
  );
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
  const [rawText, setRawText] = useState('');
  const [readerLoading, setReaderLoading] = useState(false);
  const [readerError, setReaderError] = useState('');
  const [showLinks, setShowLinks] = useState(false);
  const [zoom, setZoom] = useState(() => {
    const z = Number(loadString(SLOTS.readerZoom, '125') || '125');
    return Number.isFinite(z) ? Math.min(200, Math.max(100, z)) : 125;
  });
  const [fetcherHint, setFetcherHint] = useState('');

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
    saveString(SLOTS.readerZoom, String(zoom));
  }, [zoom]);

  // 이메일 뉴스레터는 정보 리더 대상에서 제외
  const infoList = useMemo(() => newsletters.filter(isInfoSource), [newsletters]);
  const activeNewsletter = infoList.find(n => n.id === activeSourceId);
  const sourceNotes = activeSourceId ? getNotesForSource(activeSourceId) : [];
  const siteOf = (n: Newsletter) => n.siteUrl || n.url;
  const subOf = (n: Newsletter) => n.subscribeUrl;

  const cleaned: CleanedReader = useMemo(
    () => cleanReaderText(rawText),
    [rawText]
  );

  const needsKo = useMemo(() => {
    if (!activeNewsletter || !cleaned.body) return false;
    return likelyNeedsKorean(cleaned.body, activeNewsletter.language);
  }, [cleaned.body, activeNewsletter]);

  const loadReader = useCallback(async (url: string) => {
    const ctrl = new AbortController();
    setReaderLoading(true);
    setReaderError('');
    setRawText('');
    setFetcherHint('');
    try {
      const text = await fetchReadable(url, ctrl.signal);
      setRawText(text);
      const name = lastFetcherName();
      if (name) setFetcherHint(`추출: ${name}`);
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        setReaderError(
          '앱 안 리더로 불러오지 못했습니다. 「사이트」또는 「새 탭 번역」으로 읽어 주세요.'
        );
      }
    } finally {
      setReaderLoading(false);
    }
  }, []);

  useEffect(() => {
    setShowLinks(false);
    setFetcherHint('');
    if (!activeNewsletter) {
      setRawText('');
      setReaderError('');
      return;
    }
    let cancelled = false;
    const ctrl = new AbortController();
    const target = siteOf(activeNewsletter);
    (async () => {
      setReaderLoading(true);
      setReaderError('');
      setRawText('');
      try {
        const text = await fetchReadable(target, ctrl.signal);
        if (!cancelled) {
          setRawText(text);
          const name = lastFetcherName();
          if (name) setFetcherHint(`추출: ${name}`);
        }
      } catch (e) {
        if (!cancelled && (e as Error).name !== 'AbortError') {
          setReaderError('앱 안 리더로 불러오지 못했습니다. 「사이트」새 탭으로 열어 주세요.');
        }
      } finally {
        if (!cancelled) setReaderLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [activeNewsletter?.id, activeNewsletter?.siteUrl, activeNewsletter?.url]);

  const openOriginal = () => {
    if (!activeNewsletter) return;
    openExternal(siteOf(activeNewsletter));
  };
  const openSubscribe = () => {
    if (!activeNewsletter) return;
    const sub = subOf(activeNewsletter);
    if (sub) openExternal(sub);
  };
  const openTranslate = () => {
    if (!activeNewsletter) return;
    openExternal(googleTranslatePageUrl(siteOf(activeNewsletter)));
  };

  const zoomIn = () => setZoom(z => Math.min(200, z + 10));
  const zoomOut = () => setZoom(z => Math.max(100, z - 10));
  const zoomReset = () => setZoom(125);

  const displayBody = cleaned.body;
  void SHOW_EXPERIMENTAL;

  return (
    <section className="live-desk p-8 md:p-14 border-b border-white/15" id="live">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-6">
          <div className="lg:col-span-7">
            <p className="text-xs font-bold tracking-widest live-accent mb-2">LIVE DESK · 앱 안 리더</p>
            <h2 className="font-serif text-3xl md:text-5xl tracking-tight leading-tight mb-3 text-[var(--live-fg)]">
              원문만 깨끗하게<br />읽고 메모해요
            </h2>
            <p className="text-sm text-[var(--live-muted)] leading-relaxed max-w-2xl">
              잡링크·메뉴를 빼고 <strong className="text-[var(--live-fg)]">정보만</strong> 번호 블록으로 보여 줍니다.
              안 되는 끼워보기·불안정 번역은 숨겼습니다. 외국어는 <strong className="text-[var(--live-fg)]">새 탭 번역</strong>을 쓰세요.
            </p>
            <p className="text-xs live-accent mt-2">
              지금 {timeStr} · {linkSyncStatus}
            </p>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-[var(--live-muted)] font-bold uppercase tracking-wider">출처 선택</span>
              <select
                value={activeSourceId}
                onChange={e => onSelectSource(e.target.value)}
                className="w-full bg-black/40 border border-white/25 text-[var(--live-fg)] p-3 text-sm focus:outline-none focus:border-[#a8e0c0] rounded-sm"
              >
                <option value="">출처를 선택하세요...</option>
                {infoList.map(n => (
                  <option key={n.id} value={n.id} className="bg-[var(--live-bg)] text-[var(--live-fg)]">
                    {n.name} · {n.category} · {n.country}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-[var(--live-muted)]">
                뉴스·기관 정보 출처만 · 갤러리/커뮤니티(pixiv 등)는 제외 · 구독은 카드의 구독 페이지
              </p>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <button type="button" onClick={onRefreshLinkStatus} className="px-3 py-2 bg-white/10 text-xs font-bold live-accent border border-white/15 rounded-sm cursor-pointer flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> 상태
              </button>
              {activeNewsletter && (
                <>
                  <button type="button" onClick={openOriginal} className="px-3 py-2 bg-white/10 text-xs font-bold text-[var(--live-fg)] border border-white/20 rounded-sm cursor-pointer flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 live-accent" /> 사이트
                  </button>
                  {subOf(activeNewsletter) && (
                    <button type="button" onClick={openSubscribe} className="px-3 py-2 bg-[#cf4f39]/90 text-xs font-bold text-[var(--live-fg)] rounded-sm cursor-pointer">
                      구독 페이지
                    </button>
                  )}
                  <button type="button" onClick={openTranslate} className="px-3 py-2 bg-white/10 text-xs font-bold text-[var(--live-fg)] border border-white/20 rounded-sm cursor-pointer flex items-center gap-1.5">
                    <Languages className="w-3.5 h-3.5" /> 새 탭 번역
                  </button>
                  <button type="button" onClick={() => onOpenNote(activeNewsletter.id)} className="px-3 py-2 bg-white/10 text-xs font-bold text-[var(--live-fg)] border border-white/20 rounded-sm cursor-pointer flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> 메모
                  </button>
                  <button type="button" onClick={() => onQuickGmail(activeNewsletter.id)} className="px-3 py-2 bg-[#cf4f39] text-xs font-bold text-[var(--live-fg)] rounded-sm cursor-pointer flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Gmail
                  </button>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 p-2 bg-black/30 border border-white/15 rounded-sm">
              <span className="text-[11px] font-bold text-[var(--live-muted)] uppercase tracking-wider mr-1">글자 확대</span>
              <button type="button" onClick={zoomOut} className="p-2 bg-white/10 border border-white/20 rounded-sm cursor-pointer text-[var(--live-fg)]" aria-label="축소">
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold text-[var(--live-fg)] min-w-[3.5rem] text-center tabular-nums">{zoom}%</span>
              <button type="button" onClick={zoomIn} className="p-2 bg-white/10 border border-white/20 rounded-sm cursor-pointer text-[var(--live-fg)]" aria-label="확대">
                <ZoomIn className="w-4 h-4" />
              </button>
              <button type="button" onClick={zoomReset} className="text-xs underline live-accent cursor-pointer bg-transparent border-0 font-bold">
                기본
              </button>
              <input type="range" min={100} max={200} step={5} value={zoom} onChange={e => setZoom(Number(e.target.value))} className="flex-1 min-w-[100px] accent-[#9fe0b8]" aria-label="읽기 배율" />
            </div>
          </div>
        </div>

        {activeNewsletter && (
          <div className="p-3 bg-black/25 border border-white/15 text-sm text-[var(--live-muted)] mb-4 flex flex-wrap gap-x-4 gap-y-2 items-center rounded-sm">
            <span className="font-bold text-[var(--live-fg)]">{activeNewsletter.name}</span>
            <span className="text-[11px] text-[var(--live-muted)]">
              앱 안 리더 · 안 되면 사이트/번역 새 탭
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[480px]">
          <div className="lg:col-span-8 flex flex-col border border-white/20 bg-black/40 rounded-sm relative overflow-hidden min-h-[520px]">
            {!activeNewsletter ? (
              <div className="flex-1 flex flex-col items-center justify-center p-10">
                <Globe2 className="w-10 h-10 live-accent mb-3 opacity-80" />
                <p className="text-base text-[var(--live-muted)] text-center max-w-md leading-relaxed">
                  출처를 고르면 본문을 정보 블록으로 정리합니다. 외국어는 「새 탭 번역」을 쓰세요.
                </p>
              </div>
            ) : (
              <div className="flex flex-col flex-1 min-h-[520px]">
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-white/10 bg-black/30">
                  <span className="text-xs font-bold live-accent flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    정보 블록 · 정리된 원문
                  </span>
                  <div className="flex flex-wrap gap-2 items-center">
                    {(needsKo || activeNewsletter.origin === '글로벌') && (
                      <button
                        type="button"
                        onClick={openTranslate}
                        className="px-2.5 py-1 text-xs font-bold rounded-sm border border-[#9fe0b8] bg-[#9fe0b8] text-[#0a100e] cursor-pointer flex items-center gap-1"
                      >
                        <Languages className="w-3.5 h-3.5" aria-hidden="true" />
                        새 탭 한국어 번역
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={readerLoading}
                      onClick={() => activeNewsletter && loadReader(siteOf(activeNewsletter))}
                      className="text-xs font-bold text-[var(--live-fg)] underline cursor-pointer bg-transparent border-0 disabled:opacity-50"
                    >
                      다시 불러오기
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 md:p-8 bg-[#0c1210]" style={{ fontSize: `${zoom}%` }}>
                  {readerLoading && <ReaderSkeleton />}
                  {!readerLoading && readerError && (
                    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center max-w-md mx-auto">
                      <AlertCircle className="w-8 h-8 text-[#ff9a8a]" aria-hidden="true" />
                      <p className="text-sm text-[var(--live-muted)] leading-relaxed">{readerError}</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <button type="button" onClick={openOriginal} className="px-4 py-2 btn-mint text-sm rounded-sm cursor-pointer flex items-center gap-2 border-0">
                          <ExternalLink className="w-4 h-4" aria-hidden="true" /> 사이트 새 탭
                        </button>
                        <button type="button" onClick={openTranslate} className="px-4 py-2 text-sm font-bold rounded-sm border border-white/30 text-[var(--live-fg)] bg-black/30 cursor-pointer flex items-center gap-2">
                          <Languages className="w-4 h-4" aria-hidden="true" /> 새 탭 번역
                        </button>
                      </div>
                    </div>
                  )}
                  {!readerLoading && !readerError && displayBody && (
                    <article className="max-w-3xl mx-auto">
                      {cleaned.title && (
                        <h3 className="font-serif text-[var(--live-fg)] tracking-tight mb-5 leading-snug" style={{ fontSize: '1.35em' }}>
                          {cleaned.title}
                        </h3>
                      )}
                      {fetcherHint && (
                        <p className="text-[0.6em] text-[var(--live-muted)] mb-2 font-mono">{fetcherHint}</p>
                      )}
                      <p className="text-[0.65em] text-[var(--live-muted)] mb-4">
                        정보 {splitInfoBlocks(displayBody).length}건 · 한 블록 = 한 정보
                      </p>
                      <div
                        className="text-[var(--live-fg)] flex flex-col gap-0"
                        style={{ fontSize: '0.95em' }}
                        role="list"
                        aria-label="정리된 정보 목록"
                      >
                        {splitInfoBlocks(displayBody).map((para, i) => {
                          const t = para.trim();
                          if (!t) return null;
                          const isHead =
                            t.length <= 80 &&
                            !/[.!?。]/.test(t) &&
                            !t.startsWith('·');
                          return (
                            <div
                              key={i}
                              role="listitem"
                              className="border-b border-white/10 last:border-0 py-4 first:pt-0"
                            >
                              <div className="flex gap-3 items-start">
                                <span
                                  className="shrink-0 mt-0.5 text-[10px] font-mono font-bold live-accent tabular-nums w-7 text-right"
                                  aria-hidden="true"
                                >
                                  {String(i + 1).padStart(2, '0')}
                                </span>
                                <p
                                  className={
                                    isHead
                                      ? 'm-0 font-semibold tracking-tight text-[var(--live-fg)]'
                                      : 'm-0 whitespace-pre-wrap break-words text-[var(--live-fg)]/95 leading-relaxed'
                                  }
                                  style={{
                                    lineHeight: isHead ? 1.4 : 1.75,
                                    fontSize: isHead ? '1.05em' : undefined
                                  }}
                                >
                                  {t}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* 정제된 읽을 링크만 (이미지·CDN·트래킹 제외) */}
                      {cleaned.links.length > 0 && (
                        <div className="mt-8 border border-white/15 rounded-sm overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setShowLinks(v => !v)}
                            className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-black/40 text-left cursor-pointer border-0 text-[var(--live-fg)]"
                          >
                            <span className="text-xs font-bold flex items-center gap-2">
                              <Link2 className="w-3.5 h-3.5 live-accent" />
                              관련 페이지 {cleaned.links.length}개 · 이미지·광고 링크는 숨김
                            </span>
                            {showLinks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          {showLinks && (
                            <ul className="m-0 p-2 list-none space-y-1.5 bg-black/20">
                              {cleaned.links.map((l, i) => (
                                <li key={i}>
                                  <a
                                    href={l.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col gap-0.5 px-3 py-2 rounded-sm hover:bg-white/5 no-underline"
                                    title={l.url}
                                  >
                                    <span className="text-sm font-semibold text-[var(--live-fg)] leading-snug">
                                      {l.label}
                                    </span>
                                    <span className="text-[10px] text-[var(--live-muted)] flex items-center gap-2">
                                      <span className="live-accent font-bold uppercase tracking-wide">
                                        {l.kind === 'article' ? '기사·페이지' : l.kind === 'video' ? '영상' : l.kind === 'social' ? '소셜' : '기타'}
                                      </span>
                                      <span>{l.host}</span>
                                    </span>
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      <p className="mt-8 pt-4 border-t border-white/10 text-[0.65em] text-[var(--live-muted)] leading-relaxed">
                        본문은 열람용으로 정리한 것이며 저작권은 발행사에 있습니다. 레이아웃·이미지는 사이트 열기로 확인하세요.
                      </p>
                    </article>
                  )}
                  {!readerLoading && !readerError && !displayBody && (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                      <p className="text-sm text-[var(--live-muted)]">정리할 본문이 없습니다. 사이트에서 직접 읽어 주세요.</p>
                      <button type="button" onClick={openOriginal} className="px-4 py-2 btn-mint text-sm rounded-sm cursor-pointer border-0">
                        사이트 새 탭
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

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
                      <strong className="text-sm text-[var(--live-fg)] font-bold line-clamp-1">{note.title || '제목 없는 메모'}</strong>
                      <p className="text-xs text-[var(--live-muted)] line-clamp-2 leading-relaxed">{note.body || '메모 내용이 비어 있습니다.'}</p>
                    </button>
                  ))
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                    <p className="text-sm text-[var(--live-muted)] mb-3">아직 이 출처 메모가 없습니다.</p>
                    <button type="button" onClick={() => onOpenNote(activeSourceId)} className="px-4 py-2 btn-mint text-sm rounded-sm cursor-pointer">
                      첫 메모 작성하기
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <p className="text-sm text-[var(--live-muted)] max-w-[220px] leading-relaxed">출처를 고르면 메모가 여기 정렬됩니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
