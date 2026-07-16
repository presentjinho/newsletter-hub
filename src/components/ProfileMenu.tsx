import React, { useState } from 'react';
import { User, ChevronDown, Plus, Check, Pencil, Trash2 } from 'lucide-react';
import {
  listProfiles,
  getActiveProfile,
  setActiveProfileId,
  createProfile,
  renameProfile,
  deleteProfile,
  type UserProfile
} from '../profileStore';

interface ProfileMenuProps {
  onSwitched: () => void;
}

export default function ProfileMenu({ onSwitched }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const [profiles, setProfiles] = useState<UserProfile[]>(() => listProfiles());
  const [active, setActive] = useState(() => getActiveProfile());
  const [newName, setNewName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');

  const refresh = () => {
    setProfiles(listProfiles());
    setActive(getActiveProfile());
  };

  const switchTo = (id: string) => {
    if (id === active.id) {
      setOpen(false);
      return;
    }
    if (setActiveProfileId(id)) {
      setOpen(false);
      onSwitched();
    }
  };

  const add = () => {
    const p = createProfile(newName || `사용자 ${profiles.length + 1}`);
    setNewName('');
    refresh();
    // 새 프로필로 전환 → 빈 상태로 리로드
    onSwitched();
    void p;
  };

  const saveRename = (id: string) => {
    renameProfile(id, renameVal);
    setRenamingId(null);
    refresh();
  };

  const remove = (id: string) => {
    if (profiles.length <= 1) return;
    if (!window.confirm('이 프로필의 목록·메모·설정이 이 브라우저에서 삭제됩니다. 계속할까요?')) return;
    const wasActive = id === active.id;
    deleteProfile(id);
    refresh();
    if (wasActive) onSwitched();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          refresh();
          setOpen(v => !v);
        }}
        className="flex items-center gap-1.5 text-xs font-bold bg-transparent border border-line-alpha px-2.5 py-1.5 rounded-sm cursor-pointer focus-ring max-w-[140px]"
        aria-expanded={open}
        aria-haspopup="listbox"
        title="이 브라우저 안 개인 프로필 (서버 계정 아님)"
      >
        <User className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate">{active.name}</span>
        <ChevronDown className="w-3 h-3 shrink-0 opacity-70" aria-hidden="true" />
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-transparent border-0"
            aria-label="닫기"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute right-0 top-full mt-1.5 z-50 w-72 bg-[var(--surface)] border border-line-alpha shadow-xl rounded-sm p-3 text-ink"
            role="listbox"
          >
            <p className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-2">
              이 기기 · 개인별 저장
            </p>
            <p className="text-[11px] text-secondary mb-3 leading-relaxed">
              사람마다 프로필을 만들면 목록·메모·구독 상태가 따로 저장됩니다. 서버 로그인 없음.
            </p>
            <ul className="space-y-1 max-h-48 overflow-y-auto mb-3">
              {profiles.map(p => (
                <li key={p.id} className="flex items-center gap-1">
                  {renamingId === p.id ? (
                    <form
                      className="flex-1 flex gap-1"
                      onSubmit={e => {
                        e.preventDefault();
                        saveRename(p.id);
                      }}
                    >
                      <input
                        value={renameVal}
                        onChange={e => setRenameVal(e.target.value)}
                        className="flex-1 text-xs px-2 py-1 border border-line-alpha bg-paper"
                        autoFocus
                      />
                      <button type="submit" className="text-xs font-bold px-2 cursor-pointer bg-ink text-paper border-0">
                        저장
                      </button>
                    </form>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => switchTo(p.id)}
                        className="flex-1 flex items-center gap-2 text-left text-xs font-semibold px-2 py-1.5 rounded-sm hover:bg-[var(--surface-2)] cursor-pointer bg-transparent border-0 text-ink"
                      >
                        {p.id === active.id && <Check className="w-3.5 h-3.5 text-forest-green dark:text-[var(--green)]" />}
                        <span className={p.id === active.id ? 'font-bold' : ''}>{p.name}</span>
                      </button>
                      <button
                        type="button"
                        className="p-1.5 bg-transparent border-0 cursor-pointer text-secondary"
                        aria-label="이름 변경"
                        onClick={() => {
                          setRenamingId(p.id);
                          setRenameVal(p.name);
                        }}
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      {profiles.length > 1 && (
                        <button
                          type="button"
                          className="p-1.5 bg-transparent border-0 cursor-pointer text-accent-red"
                          aria-label="프로필 삭제"
                          onClick={() => remove(p.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
            <div className="flex gap-1.5 border-t border-line-alpha pt-2">
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="새 이름 (예: 민수)"
                className="flex-1 text-xs px-2 py-1.5 border border-line-alpha bg-paper text-ink"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    add();
                  }
                }}
              />
              <button
                type="button"
                onClick={add}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-ink text-paper border-0 cursor-pointer rounded-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                추가
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
