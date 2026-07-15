import React, { useState, useEffect } from 'react';
import { Mail, Plus, Trash2, Copy, FileCode, ArrowRightLeft, X } from 'lucide-react';
import { Note, Notebook, Newsletter } from '../types';

interface NoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sourceId: string;
  noteId?: string; // If provided, load this note; else create or load latest
  
  notes: Note[];
  notebooks: Notebook[];
  newsletters: Newsletter[];
  
  onSaveNote: (id: string, patch: { title: string; body: string }) => void;
  onCreateNote: (sourceId: string, title?: string, body?: string) => Note;
  onDeleteNote: (id: string) => void;
  onTransferNote: (id: string, targetSourceId: string, mode: 'move' | 'copy') => Note | null;
  onSendGmail: (note: Note) => void;
  onSendMailto: (note: Note) => void;
  onCopyNote: (note: Note) => Promise<boolean>;
  onExportMarkdown: (note: Note) => void;
  getSourceName: (sourceId: string) => string;
}

export default function NoteDialog({
  isOpen,
  onClose,
  sourceId,
  noteId,
  notes,
  notebooks,
  newsletters,
  onSaveNote,
  onCreateNote,
  onDeleteNote,
  onTransferNote,
  onSendGmail,
  onSendMailto,
  onCopyNote,
  onExportMarkdown,
  getSourceName
}: NoteDialogProps) {
  
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [transferTarget, setTransferTarget] = useState('');
  const [transferMode, setTransferMode] = useState<'move' | 'copy'>('move');

  // Filter notes that belong to this folder
  const currentSourceNotes = notes
    .filter(n => n.sourceId === sourceId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  useEffect(() => {
    if (isOpen) {
      // Find requested note, or the most recent one in this folder, or create a new one
      let noteToLoad: Note | null = null;
      if (noteId) {
        noteToLoad = notes.find(n => n.id === noteId) || null;
      }
      if (!noteToLoad && currentSourceNotes.length > 0) {
        noteToLoad = currentSourceNotes[0];
      }
      if (!noteToLoad) {
        // Create dynamic initial note
        const folderName = getSourceName(sourceId);
        noteToLoad = onCreateNote(sourceId, `${folderName} 새 메모`, '');
      }

      setActiveNote(noteToLoad);
      setTitle(noteToLoad.title);
      setBody(noteToLoad.body);

      // Set default transfer target
      const defaultTarget = notebooks.find(n => n.id !== sourceId)?.id || 'inbox';
      setTransferTarget(defaultTarget === sourceId ? '' : defaultTarget);
    } else {
      setActiveNote(null);
    }
  }, [isOpen, sourceId, noteId, notes]);

  if (!isOpen) return null;

  const handleNoteSelect = (n: Note) => {
    // Auto-save current active note first
    if (activeNote) {
      onSaveNote(activeNote.id, { title, body });
    }
    setActiveNote(n);
    setTitle(n.title);
    setBody(n.body);
  };

  const handleCreateNew = () => {
    // Auto-save current active note
    if (activeNote) {
      onSaveNote(activeNote.id, { title, body });
    }
    const folderName = getSourceName(sourceId);
    const newNote = onCreateNote(sourceId, `${folderName} 새 메모`, '');
    setActiveNote(newNote);
    setTitle(newNote.title);
    setBody(newNote.body);
  };

  const handleLocalSave = () => {
    if (activeNote) {
      onSaveNote(activeNote.id, { title, body });
      // update activeNote state locally
      setActiveNote({
        ...activeNote,
        title,
        body,
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handleLocalDelete = () => {
    if (!activeNote) return;
    if (window.confirm('이 메모를 정말 삭제할까요?')) {
      onDeleteNote(activeNote.id);
      
      // Load next available note, or close if none left
      const remaining = currentSourceNotes.filter(n => n.id !== activeNote.id);
      if (remaining.length > 0) {
        setActiveNote(remaining[0]);
        setTitle(remaining[0].title);
        setBody(remaining[0].body);
      } else {
        onClose();
      }
    }
  };

  const handleTransfer = () => {
    if (!activeNote || !transferTarget) return;
    
    // Save current state first
    onSaveNote(activeNote.id, { title, body });

    const result = onTransferNote(activeNote.id, transferTarget, transferMode);
    if (result) {
      if (transferMode === 'move') {
        // If moved, load this note in its new target screen or just close/update
        setActiveNote(result);
        setTitle(result.title);
        setBody(result.body);
        // Alert main App that sourceId has shifted
        alert('메모가 새로운 폴더로 이동되었습니다.');
        onClose();
      } else {
        alert('메모 복사본이 새로운 폴더에 생성되었습니다.');
      }
    }
  };

  const activeNewsletter = newsletters.find(n => n.id === sourceId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/55 backdrop-blur-xs">
      <div className="w-full max-w-4xl bg-[#f6f0e3] dark:bg-[#22332b] text-ink border border-line-alpha shadow-2xl relative animate-fade-in max-h-[95vh] flex flex-col md:flex-row overflow-hidden rounded-xs">
        
        {/* Left sidebar: list of notes in current source folder */}
        <aside className="w-full md:w-[240px] bg-[#ebe4d4] dark:bg-[#1a2822] border-r border-line-alpha p-5 overflow-y-auto flex flex-col justify-between max-h-[300px] md:max-h-[80vh]">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-forest-green dark:text-green-300 uppercase mb-4">
              폴더 메모 아카이브
            </p>
            <button
              onClick={handleCreateNew}
              className="w-full py-2 px-3 text-xs font-bold text-forest-green dark:text-green-300 border border-dashed border-forest-green/30 hover:bg-ink/5 transition duration-200 text-left flex items-center justify-between cursor-pointer rounded-xs mb-4"
            >
              <span>+ 새 메모 작성</span>
              <Plus className="w-3.5 h-3.5" />
            </button>

            <div className="space-y-2 max-h-[160px] md:max-h-[50vh] overflow-y-auto pr-1">
              {currentSourceNotes.map(n => (
                <button
                  key={n.id}
                  onClick={() => handleNoteSelect(n)}
                  className={`w-full text-left p-3 border cursor-pointer transition duration-200 flex flex-col gap-1 rounded-xs
                    ${activeNote?.id === n.id
                      ? 'bg-ink border-ink text-white dark:bg-white dark:border-white dark:text-ink'
                      : 'border-line-alpha hover:bg-ink/5 dark:hover:bg-white/5 text-ink'
                    }
                  `}
                >
                  <span className="text-xs font-bold line-clamp-1">{n.title || '제목 없음'}</span>
                  <span className={`text-[9px] font-mono ${activeNote?.id === n.id ? 'opacity-70' : 'text-gray-400'}`}>
                    {new Date(n.updatedAt).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-line-alpha hidden md:block">
            <span className="text-[10px] text-gray-400 font-bold block">현재 폴더</span>
            <span className="text-xs font-bold text-ink line-clamp-1 mt-0.5">
              {getSourceName(sourceId)}
            </span>
          </div>
        </aside>

        {/* Right Editor Pane */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[70vh] md:max-h-[80vh] flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-forest-green dark:text-green-300 uppercase block">
                MEMO EDITOR
              </span>
              <h3 className="font-serif text-xl text-ink leading-tight">
                {getSourceName(sourceId)}
              </h3>
            </div>
            <button
              onClick={() => {
                // Save before closing
                handleLocalSave();
                onClose();
              }}
              className="p-1.5 hover:bg-ink/5 dark:hover:bg-white/5 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Title input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="메모 제목"
            className="w-full text-base font-bold text-ink border border-line-alpha px-3 py-2.5 bg-white dark:bg-[#15201c] dark:text-white rounded-xs focus:outline-none focus:border-forest-green mb-3"
          />

          {/* Text Area */}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="읽고 떠오른 것, 나중에 다시 볼 요약, 할 일 등을 자유롭게 남기세요..."
            className="w-full flex-1 min-h-[180px] text-sm text-ink border border-line-alpha p-4 bg-white dark:bg-[#15201c] dark:text-white rounded-xs focus:outline-none focus:border-forest-green leading-relaxed resize-y font-sans"
          />

          {/* Visit origin helper if active source is a newsletter */}
          {activeNewsletter && (
            <a
              href={activeNewsletter.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-forest-green dark:text-green-300 hover:underline mt-2 self-start flex items-center gap-1.5 font-bold"
            >
              <span>{activeNewsletter.name} 원문 실시간 확인 ↗</span>
            </a>
          )}

          {/* Action Toolbar */}
          <div className="flex flex-wrap gap-2 items-center mt-4 pt-4 border-t border-line-alpha">
            <button
              type="button"
              onClick={handleLocalSave}
              className="px-4 py-2.5 bg-accent-red hover:bg-accent-red/90 text-white font-bold text-xs rounded-xs cursor-pointer"
            >
              저장
            </button>

            {activeNote && (
              <>
                <button
                  type="button"
                  onClick={() => onSendGmail(activeNote)}
                  className="px-3 py-2.5 bg-white hover:bg-warm border border-line-alpha text-ink font-bold text-xs rounded-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-accent-red" />
                  Gmail 전송
                </button>

                <button
                  type="button"
                  onClick={() => onSendMailto(activeNote)}
                  className="px-3 py-2.5 bg-white hover:bg-warm border border-line-alpha text-ink font-bold text-xs rounded-xs cursor-pointer flex items-center gap-1.5"
                >
                  기본 메일 앱
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const ok = await onCopyNote(activeNote);
                    if (ok) alert('메모가 클립보드에 복사되었습니다.');
                  }}
                  className="px-3 py-2.5 bg-white hover:bg-warm border border-line-alpha text-ink font-bold text-xs rounded-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  복사
                </button>

                <button
                  type="button"
                  onClick={() => onExportMarkdown(activeNote)}
                  className="px-3 py-2.5 bg-white hover:bg-warm border border-line-alpha text-ink font-bold text-xs rounded-xs cursor-pointer flex items-center gap-1.5"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  MD 다운로드
                </button>
              </>
            )}
          </div>

          {/* Move/Copy Folder Actions */}
          {activeNote && (
            <div className="flex flex-wrap gap-4 items-end justify-between mt-4 pt-4 border-t border-line-alpha">
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                    다른 폴더로
                  </span>
                  <select
                    value={transferTarget}
                    onChange={(e) => setTransferTarget(e.target.value)}
                    className="bg-white dark:bg-[#15201c] dark:text-white border border-line-alpha px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="">폴더 선택...</option>
                    <option value="inbox">일반 메모함</option>
                    {notebooks.filter(n => n.id !== 'inbox').map(n => (
                      <option key={n.id} value={n.id}>{n.name}</option>
                    ))}
                    {newsletters.map(nl => (
                      <option key={nl.id} value={nl.id}>출처 • {nl.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                    방식
                  </span>
                  <select
                    value={transferMode}
                    onChange={(e) => setTransferMode(e.target.value as 'move' | 'copy')}
                    className="bg-white dark:bg-[#15201c] dark:text-white border border-line-alpha px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="move">이동 (폴더 변경)</option>
                    <option value="copy">복사 (복제본 생성)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleTransfer}
                  disabled={!transferTarget || transferTarget === sourceId}
                  className="px-4 py-2 bg-forest-green dark:bg-green-600 hover:opacity-90 disabled:opacity-40 text-white font-bold text-xs cursor-pointer rounded-xs flex items-center gap-1"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  옮기기
                </button>
              </div>

              <button
                type="button"
                onClick={handleLocalDelete}
                className="px-3 py-2 border border-accent-red/20 hover:bg-accent-red/5 text-accent-red font-bold text-xs rounded-xs flex items-center gap-1.5 cursor-pointer ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                삭제
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
