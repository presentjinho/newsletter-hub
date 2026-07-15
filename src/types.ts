export interface Newsletter {
  id: string;
  name: string;
  category: string;
  frequency: string;
  frequencyGroup: 'daily' | 'weekly' | 'occasional';
  description: string;
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
}

export interface Note {
  id: string;
  sourceId: string; // newsletter id or notebook id or 'inbox'
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
