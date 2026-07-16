import React, { useMemo, useState } from 'react';
import {
  LayoutDashboard,
  MailX,
  Clock3,
  CheckCircle2,
  Download,
  Trash2,
  ExternalLink,
  BookOpenCheck,
  Filter
} from 'lucide-react';
import { Newsletter } from '../types';

const STATUS_ORDER = ['구독 중', '나중에', '관심 있음', '해지함'] as const;

interface SubscriptionDeskProps {
  newsletters: Newsletter[];
  personalStatus: Record<string, string>;
  savedIds: Set<string>;
  onStatusChange: (id: string, status: string) => void;
  onBulkStatus: (ids: string[], status: string) => void;
  onToggleSave: (id: string) => void;
  onOpenLive: (id: string) => void;
  onExportCsv: () => void;
  onExportDigest: () => void;
  onClearStatus: (id: string) => void;
}

export default function SubscriptionDesk({
  newsletters,
  personalStatus,
  savedIds,
  onStatusChange,
  onBulkStatus,
  onToggleSave,
  onOpenLive,
  onExportCsv,
  onExportDigest,
  onClearStatus
}: SubscriptionDeskProps) {
  const [filter, setFilter] = useState<string>('전체');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const managed = useMemo(() => {
    return newsletters
      .filter(n => personalStatus[n.id] || savedIds.has(n.id))
      .map(n => ({
        item: n,
        status: personalStatus[n.id] || (savedIds.has(n.id) ? '관심 있음' : '관심 있음')
      }))
      .filter(row => filter === '전체' || row.status === filter)
      .sort((a, b) => {
        const ai = STATUS_ORDER.indexOf(a.status as (typeof STATUS_ORDER)[number]);
        const bi = STATUS_ORDER.indexOf(b.status as (typeof STATUS_ORDER)[number]);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.item.name.localeCompare(b.item.name, 'ko');
      });
  }, [newsletters, personalStatus, savedIds, filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { 전체: 0 };
    STATUS_ORDER.forEach(s => { c[s] = 0; });
    newsletters.forEach(n => {
      const s = personalStatus[n.id] || (savedIds.has(n.id) ? '관심 있음' : '');
      if (!s) return;
      c.전체 += 1;
      if (c[s] !== undefined) c[s] += 1;
      else c[s] = 1;
    });
    return c;
  }, [newsletters, personalStatus, savedIds]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelected(new Set(managed.map(m => m.item.id)));
  };

  const clearSelect = () => setSelected(new Set());

  return (
    <section className="surface-tint p-8 md:p-14 border-b border-line-alpha" id="subscriptions">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-bold tracking-widest text-forest-green dark:text-[var(--green)] mb-2 flex items-center gap-2">
              <LayoutDashboard className="w-3.5 h-3.5" />
              SUBSCRIPTION DESK · 구독 관리 대시보드
            </p>
            <h2 className="font-serif text-3xl md:text-5xl tracking-tight text-ink mb-3">
              구독은 한곳에서<br />가볍게 정리
            </h2>
            <p className="text-sm text-secondary max-w-2xl leading-relaxed">
              X·메일 앱에서 반복되는 요구: <strong>한 화면 구독 목록</strong>, <strong>일괄 해지 표시</strong>,{' '}
              <strong>주말 몰아보기</strong>, CSV보내기. 실제 Gmail 해지는 각 발행사 페이지에서 하고,
              여기선 내 상태를 기록·정리합니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onExportCsv}
              className="px-3 py-2 text-xs font-bold border border-line-alpha bg-[var(--surface)] text-ink cursor-pointer flex items-center gap-1.5 rounded-sm"
            >
              <Download className="w-3.5 h-3.5" />
              구독 CSV
            </button>
            <button
              type="button"
              onClick={onExportDigest}
              className="px-3 py-2 text-xs font-bold bg-[var(--green)] text-[var(--on-accent)] cursor-pointer flex items-center gap-1.5 rounded-sm"
            >
              <BookOpenCheck className="w-3.5 h-3.5" />
              주말 몰아보기 MD
            </button>
          </div>
        </div>

        {/* Status chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['전체', ...STATUS_ORDER].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => { setFilter(s); clearSelect(); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-full border cursor-pointer ${
                filter === s
                  ? 'chip-active'
                  : 'bg-transparent text-ink border-line-alpha'
              }`}
            >
              {s} {counts[s] ?? 0}
            </button>
          ))}
        </div>

        {/* Bulk bar */}
        {selected.size > 0 && (
          <div className="mb-4 p-3 chip-active flex flex-wrap items-center gap-3 rounded-sm text-xs font-bold">
            <span>{selected.size}개 선택</span>
            <button type="button" className="underline cursor-pointer" onClick={() => onBulkStatus([...selected], '구독 중')}>
              구독 중으로
            </button>
            <button type="button" className="underline cursor-pointer" onClick={() => onBulkStatus([...selected], '나중에')}>
              나중에(주말 몰아보기)
            </button>
            <button type="button" className="underline cursor-pointer" onClick={() => onBulkStatus([...selected], '해지함')}>
              해지함으로 표시
            </button>
            <button type="button" className="underline cursor-pointer opacity-80" onClick={clearSelect}>
              선택 해제
            </button>
          </div>
        )}

        {managed.length === 0 ? (
          <div className="py-14 text-center border border-dashed border-line-alpha bg-white/50 dark:bg-black/20 rounded-sm">
            <Filter className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm text-secondary mb-1">아직 관리 중인 구독이 없습니다.</p>
            <p className="text-xs text-secondary mb-4 max-w-md mx-auto leading-relaxed">
              디렉터리 카드에서 <strong className="text-ink">내 구독 상태</strong>를 바꾸거나
              <strong className="text-ink"> + 내 목록</strong>에 저장하면 여기에 나타납니다.
              (상태·목록은 이 브라우저 localStorage에만 저장됩니다.)
            </p>
            <a
              href="#find"
              className="inline-flex px-4 py-2 text-xs font-bold bg-ink text-paper no-underline rounded-sm"
            >
              디렉터리에서 상태 고르기 ↓
            </a>
          </div>
        ) : (
          <>
            <div className="flex gap-3 mb-3 text-xs">
              <button type="button" onClick={selectAllVisible} className="underline font-bold cursor-pointer text-forest-green dark:text-[var(--green)]">
                보이는 항목 전체 선택
              </button>
              <button type="button" onClick={clearSelect} className="underline cursor-pointer text-secondary">
                선택 해제
              </button>
            </div>
            <div className="border border-line-alpha bg-white/80 dark:bg-[var(--surface)] overflow-hidden rounded-sm">
              <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-secondary border-b border-line-alpha bg-warm/30">
                <div className="col-span-1" />
                <div className="col-span-4">이름</div>
                <div className="col-span-2">상태</div>
                <div className="col-span-2">빈도</div>
                <div className="col-span-3">동작</div>
              </div>
              {managed.map(({ item, status }) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 px-4 py-3 border-b border-line-alpha last:border-0 items-center text-sm"
                >
                  <div className="md:col-span-1">
                    <input
                      type="checkbox"
                      checked={selected.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="w-4 h-4 cursor-pointer"
                      aria-label={`${item.name} 선택`}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <div className="font-bold text-ink">{item.name}</div>
                    <div className="text-xs text-secondary">
                      {item.category} · {item.country}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <select
                      value={status}
                      onChange={e => onStatusChange(item.id, e.target.value)}
                      className="w-full text-xs border border-line-alpha bg-paper text-ink px-2 py-1.5 rounded-sm"
                    >
                      {STATUS_ORDER.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2 text-xs text-secondary">
                    {item.frequency}
                    {status === '해지함' && (
                      <span className="block text-accent-red mt-0.5 flex items-center gap-1">
                        <MailX className="w-3 h-3" /> 해지 기록됨
                      </span>
                    )}
                    {status === '나중에' && (
                      <span className="block text-forest-green dark:text-[var(--green)] mt-0.5 flex items-center gap-1">
                        <Clock3 className="w-3 h-3" /> 주말 큐
                      </span>
                    )}
                  </div>
                  <div className="md:col-span-3 flex flex-wrap gap-2">
                    <a
                      href={item.siteUrl || item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      referrerPolicy="no-referrer"
                      className="text-xs font-bold text-forest-green dark:text-[var(--green)] flex items-center gap-1 no-underline"
                    >
                      <ExternalLink className="w-3 h-3" /> 사이트
                    </a>
                    {item.subscribeUrl && (
                      <a
                        href={item.subscribeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        referrerPolicy="no-referrer"
                        className="text-xs font-bold text-accent-red flex items-center gap-1 no-underline"
                      >
                        구독
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => onOpenLive(item.id)}
                      className="text-xs font-bold underline cursor-pointer bg-transparent border-0 text-ink"
                    >
                      실시간
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleSave(item.id)}
                      className="text-xs font-bold underline cursor-pointer bg-transparent border-0 text-ink"
                    >
                      {savedIds.has(item.id) ? '목록 해제' : '목록 저장'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onClearStatus(item.id)}
                      className="text-xs text-accent-red font-bold flex items-center gap-0.5 cursor-pointer bg-transparent border-0"
                      title="상태 기록 삭제"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <p className="mt-4 text-xs text-secondary flex items-start gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-forest-green dark:text-[var(--green)]" />
          “해지함”은 이 앱 안의 기록입니다. 실제 메일 수신 중지는 원문 페이지·메일 하단 수신거부에서 완료하세요.
        </p>
      </div>
    </section>
  );
}
