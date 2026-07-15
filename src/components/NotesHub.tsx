import React from 'react';
import { Mail, Plus, Folder, BookOpen, Inbox } from 'lucide-react';
import { Note, Notebook } from '../types';

interface NotesHubProps {
  notes: Note[];
  notebooks: Notebook[];
  gmailSelfEmail: string;
  onGmailEmailChange: (email: string) => void;
  onOpenInbox: () => void;
  onAddNotebook: () => void;
  onOpenNote: (sourceId: string, noteId?: string) => void;
  onSendGmail: (note: Note) => void;
  getSourceName: (sourceId: string) => string;
}

export default function NotesHub({
  notes,
  notebooks,
  gmailSelfEmail,
  onGmailEmailChange,
  onOpenInbox,
  onAddNotebook,
  onOpenNote,
  onSendGmail,
  getSourceName
}: NotesHubProps) {

  // Group notes by sourceId
  const notesBySource = notes.reduce((acc, note) => {
    if (!acc[note.sourceId]) acc[note.sourceId] = [];
    acc[note.sourceId].push(note);
    return acc;
  }, {} as Record<string, Note[]>);

  const activeSources = Object.keys(notesBySource);

  return (
    <section className="notes-hub bg-[#f4efe4] dark:bg-[#1d2a25] p-8 md:p-14 border-b border-line-alpha" id="notes">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-widest text-forest-green dark:text-green-300 mb-2">
              NOTES · GMAIL · PORTAL
            </p>
            <h2 className="font-serif text-3xl md:text-5xl tracking-tight leading-tight mb-4 text-ink">
              메모하고, Gmail로 보내고,<br />원하는 곳으로 이동하기
            </h2>
            <p className="text-sm text-[#2a3831] dark:text-[#d0ddd6] leading-relaxed">
              작성된 메모들은 브라우저 로컬 저장소에 저장되어 안전하게 유지됩니다.<br />
              지정한 이메일 주소를 사용해 클릭 한 번으로 Gmail 편지 작성 창(compose)으로 내보내거나 백업할 수 있습니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenInbox}
              className="px-4 py-3 bg-ink text-white dark:bg-white dark:text-ink hover:opacity-90 transition duration-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer rounded-xs"
            >
              <Inbox className="w-4 h-4" />
              일반 메모함 열기
            </button>
            
            <button
              onClick={onAddNotebook}
              className="px-4 py-3 bg-[#e7ddc9] dark:bg-[#283a32] text-ink hover:opacity-90 border border-line-alpha transition duration-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer rounded-xs"
            >
              <Plus className="w-4 h-4 text-accent-red" />
              새 폴더 추가
            </button>

            <div className="flex flex-col gap-1 text-left">
              <label className="text-[10px] font-bold text-[#3d4f46] dark:text-[#c5d4cb] uppercase tracking-wider">
                나에게 보낼 Gmail 주소
              </label>
              <input
                type="email"
                placeholder="you@gmail.com"
                value={gmailSelfEmail}
                onChange={(e) => onGmailEmailChange(e.target.value)}
                className="bg-white text-ink border border-line-alpha px-3 py-2 text-xs focus:outline-none focus:border-forest-green max-w-[200px]"
              />
            </div>
          </div>
        </div>

        {/* Notes Folders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {activeSources.length > 0 ? (
            activeSources.map(sourceId => {
              const sourceList = notesBySource[sourceId] || [];
              const latestNote = [...sourceList].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
              const folderName = getSourceName(sourceId);

              return (
                <article
                  key={sourceId}
                  className="notes-hub-card p-5 border border-line-alpha bg-white/70 dark:bg-[#22332b] flex flex-col justify-between min-h-[190px] transition-all duration-200 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-forest-green dark:text-green-300 uppercase tracking-wider mb-2">
                      <Folder className="w-3.5 h-3.5 text-accent-red" />
                      <span className="line-clamp-1">{folderName}</span>
                    </div>

                    <h3 className="font-serif text-lg leading-snug mb-1 text-ink line-clamp-1">
                      {latestNote.title || '제목 없는 메모'}
                    </h3>

                    <p className="text-xs text-[#3d4f46] dark:text-[#c5d4cb] line-clamp-2 leading-relaxed mb-3">
                      {latestNote.body || '빈 메모'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-[#5a6b62] dark:text-[#b8c9bf] mb-3">
                      {sourceList.length}개의 메모 • {new Date(latestNote.updatedAt).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>

                    <div className="flex gap-2 border-t border-line-alpha pt-3">
                      <button
                        onClick={() => onOpenNote(sourceId, latestNote.id)}
                        className="flex-1 py-1.5 text-center text-xs font-bold bg-line-alpha hover:bg-warm transition duration-200 text-ink cursor-pointer flex items-center justify-center gap-1"
                      >
                        <BookOpen className="w-3 h-3 text-forest-green dark:text-green-300" />
                        <span>열기 ({sourceList.length})</span>
                      </button>
                      
                      <button
                        onClick={() => onSendGmail(latestNote)}
                        className="flex-1 py-1.5 text-center text-xs font-bold bg-[#cf4f39]/10 hover:bg-[#cf4f39]/20 text-accent-red transition duration-200 cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Mail className="w-3 h-3" />
                        <span>Gmail</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center bg-white/40 border border-dashed border-line-alpha p-10 flex flex-col items-center justify-center">
              <Inbox className="w-10 h-10 text-[#5a6b62] dark:text-[#b8c9bf] mb-2" />
              <p className="text-sm font-medium text-[#3d4f46] dark:text-[#c5d4cb] mb-1">
                아직 생성된 메모가 존재하지 않습니다.
              </p>
              <p className="text-xs text-[#5a6b62] dark:text-[#b8c9bf]">
                원하는 편지 카드의 [메모] 또는 상단의 [실시간 확인 작업대]에서 메모를 바로 남겨 보세요!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
