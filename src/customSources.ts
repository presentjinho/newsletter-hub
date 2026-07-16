import { Newsletter } from './types';
import { normalizeItem } from './data';

const KEY = 'letter-custom-sources-v1';

export type CustomSourceInput = {
  name: string;
  siteUrl: string;
  description?: string;
  category?: string;
  subscribeUrl?: string;
};

export function loadCustomSources(): Newsletter[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as Partial<Newsletter>[];
    if (!Array.isArray(list)) return [];
    return list.map(row =>
      normalizeItem({
        ...row,
        type: row.type || 'site',
        deskRole: 'info',
        origin: row.origin || '한국',
        reuseLevel: 'A',
        trust: row.trust || ['내가 추가한 출처', '공식 링크 확인'],
        frequency: row.frequency || '수시',
        frequencyGroup: row.frequencyGroup || 'occasional',
      })
    );
  } catch {
    return [];
  }
}

export function saveCustomSources(items: Newsletter[]) {
  localStorage.setItem(
    KEY,
    JSON.stringify(
      items.map(n => ({
        id: n.id,
        name: n.name,
        siteUrl: n.siteUrl,
        url: n.url,
        description: n.description,
        category: n.category,
        subscribeUrl: n.subscribeUrl,
        origin: n.origin,
        country: n.country,
        language: n.language,
        type: n.type,
        deskRole: n.deskRole,
        interests: n.interests,
        status: n.status,
        daysSince: n.daysSince,
        typical: n.typical,
        frequency: n.frequency,
        frequencyGroup: n.frequencyGroup,
        trust: n.trust,
        reuseLevel: n.reuseLevel,
        sourceScope: n.sourceScope,
      }))
    )
  );
}

export function makeCustomSource(input: CustomSourceInput): Newsletter | null {
  let url = (input.siteUrl || '').trim();
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  try {
    // validate
    // eslint-disable-next-line no-new
    new URL(url);
  } catch {
    return null;
  }
  const name = (input.name || '').trim() || new URL(url).hostname;
  const id = `custom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const category = (input.category || '시사').trim() || '시사';
  return normalizeItem({
    id,
    name,
    siteUrl: url,
    url,
    description: (input.description || '').trim() || '내가 등록한 정보 출처입니다.',
    category,
    subscribeUrl: input.subscribeUrl?.trim() || undefined,
    type: 'site',
    deskRole: 'info',
    origin: '한국',
    country: '대한민국',
    language: '한국어',
    interests: [category, '내출처'],
    trust: ['내가 추가한 출처'],
    status: 'alive',
    daysSince: 0,
    typical: '수시',
    frequency: '수시',
    frequencyGroup: 'occasional',
    reuseLevel: 'A',
    sourceScope: 'general',
  });
}
