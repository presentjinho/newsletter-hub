import React, { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, FileText, Mail, Languages, ShieldOff, Eye } from 'lucide-react';
import { Newsletter, Note } from '../types';
import { canAttemptIframe, embedBlockReason } from '../embedPolicy';

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
  /** 사용자가 명시적으로 iframe 시도를 켠 경우만 */
  const [forceIframe, setForceIframe] = useState(false);
  const [iframeFailed, setIframeFailed] = useState(false);

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

  // 출처 바뀌면 iframe 강제/실패 상태 리셋
  useEffect(() => {
    setForceIframe(false);
    setIframeFailed(false);
  }, [activeSourceId]);

  const activeNewsletter = newsletters.find(n => n.id === activeSourceId);
  const sourceNotes = activeSourceId ? getNotesForSource(activeSourceId) : [];
  const allowIframe =
    !!activeNewsletter && canAttemptIframe(activeNewsletter.url) && forceIframe && !iframeFailed;
  const showBlockedPanel = !!activeNewsletter && !allowIframe;

  const openOriginal = () => {
    if (activeNewsletter) window.open(activeNewsletter.url, '_blank', 'noopener,noreferrer');
  };

  const openTranslate = () => {
    if (!activeNewsletter) return;
    const u = `https://translate.google.com/translate?sl=auto&tl=ko&u=${encodeURIComponent(activeNewsletter.url)}`;
    window.open(u, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="live-desk p-8 md:p-14 border-b border-white/15" id="live">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
          <div className="lg:col-span-8">
            <p className="text-xs font-bold tracking-widest live-accent mb-2">
              LIVE DESK · 실시간 확인 작업대
            </p>
            <h2 className="font-serif text-3xl md:text-5xl tracking-tight leading-tight mb-3 text-[var(--live-fg)]">
              원문을 보면서<br />바로 메모해요
            </h2>
            <p className="text-sm text-[var(--live-muted)] flex flex-wrap items-center gap-2">
              <span>현재 시각: {timeStr}</span>
              <span className="opacity-50">•</span>
              <span className="live-accent">{linkSyncStatus}</span>
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-[var(--live-muted)] font-bold uppercase tracking-wider">
                출처 선택
              </span>
              <select
                value={activeSourceId}
                onChange={(e) => onSelectSource(e.target.value)}
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

            <div className="flex flex-wrap gap-2">
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
                    className="px-3 py-2 bg-[#a8e0c0]/15 hover:bg-[#a8e0c0]/25 text-xs font-bold text-[var(--live-fg)] border border-[#a8e0c0]/30 rounded-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 live-accent" />
                    새 탭에서 원문
                  </button>

                  {activeNewsletter.origin === '글로벌' && (
                    <button
                      type="button"
                      onClick={openTranslate}
                      className="px-3 py-2 bg-white/10 hover:bg-white/15 text-xs font-bold text-[var(--live-fg)] border border-white/20 rounded-sm cursor-pointer flex items-center gap-1.5"
                    >
                      <Languages className="w-3.5 h-3.5" />
                      한국어로 보기
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onOpenNote(activeNewsletter.id)}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-xs font-bold text-[var(--live-fg)] border border-white/20 rounded-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    메모 작성
                  </button>

                  <button
                    type="button"
                    onClick={() => onQuickGmail(activeNewsletter.id)}
                    className="px-3 py-2 bg-[#cf4f39] hover:bg-[#b84430] text-xs font-bold text-[var(--live-fg)] rounded-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Gmail 빠른 메모
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {activeNewsletter ? (
          <div className="p-3 bg-black/25 border border-white/15 text-sm text-[var(--live-muted)] mb-6 flex flex-wrap gap-x-4 gap-y-2 items-center rounded-sm">
            <span className="font-bold text-[var(--live-fg)]">{activeNewsletter.name}</span>
            <span className="opacity-40">•</span>
            <span className={activeNewsletter.status === 'alive' ? 'live-accent' : 'text-[#c4b8a0]'}>
              {activeNewsletter.status === 'alive' ? '발행 중' : '확인 필요'}
            </span>
            <span className="opacity-40">•</span>
            <span>최근 활동: {activeNewsletter.typical}</span>
            <span className="opacity-40">•</span>
            <a
              href={activeNewsletter.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline live-accent hover:text-[var(--live-fg)] break-all"
            >
              {activeNewsletter.url}
            </a>
          </div>
        ) : (
          <p className="text-sm text-[var(--live-muted)] p-3 border border-dashed border-white/20 mb-6 bg-black/20 rounded-sm">
            드롭다운 또는 카드의 [실시간]을 누르면 원문 열기와 메모를 같이 할 수 있습니다.
            대부분의 사이트는 보안상 페이지 안 미리보기를 막으므로, <strong className="text-[var(--live-fg)]">새 탭 + 메모</strong>가 기본입니다.
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[440px]">
          <div className="lg:col-span-8 flex flex-col border border-white/20 bg-black/40 rounded-sm relative overflow-hidden min-h-[450px]">
            {activeNewsletter ? (
              showBlockedPanel ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 text-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-[#a8e0c0]/15 flex items-center justify-center">
                    <ShieldOff className="w-7 h-7 live-accent" />
                  </div>
                  <div className="max-w-lg space-y-3">
                    <h3 className="font-serif text-2xl text-[var(--live-fg)] tracking-tight">
                      미리보기 대신 새 탭으로 엽니다
                    </h3>
                    <p className="text-sm text-[var(--live-muted)] leading-relaxed">
                      {embedBlockReason(activeNewsletter.url)}
                      <br />
                      <span className="live-accent">
                        DW, BBC, NASA 등 공신력 있는 사이트일수록 이 차단이 흔합니다. 오류가 아닙니다.
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <button
                      type="button"
                      onClick={openOriginal}
                      className="px-5 py-3 btn-mint text-sm rounded-sm cursor-pointer flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      새 탭에서 원문 열기
                    </button>
                    {activeNewsletter.origin === '글로벌' && (
                      <button
                        type="button"
                        onClick={openTranslate}
                        className="px-5 py-3 bg-white/10 text-[var(--live-fg)] font-bold text-sm border border-white/25 rounded-sm cursor-pointer flex items-center gap-2 hover:bg-white/15"
                      >
                        <Languages className="w-4 h-4" />
                        한국어 번역 탭
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onOpenNote(activeNewsletter.id)}
                      className="px-5 py-3 bg-white/10 text-[var(--live-fg)] font-bold text-sm border border-white/25 rounded-sm cursor-pointer flex items-center gap-2 hover:bg-white/15"
                    >
                      <FileText className="w-4 h-4" />
                      여기서 메모
                    </button>
                  </div>
                  {canAttemptIframe(activeNewsletter.url) && (
                    <button
                      type="button"
                      onClick={() => {
                        setIframeFailed(false);
                        setForceIframe(true);
                      }}
                      className="mt-2 text-xs live-accent underline cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      그래도 페이지 안 미리보기 시도
                    </button>
                  )}
                  <div className="mt-4 p-4 bg-black/30 border border-white/10 rounded-sm text-left w-full max-w-lg">
                    <p className="text-[11px] font-bold live-accent mb-1">권장 흐름</p>
                    <ol className="text-sm text-[var(--live-muted)] list-decimal list-inside space-y-1 leading-relaxed">
                      <li>새 탭에서 원문 읽기</li>
                      <li>이 화면에서 메모 작성</li>
                      <li>필요하면 Gmail로 보내기</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col flex-1">
                  <iframe
                    src={activeNewsletter.url}
                    title={`${activeNewsletter.name} 원문`}
                    // allow-same-origin 제거: 불필요 권한 축소. 스크립트만 허용.
                    sandbox="allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox"
                    referrerPolicy="no-referrer"
                    className="w-full h-[450px] border-0 bg-white"
                    onError={() => setIframeFailed(true)}
                    onLoad={(e) => {
                      // 빈/차단 프레임 감지 어려움 — 사용자가 거부 화면 보면 버튼으로 전환
                      try {
                        const doc = (e.target as HTMLIFrameElement).contentDocument;
                        if (doc && doc.body && doc.body.innerHTML.trim() === '') {
                          setIframeFailed(true);
                        }
                      } catch {
                        // cross-origin: 로드는 됐으나 내용은 못 봄 — 정상일 수 있음
                      }
                    }}
                  />
                  <div className="p-3 text-xs text-[var(--live-muted)] bg-black/50 leading-relaxed flex flex-wrap gap-3 items-center justify-between">
                    <span>
                      연결 거부·빈 화면이면 미리보기를 끄고 새 탭을 쓰세요. (보안 정책)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setForceIframe(false);
                        setIframeFailed(true);
                      }}
                      className="underline live-accent cursor-pointer font-bold"
                    >
                      미리보기 끄기
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-10 h-[450px]">
                <p className="text-base text-[var(--live-muted)] text-center max-w-md leading-relaxed">
                  출처를 고르면 원문 열기 버튼과 메모 패널이 활성화됩니다.
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 border border-white/20 bg-black/25 p-5 flex flex-col rounded-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest live-accent mb-4">
              이 출처 최근 메모 ({sourceNotes.length})
            </h3>

            {activeSourceId ? (
              <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[390px] pr-1">
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
                      <span className="text-[10px] text-[var(--live-muted)] font-mono mt-1">
                        {new Date(note.updatedAt).toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
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
                  출처를 고르면 최근 메모가 여기 정렬됩니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
