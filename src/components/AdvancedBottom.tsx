import React from 'react';
import { ExternalLink, Plus, Trash2, Download, Upload, Shield, Wrench } from 'lucide-react';
import { stackTools } from '../data';
import { Newsletter } from '../types';
import { CustomSourceInput } from '../customSources';
import { externalAnchorProps } from '../safeLink';
import AddSourceForm from './AddSourceForm';

interface AdvancedBottomProps {
  customSources: Newsletter[];
  onAddCustom: (input: CustomSourceInput) => boolean;
  onRemoveCustom: (id: string) => void;
  onExportOpmlSaved: () => void;
  onExportOpmlPublic: () => void;
  onBackup: () => void;
  onRestore: (file: File) => void;
  onExportCsv: () => void;
  onExportDigest: () => void;
}

export default function AdvancedBottom({
  customSources,
  onAddCustom,
  onRemoveCustom,
  onExportOpmlSaved,
  onExportOpmlPublic,
  onBackup,
  onRestore,
  onExportCsv,
  onExportDigest
}: AdvancedBottomProps) {
  return (
    <section
      id="advanced"
      className="bg-[var(--surface-2)] border-t border-line-alpha"
      aria-label="부가·고급 기능"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-14 space-y-12">
        <div className="max-w-2xl">
          <p className="text-[10px] font-bold tracking-widest text-secondary uppercase mb-2 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5" />
            부가 기능 · 맨 아래
          </p>
          <h2 className="font-serif text-2xl md:text-3xl tracking-tight text-ink mb-2">
            자주 안 쓰는 설정과 도구
          </h2>
          <p className="text-sm text-secondary leading-relaxed">
            일상 이용은 위쪽(디렉터리·실시간·구독·메모)만 보면 됩니다. 여기에는 내보내기, 백업, 직접 출처 추가, 외부 도구 안내가 있습니다.
          </p>
        </div>

        {/* 내 출처 추가 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="my-sources">
          <div className="border border-line-alpha bg-[var(--surface)] p-6 rounded-sm">
            <h3 className="text-sm font-bold text-ink mb-1 flex items-center gap-2">
              <Plus className="w-4 h-4 text-accent-red" />
              원하는 사이트 추가 (상세)
            </h3>
            <p className="text-xs text-secondary mb-4 leading-relaxed">
              디렉터리·내 목록 상단에서도 추가할 수 있습니다. 이 브라우저에만 저장 · 원문 복제 없음.
            </p>
            <AddSourceForm onAdd={onAddCustom} variant="full" idPrefix="adv-add" />
          </div>

          <div className="border border-line-alpha bg-[var(--surface)] p-6 rounded-sm">
            <h3 className="text-sm font-bold text-ink mb-3">내가 추가한 출처 ({customSources.length})</h3>
            {customSources.length === 0 ? (
              <p className="text-xs text-secondary">아직 없습니다. 왼쪽 또는 디렉터리에서 URL을 등록하세요.</p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {customSources.map(s => (
                  <li
                    key={s.id}
                    className="flex items-start justify-between gap-2 text-sm border-b border-line-alpha pb-2"
                  >
                    <div>
                      <div className="font-bold text-ink">{s.name}</div>
                      <a
                        href={s.siteUrl}
                        {...externalAnchorProps}
                        className="text-[11px] text-forest-green dark:text-[var(--green)] break-all"
                      >
                        {s.siteUrl}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveCustom(s.id)}
                      className="text-accent-red bg-transparent border-0 cursor-pointer p-1"
                      aria-label={`${s.name} 삭제`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* 내보내기 · 백업 */}
        <div className="border border-line-alpha bg-[var(--surface)] p-6 rounded-sm">
          <h3 className="text-sm font-bold text-ink mb-1 flex items-center gap-2">
            <Download className="w-4 h-4" />
            내보내기 · 백업
          </h3>
          <p className="text-xs text-secondary mb-4">다른 기기·RSS 리더로 옮길 때 사용합니다.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onExportOpmlSaved} className="px-3 py-2 text-xs font-bold bg-ink text-paper border-0 cursor-pointer rounded-sm">
              내 목록 OPML
            </button>
            <button type="button" onClick={onExportOpmlPublic} className="px-3 py-2 text-xs font-bold border border-line-alpha bg-paper text-ink cursor-pointer rounded-sm">
              공공 출처 OPML
            </button>
            <button type="button" onClick={onExportCsv} className="px-3 py-2 text-xs font-bold border border-line-alpha bg-paper text-ink cursor-pointer rounded-sm">
              구독 CSV
            </button>
            <button type="button" onClick={onExportDigest} className="px-3 py-2 text-xs font-bold border border-line-alpha bg-paper text-ink cursor-pointer rounded-sm">
              주말 몰아보기 MD
            </button>
            <button type="button" onClick={onBackup} className="px-3 py-2 text-xs font-bold border border-line-alpha bg-paper text-ink cursor-pointer rounded-sm flex items-center gap-1">
              <Download className="w-3.5 h-3.5" /> 전체 백업 JSON
            </button>
            <label className="px-3 py-2 text-xs font-bold border border-line-alpha bg-paper text-ink cursor-pointer rounded-sm flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" /> 백업 복원
              <input
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) onRestore(f);
                  e.target.value = '';
                }}
              />
            </label>
          </div>
        </div>

        {/* 외부 도구 — 참고만 */}
        <div>
          <h3 className="text-sm font-bold text-ink mb-3">참고 도구 (외부 · 이 앱과 별개)</h3>
          <p className="text-xs text-secondary mb-4">
            RSS 리더·목록 도구 링크입니다. 설치·계정은 각 사이트 정책을 따릅니다.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {stackTools.map((tool, idx) => (
              <a
                key={idx}
                href={tool.url}
                {...externalAnchorProps}
                className="p-4 border border-line-alpha bg-[var(--surface)] no-underline hover:border-ink/30 transition"
              >
                <span className="text-[10px] font-bold text-forest-green dark:text-[var(--green)]">{tool.kind}</span>
                <div className="font-serif text-base text-ink mt-1 flex items-center gap-1">
                  {tool.name}
                  <ExternalLink className="w-3 h-3 text-accent-red shrink-0" />
                </div>
                <p className="text-[11px] text-secondary mt-1 leading-relaxed">{tool.blurb}</p>
              </a>
            ))}
          </div>
        </div>

        {/* 법적·개인정보 고지 */}
        <div
          id="legal"
          className="border border-line-alpha bg-paper dark:bg-[var(--surface)] p-6 rounded-sm text-xs text-secondary leading-relaxed space-y-3"
        >
          <h3 className="text-sm font-bold text-ink flex items-center gap-2">
            <Shield className="w-4 h-4 text-forest-green dark:text-[var(--green)]" />
            이용·저작권·개인정보 고지
          </h3>
          <p>
            <strong className="text-ink">성격:</strong> 개인용 정보·뉴스레터 <em>디렉터리</em>입니다.
            원문 기사·뉴스레터 본문을 수집·저장·재배포하지 않습니다. 각 저작권은 발행 기관에 있습니다.
          </p>
          <p>
            <strong className="text-ink">표시 내용:</strong> 출처 이름, 공식 URL, 운영자가 작성한 짧은 한국어 소개, 분야·국가 등 메타데이터.
            로고·원문 전문·유료 우회본은 제공하지 않습니다.
          </p>
          <p>
            <strong className="text-ink">앱 안 리더:</strong> 개인 읽기 보조로 공개 페이지 텍스트를 정리해 보여 줄 수 있습니다.
            본문을 서버에 보관하거나 검색 가능하게 아카이브하지 않습니다. 막히면 사이트 새 탭을 사용하세요.
          </p>
          <p>
            <strong className="text-ink">개인 데이터:</strong> 관심사·메모·구독 상태·내 출처는 이 브라우저에만 저장됩니다.
            상단 <strong className="text-ink">프로필</strong>로 같은 PC에서도 사람별 공간을 나눌 수 있습니다 (서버 계정 아님).
            백업 JSON은 현재 프로필 데이터를 내려받습니다.
          </p>
          <p>
            <strong className="text-ink">Gmail:</strong> Google 계정 비밀번호를 받지 않습니다. 공식 메일 작성 창(compose) URL만 엽니다.
          </p>
          <p>
            <strong className="text-ink">삭제·정정:</strong> 출처 삭제·오류 정정 요청은{' '}
            <a
              href="https://github.com/presentjinho/newsletter-hub/issues/new/choose"
              {...externalAnchorProps}
              className="text-forest-green dark:text-[var(--green)] font-semibold"
            >
              GitHub Issues
            </a>
            로 알려 주세요. 확인 후 목록에서 내리거나 수정합니다.
          </p>
          <p className="text-[10px] opacity-80">
            본 고지는 법률 자문이 아닙니다. 상업·대규모 운영 시 별도 검토를 권합니다. 운영 기준:{' '}
            <code className="text-[10px]">docs/REUSE_POLICY.md</code>
          </p>
        </div>
      </div>
    </section>
  );
}
