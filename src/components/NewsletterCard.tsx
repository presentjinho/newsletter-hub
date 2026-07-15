import React from 'react';
import { ExternalLink, Check, Bookmark, FileText, PenTool, Globe } from 'lucide-react';
import { Newsletter } from '../types';
import { valuePromises, readingTimes, unsubscribeText, reuseLabels } from '../data';

interface NewsletterCardProps {
  key?: string | number;
  item: Newsletter;
  isSaved: boolean;
  onToggleSave: () => void;
  onOpenLive: () => void;
  onOpenNote: () => void;
  personalState: string;
  onChangePersonalState: (state: string) => void;
}

export default function NewsletterCard({
  item,
  isSaved,
  onToggleSave,
  onOpenLive,
  onOpenNote,
  personalState,
  onChangePersonalState
}: NewsletterCardProps) {
  
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

  const googleTranslateUrl = `https://translate.google.com/translate?sl=auto&tl=ko&u=${encodeURIComponent(item.url)}`;

  return (
    <article className="newsletter-card bg-white dark:bg-[#1a2822] border-r border-b border-line-alpha p-6 flex flex-col justify-between transition-all duration-200 hover:bg-paper dark:hover:bg-[#22332b]">
      <div>
        {/* Card Header Category & Status */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold text-forest-green dark:text-green-300">
            {item.category}
          </span>
          <span className={`text-[10px] flex items-center gap-1.5 ${item.status === 'alive' ? 'text-forest-green dark:text-green-300' : 'text-gray-500'}`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${item.status === 'alive' ? 'bg-forest-green dark:bg-green-400' : 'bg-gray-400'}`} />
            {item.status === 'alive' ? '발행 중' : '확인 필요'}
          </span>
        </div>

        {/* Card Metadata Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#f6ded8] text-accent-red dark:bg-[#4a2c26] uppercase">
            {item.type === 'newsletter' ? '뉴스레터' : item.type === 'magazine' ? '매거진' : '사이트'}
          </span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#e4eadf] text-forest-green dark:bg-[#314b3f]">
            {item.origin === '글로벌' ? `GLOBAL · ${item.country}` : 'KOREA · 대한민국'}
          </span>
          <span className="text-[10px] text-gray-500 font-mono ml-1">
            {item.interests.slice(0, 3).map(tag => `#${tag}`).join(' ')}
          </span>
        </div>

        {/* Name and description */}
        <h3 className="font-serif text-2xl tracking-tight leading-tight mb-2 text-ink">
          {item.name}
        </h3>
        
        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
          {item.description}
        </p>

        {/* Value promise with red border */}
        <p className="border-l-2 border-accent-red pl-2 py-0.5 my-3 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
          {valuePromises[item.category] || '내게 필요한 내용인지 빠르게 확인할 수 있어요.'}
        </p>
      </div>

      <div>
        {/* Core details (frequency, length, last checked) */}
        <div className="flex gap-4 items-center text-[11px] text-gray-500 dark:text-gray-400 pt-3 border-t border-line-alpha mb-2">
          <span>{item.frequency}</span>
          <span>•</span>
          <span className="text-forest-green dark:text-green-300">{readingTimes[item.category] || '3분 읽기'}</span>
          <span className="ml-auto text-[10px] font-mono">{formattedFreshness()}</span>
        </div>

        {/* Average activity / unsubscribe support */}
        <p className="text-[11px] text-forest-green dark:text-green-300 font-semibold mb-1">
          {item.type === 'site' ? '평소 활동' : '평균 발행'} · {item.typical}
        </p>
        
        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
          {unsubscribeText[item.type] || '해지 · 메일 하단 수신거부 링크 또는 설정'}
        </p>

        {/* Trust Badges */}
        <div className="flex flex-wrap gap-1 mb-4">
          {item.trust.map((t, idx) => (
            <span key={idx} className="text-[9px] px-1.5 py-0.5 border border-forest-green/20 text-forest-green dark:text-green-300">
              {t}
            </span>
          ))}
          {item.sourceScope === 'public' && (
            <span className="text-[9px] px-1.5 py-0.5 border border-forest-green/20 text-forest-green dark:text-green-300 font-bold">
              검증 공공 출처
            </span>
          )}
          <span className="text-[9px] px-1.5 py-0.5 border border-forest-green/20 text-forest-green dark:text-green-300">
            {reuseLabels[item.reuseLevel]}
          </span>
        </div>

        {/* Buttons and Actions */}
        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-line-alpha">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-ink hover:underline flex items-center gap-1"
          >
            <span>{item.type === 'newsletter' ? '구독 · 원문' : '방문하기 · 원문'}</span>
            <ExternalLink className="w-3.5 h-3.5 text-accent-red" />
          </a>

          {item.origin === '글로벌' && (
            <a
              href={googleTranslateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-forest-green dark:text-green-300 hover:underline flex items-center gap-0.5"
            >
              <Globe className="w-3 h-3" />
              <span>한국어 번역</span>
            </a>
          )}

          <button
            onClick={onToggleSave}
            className={`text-xs font-bold transition-all duration-200 cursor-pointer ${isSaved ? 'text-accent-red' : 'text-forest-green dark:text-green-300'}`}
          >
            {isSaved ? '저장됨 ✓' : '+ 내 목록'}
          </button>
        </div>

        {/* Extra Workspace Buttons */}
        <div className="flex gap-3 mt-3">
          <button
            onClick={onOpenLive}
            className="flex-1 py-1.5 text-center text-xs font-semibold bg-line-alpha hover:bg-warm transition-all duration-200 text-ink cursor-pointer"
          >
            실시간
          </button>
          <button
            onClick={onOpenNote}
            className="flex-1 py-1.5 text-center text-xs font-semibold bg-line-alpha hover:bg-warm transition-all duration-200 text-ink cursor-pointer"
          >
            메모 쓰기
          </button>
        </div>

        {/* Personal State Selector */}
        <div className="flex justify-between items-center mt-3 pt-2 border-t border-line-alpha text-[10px] text-gray-500">
          <span>내 구독 상태</span>
          <select
            value={personalState}
            onChange={(e) => onChangePersonalState(e.target.value)}
            className="text-[11px] font-semibold bg-transparent border-0 text-ink outline-none cursor-pointer"
          >
            <option value="관심 있음">관심 있음</option>
            <option value="구독 중">구독 중</option>
            <option value="나중에">나중에</option>
            <option value="해지함">해지함</option>
          </select>
        </div>

        {/* Bug / issue report */}
        <button
          onClick={handleReport}
          className="w-full text-left text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-white underline mt-2 bg-transparent border-0 cursor-pointer"
        >
          정보 수정·제보 제안
        </button>
      </div>
    </article>
  );
}
