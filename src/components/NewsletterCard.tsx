import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, Globe, Radio } from 'lucide-react';
import { Newsletter } from '../types';
import { valuePromises, readingTimes, unsubscribeText, reuseLabels } from '../data';

export type LinkCheckInfo = {
  status: string;
  httpStatus?: number;
  checkedAt: string;
};

interface NewsletterCardProps {
  key?: string | number;
  item: Newsletter;
  isSaved: boolean;
  onToggleSave: () => void;
  onOpenLive: () => void;
  onOpenNote: () => void;
  personalState: string;
  onChangePersonalState: (state: string) => void;
  lastLinkCheck?: LinkCheckInfo | null;
}

function formatCheckDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ko-KR', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
}

export default function NewsletterCard({
  item,
  isSaved,
  onToggleSave,
  onOpenLive,
  onOpenNote,
  personalState,
  onChangePersonalState,
  lastLinkCheck
}: NewsletterCardProps) {
  const [descOpen, setDescOpen] = useState(false);
  const longDesc = (item.description || '').length > 90;

  const handleReport = () => {
    const issueUrl = 'https://github.com/presentjinho/newsletter-hub/issues/new/choose';
    const title = encodeURIComponent(`[정보 수정] ${item.name}`);
    const body = encodeURIComponent(`뉴스레터: ${item.name}\n\n수정할 내용:\n\n확인한 링크:`);
    window.open(`${issueUrl}?title=${title}&body=${body}`, '_blank', 'noopener');
  };

  const formattedFreshness = () => {
    const verb = item.type === 'site' ? '확인' : '발행';
    if (item.daysSince === 0) return `오늘 ${verb}`;
    if (item.daysSince === 1) return `어제 ${verb}`;
    return `${item.daysSince}일째 새 글 없음`;
  };

  const site = item.siteUrl || item.url;
  const sub = item.subscribeUrl;
  const googleTranslateUrl = `https://translate.google.com/translate?sl=auto&tl=ko&u=${encodeURIComponent(site)}`;

  const checkLabel = lastLinkCheck
    ? lastLinkCheck.status === 'reachable'
      ? `링크 OK · ${formatCheckDate(lastLinkCheck.checkedAt)}`
      : `링크 점검 필요 · ${formatCheckDate(lastLinkCheck.checkedAt)}`
    : null;

  return (
    <article
      className="newsletter-card bg-[var(--surface)] border-r border-b border-line-alpha p-6 flex flex-col justify-between transition-all duration-200 hover:bg-paper dark:hover:bg-[#22332b]"
      aria-labelledby={`card-title-${item.id}`}
    >
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold text-forest-green dark:text-[var(--green)]">
            {item.category}
          </span>
          <span className={`text-[10px] flex items-center gap-1.5 ${item.status === 'alive' ? 'text-forest-green dark:text-[var(--green)]' : 'text-gray-500'}`}>
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full ${item.status === 'alive' ? 'bg-forest-green dark:bg-green-400' : 'bg-gray-400'}`}
              aria-hidden="true"
            />
            {item.status === 'alive' ? '발행 중' : '확인 필요'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#f6ded8] text-accent-red dark:bg-[#4a2c26] uppercase">
            {item.type === 'newsletter' ? '뉴스레터' : item.type === 'magazine' ? '매거진' : '사이트'}
          </span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[var(--green-soft)] text-[var(--green)]">
            {item.origin === '글로벌' ? `GLOBAL · ${item.country}` : 'KOREA · 대한민국'}
          </span>
          {checkLabel && (
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 border ${
                lastLinkCheck?.status === 'reachable'
                  ? 'border-forest-green/30 text-forest-green dark:text-[var(--green)]'
                  : 'border-accent-red/40 text-accent-red'
              }`}
              title="GitHub Actions 링크 검사 스냅샷"
            >
              {checkLabel}
            </span>
          )}
          <span className="text-[10px] text-gray-500 font-mono ml-1">
            {item.interests.slice(0, 3).map(tag => `#${tag}`).join(' ')}
          </span>
        </div>

        <h3 id={`card-title-${item.id}`} className="font-serif text-2xl tracking-tight leading-tight mb-2 text-ink">
          {item.name}
        </h3>

        <p className={`description text-sm leading-relaxed mb-1 text-secondary ${!descOpen && longDesc ? 'line-clamp-2' : ''}`}>
          {item.description}
        </p>
        {longDesc && (
          <button
            type="button"
            onClick={() => setDescOpen(v => !v)}
            className="text-[11px] font-bold text-forest-green dark:text-[var(--green)] bg-transparent border-0 cursor-pointer mb-2 flex items-center gap-0.5 p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-red"
            aria-expanded={descOpen}
          >
            {descOpen ? <>접기 <ChevronUp className="w-3 h-3" aria-hidden="true" /></> : <>더 보기 <ChevronDown className="w-3 h-3" aria-hidden="true" /></>}
          </button>
        )}

        <p className="border-l-2 border-accent-red pl-2 py-0.5 my-3 text-xs leading-relaxed text-secondary">
          {valuePromises[item.category] || '내게 필요한 내용인지 빠르게 확인할 수 있어요.'}
        </p>
      </div>

      <div>
        <div className="flex gap-4 items-center text-xs text-secondary pt-3 border-t border-line-alpha mb-2">
          <span>{item.frequency}</span>
          <span aria-hidden="true">•</span>
          <span className="text-forest-green dark:text-[var(--green)] font-semibold">{readingTimes[item.category] || '3분 읽기'}</span>
          <span className="ml-auto text-[11px] font-mono font-medium">{formattedFreshness()}</span>
        </div>

        <p className="text-xs text-forest-green dark:text-[var(--green)] font-semibold mb-1">
          {item.type === 'site' ? '평소 활동' : '평균 발행'} · {item.typical}
        </p>

        <p className="text-xs text-secondary leading-relaxed mb-3">
          {unsubscribeText[item.type] || '해지 · 메일 하단 수신거부 링크 또는 설정'}
        </p>

        <div className="flex flex-wrap gap-1 mb-4">
          {item.trust.map((t, idx) => (
            <span key={idx} className="text-[9px] px-1.5 py-0.5 border border-forest-green/20 text-forest-green dark:text-[var(--green)]">
              {t}
            </span>
          ))}
          {item.sourceScope === 'public' && (
            <span className="text-[9px] px-1.5 py-0.5 border border-forest-green/20 text-forest-green dark:text-[var(--green)] font-bold">
              검증 공공 출처
            </span>
          )}
          {item.stability === 'high' && (
            <span className="text-[9px] px-1.5 py-0.5 border border-forest-green/20 text-forest-green dark:text-[var(--green)] font-bold">
              안정성 높음
            </span>
          )}
          {item.industry && (
            <span className="text-[9px] px-1.5 py-0.5 bg-[var(--green-soft)] text-[var(--green)] font-bold">
              산업·{item.industry}
            </span>
          )}
          <span className="text-[9px] px-1.5 py-0.5 border border-forest-green/20 text-forest-green dark:text-[var(--green)]">
            {reuseLabels[item.reuseLevel]}
          </span>
        </div>

        {/* 구독 우선 · 사이트 보조 · 대비 강화 */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-line-alpha">
          {sub ? (
            <a
              href={sub}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold px-3 py-2 bg-accent-red text-white dark:text-[#1a0a08] rounded-sm hover:opacity-95 flex items-center gap-1 no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-red"
            >
              <span>구독 페이지</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          ) : null}
          <a
            href={site}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold px-3 py-2 bg-ink text-paper rounded-sm hover:opacity-90 flex items-center gap-1 no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-red"
          >
            <span>사이트 열기</span>
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
          {!sub && (
            <span className="text-[10px] text-secondary">구독 전용 링크 없음 · 사이트에서 확인</span>
          )}
          {item.origin === '글로벌' && (
            <a
              href={googleTranslateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-forest-green dark:text-[var(--green)] hover:underline flex items-center gap-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <Globe className="w-3 h-3" aria-hidden="true" />
              <span>한국어 번역</span>
            </a>
          )}
          <button
            type="button"
            onClick={onToggleSave}
            className={`ml-auto text-xs font-bold transition-all duration-200 cursor-pointer bg-transparent border-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${isSaved ? 'text-accent-red' : 'text-forest-green dark:text-[var(--green)]'}`}
            aria-pressed={isSaved}
          >
            {isSaved ? '저장됨 ✓' : '+ 내 목록'}
          </button>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={onOpenLive}
            className="flex-1 py-2 text-center text-xs font-bold bg-forest-green text-[var(--on-accent)] hover:opacity-95 transition-all duration-200 cursor-pointer border-0 rounded-sm flex items-center justify-center gap-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Radio className="w-3.5 h-3.5" aria-hidden="true" />
            실시간 읽기
          </button>
          <button
            type="button"
            onClick={onOpenNote}
            className="flex-1 py-2 text-center text-xs font-bold bg-ink text-paper hover:opacity-90 transition-all duration-200 cursor-pointer border-0 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            메모 쓰기
          </button>
        </div>

        <div className="flex justify-between items-center mt-3 pt-2 border-t border-line-alpha text-[10px] text-gray-500">
          <label htmlFor={`status-${item.id}`} className="text-secondary">내 구독 상태</label>
          <select
            id={`status-${item.id}`}
            value={personalState}
            onChange={(e) => onChangePersonalState(e.target.value)}
            className="text-[11px] font-semibold bg-transparent border-0 text-ink outline-none cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <option value="관심 있음">관심 있음</option>
            <option value="구독 중">구독 중</option>
            <option value="나중에">나중에</option>
            <option value="해지함">해지함</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleReport}
          className="w-full text-left text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-white underline mt-2 bg-transparent border-0 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          정보 수정·제보 제안
        </button>
      </div>
    </article>
  );
}
