/**
 * 개개인(프로필)별 로컬 저장.
 * - 서버 계정 없음: 이 브라우저 안에서 프로필 분리
 * - 키: letter.p.{profileId}.{slot}
 * - 예전 단일 letter-* 키는 첫 실행 시 기본 프로필로 이전
 */

export type UserProfile = {
  id: string;
  name: string;
  createdAt: string;
};

type Meta = {
  version: 1;
  activeId: string;
  profiles: UserProfile[];
};

const META_KEY = 'letter.profiles.v1';

/** 슬롯 이름 (프로필 접두사 뒤) */
export const SLOTS = {
  shelf: 'shelf',
  status: 'status',
  interests: 'interests',
  preferences: 'preferences',
  notes: 'notes-v1',
  notebooks: 'notebooks-v1',
  gmail: 'gmail-pref',
  liveSource: 'live-source',
  onboarding: 'onboarding-seen',
  customSources: 'custom-sources-v1',
  readerZoom: 'reader-zoom',
  theme: 'theme',
  textSize: 'text-size',
} as const;

const LEGACY: Record<string, string> = {
  [SLOTS.shelf]: 'letter-shelf',
  [SLOTS.status]: 'letter-status',
  [SLOTS.interests]: 'letter-interests',
  [SLOTS.preferences]: 'letter-preferences',
  [SLOTS.notes]: 'letter-notes-v1',
  [SLOTS.notebooks]: 'letter-notebooks-v1',
  [SLOTS.gmail]: 'letter-gmail-pref',
  [SLOTS.liveSource]: 'letter-live-source',
  [SLOTS.onboarding]: 'letter-onboarding-seen',
  [SLOTS.customSources]: 'letter-custom-sources-v1',
  [SLOTS.readerZoom]: 'letter-reader-zoom',
  [SLOTS.theme]: 'letter-theme',
  [SLOTS.textSize]: 'letter-text-size',
};

function readMeta(): Meta | null {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return null;
    const m = JSON.parse(raw) as Meta;
    if (!m?.activeId || !Array.isArray(m.profiles) || m.profiles.length === 0) return null;
    return m;
  } catch {
    return null;
  }
}

function writeMeta(m: Meta) {
  localStorage.setItem(META_KEY, JSON.stringify(m));
}

function newId() {
  return `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** 앱 시작 시 1회: 메타 없으면 기본 프로필 + 레거시 이전 */
export function ensureProfiles(): Meta {
  let m = readMeta();
  if (m) return m;

  const id = 'default';
  const profile: UserProfile = {
    id,
    name: '나 (기본)',
    createdAt: new Date().toISOString()
  };
  m = { version: 1, activeId: id, profiles: [profile] };
  writeMeta(m);

  // 레거시 → 기본 프로필
  for (const [slot, legacyKey] of Object.entries(LEGACY)) {
    const val = localStorage.getItem(legacyKey);
    if (val !== null && localStorage.getItem(pKey(id, slot)) === null) {
      localStorage.setItem(pKey(id, slot), val);
    }
  }
  return m;
}

export function pKey(profileId: string, slot: string): string {
  return `letter.p.${profileId}.${slot}`;
}

export function getActiveProfileId(): string {
  return ensureProfiles().activeId;
}

export function listProfiles(): UserProfile[] {
  return ensureProfiles().profiles;
}

export function getActiveProfile(): UserProfile {
  const m = ensureProfiles();
  return m.profiles.find(p => p.id === m.activeId) || m.profiles[0];
}

export function setActiveProfileId(id: string): boolean {
  const m = ensureProfiles();
  if (!m.profiles.some(p => p.id === id)) return false;
  m.activeId = id;
  writeMeta(m);
  return true;
}

export function createProfile(name: string): UserProfile {
  const m = ensureProfiles();
  const trimmed = (name || '').trim() || `사용자 ${m.profiles.length + 1}`;
  const p: UserProfile = {
    id: newId(),
    name: trimmed.slice(0, 40),
    createdAt: new Date().toISOString()
  };
  m.profiles.push(p);
  m.activeId = p.id;
  writeMeta(m);
  return p;
}

export function renameProfile(id: string, name: string): boolean {
  const m = ensureProfiles();
  const p = m.profiles.find(x => x.id === id);
  if (!p) return false;
  p.name = (name || '').trim().slice(0, 40) || p.name;
  writeMeta(m);
  return true;
}

/** 마지막 프로필은 삭제 불가. 활성 삭제 시 다른 프로필로 전환 */
export function deleteProfile(id: string): boolean {
  const m = ensureProfiles();
  if (m.profiles.length <= 1) return false;
  if (!m.profiles.some(p => p.id === id)) return false;
  m.profiles = m.profiles.filter(p => p.id !== id);
  if (m.activeId === id) m.activeId = m.profiles[0].id;
  writeMeta(m);
  // 데이터 키 정리
  const prefix = `letter.p.${id}.`;
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefix)) toRemove.push(k);
  }
  toRemove.forEach(k => localStorage.removeItem(k));
  return true;
}

function activeKey(slot: string): string {
  return pKey(getActiveProfileId(), slot);
}

export function loadString(slot: string, fallback = ''): string {
  ensureProfiles();
  const v = localStorage.getItem(activeKey(slot));
  return v === null ? fallback : v;
}

export function saveString(slot: string, value: string) {
  ensureProfiles();
  localStorage.setItem(activeKey(slot), value);
}

export function loadJSON<T>(slot: string, fallback: T): T {
  const raw = loadString(slot, '');
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON(slot: string, value: unknown) {
  saveString(slot, JSON.stringify(value));
}

export function removeSlot(slot: string) {
  ensureProfiles();
  localStorage.removeItem(activeKey(slot));
}
