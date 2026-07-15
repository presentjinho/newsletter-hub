import React, { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, FileText, Send, Mail } from 'lucide-react';
import { Newsletter, Note } from '../types';

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

  // Clock tick
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat('ko-KR', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(now);
      setTimeStr(formatted);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeNewsletter = newsletters.find(n => n.id === activeSourceId);
  const sourceNotes = activeSourceId ? getNotesForSource(activeSourceId) : [];

  return (
    <section className="live-desk bg-[#1f2d28] text-[#edf1e8] p-8 md:p-14 border-b border-line-alpha" id="live">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
          <div className="lg:col-span-8">
            <p className="text-xs font-bold tracking-widest text-[#9bcfb3] mb-2">
              LIVE DESK · 실시간 확인 작업대
            </p>
            <h2 className="font-serif text-3xl md:text-5xl tracking-tight leading-tight mb-3">
              원문을 보면서<br />바로 메모해요
            </h2>
            <p className="text-xs md:text-sm text-[#c3c9bc] flex items-center gap-2">
              <span>현재 시각: {timeStr}</span>
              <span>•</span>
              <span className="text-[#9bcfb3]">{linkSyncStatus}</span>
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-[#c3c9bc] font-bold uppercase tracking-wider">
                출처 선택
              </span>
              <select
                value={activeSourceId}
                onChange={(e) => onSelectSource(e.target.value)}
                className="w-full bg-black/20 border border-white/20 text-[#edf1e8] p-3 text-sm focus:outline-none focus:border-[#9bcfb3] rounded-xs"
              >
                <option value="">출처를 선택하세요...</option>
                {newsletters.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.name} · {n.category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={onRefreshLinkStatus}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 text-xs font-bold text-[#9bcfb3] transition duration-200 border border-white/10 rounded-xs cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                상태 동기화
              </button>

              {activeNewsletter && (
                <>
                  <button
                    onClick={() => window.open(activeNewsletter.url, '_blank', 'noopener')}
                    className="px-3 py-2 bg-[#9bcfb3]/10 hover:bg-[#9bcfb3]/20 text-xs font-bold text-white transition duration-200 border border-[#9bcfb3]/20 rounded-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#9bcfb3]" />
                    새 탭에서 열기
                  </button>

                  <button
                    onClick={() => onOpenNote(activeNewsletter.id)}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition duration-200 border border-white/20 rounded-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    메모 작성
                  </button>

                  <button
                    onClick={() => onQuickGmail(activeNewsletter.id)}
                    className="px-3 py-2 bg-accent-red hover:bg-accent-red/90 text-xs font-bold text-white transition duration-200 rounded-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Gmail 빠른 메모
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Selected Metadata Link Bar */}
        {activeNewsletter ? (
          <div className="p-3 bg-black/10 border border-white/10 text-xs text-[#aeb6ab] mb-6 flex flex-wrap gap-x-6 gap-y-2 items-center">
            <span className="font-bold text-[#edf1e8]">{activeNewsletter.name}</span>
            <span>•</span>
            <span className={activeNewsletter.status === 'alive' ? 'text-green-300' : 'text-gray-400'}>
              {activeNewsletter.status === 'alive' ? '발행 중' : '확인 필요'}
            </span>
            <span>•</span>
            <span>최근 활동: {activeNewsletter.typical}</span>
            <span>•</span>
            <a
              href={activeNewsletter.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-[#9bcfb3] hover:text-white"
            >
              {activeNewsletter.url}
            </a>
          </div>
        ) : (
          <p className="text-xs text-[#aeb6ab] p-3 border border-dashed border-white/10 mb-6 bg-black/5">
            위 dropdown 또는 아래의 뉴스레터 카드의 [실시간] 버튼을 누르면 원문 미리보기와 메모 작성을 동시에 수행할 수 있는 스크린이 표시됩니다.
          </p>
        )}

        {/* Core Live Split Screen: Preview Frame + Recent Memos */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[440px]">
          {/* Left Block: Preview Area */}
          <div className="lg:col-span-8 flex flex-col border border-white/15 bg-[#15201c] rounded-xs relative">
            {activeNewsletter ? (
              <div className="w-full h-full flex flex-col flex-1">
                <iframe
                  src={activeNewsletter.url}
                  title={`${activeNewsletter.name} 원문`}
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  className="w-full h-[450px] border-0 bg-white"
                />
                <p className="p-3 text-[11px] text-[#aeb6ab] bg-black/40 leading-relaxed">
                  💡 대다수의 보안 강화 사이트는 보안 정책(X-Frame-Options)으로 인해 iframe 내부 로딩을 직접적으로 거부할 수 있습니다. 
                  원문이 비어 보이거나 연결 거부가 나타나는 경우, 상단의 [새 탭에서 열기 ↗] 버튼을 통해 외부 창으로 이동하면서 여기에서 메모를 이어서 남기세요.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-10 h-[450px]">
                <p className="text-sm text-[#aeb6ab] text-center max-w-md leading-relaxed">
                  출처를 고르시면 원문 로딩과 맞춤 메모 작성 창이 활성화됩니다.
                </p>
              </div>
            )}
          </div>

          {/* Right Block: Recent Memos sidebar */}
          <div className="lg:col-span-4 border border-white/15 bg-black/15 p-5 flex flex-col rounded-xs">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#9bcfb3] mb-4">
              이 출처 최근 작성한 메모 ({sourceNotes.length})
            </h3>

            {activeSourceId ? (
              <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[390px] pr-1">
                {sourceNotes.length > 0 ? (
                  sourceNotes.map(note => (
                    <button
                      key={note.id}
                      onClick={() => onOpenNote(activeSourceId, note.id)}
                      className="w-full text-left p-3 border border-white/10 hover:border-[#9bcfb3] hover:bg-white/5 transition duration-200 rounded-xs flex flex-col gap-1 cursor-pointer"
                    >
                      <strong className="text-xs text-[#edf1e8] font-bold line-clamp-1">
                        {note.title || '제목 없는 메모'}
                      </strong>
                      <p className="text-[11px] text-[#c3c9bc] line-clamp-2">
                        {note.body || '메모 내용이 비어 있습니다.'}
                      </p>
                      <span className="text-[9px] text-[#aeb6ab] font-mono mt-1">
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
                    <p className="text-xs text-[#c3c9bc] mb-2">아직 이 출처에 남겨진 메모가 존재하지 않습니다.</p>
                    <button
                      onClick={() => onOpenNote(activeSourceId)}
                      className="px-3 py-1.5 bg-[#9bcfb3] hover:bg-[#9bcfb3]/80 text-black text-xs font-bold transition duration-150 rounded-xs cursor-pointer"
                    >
                      첫 메모 작성하기
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <p className="text-xs text-[#aeb6ab] max-w-[200px] leading-relaxed">
                  출처를 고르시면 최근 메모 아카이브가 이곳에 정렬됩니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
