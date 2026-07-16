/**
 * 브라우저 단일 저장 (프로필 분리 없음).
 * - localStorage 안전 읽기/쓰기
 * - 예전 키 · 프로필 키 자동 이전
 * - 쓰기 실패 시 미러 키 + beforeunload 플러시
 */

const PREFIX = 'letter.';
const MIRROR = 'letter.mirror.';

/** 앱 데이터 슬롯 */
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

let migrated = false;
let lastWriteError: string | null = null;

function mainKey(slot: string) {
  return PREFIX + slot;
}
function mirrorKey(slot: string) {
  return MIRROR + slot;
}

function readRaw(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeRaw(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    lastWriteError = e instanceof Error ? e.message : 'quota_or_blocked';
    return false;
  }
}

/** 프로필 시절 키 letter.p.{id}.{slot} → 단일 키로 합침 (활성/기본 우선) */
function migrateFromProfiles() {
  try {
    const metaRaw = readRaw('letter.profiles.v1');
    let preferredId = 'default';
    if (metaRaw) {
      const meta = JSON.parse(metaRaw) as { activeId?: string; profiles?: { id: string }[] };
      if (meta.activeId) preferredId = meta.activeId;
    }
    for (const slot of Object.values(SLOTS)) {
      const dest = mainKey(slot);
      if (readRaw(dest) !== null) continue;
      // 1) 활성 프로필
      const fromActive = readRaw(`letter.p.${preferredId}.${slot}`);
      if (fromActive !== null) {
        writeRaw(dest, fromActive);
        writeRaw(mirrorKey(slot), fromActive);
        continue;
      }
      // 2) default
      const fromDefault = readRaw(`letter.p.default.${slot}`);
      if (fromDefault !== null) {
        writeRaw(dest, fromDefault);
        writeRaw(mirrorKey(slot), fromDefault);
        continue;
      }
      // 3) 아무 프로필이나 첫 매치
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('letter.p.') && k.endsWith('.' + slot)) {
          const v = readRaw(k);
          if (v !== null) {
            writeRaw(dest, v);
            writeRaw(mirrorKey(slot), v);
            break;
          }
        }
      }
    }
  } catch {
    /* ignore */
  }
}

function migrateFromLegacy() {
  for (const [slot, legacyKey] of Object.entries(LEGACY)) {
    const dest = mainKey(slot);
    if (readRaw(dest) !== null) continue;
    const v = readRaw(legacyKey);
    if (v !== null) {
      writeRaw(dest, v);
      writeRaw(mirrorKey(slot), v);
    }
  }
}

/** 앱 시작 시 1회 */
export function ensureBrowserStore() {
  if (migrated) return;
  migrated = true;
  migrateFromLegacy();
  migrateFromProfiles();
  // 미러 보강
  for (const slot of Object.values(SLOTS)) {
    const main = readRaw(mainKey(slot));
    if (main !== null && readRaw(mirrorKey(slot)) === null) {
      writeRaw(mirrorKey(slot), main);
    }
    // 메인 없고 미러만 있으면 복구
    if (main === null) {
      const mir = readRaw(mirrorKey(slot));
      if (mir !== null) writeRaw(mainKey(slot), mir);
    }
  }
}

export function getLastWriteError(): string | null {
  return lastWriteError;
}

export function clearLastWriteError() {
  lastWriteError = null;
}

export function loadString(slot: string, fallback = ''): string {
  ensureBrowserStore();
  const v = readRaw(mainKey(slot));
  if (v !== null) return v;
  const m = readRaw(mirrorKey(slot));
  if (m !== null) {
    writeRaw(mainKey(slot), m);
    return m;
  }
  return fallback;
}

export function saveString(slot: string, value: string): boolean {
  ensureBrowserStore();
  clearLastWriteError();
  const a = writeRaw(mainKey(slot), value);
  const b = writeRaw(mirrorKey(slot), value);
  return a || b;
}

export function loadJSON<T>(slot: string, fallback: T): T {
  const raw = loadString(slot, '');
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    // 미러 재시도
    const m = readRaw(mirrorKey(slot));
    if (m) {
      try {
        const parsed = JSON.parse(m) as T;
        writeRaw(mainKey(slot), m);
        return parsed;
      } catch {
        return fallback;
      }
    }
    return fallback;
  }
}

export function saveJSON(slot: string, value: unknown): boolean {
  try {
    return saveString(slot, JSON.stringify(value));
  } catch {
    lastWriteError = 'stringify_failed';
    return false;
  }
}

/** 현재 사용자 데이터 스냅샷 (백업·검증용) */
export function snapshotAll(): Record<string, string | null> {
  ensureBrowserStore();
  const out: Record<string, string | null> = {};
  for (const slot of Object.values(SLOTS)) {
    out[slot] = readRaw(mainKey(slot));
  }
  return out;
}

/** 탭 닫기 직전 중요 데이터 다시 쓰기용 훅 등록 */
export function registerFlush(getters: () => Record<string, unknown>) {
  const flush = () => {
    try {
      const data = getters();
      for (const [slot, value] of Object.entries(data)) {
        if (value === undefined) continue;
        if (typeof value === 'string') saveString(slot, value);
        else saveJSON(slot, value);
      }
    } catch {
      /* ignore */
    }
  };
  window.addEventListener('pagehide', flush);
  window.addEventListener('beforeunload', flush);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
  return flush;
}
