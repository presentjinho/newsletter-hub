import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { CustomSourceInput } from '../customSources';

interface AddSourceFormProps {
  onAdd: (input: CustomSourceInput) => boolean;
  /** compact = 디렉터리/내 목록 상단, full = 부가 섹션 */
  variant?: 'compact' | 'full';
  idPrefix?: string;
}

export default function AddSourceForm({
  onAdd,
  variant = 'full',
  idPrefix = 'add'
}: AddSourceFormProps) {
  const [name, setName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('시사');
  const [subscribeUrl, setSubscribeUrl] = useState('');
  const [open, setOpen] = useState(variant === 'full');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = onAdd({ name, siteUrl, description, category, subscribeUrl });
    if (ok) {
      setName('');
      setSiteUrl('');
      setDescription('');
      setSubscribeUrl('');
      if (variant === 'compact') setOpen(false);
    }
  };

  if (variant === 'compact' && !open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-ink text-paper border-0 cursor-pointer rounded-sm focus-ring"
      >
        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
        원하는 사이트 추가
      </button>
    );
  }

  return (
    <div
      className={
        variant === 'compact'
          ? 'border border-line-alpha bg-[var(--surface)] p-4 rounded-sm w-full max-w-xl'
          : ''
      }
    >
      {variant === 'compact' && (
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-ink flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-accent-red" />
            원하는 사이트 추가
          </h3>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-[11px] text-secondary bg-transparent border-0 cursor-pointer underline"
          >
            접기
          </button>
        </div>
      )}
      <form onSubmit={submit} className={variant === 'full' ? 'space-y-3' : 'space-y-2'}>
        <div className={variant === 'compact' ? 'grid grid-cols-1 sm:grid-cols-2 gap-2' : 'space-y-3'}>
          <div>
            <label htmlFor={`${idPrefix}-url`} className="text-[10px] font-bold text-secondary uppercase">
              사이트 URL *
            </label>
            <input
              id={`${idPrefix}-url`}
              type="text"
              required
              inputMode="url"
              value={siteUrl}
              onChange={e => setSiteUrl(e.target.value)}
              placeholder="https://example.com 또는 example.com"
              className="w-full mt-1 px-3 py-2 text-sm border border-line-alpha bg-paper text-ink"
              autoComplete="url"
            />
          </div>
          <div>
            <label htmlFor={`${idPrefix}-name`} className="text-[10px] font-bold text-secondary uppercase">
              이름 (비우면 도메인)
            </label>
            <input
              id={`${idPrefix}-name`}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="예: 내가 보는 블로그"
              className="w-full mt-1 px-3 py-2 text-sm border border-line-alpha bg-paper text-ink"
            />
          </div>
        </div>
        <div className={variant === 'compact' ? 'grid grid-cols-1 sm:grid-cols-2 gap-2' : 'space-y-3'}>
          <div>
            <label htmlFor={`${idPrefix}-cat`} className="text-[10px] font-bold text-secondary uppercase">
              분야
            </label>
            <input
              id={`${idPrefix}-cat`}
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm border border-line-alpha bg-paper text-ink"
            />
          </div>
          <div>
            <label htmlFor={`${idPrefix}-sub`} className="text-[10px] font-bold text-secondary uppercase">
              구독 페이지 (선택)
            </label>
            <input
              id={`${idPrefix}-sub`}
              type="text"
              value={subscribeUrl}
              onChange={e => setSubscribeUrl(e.target.value)}
              placeholder="뉴스레터 가입 URL"
              className="w-full mt-1 px-3 py-2 text-sm border border-line-alpha bg-paper text-ink"
            />
          </div>
        </div>
        <div>
          <label htmlFor={`${idPrefix}-desc`} className="text-[10px] font-bold text-secondary uppercase">
            한 줄 소개 (선택)
          </label>
          <input
            id={`${idPrefix}-desc`}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="왜 저장하는지"
            className="w-full mt-1 px-3 py-2 text-sm border border-line-alpha bg-paper text-ink"
          />
        </div>
        <p className="text-[10px] text-secondary m-0">
          이 브라우저에만 저장 · 원문 복제 없음 · 디렉터리·내 목록·실시간 리더에 바로 반영
        </p>
        <button
          type="submit"
          className="px-4 py-2.5 bg-ink text-paper text-xs font-bold cursor-pointer border-0 rounded-sm"
        >
          추가하고 내 목록에 넣기
        </button>
      </form>
    </div>
  );
}
