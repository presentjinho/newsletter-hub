export interface Newsletter {
  id: string;
  name: string;
  category: string;
  frequency: string;
  frequencyGroup: 'daily' | 'weekly' | 'occasional';
  description: string;
  /** 사이트 홈·아카이브 (읽기/방문). 리더·새 탭 기본 */
  siteUrl: string;
  /** 이메일 구독·뉴스레터 가입 페이지. 없으면 구독 버튼 숨김 */
  subscribeUrl?: string;
  /**
   * @deprecated siteUrl과 동일. 구버전 호환용
   */
  url: string;
  daysSince: number;
  typical: string;
  status: 'alive' | 'paused' | 'needs-review';
  interests: string[];
  trust: string[];
  origin: '한국' | '글로벌';
  language: string;
  country: string;
  type: 'newsletter' | 'magazine' | 'site';
  discipline: string;
  reuseLevel: 'A' | 'B' | 'C';
  licenseUrl: string;
  feedUrl?: string;
  sourceScope: 'public' | 'general';
  /** 안정성: 공영/기관/장기 운영 등 */
  stability?: 'high' | 'medium';
  /** 산업 축 (반도체, 자동차 등) — 국가 다각화 필터 */
  industry?: string;
  /**
   * info = 뉴스·기관 정보 (실시간 리더·기본 디렉터리)
   * browse = 갤러리·커뮤니티 탐색용 (디렉터리「전부」에서만, 리더 제외)
   */
  deskRole?: 'info' | 'browse';
}

export interface Note {
  id: string;
  sourceId: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notebook {
  id: string;
  name: string;
}

export interface Preferences {
  frequency: 'all' | 'daily' | 'weekly' | 'occasional';
  paused: boolean;
}
