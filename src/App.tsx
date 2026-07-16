import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Search, 
  BookOpen, 
  Bookmark, 
  HelpCircle, 
  RefreshCw, 
  Settings, 
  FolderPlus, 
  Mail, 
  Download, 
  Inbox, 
  Clock, 
  ExternalLink,
  SlidersHorizontal,
  ChevronDown,
  Info
} from 'lucide-react';

import { Newsletter, Note, Notebook, Preferences } from './types';
import { 
  newsletters, 
  categories, 
  topics, 
  countriesList, 
  typesList, 
  disciplinesList,
  industryList,
  readingTimes,
  valuePromises,
  isInfoSource
} from './data';

// Component imports
import OnboardingDialog from './components/OnboardingDialog';
import PreferenceDialog from './components/PreferenceDialog';
import NewsletterCard, { type LinkCheckInfo } from './components/NewsletterCard';
import LiveDesk from './components/LiveDesk';
import NotesHub from './components/NotesHub';
import NoteDialog from './components/NoteDialog';
import SubscriptionDesk from './components/SubscriptionDesk';
import Toast from './components/Toast';
import AdvancedBottom from './components/AdvancedBottom';
import {
  isValidEmail,
  openGmailCompose,
  openGoogleMailLogin
} from './gmailCompose';
import {
  loadCustomSources,
  saveCustomSources,
  makeCustomSource,
  hostKey,
  type CustomSourceInput
} from './customSources';
import AddSourceForm from './components/AddSourceForm';

const ALL_INTERESTS = [
  'AI', '재테크', '커리어', '디자인', '시사', '과학', '국제', '건강',
  '교육', '미술', '환경', '테크', '문화', '법률'
];

function mergeBaseAndCustom(base: Newsletter[], custom: Newsletter[]): Newsletter[] {
  const map = new Map<string, Newsletter>();
  for (const n of base) map.set(n.id, n);
  for (const n of custom) map.set(n.id, n);
  return [...map.values()];
}

export default function App() {
  // --- STATE DECLARATIONS ---
  const [query, setQuery] = useState('');
  const [selectedSourceScope, setSelectedSourceScope] = useState<'all' | 'public'>('all');
  const [selectedDiscipline, setSelectedDiscipline] = useState('전체');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedTopic, setSelectedTopic] = useState('전체');
  const [selectedFrequency, setSelectedFrequency] = useState('전체');
  const [selectedOrigin, setSelectedOrigin] = useState('전체');
  const [selectedCountry, setSelectedCountry] = useState('전체');
  const [selectedType, setSelectedType] = useState('전체');
  /** 첫 화면 기본: 정보 매체만 (이메일 뉴스레터 제외) */
  const [mediaKind, setMediaKind] = useState<'info' | 'newsletter' | 'all'>('info');
  const [selectedPersonal, setSelectedPersonal] = useState('전체');
  const [selectedIndustry, setSelectedIndustry] = useState('전체');
  const [linkMode, setLinkMode] = useState<'all' | 'has-subscribe' | 'site-only'>('all');
  const [sortBy, setSortBy] = useState('recommended');
  const [toastMsg, setToastMsg] = useState('');
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);

  // Bookmarks & local preferences
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('letter-shelf');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [personalStatus, setPersonalStatus] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem('letter-status');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [userInterests, setUserInterests] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('letter-interests');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [prefs, setPrefs] = useState<Preferences>(() => {
    try {
      const stored = localStorage.getItem('letter-preferences');
      return stored ? JSON.parse(stored) : { frequency: 'all', paused: false };
    } catch {
      return { frequency: 'all', paused: false };
    }
  });

  // Notes state
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const stored = localStorage.getItem('letter-notes-v1');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [notebooks, setNotebooks] = useState<Notebook[]>(() => {
    try {
      const stored = localStorage.getItem('letter-notebooks-v1');
      const list = stored ? JSON.parse(stored) : [];
      if (!list.some((n: any) => n.id === 'inbox')) {
        list.unshift({ id: 'inbox', name: '일반 메모함' });
      }
      return list;
    } catch {
      return [{ id: 'inbox', name: '일반 메모함' }];
    }
  });

  // Workspace selections
  const [liveSourceId, setLiveSourceId] = useState(() => {
    return localStorage.getItem('letter-live-source') || '';
  });

  const [gmailSelfEmail, setGmailSelfEmail] = useState(() => {
    try {
      const stored = localStorage.getItem('letter-gmail-pref');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.selfEmail || '';
      }
    } catch {}
    return '';
  });

  // UI States
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [noteEditorOpen, setNoteEditorOpen] = useState(false);
  const [noteEditorSourceId, setNoteEditorSourceId] = useState('');
  const [noteEditorNoteId, setNoteEditorNoteId] = useState<string | undefined>(undefined);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('letter-theme') as 'light' | 'dark') || 'light';
  });
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'xl'>(() => {
    const v = localStorage.getItem('letter-text-size');
    if (v === 'large' || v === 'xl' || v === 'normal') return v;
    return 'normal';
  });

  const [linkSyncStatus, setLinkSyncStatus] = useState('상태 파일 대기');
  const [customSources, setCustomSources] = useState<Newsletter[]>(() => loadCustomSources());
  const [catalog, setCatalog] = useState<Newsletter[]>(() =>
    mergeBaseAndCustom(newsletters, loadCustomSources())
  );
  const [linkCheckMap, setLinkCheckMap] = useState<Record<string, LinkCheckInfo>>({});
  const [linkCheckedAt, setLinkCheckedAt] = useState('');
  /** 모바일: 상세 필터 기본 접힘 */
  const [filtersOpen, setFiltersOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(min-width: 768px)').matches;
  });

  const showToast = (msg: string) => setToastMsg(msg);

  const cardLinkCheck = (id: string): LinkCheckInfo | null => linkCheckMap[id] || null;

  // Onboarding auto-open trigger
  useEffect(() => {
    const seen = localStorage.getItem('letter-onboarding-seen');
    if (!seen) {
      setOnboardingOpen(true);
    }
  }, []);

  // Ctrl/Cmd+K → 검색 포커스
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.getElementById('find')?.scrollIntoView({ behavior: 'smooth' });
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /** 관심 등록: 내 목록·구독 상태·온보딩 관심사 태그 일치 */
  const isTrackedInterest = (n: Newsletter) => {
    if (savedIds.has(n.id) || personalStatus[n.id]) return true;
    if (userInterests.length > 0 && n.interests.some(t => userInterests.includes(t))) return true;
    return false;
  };

  // link-status.json 반영 — 「확인 필요」는 관심 등록 항목에만 표시
  const applyLinkStatusFile = async () => {
    setLinkSyncStatus('동기화 중…');
    try {
      const base = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL || '/';
      const res = await fetch(`${base}data/link-status.json`, { cache: 'no-store' });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      const checkedAt: string = data.checkedAt || new Date().toISOString();
      setLinkCheckedAt(checkedAt);
      const map: Record<string, LinkCheckInfo> = {};
      for (const r of data.results || []) {
        if (!r?.id) continue;
        map[r.id] = {
          status: r.status || 'needs-review',
          httpStatus: r.httpStatus,
          checkedAt
        };
      }
      setLinkCheckMap(map);
      let trackedBad = 0;
      setCatalog(prev =>
        prev.map(n => {
          const check = map[n.id];
          const tracked =
            savedIds.has(n.id) ||
            !!personalStatus[n.id] ||
            (userInterests.length > 0 && n.interests.some(t => userInterests.includes(t)));
          if (!check) {
            if (n.status === 'needs-review' && !tracked) return { ...n, status: 'alive' as const };
            return n;
          }
          if (check.status === 'needs-review') {
            if (tracked) {
              trackedBad += 1;
              return { ...n, status: 'needs-review' as const };
            }
            return { ...n, status: n.status === 'needs-review' ? ('alive' as const) : n.status };
          }
          if (check.status === 'reachable' && n.status === 'needs-review') {
            return { ...n, status: 'alive' as const };
          }
          return n;
        })
      );
      const when = new Date(checkedAt).toLocaleString('ko-KR');
      setLinkSyncStatus(
        `동기화 완료 · ${when}` +
          (trackedBad ? ` · 관심 중 확인 필요 ${trackedBad}` : ' · 관심 항목 링크 OK')
      );
      showToast(
        trackedBad
          ? `관심 등록 중 확인 필요 ${trackedBad}건`
          : '링크 상태 동기화 완료 (확인 필요는 관심 항목만)'
      );
    } catch {
      setLinkSyncStatus('동기화 실패 (로컬/네트워크) — 새 탭 원문은 가능');
      showToast('상태 파일 동기화 실패 — 원문 링크는 그대로 사용하세요');
    }
  };

  useEffect(() => {
    applyLinkStatusFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 관심 목록이 바뀌면 확인 필요 재적용
  useEffect(() => {
    if (!Object.keys(linkCheckMap).length) return;
    setCatalog(prev =>
      prev.map(n => {
        const check = linkCheckMap[n.id];
        const tracked = isTrackedInterest(n);
        if (check?.status === 'needs-review' && tracked) {
          return { ...n, status: 'needs-review' as const };
        }
        if (n.status === 'needs-review' && !tracked) {
          return { ...n, status: 'alive' as const };
        }
        if (check?.status === 'reachable' && n.status === 'needs-review') {
          return { ...n, status: 'alive' as const };
        }
        return n;
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedIds, personalStatus, userInterests, linkCheckMap]);

  // Theme application
  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('letter-theme', theme);
  }, [theme]);

  // Text size application (사이트 전체 글자)
  useEffect(() => {
    document.body.classList.toggle('large-text', textSize === 'large');
    document.body.classList.toggle('ui-zoom-lg', textSize === 'large');
    document.body.classList.toggle('ui-zoom-xl', textSize === 'xl');
    localStorage.setItem('letter-text-size', textSize);
  }, [textSize]);

  // Sync state modifications to localstorage
  useEffect(() => {
    localStorage.setItem('letter-shelf', JSON.stringify([...savedIds]));
  }, [savedIds]);

  useEffect(() => {
    localStorage.setItem('letter-status', JSON.stringify(personalStatus));
  }, [personalStatus]);

  useEffect(() => {
    localStorage.setItem('letter-notes-v1', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('letter-notebooks-v1', JSON.stringify(notebooks));
  }, [notebooks]);

  // --- ACTIONS & HANDLERS ---

  const handleToggleSave = (id: string) => {
    setSavedIds(prev => {
      const copy = new Set(prev);
      if (copy.has(id)) {
        copy.delete(id);
      } else {
        copy.add(id);
        // 목록 저장 시 구독 대시보드에도 나타나도록 기본 상태 기록
        setPersonalStatus(ps => (ps[id] ? ps : { ...ps, [id]: '관심 있음' }));
      }
      return copy;
    });
  };

  const handleStatusChange = (id: string, stat: string) => {
    setPersonalStatus(prev => ({
      ...prev,
      [id]: stat
    }));
    showToast(`${stat}으로 기록 · 구독 관리에 반영`);
  };

  const handleBulkStatus = (ids: string[], status: string) => {
    setPersonalStatus(prev => {
      const next = { ...prev };
      ids.forEach(id => { next[id] = status; });
      return next;
    });
    showToast(`${ids.length}개 → ${status}`);
  };

  const handleClearStatus = (id: string) => {
    setPersonalStatus(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    showToast('상태 기록 삭제');
  };

  const clearDirectoryFilters = () => {
    setQuery('');
    setSelectedSourceScope('all');
    setSelectedDiscipline('전체');
    setSelectedCategory('전체');
    setSelectedTopic('전체');
    setSelectedFrequency('전체');
    setSelectedOrigin('전체');
    setSelectedCountry('전체');
    setSelectedType('전체');
    setMediaKind('info');
    setSelectedPersonal('전체');
    setSelectedIndustry('전체');
    setLinkMode('all');
    setSortBy('recommended');
    showToast('필터 초기화 · 정보 매체 보기');
  };

  // 리더에 뉴스레터가 선택돼 있으면 해제
  useEffect(() => {
    const cur = catalog.find(n => n.id === liveSourceId);
    if (cur && !isInfoSource(cur)) {
      setLiveSourceId('');
      localStorage.removeItem('letter-live-source');
    }
  }, [catalog, liveSourceId]);

  const handleExportSubscriptionCsv = () => {
    const rows = catalog
      .filter(n => personalStatus[n.id] || savedIds.has(n.id))
      .map(n => {
        const status = personalStatus[n.id] || (savedIds.has(n.id) ? '관심 있음' : '');
        const cells = [n.name, status, n.category, n.frequency, n.country, n.siteUrl || n.url, n.subscribeUrl || '', n.type, n.industry || ''];
        return cells.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',');
      });
    if (!rows.length) {
      showToast('내보낼 구독 기록이 없습니다');
      return;
    }
    const csv = ['이름,상태,분야,빈도,국가,사이트URL,구독URL,형식,산업', ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'letterbox-subscriptions.csv';
    a.click();
    showToast('구독 CSV 저장');
  };

  const handleExportWeekendDigest = () => {
    const pile = catalog.filter(n => {
      const s = personalStatus[n.id];
      return s === '나중에' || s === '구독 중' || (!s && savedIds.has(n.id));
    });
    const weekend = pile.filter(n => personalStatus[n.id] === '나중에');
    const list = weekend.length ? weekend : pile;
    if (!list.length) {
      showToast('주말 큐가 비어 있습니다 — 상태를 “나중에”로 표시하세요');
      return;
    }
    const md = [
      '# 주말 몰아보기 · 오늘의 편지함',
      '',
      `생성: ${new Date().toLocaleString('ko-KR')}`,
      '',
      '한 주에 쌓아 두고 주말에만 읽는 롤업 목록입니다.',
      '',
      ...list.map((n, i) => {
        const st = personalStatus[n.id] || '관심 있음';
        return `## ${i + 1}. ${n.name}\n- 상태: ${st}\n- 분야: ${n.category} · ${n.frequency}\n- 사이트: ${n.siteUrl || n.url}\n${n.subscribeUrl ? `- 구독: ${n.subscribeUrl}\n` : ''}- 한 줄: ${n.description}\n`;
      }),
      '---',
      '*exported from 오늘의 편지함*'
    ].join('\n');
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'weekend-digest.md';
    a.click();
    showToast(`주말 몰아보기 ${list.length}개 저장`);
  };

  const handleAddCustom = (input: CustomSourceInput): boolean => {
    const item = makeCustomSource(input);
    if (!item) {
      showToast('URL을 확인해 주세요 (예: example.com 또는 https://...)');
      return false;
    }
    const key = hostKey(item.siteUrl);
    const dup = catalog.find(
      n => hostKey(n.siteUrl || n.url) === key || n.siteUrl === item.siteUrl
    );
    if (dup && !dup.id.startsWith('custom_')) {
      showToast(`이미 디렉터리에 있음: 「${dup.name}」 — 내 목록에 저장했어요`);
      setSavedIds(prev => new Set([...prev, dup.id]));
      setPersonalStatus(prev => ({ ...prev, [dup.id]: prev[dup.id] || '관심 있음' }));
      return true;
    }
    if (dup && dup.id.startsWith('custom_')) {
      showToast(`이미 추가한 사이트입니다: 「${dup.name}」`);
      return false;
    }
    setCustomSources(prev => {
      const next = [...prev, item];
      saveCustomSources(next);
      return next;
    });
    setCatalog(prev => [...prev, item]);
    setSavedIds(prev => new Set([...prev, item.id]));
    setPersonalStatus(prev => ({ ...prev, [item.id]: '관심 있음' }));
    showToast(`「${item.name}」 추가됨 · 내 목록·디렉터리·실시간에서 사용 가능`);
    return true;
  };

  const handleRemoveCustom = (id: string) => {
    setCustomSources(prev => {
      const next = prev.filter(n => n.id !== id);
      saveCustomSources(next);
      return next;
    });
    setCatalog(prev => prev.filter(n => n.id !== id));
    setSavedIds(prev => {
      const copy = new Set(prev);
      copy.delete(id);
      return copy;
    });
    setPersonalStatus(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    showToast('내 출처 삭제');
  };

  const handleBackupAll = () => {
    const payload = {
      version: 2,
      exportedAt: new Date().toISOString(),
      savedIds: [...savedIds],
      personalStatus,
      userInterests,
      prefs,
      notes,
      notebooks,
      gmailSelfEmail,
      theme,
      textSize,
      customSources
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `letterbox-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast('전체 백업 JSON 저장');
  };

  const handleRestoreBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (Array.isArray(data.savedIds)) setSavedIds(new Set(data.savedIds));
        if (data.personalStatus) setPersonalStatus(data.personalStatus);
        if (Array.isArray(data.userInterests)) setUserInterests(data.userInterests);
        if (data.prefs) setPrefs(data.prefs);
        if (Array.isArray(data.notes)) setNotes(data.notes);
        if (Array.isArray(data.notebooks)) setNotebooks(data.notebooks);
        if (typeof data.gmailSelfEmail === 'string') {
          setGmailSelfEmail(data.gmailSelfEmail);
          localStorage.setItem('letter-gmail-pref', JSON.stringify({ selfEmail: data.gmailSelfEmail }));
        }
        if (data.theme === 'light' || data.theme === 'dark') setTheme(data.theme);
        if (data.textSize === 'normal' || data.textSize === 'large' || data.textSize === 'xl') setTextSize(data.textSize);
        if (Array.isArray(data.customSources)) {
          const customs = data.customSources as Newsletter[];
          setCustomSources(customs);
          saveCustomSources(customs);
          setCatalog(mergeBaseAndCustom(newsletters, customs));
        }
        showToast('백업 복원 완료');
      } catch {
        showToast('백업 파일을 읽을 수 없습니다');
      }
    };
    reader.readAsText(file);
  };

  const handleOnboardingClose = (selectedInterests: string[]) => {
    if (selectedInterests.length > 0) {
      setUserInterests(selectedInterests);
      localStorage.setItem('letter-interests', JSON.stringify(selectedInterests));
    }
    localStorage.setItem('letter-onboarding-seen', 'true');
    setOnboardingOpen(false);
  };

  const handlePreferencesSave = (selectedInterests: string[], updatedPrefs: Preferences) => {
    setUserInterests(selectedInterests);
    setPrefs(updatedPrefs);
    localStorage.setItem('letter-interests', JSON.stringify(selectedInterests));
    localStorage.setItem('letter-preferences', JSON.stringify(updatedPrefs));
    setPreferencesOpen(false);
  };

  // Notes persistence callbacks
  const handleSaveNote = (id: string, patch: { title: string; body: string }) => {
    setNotes(prev => prev.map(n => {
      if (n.id === id) {
        return {
          ...n,
          ...patch,
          updatedAt: new Date().toISOString()
        };
      }
      return n;
    }));
  };

  const handleCreateNote = (sourceId: string, title = '', body = ''): Note => {
    const now = new Date().toISOString();
    const newNote: Note = {
      id: `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      sourceId,
      title: title || `${getSourceName(sourceId)} 메모`,
      body,
      createdAt: now,
      updatedAt: now
    };
    setNotes(prev => [newNote, ...prev]);
    return newNote;
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const handleTransferNote = (id: string, targetSourceId: string, mode: 'move' | 'copy'): Note | null => {
    const targetNote = notes.find(n => n.id === id);
    if (!targetNote) return null;

    if (mode === 'copy') {
      const copy = handleCreateNote(targetSourceId, targetNote.title, targetNote.body);
      return copy;
    } else {
      setNotes(prev => prev.map(n => {
        if (n.id === id) {
          return {
            ...n,
            sourceId: targetSourceId,
            updatedAt: new Date().toISOString()
          };
        }
        return n;
      }));
      return {
        ...targetNote,
        sourceId: targetSourceId,
        updatedAt: new Date().toISOString()
      };
    }
  };

  // Gmail Compose (브라우저 Google 세션 · OAuth 서버 없음)
  const formatGmailBody = (note: Note) => {
    const sourceItem = catalog.find(n => n.id === note.sourceId);
    const dateStr = new Date(note.updatedAt || note.createdAt).toLocaleString('ko-KR');
    
    return [
      `📝 [오늘의 편지함 메모] ${note.title}`,
      `작성 일시: ${dateStr}`,
      `위치: ${getSourceName(note.sourceId)}`,
      sourceItem ? `사이트: ${sourceItem.siteUrl || sourceItem.url}` : '',
      sourceItem?.subscribeUrl ? `구독: ${sourceItem.subscribeUrl}` : '',
      `---`,
      note.body,
      `---`,
      `본 메일은 오늘의 편지함에서 내보내기로 생성되었습니다.`
    ].filter(Boolean).join('\n\n');
  };

  const handleSendGmail = (note: Note) => {
    const to = gmailSelfEmail.trim();
    if (to && !isValidEmail(to)) {
      showToast('Gmail 주소 형식을 확인해 주세요 (예: you@gmail.com)');
      document.getElementById('notes')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (!to) {
      showToast('받을 주소가 비어 있음 · 작성 창 to 칸에 직접 입력하세요');
    }
    const result = openGmailCompose({
      to,
      subject: `[오늘의 편지함] ${note.title || getSourceName(note.sourceId)}`,
      body: formatGmailBody(note)
    });
    if (!result.ok) {
      showToast('팝업이 막혔습니다. 브라우저에서 팝업 허용 후 다시 시도하세요');
      return;
    }
    if (result.truncated) {
      showToast('Gmail 창 열림 · 본문이 길어서 일부만 전달됨 — 필요 시 복사 사용');
    } else if (result.usedLoginChooser) {
      showToast('Google 계정 선택/로그인 후 메일 작성 창으로 이어집니다');
    } else {
      showToast('Gmail 작성 창을 열었습니다');
    }
  };

  const handleGoogleMailLogin = () => {
    const ok = openGoogleMailLogin();
    showToast(
      ok
        ? 'Google 로그인/계정 선택 창을 열었습니다. 로그인 후 이 탭으로 돌아와 Gmail 전송을 누르세요'
        : '창을 열 수 없습니다. 팝업 차단을 해제해 주세요'
    );
  };

  const handleSendMailto = (note: Note) => {
    const to = gmailSelfEmail.trim();
    const subject = encodeURIComponent(`[오늘의 편지함] ${note.title}`);
    const bodyText = encodeURIComponent(formatGmailBody(note).slice(0, 1600));
    window.location.href = `mailto:${encodeURIComponent(to)}?subject=${subject}&body=${bodyText}`;
  };

  const handleCopyNote = async (note: Note): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(formatGmailBody(note));
      return true;
    } catch {
      return false;
    }
  };

  const handleExportMarkdown = (note: Note) => {
    const content = [
      `# ${note.title}`,
      `- 작성일자: ${new Date(note.createdAt).toLocaleString('ko-KR')}`,
      `- 최종수정: ${new Date(note.updatedAt).toLocaleString('ko-KR')}`,
      `- 분류/출처: ${getSourceName(note.sourceId)}`,
      `---`,
      ``,
      note.body,
      ``,
      `---`,
      `*exported from 오늘의 편지함*`
    ].join('\n');

    const filename = `${note.title.replace(/[\\/:*?"<>|]/g, '_') || 'note'}.md`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const getSourceName = (id: string): string => {
    if (id === 'inbox') return '일반 메모함';
    const nb = notebooks.find(n => n.id === id);
    if (nb) return nb.name;
    const nl = catalog.find(item => item.id === id);
    return nl ? nl.name : id;
  };

  const handleAddNotebook = () => {
    const name = window.prompt('새 메모함 폴더의 이름을 입력하세요:');
    if (!name || !name.trim()) return;
    const newId = `nb_${Date.now().toString(36)}`;
    setNotebooks(prev => [...prev, { id: newId, name: name.trim() }]);
    showToast(`메모함 “${name.trim()}” 생성`);
  };

  const handleGmailEmailSave = (email: string) => {
    setGmailSelfEmail(email);
    localStorage.setItem('letter-gmail-pref', JSON.stringify({ selfEmail: email }));
  };

  const handleRefreshLinkStatus = () => {
    applyLinkStatusFile();
  };

  // OPML Export function
  const escapeXml = (value: string) => {
    return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  const handleExportOpml = (mode: 'saved' | 'public') => {
    const source = mode === 'saved'
      ? catalog.filter(item => savedIds.has(item.id))
      : catalog.filter(item => item.sourceScope === 'public');

    if (!source.length) {
      showToast(mode === 'saved' ? '저장된 출처가 없습니다' : '공공 출처가 없습니다');
      return;
    }

    const title = mode === 'saved' ? '오늘의 편지함 · 내 저장 목록' : '오늘의 편지함 · 검증 공공 출처';
    const outlines = source.map(item => {
      const html = item.siteUrl || item.url;
      const xmlUrl = item.feedUrl || html;
      return `    <outline text="${escapeXml(item.name)}" title="${escapeXml(item.name)}" type="rss" xmlUrl="${escapeXml(xmlUrl)}" htmlUrl="${escapeXml(html)}" category="${escapeXml(item.category)}" />`;
    }).join('\n');

    const opmlText = `<?xml version="1.0" encoding="UTF-8"?>\n<opml version="2.0">\n  <head>\n    <title>${escapeXml(title)}</title>\n    <dateCreated>${new Date().toUTCString()}</dateCreated>\n  </head>\n  <body>\n    <outline text="${escapeXml(title)}" title="${escapeXml(title)}">\n${outlines}\n    </outline>\n  </body>\n</opml>\n`;

    const blob = new Blob([opmlText], { type: 'text/x-opml+xml;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = mode === 'saved' ? 'letterbox-saved-shelf.opml' : 'letterbox-public-sources.opml';
    link.click();
    showToast('OPML 저장 완료');
  };

  // Dialog triggers
  const handleOpenNote = (sourceId: string, noteId?: string) => {
    setNoteEditorSourceId(sourceId);
    setNoteEditorNoteId(noteId);
    setNoteEditorOpen(true);
  };

  const handleQuickGmail = (sourceId: string) => {
    // 클릭 제스처 안에서 바로 열기 (setTimeout 쓰면 팝업 차단됨)
    const folderName = getSourceName(sourceId);
    const newNote = handleCreateNote(sourceId, `${folderName} 빠른 메모`, '');
    handleSendGmail(newNote);
    handleOpenNote(sourceId, newNote.id);
  };

  // Filter Newsletters logic (catalog includes live link-status overrides)
  const filteredNewsletters = catalog.filter(item => {
    const words = `${item.name} ${item.discipline} ${item.category} ${item.description} ${item.interests.join(' ')} ${item.country}`.toLowerCase();
    if (query && !words.includes(query.toLowerCase())) return false;
    if (selectedSourceScope === 'public' && item.sourceScope !== 'public') return false;
    if (selectedDiscipline !== '전체' && item.discipline !== selectedDiscipline) return false;
    if (selectedCategory !== '전체' && item.category !== selectedCategory) return false;
    if (selectedTopic !== '전체' && !item.interests.includes(selectedTopic)) return false;
    if (selectedType !== '전체' && item.type !== selectedType) return false;
    if (mediaKind === 'info' && !isInfoSource(item)) return false;
    if (mediaKind === 'newsletter' && item.type !== 'newsletter') return false;
    if (selectedCountry !== '전체' && item.country !== selectedCountry) return false;
    if (selectedOrigin !== '전체') {
      if (selectedOrigin === '한국' && item.origin !== '한국') return false;
      if (selectedOrigin === '글로벌' && item.origin !== '글로벌') return false;
    }
    if (selectedFrequency !== '전체' && item.frequencyGroup !== selectedFrequency) return false;
    if (selectedPersonal !== '전체') {
      const st = personalStatus[item.id] || (savedIds.has(item.id) ? '관심 있음' : '');
      if (st !== selectedPersonal) return false;
    }
    if (selectedIndustry !== '전체' && item.industry !== selectedIndustry) return false;
    if (linkMode === 'has-subscribe' && !item.subscribeUrl) return false;
    if (linkMode === 'site-only' && item.subscribeUrl) return false;
    return true;
  });

  // Sort Newsletters logic
  const sortedFilteredNewsletters = [...filteredNewsletters].sort((a, b) => {
    if (sortBy === 'recent') {
      return a.daysSince - b.daysSince;
    }
    if (sortBy === 'light') {
      const aTime = parseInt(readingTimes[a.category] || '3') || 3;
      const bTime = parseInt(readingTimes[b.category] || '3') || 3;
      return aTime - bTime;
    }
    // recommended sort (User chosen interests align first, then daysSince)
    const aMatchCount = a.interests.filter(tag => userInterests.includes(tag)).length;
    const bMatchCount = b.interests.filter(tag => userInterests.includes(tag)).length;
    
    if (bMatchCount !== aMatchCount) {
      return bMatchCount - aMatchCount;
    }
    return a.daysSince - b.daysSince;
  });

  // 첫 화면: 정보 매체만 (사이트·매거진·공공) — 이메일 뉴스레터 제외
  const infoCatalog = catalog.filter(isInfoSource);

  // Today's Picks — 관심·내 목록 우선, 정보 매체, 국가 분산
  const todayPicks = (() => {
    const pool = infoCatalog.filter(item => {
      if (item.status === 'needs-review' && isTrackedInterest(item)) return false;
      if (prefs.paused) return false;
      if (prefs.frequency !== 'all' && item.frequencyGroup !== prefs.frequency) return false;
      return true;
    });
    const daySeed = new Date().toISOString().slice(0, 10);
    const scored = [...pool].sort((a, b) => {
      const score = (n: Newsletter) => {
        let s = 0;
        s += n.interests.filter(t => userInterests.includes(t)).length * 10;
        if (savedIds.has(n.id)) s += 8;
        if (personalStatus[n.id] === '구독 중') s += 12;
        if (personalStatus[n.id] === '나중에') s += 6;
        if (personalStatus[n.id] === '관심 있음') s += 4;
        if (n.sourceScope === 'public') s += 2;
        if (n.stability === 'high') s += 2;
        if (n.daysSince === 0) s += 3;
        // 날짜 시드로 매일 살짝 섞기
        s += (n.id.charCodeAt(0) + daySeed.charCodeAt(daySeed.length - 1)) % 3;
        return s;
      };
      return score(b) - score(a) || a.daysSince - b.daysSince;
    });
    const picked: Newsletter[] = [];
    const usedCountry = new Set<string>();
    for (const item of scored) {
      if (picked.length >= 3) break;
      if (usedCountry.has(item.country) && picked.length > 0 && scored.length > 8) continue;
      picked.push(item);
      usedCountry.add(item.country);
    }
    if (picked.length < 3) {
      for (const item of scored) {
        if (picked.length >= 3) break;
        if (!picked.find(p => p.id === item.id)) picked.push(item);
      }
    }
    return picked.slice(0, 3);
  })();

  const recommendedItems = infoCatalog
    .filter(item => {
      if (prefs.paused) return false;
      if (prefs.frequency !== 'all' && item.frequencyGroup !== prefs.frequency) return false;
      if (userInterests.length === 0) return item.stability === 'high' || !!item.industry || item.sourceScope === 'public';
      return item.interests.some(tag => userInterests.includes(tag));
    })
    .sort((a, b) => a.daysSince - b.daysSince)
    .slice(0, 6);

  const savedNewsletters = catalog.filter(item => savedIds.has(item.id));

  const totalActive = catalog.length;
  const totalAlive = catalog.filter(n => n.status === 'alive').length;
  /** 확인 필요 = 관심 등록(목록·상태·관심사) + 링크 needs-review 만 */
  const totalNeedsReview = catalog.filter(
    n => n.status === 'needs-review' && isTrackedInterest(n)
  ).length;
  const weekendQueue = Object.values(personalStatus).filter(s => s === '나중에').length;

  return (
    <div className={`relative min-h-screen text-ink selection:bg-accent-red/20 selection:text-ink text-size-${textSize}`}>
      <div className="paper-grain" aria-hidden="true" />

      <a href="#find" className="skip-link">
        디렉터리로 건너뛰기
      </a>

      {/* --- SITE HEADER --- */}
      <header className="site-header border-b border-line h-[74px] px-6 md:px-12 flex justify-between items-center sticky top-0 backdrop-blur-xs z-40">
        <a href="#top" className="brand flex items-center font-bold tracking-tight no-underline text-lg">
          <span className="brand-mark" aria-hidden="true">✦</span>
          <span>오늘의 편지함</span>
        </a>

        <nav className="flex items-center gap-6 md:gap-8 overflow-x-auto max-w-[65%] whitespace-nowrap" aria-label="주요 메뉴">
          <a href="#live" className="text-xs font-bold no-underline focus-ring">실시간</a>
          <a href="#subscriptions" className="text-xs font-bold no-underline flex items-center gap-1 focus-ring">
            구독관리
            {weekendQueue > 0 && (
              <span className="text-[10px] bg-forest-green/15 text-forest-green dark:text-[var(--green)] px-1.5 py-0.5 font-bold rounded-full">
                주말{weekendQueue}
              </span>
            )}
          </a>
          <a href="#find" className="text-xs font-bold no-underline focus-ring">디렉터리</a>
          <a href="#notes" className="text-xs font-bold no-underline flex items-center gap-1 focus-ring">
            <span>메모</span>
            <span className="text-[10px] bg-accent-red/10 text-accent-red px-1.5 py-0.5 font-bold rounded-full">
              {notes.length}
            </span>
          </a>
          <a href="#my-list" className="text-xs font-bold no-underline flex items-center gap-1 focus-ring">
            <span>내 목록</span>
            <span className="text-[10px] bg-forest-green/10 text-forest-green dark:text-[var(--green)] px-1.5 py-0.5 font-bold rounded-full">
              {savedIds.size}
            </span>
          </a>
          <a href="#add-source" className="text-xs font-bold no-underline focus-ring">사이트 추가</a>
          <a href="#advanced" className="text-xs font-bold no-underline opacity-80 focus-ring">부가·백업</a>
          
          <span className="w-px h-3.5 bg-line-alpha" aria-hidden="true" />

          <button
            type="button"
            onClick={() => setPreferencesOpen(true)}
            className="text-xs font-bold bg-transparent border-0 cursor-pointer focus-ring"
          >
            내 설정
          </button>
          
          <button
            type="button"
            onClick={() =>
              setTextSize(prev => (prev === 'normal' ? 'large' : prev === 'large' ? 'xl' : 'normal'))
            }
            className="text-xs font-bold bg-transparent border-0 cursor-pointer focus-ring"
            title="사이트 전체 글자 크기 순환"
            aria-label={`글자 크기 변경 (현재 ${textSize})`}
          >
            {textSize === 'normal' ? '글자 크게' : textSize === 'large' ? '글자 더크게' : '기본 글자'}
          </button>

          <button
            type="button"
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            className="text-xs font-bold bg-transparent border-0 cursor-pointer focus-ring"
            aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {theme === 'dark' ? '라이트 모드' : '다크 모드'}
          </button>
        </nav>
      </header>

      {/* --- HERO BANNER --- */}
      <section className="hero max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 relative overflow-hidden flex flex-col justify-between" id="top">
        <div className="max-w-3xl z-10">
          <p className="text-xs font-bold tracking-widest text-forest-green dark:text-[var(--green)] mb-4">
            정보 디렉터리 · 국가·산업별 안정 출처 · 뉴스레터는 선택 표시
          </p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight leading-tight mb-6">
            세계 곳곳의 정보를<br />
            <em className="text-accent-red not-italic font-bold">가볍게</em> 모으고,<br />
            편하게 읽어요.
          </h1>
          <p className="text-base md:text-lg text-secondary leading-relaxed mb-8 max-w-2xl">
            공영·기관·전문 매체의 정보를 국가·산업별로 모아 보여 줍니다.<br />
            이메일 뉴스레터는 기본 목록에서 빼고, 필요할 때만 필터로 볼 수 있습니다.
          </p>

          <a
            href="#find"
            className="inline-flex items-center gap-12 font-bold text-base text-ink no-underline border-b border-ink dark:border-white pb-2 hover:border-accent-red hover:text-accent-red transition-all duration-200"
          >
            <span>정보 지도 보러가기</span>
            <span className="text-lg text-accent-red">↓</span>
          </a>
        </div>

        <div className="mt-12 text-xs flex items-center gap-2.5 z-10">
          <span className="pulse" />
          <span className="text-secondary">
            현재 <strong>{totalActive}</strong>개의 엄선 채널 중, <strong>{totalAlive}</strong>개 정상 발행 상태 확인 완료
            {linkCheckedAt ? ` · 링크 점검 ${new Date(linkCheckedAt).toLocaleDateString('ko-KR')}` : ''}
          </span>
        </div>

        {/* Serif background decorative character */}
        <div className="absolute right-[-40px] bottom-[-40px] text-[200px] md:text-[340px] lg:text-[460px] font-serif font-bold text-warm dark:text-[#203028] pointer-events-none select-none z-0 opacity-40">
          편지
        </div>
      </section>

      {/* --- STATISTICS BAR --- */}
      <section className="stats-bar px-6 md:px-12 py-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div className="border-l border-white/20 pl-4 py-1">
            <span className="stats-label block text-[10px] uppercase tracking-wider mb-0.5">상태 동기화</span>
            <strong className="stats-value text-sm font-semibold">{linkSyncStatus}</strong>
          </div>
          <div className="border-l border-white/20 pl-4 py-1">
            <span className="stats-label block text-[10px] uppercase tracking-wider mb-0.5">오늘 발행 감각</span>
            <strong className="stats-accent text-sm font-semibold">
              {catalog.filter(n => n.daysSince === 0).length}개 채널
            </strong>
          </div>
          <div className="border-l border-white/20 pl-4 py-1">
            <span className="stats-label block text-[10px] uppercase tracking-wider mb-0.5">관심 중 확인 필요 · 주말 큐</span>
            <strong className="text-sm font-semibold text-[#ff9a8a]">
              {totalNeedsReview} · 주말 {weekendQueue}
            </strong>
          </div>
          <div className="text-xs text-[#d5e2db] leading-relaxed">
            Ctrl+K 검색 · 구독관리 · 관심 기준 오늘 3개 · 백업은 맨 아래
          </div>
        </div>
      </section>

      {/* --- LIVE DESK --- */}
      <LiveDesk
        newsletters={catalog}
        activeSourceId={liveSourceId}
        onSelectSource={(id) => {
          setLiveSourceId(id);
          localStorage.setItem('letter-live-source', id);
        }}
        onOpenNote={handleOpenNote}
        onQuickGmail={handleQuickGmail}
        getNotesForSource={(sourceId) => notes.filter(n => n.sourceId === sourceId)}
        onRefreshLinkStatus={handleRefreshLinkStatus}
        linkSyncStatus={linkSyncStatus}
      />

      {/* --- SUBSCRIPTION DESK (X demand: one dashboard) --- */}
      <SubscriptionDesk
        newsletters={catalog}
        personalStatus={personalStatus}
        savedIds={savedIds}
        onStatusChange={handleStatusChange}
        onBulkStatus={handleBulkStatus}
        onToggleSave={handleToggleSave}
        onOpenLive={(id) => {
          setLiveSourceId(id);
          localStorage.setItem('letter-live-source', id);
          document.getElementById('live')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onExportCsv={handleExportSubscriptionCsv}
        onExportDigest={handleExportWeekendDigest}
        onClearStatus={handleClearStatus}
      />

      {/* --- TODAY'S PICKS (3 Items) --- */}
      <section className="surface-tint p-8 md:p-14 border-b border-line-alpha" id="today">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4">
            <p className="text-xs font-bold tracking-widest text-forest-green dark:text-[var(--green)] uppercase mb-2">
              A SMALL MORNING STACK
            </p>
            <h2 className="font-serif text-3xl md:text-4xl tracking-tight mb-3 text-ink">
              오늘 읽을 편지 <span className="text-accent-red font-sans">3</span>
            </h2>
            <p className="text-sm text-secondary leading-relaxed">
              최근에 새로운 글이 발행되었고, 가벼운 호흡으로 시작해 보기 좋은 엄선 스택입니다.
            </p>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 border-t border-l border-line-alpha bg-white/20">
            {todayPicks.map(item => (
              <NewsletterCard
                key={item.id}
                item={item}
                isSaved={savedIds.has(item.id)}
                onToggleSave={() => handleToggleSave(item.id)}
                onOpenLive={() => {
                  setLiveSourceId(item.id);
                  localStorage.setItem('letter-live-source', item.id);
                  document.getElementById('live')?.scrollIntoView({ behavior: 'smooth' });
                }}
                onOpenNote={() => handleOpenNote(item.id)}
                personalState={personalStatus[item.id] || '관심 있음'}
                onChangePersonalState={(stat) => handleStatusChange(item.id, stat)}
                lastLinkCheck={
                  isTrackedInterest(item) ? cardLinkCheck(item.id) : null
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* --- RECOMMENDED SECTION (Interests Matching) --- */}
      {!prefs.paused && userInterests.length > 0 && recommendedItems.length > 0 && (
        <section className="bg-[var(--surface-2)] p-8 md:p-14 border-b border-line-alpha" id="recommendations">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
              <div>
                <p className="text-xs font-bold tracking-widest text-forest-green dark:text-[var(--green)] uppercase mb-1">
                  PICKED FOR YOU
                </p>
                <h2 className="font-serif text-2xl md:text-3xl tracking-tight text-ink">
                  <span className="text-accent-red font-sans">{userInterests.join(' · ')}</span> 관심사에 적합한 가이드 추천
                </h2>
              </div>
              <button
                onClick={() => setPreferencesOpen(true)}
                className="text-xs font-bold text-forest-green dark:text-[var(--green)] underline cursor-pointer bg-transparent border-0"
              >
                관심 분야 및 빈도 재설정하기
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 border-t border-l border-line-alpha bg-white/10">
              {recommendedItems.map(item => (
                <NewsletterCard
                  key={item.id}
                  item={item}
                  isSaved={savedIds.has(item.id)}
                  onToggleSave={() => handleToggleSave(item.id)}
                  onOpenLive={() => {
                    setLiveSourceId(item.id);
                    localStorage.setItem('letter-live-source', item.id);
                    document.getElementById('live')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onOpenNote={() => handleOpenNote(item.id)}
                  personalState={personalStatus[item.id] || '관심 있음'}
                  onChangePersonalState={(stat) => handleStatusChange(item.id, stat)}
                  lastLinkCheck={
                    isTrackedInterest(item) ? cardLinkCheck(item.id) : null
                  }
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- MAIN DIRECTORY SECTION --- */}
      <section className="directory bg-[var(--surface)] p-8 md:p-14 border-b border-line-alpha" id="find">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="max-w-xl">
              <p className="text-xs font-bold tracking-widest text-forest-green dark:text-[var(--green)] uppercase mb-2">
                THE DIRECTORY
              </p>
              <h2 className="font-serif text-3xl md:text-5xl tracking-tight leading-tight text-ink">
                오늘, 무슨 편지를<br />기다리고 있나요?
              </h2>
              <p className="text-sm text-secondary mt-3">
                목록에 없으면 <strong className="text-ink">원하는 사이트 URL</strong>을 직접 넣을 수 있습니다.
              </p>
            </div>
            <div id="add-source" className="shrink-0">
              <AddSourceForm onAdd={handleAddCustom} variant="compact" idPrefix="dir-add" />
            </div>
          </div>

          {/* --- SEARCH & FILTERS CONTROLS --- */}
          <div className="space-y-4 mb-8 bg-[var(--surface-2)] p-6 border border-line-alpha rounded-xs">
            {/* Search Input */}
            <div className="relative border-b border-ink/40 dark:border-white/40 focus-within:border-accent-red transition duration-200">
              <Search className="absolute left-0 top-3 h-5 w-5 text-secondary" aria-hidden="true" />
              <label htmlFor="directory-search" className="sr-only">디렉터리 검색</label>
              <input
                id="directory-search"
                ref={searchInputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="검색 (Ctrl+K) · 제목, 분류, 키워드…"
                className="w-full pl-8 py-3 text-sm md:text-base text-ink dark:text-white bg-transparent focus:outline-none focus-ring"
                autoComplete="off"
              />
            </div>

            {/* 매체 종류는 항상 노출 */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest w-[80px] text-left">
                매체 종류
              </span>
              <div className="flex flex-wrap gap-1.5">
                {([
                  ['info', '뉴스·정보 (대시보드용)'],
                  ['newsletter', '이메일 뉴스레터만'],
                  ['all', '전부 (탐색·갤러리 포함)']
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMediaKind(value)}
                    className={`px-3 py-1 text-xs border rounded-full transition duration-200 cursor-pointer focus-ring
                      ${mediaKind === value
                        ? 'chip-active border'
                        : 'border-line-alpha text-ink hover:border-ink dark:hover:border-white'
                      }
                    `}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line-alpha/40 pt-3">
              <button
                type="button"
                onClick={() => setFiltersOpen(v => !v)}
                className="flex items-center gap-2 text-xs font-bold text-forest-green dark:text-[var(--green)] bg-transparent border-0 cursor-pointer focus-ring px-0 py-1"
                aria-expanded={filtersOpen}
                aria-controls="directory-filters-panel"
              >
                <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
                {filtersOpen ? '상세 필터 접기' : '상세 필터 펼치기'}
                <ChevronDown className={`w-4 h-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              {!filtersOpen && (
                <span className="text-[10px] text-secondary">
                  모바일 기본 접힘 · 검색·매체 종류는 위에 유지
                </span>
              )}
            </div>

            <div
              id="directory-filters-panel"
              hidden={!filtersOpen}
              className={filtersOpen ? 'space-y-6' : undefined}
            >
            {/* My subscription status filter */}
            <div className="flex flex-wrap items-center gap-2 border-t border-line-alpha/40 pt-3">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest w-[80px] text-left">
                내 상태
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['전체', '구독 중', '나중에', '관심 있음', '해지함'].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedPersonal(s)}
                    className={`px-3 py-1 text-xs border rounded-full transition duration-200 cursor-pointer
                      ${selectedPersonal === s
                        ? 'chip-active border'
                        : 'border-line-alpha text-ink hover:border-ink dark:hover:border-white'
                      }
                    `}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-line-alpha/40 pt-3">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest w-[80px] text-left">
                산업 축
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto">
                {industryList.map(ind => (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => setSelectedIndustry(ind)}
                    className={`px-3 py-1 text-xs border rounded-full transition duration-200 cursor-pointer
                      ${selectedIndustry === ind
                        ? 'chip-active border'
                        : 'border-line-alpha text-ink hover:border-ink dark:hover:border-white'
                      }
                    `}
                  >
                    {ind === '전체' ? '산업 전체' : ind}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-line-alpha/40 pt-3">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest w-[80px] text-left">
                링크 유형
              </span>
              <div className="flex flex-wrap gap-1.5">
                {([
                  ['all', '전체'],
                  ['has-subscribe', '구독 페이지 있음'],
                  ['site-only', '사이트만']
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setLinkMode(value)}
                    className={`px-3 py-1 text-xs border rounded-full transition duration-200 cursor-pointer
                      ${linkMode === value
                        ? 'chip-active border'
                        : 'border-line-alpha text-ink hover:border-ink dark:hover:border-white'
                      }
                    `}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Source Scope Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest w-[80px] text-left">
                분류 범위
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '전체 디렉터리', value: 'all' },
                  { label: '검증 공공·비영리 출처만', value: 'public' }
                ].map(scope => (
                  <button
                    key={scope.value}
                    onClick={() => setSelectedSourceScope(scope.value as any)}
                    className={`px-3 py-1 text-xs border rounded-full transition duration-200 cursor-pointer
                      ${selectedSourceScope === scope.value
                        ? 'chip-active border'
                        : 'border-line-alpha text-ink hover:border-ink dark:hover:border-white'
                      }
                    `}
                  >
                    {scope.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Academic Discipline Filter */}
            <div className="flex flex-wrap items-center gap-2 border-t border-line-alpha/40 pt-3">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest w-[80px] text-left">
                학문 분야
              </span>
              <div className="flex flex-wrap gap-1.5">
                {disciplinesList.map(discipline => (
                  <button
                    key={discipline}
                    onClick={() => setSelectedDiscipline(discipline)}
                    className={`px-3 py-1 text-xs border rounded-full transition duration-200 cursor-pointer
                      ${selectedDiscipline === discipline
                        ? 'chip-active border'
                        : 'border-line-alpha text-ink hover:border-ink dark:hover:border-white'
                      }
                    `}
                  >
                    {discipline === '전체' ? '학문 전체' : discipline}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories Filter */}
            <div className="flex flex-wrap items-center gap-2 border-t border-line-alpha/40 pt-3">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest w-[80px] text-left">
                콘텐츠 카테고리
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 text-xs border rounded-full transition duration-200 cursor-pointer
                      ${selectedCategory === cat
                        ? 'chip-active border'
                        : 'border-line-alpha text-ink hover:border-ink dark:hover:border-white'
                      }
                    `}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Topics Filter */}
            <div className="flex flex-wrap items-center gap-2 border-t border-line-alpha/40 pt-3">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest w-[80px] text-left">
                세부 주제 태그
              </span>
              <div className="flex flex-wrap gap-1.5">
                {topics.map(topic => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    className={`px-3 py-1 text-xs border border-dashed rounded-full transition duration-200 cursor-pointer
                      ${selectedTopic === topic
                        ? 'chip-active border'
                        : 'border-line-alpha text-ink hover:border-ink dark:hover:border-white'
                      }
                    `}
                  >
                    {topic === '전체' ? '세부 주제 전체' : `# ${topic}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Frequency, Language, Type side filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-line-alpha/40 pt-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">발행 빈도</span>
                <select
                  value={selectedFrequency}
                  onChange={(e) => setSelectedFrequency(e.target.value)}
                  className="bg-[var(--surface)] dark:text-white border border-line-alpha px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="전체">전체 빈도</option>
                  <option value="daily">매일</option>
                  <option value="weekly">주 1회</option>
                  <option value="occasional">가끔만</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">발행 언어/구독</span>
                <select
                  value={selectedOrigin}
                  onChange={(e) => setSelectedOrigin(e.target.value)}
                  className="bg-[var(--surface)] dark:text-white border border-line-alpha px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="전체">전체 언어</option>
                  <option value="한국">한국어 뉴스레터</option>
                  <option value="글로벌">글로벌 원문 · 한국어 소개</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">콘텐츠 형식</span>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-[var(--surface)] dark:text-white border border-line-alpha px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="전체">전체 형식</option>
                  <option value="newsletter">뉴스레터</option>
                  <option value="magazine">매거진</option>
                  <option value="site">사이트</option>
                </select>
              </div>
            </div>

            {/* Country and Sorting Options */}
            <div className="flex flex-wrap justify-between items-center gap-4 border-t border-line-alpha/40 pt-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">국가</span>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="bg-[var(--surface)] dark:text-white border border-line-alpha px-2.5 py-1.5 text-xs focus:outline-none"
                >
                  {countriesList.map(country => (
                    <option key={country} value={country}>
                      {country === '전체' ? '국가 전체' : country}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">정렬 기준</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[var(--surface)] dark:text-white border border-line-alpha px-2.5 py-1.5 text-xs focus:outline-none font-semibold"
                >
                  <option value="recommended">나에게 맞는 추천순</option>
                  <option value="recent">최근 활동 순</option>
                  <option value="light">가볍게 읽는 순</option>
                </select>
              </div>
            </div>
            </div>
          </div>

          {/* Results count indicator */}
          <div className="text-xs text-gray-500 mb-4 font-mono flex justify-between items-center">
            <span>
              총 <strong className="text-accent-red">{sortedFilteredNewsletters.length}</strong>개의 편지 지도 검색됨
            </span>
            {(query || selectedSourceScope !== 'all' || selectedCategory !== '전체' || selectedDiscipline !== '전체' || selectedTopic !== '전체' || selectedFrequency !== '전체' || selectedOrigin !== '전체' || selectedType !== '전체' || selectedCountry !== '전체' || selectedPersonal !== '전체' || selectedIndustry !== '전체' || linkMode !== 'all' || mediaKind !== 'info') && (
              <button
                type="button"
                onClick={clearDirectoryFilters}
                className="text-xs text-forest-green hover:underline cursor-pointer bg-transparent border-0 font-bold"
              >
                필터 조건 초기화 ↺
              </button>
            )}
          </div>

          {/* Grid display of newsletters */}
          {sortedFilteredNewsletters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-line-alpha">
              {sortedFilteredNewsletters.map(item => (
                <NewsletterCard
                  key={item.id}
                  item={item}
                  isSaved={savedIds.has(item.id)}
                  onToggleSave={() => handleToggleSave(item.id)}
                  onOpenLive={() => {
                    setLiveSourceId(item.id);
                    localStorage.setItem('letter-live-source', item.id);
                    document.getElementById('live')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onOpenNote={() => handleOpenNote(item.id)}
                  personalState={personalStatus[item.id] || '관심 있음'}
                  onChangePersonalState={(stat) => handleStatusChange(item.id, stat)}
                  lastLinkCheck={
                    isTrackedInterest(item) ? cardLinkCheck(item.id) : null
                  }
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-white/40 border border-dashed border-line-alpha flex flex-col items-center justify-center p-8">
              <Info className="w-8 h-8 text-secondary mb-2" />
              <p className="text-sm font-semibold text-gray-600 dark:text-secondary mb-1">
                검색 조건에 맞는 편지 채널이 존재하지 않습니다.
              </p>
              <p className="text-xs text-secondary">
                입력된 키워드 철자를 확인하거나 위의 필터 조건들을 조금 더 넓혀 보세요.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* --- SAVED SHELF SECTION ("내 목록") --- */}
      <section className="my-list bg-[var(--warm)] p-8 md:p-14 border-b border-line-alpha" id="my-list">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div className="max-w-xl">
              <p className="text-xs font-bold tracking-widest text-forest-green dark:text-[var(--green)] uppercase mb-2">
                YOUR SHELF
              </p>
              <h2 className="font-serif text-3xl md:text-5xl tracking-tight leading-tight text-ink">
                내가 모아 둔 편지함
              </h2>
              <p className="text-sm text-secondary mt-2 leading-relaxed">
                보관해 둔 목록입니다. 없는 사이트는 아래에서 추가하세요. OPML·백업은 맨 아래 「부가·백업」.
              </p>
            </div>
            <AddSourceForm onAdd={handleAddCustom} variant="compact" idPrefix="shelf-add" />
          </div>

          {savedNewsletters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-line-alpha bg-white/20">
              {savedNewsletters.map(item => (
                <NewsletterCard
                  key={item.id}
                  item={item}
                  isSaved={savedIds.has(item.id)}
                  onToggleSave={() => handleToggleSave(item.id)}
                  onOpenLive={() => {
                    setLiveSourceId(item.id);
                    localStorage.setItem('letter-live-source', item.id);
                    document.getElementById('live')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onOpenNote={() => handleOpenNote(item.id)}
                  personalState={personalStatus[item.id] || '관심 있음'}
                  onChangePersonalState={(stat) => handleStatusChange(item.id, stat)}
                  lastLinkCheck={
                    isTrackedInterest(item) ? cardLinkCheck(item.id) : null
                  }
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center bg-white/25 border border-dashed border-line-alpha flex flex-col items-center justify-center p-8">
              <p className="font-serif text-lg text-secondary mb-2">
                보관된 편지가 아직 존재하지 않습니다.
              </p>
              <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
                위 디렉터리 탐색 목록에서 흥미가 가거나 구독하려는 편지의 카드를 보고 [+ 내 목록] 보관을 선택하여 책장을 채우세요.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* --- NOTES & GMAIL INTERACTION SECTION --- */}
      <NotesHub
        notes={notes}
        notebooks={notebooks}
        gmailSelfEmail={gmailSelfEmail}
        onGmailEmailChange={handleGmailEmailSave}
        onGoogleLogin={handleGoogleMailLogin}
        onOpenInbox={() => handleOpenNote('inbox')}
        onAddNotebook={handleAddNotebook}
        onOpenNote={handleOpenNote}
        onSendGmail={handleSendGmail}
        getSourceName={getSourceName}
      />

      {/* --- 부가·고급·법적 고지 (맨 아래) --- */}
      <AdvancedBottom
        customSources={customSources}
        onAddCustom={handleAddCustom}
        onRemoveCustom={handleRemoveCustom}
        onExportOpmlSaved={() => handleExportOpml('saved')}
        onExportOpmlPublic={() => handleExportOpml('public')}
        onBackup={handleBackupAll}
        onRestore={handleRestoreBackup}
        onExportCsv={handleExportSubscriptionCsv}
        onExportDigest={handleExportWeekendDigest}
      />

      <footer className="py-6 text-center text-xs text-secondary bg-paper dark:bg-[#121c18] border-t border-line-alpha">
        <p className="mb-1">오늘의 편지함 · 디렉터리 · 메모</p>
        <p className="text-[10px]">
          <a href="#legal" className="text-forest-green dark:text-[var(--green)] font-semibold no-underline hover:underline">
            이용·저작권·개인정보 고지
          </a>
          {' · '}
          <a
            href="https://github.com/presentjinho/newsletter-hub/issues/new/choose"
            target="_blank"
            rel="noopener noreferrer"
            className="text-forest-green dark:text-[var(--green)] font-semibold no-underline hover:underline"
          >
            삭제·정정 요청
          </a>
        </p>
      </footer>

      <Toast message={toastMsg} onDone={() => setToastMsg('')} />

      {/* --- DIALOG COMPONENT MOUNTS --- */}
      
      <OnboardingDialog
        isOpen={onboardingOpen}
        onClose={handleOnboardingClose}
        availableInterests={ALL_INTERESTS}
      />

      <PreferenceDialog
        isOpen={preferencesOpen}
        onClose={() => setPreferencesOpen(false)}
        onSave={handlePreferencesSave}
        currentInterests={userInterests}
        currentPrefs={prefs}
        availableInterests={ALL_INTERESTS}
      />

      <NoteDialog
        isOpen={noteEditorOpen}
        onClose={() => setNoteEditorOpen(false)}
        sourceId={noteEditorSourceId}
        noteId={noteEditorNoteId}
        notes={notes}
        notebooks={notebooks}
        newsletters={catalog}
        onSaveNote={handleSaveNote}
        onCreateNote={handleCreateNote}
        onDeleteNote={handleDeleteNote}
        onTransferNote={handleTransferNote}
        onSendGmail={handleSendGmail}
        onSendMailto={handleSendMailto}
        onCopyNote={handleCopyNote}
        onExportMarkdown={handleExportMarkdown}
        getSourceName={getSourceName}
      />
    </div>
  );
}
