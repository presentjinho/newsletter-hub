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
import NewsletterCard from './components/NewsletterCard';
import LiveDesk from './components/LiveDesk';
import NotesHub from './components/NotesHub';
import NoteDialog from './components/NoteDialog';
import ToolsSection from './components/ToolsSection';
import SubscriptionDesk from './components/SubscriptionDesk';
import Toast from './components/Toast';

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
  const [catalog, setCatalog] = useState<Newsletter[]>(newsletters);

  const showToast = (msg: string) => setToastMsg(msg);

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

  // link-status.json 실제 반영
  const applyLinkStatusFile = async () => {
    setLinkSyncStatus('동기화 중…');
    try {
      const base = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL || '/';
      const res = await fetch(`${base}data/link-status.json`, { cache: 'no-store' });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      const bad = new Set(
        (data.results || [])
          .filter((r: { status?: string }) => r.status === 'needs-review')
          .map((r: { id: string }) => r.id)
      );
      setCatalog(prev =>
        prev.map(n => (bad.has(n.id) ? { ...n, status: 'needs-review' as const } : n))
      );
      const when = data.checkedAt
        ? new Date(data.checkedAt).toLocaleString('ko-KR')
        : new Date().toLocaleTimeString('ko-KR');
      setLinkSyncStatus(`동기화 완료 · ${when}` + (bad.size ? ` · 확인 필요 ${bad.size}` : ''));
      showToast(bad.size ? `확인 필요 ${bad.size}건 표시` : '링크 상태 동기화 완료');
    } catch {
      setLinkSyncStatus('동기화 실패 (로컬/네트워크) — 새 탭 원문은 가능');
      showToast('상태 파일 동기화 실패 — 원문 링크는 그대로 사용하세요');
    }
  };

  useEffect(() => {
    applyLinkStatusFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      }
      return copy;
    });
  };

  const handleStatusChange = (id: string, stat: string) => {
    setPersonalStatus(prev => ({
      ...prev,
      [id]: stat
    }));
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

  const handleBackupAll = () => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      savedIds: [...savedIds],
      personalStatus,
      userInterests,
      prefs,
      notes,
      notebooks,
      gmailSelfEmail,
      theme,
      textSize
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

  // Gmail Compose Link Maker
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
      `본 메일은 오늘의 편지함(K-Newsletter Hub)에서 편리한 편지 내보내기를 통해 생성되었습니다.`
    ].filter(Boolean).join('\n\n');
  };

  const handleSendGmail = (note: Note) => {
    const subject = encodeURIComponent(`[오늘의 편지함] ${note.title || getSourceName(note.sourceId)}`);
    const bodyText = encodeURIComponent(formatGmailBody(note));
    const url = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=${encodeURIComponent(gmailSelfEmail)}&su=${subject}&body=${bodyText}`;
    window.open(url, '_blank', 'noopener');
  };

  const handleSendMailto = (note: Note) => {
    const subject = encodeURIComponent(`[오늘의 편지함] ${note.title}`);
    const bodyText = encodeURIComponent(formatGmailBody(note));
    window.location.href = `mailto:${encodeURIComponent(gmailSelfEmail)}?subject=${subject}&body=${bodyText}`;
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
    const folderName = getSourceName(sourceId);
    const newNote = handleCreateNote(sourceId, `${folderName} 빠른 메모`, '');
    handleOpenNote(sourceId, newNote.id);
    // Open Gmail compose helper quickly
    setTimeout(() => {
      handleSendGmail(newNote);
    }, 150);
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

  // Today's Picks — 정보 매체 다양성 (국가·산업 분산)
  const todayPicks = (() => {
    const pool = infoCatalog.filter(item => {
      if (item.status === 'needs-review') return false;
      if (prefs.paused) return false;
      return true;
    });
    const scored = [...pool].sort((a, b) => {
      const am = a.interests.filter(t => userInterests.includes(t)).length;
      const bm = b.interests.filter(t => userInterests.includes(t)).length;
      const as = (a.stability === 'high' ? 2 : 0) + (a.sourceScope === 'public' ? 1 : 0) + (a.industry ? 1 : 0);
      const bs = (b.stability === 'high' ? 2 : 0) + (b.sourceScope === 'public' ? 1 : 0) + (b.industry ? 1 : 0);
      return bm - am || bs - as || a.daysSince - b.daysSince;
    });
    // 국가 중복 줄여 다양하게 3개
    const picked: typeof scored = [];
    const usedCountry = new Set<string>();
    for (const item of scored) {
      if (picked.length >= 3) break;
      if (usedCountry.has(item.country) && picked.length < 3 && scored.length > 5) continue;
      picked.push(item);
      usedCountry.add(item.country);
    }
    if (picked.length < 3) {
      for (const item of scored) {
        if (picked.length >= 3) break;
        if (!picked.includes(item)) picked.push(item);
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
  const totalNeedsReview = catalog.filter(n => n.status === 'needs-review').length;
  const weekendQueue = Object.values(personalStatus).filter(s => s === '나중에').length;

  return (
    <div className="relative min-h-screen text-ink selection:bg-accent-red/20 selection:text-ink">
      <div className="paper-grain" aria-hidden="true" />

      {/* --- SITE HEADER --- */}
      <header className="site-header border-b border-line h-[74px] px-6 md:px-12 flex justify-between items-center bg-paper/90 sticky top-0 backdrop-blur-xs z-40">
        <a href="#top" className="brand flex items-center font-bold tracking-tight text-ink no-underline text-lg">
          <span className="brand-mark">✦</span>
          <span>오늘의 편지함</span>
        </a>

        <nav className="flex items-center gap-6 md:gap-8 overflow-x-auto max-w-[65%] whitespace-nowrap">
          <a href="#live" className="text-xs font-bold text-ink no-underline hover:text-accent-red">실시간</a>
          <a href="#subscriptions" className="text-xs font-bold text-ink no-underline hover:text-accent-red flex items-center gap-1">
            구독관리
            {weekendQueue > 0 && (
              <span className="text-[10px] bg-forest-green/15 text-forest-green px-1.5 py-0.5 font-bold rounded-full">
                주말{weekendQueue}
              </span>
            )}
          </a>
          <a href="#find" className="text-xs font-bold text-ink no-underline hover:text-accent-red">디렉터리</a>
          <a href="#notes" className="text-xs font-bold text-ink no-underline hover:text-accent-red flex items-center gap-1">
            <span>메모</span>
            <span className="text-[10px] bg-accent-red/10 text-accent-red px-1.5 py-0.5 font-bold rounded-full">
              {notes.length}
            </span>
          </a>
          <a href="#my-list" className="text-xs font-bold text-ink no-underline hover:text-accent-red flex items-center gap-1">
            <span>내 목록</span>
            <span className="text-[10px] bg-forest-green/10 text-forest-green px-1.5 py-0.5 font-bold rounded-full">
              {savedIds.size}
            </span>
          </a>
          <a href="#stack" className="text-xs font-bold text-ink no-underline hover:text-accent-red">보강 도구</a>
          
          <span className="w-px h-3.5 bg-line-alpha" />

          <button
            onClick={() => setPreferencesOpen(true)}
            className="text-xs font-bold text-ink/70 hover:text-ink bg-transparent border-0 cursor-pointer"
          >
            내 설정
          </button>
          
          <button
            onClick={() =>
              setTextSize(prev => (prev === 'normal' ? 'large' : prev === 'large' ? 'xl' : 'normal'))
            }
            className="text-xs font-bold text-ink/70 hover:text-ink bg-transparent border-0 cursor-pointer"
            title="사이트 전체 글자 크기 순환"
          >
            {textSize === 'normal' ? '글자 크게' : textSize === 'large' ? '글자 더크게' : '기본 글자'}
          </button>

          <button
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            className="text-xs font-bold text-ink/70 hover:text-ink bg-transparent border-0 cursor-pointer"
          >
            {theme === 'dark' ? '라이트 모드' : '다크 모드'}
          </button>
        </nav>
      </header>

      {/* --- HERO BANNER --- */}
      <section className="hero max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 relative overflow-hidden flex flex-col justify-between" id="top">
        <div className="max-w-3xl z-10">
          <p className="text-xs font-bold tracking-widest text-forest-green dark:text-[var(--green)] mb-4">
            KOREAN NEWSLETTER DIRECTORY · 매일 오전 7시 갱신
          </p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight leading-tight mb-6">
            좋아하는 이야기는<br />
            <em className="text-accent-red not-italic font-bold">가볍게</em> 모으고,<br />
            편하게 읽어요.
          </h1>
          <p className="text-base md:text-lg text-secondary leading-relaxed mb-8 max-w-2xl">
            수많은 뉴스레터와 공공 공개 자료원들이 어디에 있고, 오늘도 살아있는지 한곳에서 확인하세요.<br />
            남의 편지를 무단 복사하지 않고, 발행사 공식 채널로만 직접 안내하여 안심하고 구독할 수 있습니다.
          </p>

          <a
            href="#find"
            className="inline-flex items-center gap-12 font-bold text-base text-ink no-underline border-b border-ink dark:border-white pb-2 hover:border-accent-red hover:text-accent-red transition-all duration-200"
          >
            <span>뉴스레터 지도 보러가기</span>
            <span className="text-lg text-accent-red">↓</span>
          </a>
        </div>

        <div className="mt-12 text-xs flex items-center gap-2.5 z-10">
          <span className="pulse" />
          <span className="text-secondary">
            현재 <strong>{totalActive}</strong>개의 엄선 채널 중, <strong>{totalAlive}</strong>개 정상 발행 상태 확인 완료
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
            <span className="stats-label block text-[10px] uppercase tracking-wider mb-0.5">확인 필요 · 주말 큐</span>
            <strong className="text-sm font-semibold text-[#ff9a8a]">
              {totalNeedsReview} · 주말 {weekendQueue}
            </strong>
          </div>
          <div className="text-xs text-[#d5e2db] leading-relaxed">
            Ctrl+K 검색 · 구독관리 일괄 정리 · 주말 몰아보기 MD · 백업 JSON
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
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- MAIN DIRECTORY SECTION --- */}
      <section className="directory bg-[var(--surface)] p-8 md:p-14 border-b border-line-alpha" id="find">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-xl mb-10">
            <p className="text-xs font-bold tracking-widest text-forest-green dark:text-[var(--green)] uppercase mb-2">
              THE DIRECTORY
            </p>
            <h2 className="font-serif text-3xl md:text-5xl tracking-tight leading-tight text-ink">
              오늘, 무슨 편지를<br />기다리고 있나요?
            </h2>
          </div>

          {/* --- SEARCH & FILTERS CONTROLS --- */}
          <div className="space-y-6 mb-8 bg-[var(--surface-2)] p-6 border border-line-alpha rounded-xs">
            {/* Search Input */}
            <div className="relative border-b border-ink/40 dark:border-white/40 focus-within:border-accent-red transition duration-200">
              <Search className="absolute left-0 top-3 h-5 w-5 text-secondary" />
              <input
                ref={searchInputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="검색 (Ctrl+K) · 제목, 분류, 키워드…"
                className="w-full pl-8 py-3 text-sm md:text-base text-ink dark:text-white bg-transparent focus:outline-none"
              />
            </div>

            {/* 정보 vs 뉴스레터 — 기본 정보 매체 */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest w-[80px] text-left">
                매체 종류
              </span>
              <div className="flex flex-wrap gap-1.5">
                {([
                  ['info', '정보 매체 (기본)'],
                  ['newsletter', '이메일 뉴스레터만'],
                  ['all', '전부']
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMediaKind(value)}
                    className={`px-3 py-1 text-xs border rounded-full transition duration-200 cursor-pointer
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
                보관해 둔 편지 목록입니다. 타 기기나 FreshRSS, NetNewsWire 등 다른 RSS 리더기로 한 번에 전송하고 싶다면 OPML 규격 파일로 내려받으세요.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => handleExportOpml('saved')}
                className="px-4 py-3 bg-ink text-paper hover:opacity-90 font-bold text-xs cursor-pointer rounded-xs"
              >
                내 목록 OPML 내보내기
              </button>
              
              <button
                onClick={() => handleExportOpml('public')}
                className="px-4 py-3 bg-white hover:bg-[var(--warm)] text-ink border border-line-alpha font-bold text-xs cursor-pointer rounded-xs"
              >
                검증 공공 출처 OPML 받기
              </button>
            </div>
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
        onOpenInbox={() => handleOpenNote('inbox')}
        onAddNotebook={handleAddNotebook}
        onOpenNote={handleOpenNote}
        onSendGmail={handleSendGmail}
        getSourceName={getSourceName}
      />

      {/* --- SUPPLEMENTARY OPEN SOURCE TOOLS --- */}
      <ToolsSection />

      {/* --- FOOTER --- */}
      <footer className="py-12 text-center text-xs text-secondary bg-paper dark:bg-[#121c18] border-t border-line-alpha flex flex-col items-center justify-center gap-3">
        <p>오늘의 편지함 · 개인 정보 뉴스레터 디렉터리 및 메모작업 공간</p>
        <p className="text-[10px] text-secondary max-w-lg">
          모든 뉴스레터 및 기사의 저작권은 각 원천 발행 기관에 귀속됩니다. 원문 무단 전재 없음. 데이터는 이 브라우저에만 저장됩니다.
        </p>
        <div className="flex flex-wrap gap-3 justify-center items-center">
          <button
            type="button"
            onClick={handleBackupAll}
            className="text-xs text-forest-green dark:text-[var(--green)] hover:underline cursor-pointer bg-transparent border-0 font-semibold"
          >
            전체 백업 JSON
          </button>
          <label className="text-xs text-forest-green dark:text-[var(--green)] hover:underline cursor-pointer font-semibold">
            백업 복원
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) handleRestoreBackup(f);
                e.target.value = '';
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => {
              window.open('https://github.com/presentjinho/newsletter-hub/issues/new/choose', '_blank', 'noopener');
            }}
            className="text-xs text-forest-green dark:text-[var(--green)] hover:underline cursor-pointer bg-transparent border-0 font-semibold"
          >
            제보 · 피드백
          </button>
        </div>
      </footer>

      <Toast message={toastMsg} onDone={() => setToastMsg('')} />

      {/* --- DIALOG COMPONENT MOUNTS --- */}
      
      <OnboardingDialog
        isOpen={onboardingOpen}
        onClose={handleOnboardingClose}
        availableInterests={['AI', '재테크', '커리어', '디자인', '시사', '과학', '국제', '건강']}
      />

      <PreferenceDialog
        isOpen={preferencesOpen}
        onClose={() => setPreferencesOpen(false)}
        onSave={handlePreferencesSave}
        currentInterests={userInterests}
        currentPrefs={prefs}
        availableInterests={['AI', '재테크', '커리어', '디자인', '시사', '과학', '국제', '건강']}
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
