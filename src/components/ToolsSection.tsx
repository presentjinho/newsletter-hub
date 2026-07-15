import React from 'react';
import { ExternalLink } from 'lucide-react';
import { stackTools } from '../data';

export default function ToolsSection() {
  return (
    <section className="stack bg-[#e8efe8] dark:bg-[#1a2822] p-8 md:p-14 border-b border-line-alpha" id="stack">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mb-10">
          <p className="text-xs font-bold tracking-widest text-forest-green dark:text-green-300 uppercase mb-2">
            OPEN SOURCE STACK · GITHUB &amp; X 큐레이션
          </p>
          <h2 className="font-serif text-3xl md:text-5xl tracking-tight leading-tight mb-4 text-ink">
            더 깊게 읽고 싶을 때<br />함께 사용하는 스택 도구들
          </h2>
          <p className="text-sm text-[#2a3831] dark:text-[#d0ddd6] leading-relaxed">
            GitHub와 X(트위터) 커뮤니티에서 개발자와 파워 유저들이 뉴스레터 및 RSS를 관리할 때 주로 추천하는 도구 목록입니다.<br />
            본 앱은 <strong>발견과 안심 구독 및 실시간 데스크</strong>의 허브 역할을 하며, 대량의 일상 피드 수집/구동은 전문 RSS 리더와 브릿지 도구의 사용을 조화롭게 병행하는 것이 좋습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {stackTools.map((tool, idx) => (
            <article
              key={idx}
              className="stack-card p-5 border border-line-alpha bg-white/55 dark:bg-[#22332b]/80 flex flex-col justify-between min-h-[190px] transition duration-200 hover:shadow-sm"
            >
              <div>
                <span className="inline-block px-2 py-0.5 border border-forest-green/30 text-forest-green dark:text-green-300 text-[10px] font-bold uppercase mb-3">
                  {tool.kind}
                </span>
                <h3 className="font-serif text-xl tracking-tight leading-snug mb-1 text-ink">
                  {tool.name}
                </h3>
                <p className="text-xs text-[#3d4f46] dark:text-[#c5d4cb] leading-relaxed mb-4">
                  {tool.blurb}
                </p>
              </div>

              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-ink hover:underline flex items-center gap-1 self-start pt-2 border-t border-line-alpha w-full"
              >
                <span>GitHub 페이지</span>
                <ExternalLink className="w-3 h-3 text-accent-red" />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
