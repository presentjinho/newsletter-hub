import React from 'react';
import { Mail, Plus, Folder, BookOpen, Inbox, LogIn, CheckCircle2, AlertCircle } from 'lucide-react';
import { Note, Notebook } from '../types';
import { isValidEmail } from '../gmailCompose';

interface NotesHubProps {
  notes: Note[];
  notebooks: Notebook[];
  gmailSelfEmail: string;
  onGmailEmailChange: (email: string) => void;
  onGoogleLogin?: () => void;
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
  onGoogleLogin,
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
  const emailTrim = gmailSelfEmail.trim();
  const emailValid = !emailTrim || isValidEmail(emailTrim);
  const emailReady = isValidEmail(emailTrim);

  return (
    <section className="notes-hub bg-[var(--surface-2)] p-8 md:p-14 border-b border-line-alpha" id="notes">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-widest text-forest-green dark:text-[var(--green)] mb-2">
              NOTES · GMAIL · PORTAL
            </p>
            <h2 className="font-serif text-3xl md:text-5xl tracking-tight leading-tight mb-4 text-ink">
              메모하고, Gmail로 보내고,<br />원하는 곳으로 이동하기
            </h2>
            <p className="text-sm text-secondary leading-relaxed">
              메모는 브라우저 로컬에 저장됩니다. Gmail은 <strong className="text-ink">이 앱 로그인이 아니라</strong> 브라우저의 Google 계정 세션으로 작성 창을 엽니다.
              로그인되어 있지 않으면 Google 로그인 화면이 먼저 나옵니다.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <button
              type="button"
              onClick={onOpenInbox}
              className="px-4 py-3 bg-ink text-paper hover:opacity-90 transition duration-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer rounded-xs"
            >
              <Inbox className="w-4 h-4" />
              일반 메모함 열기
            </button>
            
            <button
              type="button"
              onClick={onAddNotebook}
              className="px-4 py-3 bg-[var(--warm)] text-ink hover:opacity-90 border border-line-alpha transition duration-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer rounded-xs"
            >
              <Plus className="w-4 h-4 text-accent-red" />
              새 폴더 추가
            </button>

            <div className="flex flex-col gap-1 text-left min-w-[200px]">
              <label htmlFor="gmail-self-email" className="text-[10px] font-bold text-secondary uppercase tracking-wider">
                나에게 보낼 주소 (to)
              </label>
              <input
                id="gmail-self-email"
                type="email"
                autoComplete="email"
                placeholder="you@gmail.com"
                value={gmailSelfEmail}
                onChange={(e) => onGmailEmailChange(e.target.value)}
                className={`bg-white text-ink border px-3 py-2 text-xs focus:outline-none max-w-[240px] ${
                  emailValid ? 'border-line-alpha focus:border-forest-green' : 'border-accent-red'
                }`}
              />
              <span className={`text-[10px] flex items-center gap-1 ${emailReady ? 'text-forest-green dark:text-[var(--green)]' : emailTrim ? 'text-accent-red' : 'text-secondary'}`}>
                {emailReady ? (
                  <><CheckCircle2 className="w-3 h-3" /> 주소 형식 OK · 로컬에 저장됨</>
                ) : emailTrim ? (
                  <><AlertCircle className="w-3 h-3" /> 이메일 형식이 아닙니다</>
                ) : (
                  <>비워 두면 작성 창에서 to를 직접 입력</>
                )}
              </span>
            </div>

            {onGoogleLogin && (
              <button
                type="button"
                onClick={onGoogleLogin}
                className="px-4 py-3 bg-[#cf4f39] text-white hover:opacity-95 transition duration-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer rounded-xs"
                title="브라우저에서 Google 계정으로 Gmail 로그인"
              >
                <LogIn className="w-4 h-4" />
                Google 로그인 확인
              </button>
            )}
          </div>
        </div>

        <div className="mb-6 p-3 border border-line-alpha bg-[var(--surface)] text-xs text-secondary leading-relaxed rounded-sm">
          <strong className="text-ink">Gmail이 안 열릴 때:</strong>{' '}
          ① 「Google 로그인 확인」으로 계정 로그인 → ② 팝업 차단 해제 → ③ 메모에서 「Gmail」 다시 클릭.
          이 사이트는 Gmail 비밀번호를 받지 않습니다.
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
                  className="notes-hub-card p-5 border border-line-alpha bg-[var(--surface)] flex flex-col justify-between min-h-[190px] transition-all duration-200 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-forest-green dark:text-[var(--green)] uppercase tracking-wider mb-2">
                      <Folder className="w-3.5 h-3.5 text-accent-red" />
                      <span className="line-clamp-1">{folderName}</span>
                    </div>

                    <h3 className="font-serif text-lg leading-snug mb-1 text-ink line-clamp-1">
                      {latestNote.title || '제목 없는 메모'}
                    </h3>

                    <p className="text-xs text-secondary line-clamp-2 leading-relaxed mb-3">
                      {latestNote.body || '빈 메모'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-secondary mb-3">
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
                        <BookOpen className="w-3 h-3 text-forest-green dark:text-[var(--green)]" />
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
              <Inbox className="w-10 h-10 text-secondary mb-2" />
              <p className="text-sm font-medium text-secondary mb-1">
                아직 생성된 메모가 존재하지 않습니다.
              </p>
              <p className="text-xs text-secondary">
                원하는 편지 카드의 [메모] 또는 상단의 [실시간 확인 작업대]에서 메모를 바로 남겨 보세요!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
