# 오늘의 편지함 (newsletter-hub)

뉴스레터·공개 정보를 분야별로 찾고, 발행 감각을 보고, 메모·Gmail 작성 창으로 이어 쓰는 개인용 디렉터리.

- **공개 URL (GitHub Pages):** https://presentjinho.github.io/newsletter-hub/
- **저장소:** https://github.com/presentjinho/newsletter-hub
- **AI Studio 초안 앱:** https://ai.studio/apps/3dafecac-2363-4267-839c-1da3400d7625

## 스택

- React + Vite + TypeScript + Tailwind (AI Studio Build export)
- 개인 데이터: 브라우저 `localStorage`
- Gmail: 공식 compose URL (API 키 없이 작성 창 연동)
- 배포: GitHub Pages (`main` push → Actions)

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저: http://localhost:3000/

현재 앱은 외부 AI·서버 API 키 없이 동작합니다.

## GitHub Pages

1. 이 repo Settings → **Pages** → Source: **GitHub Actions**
2. `main`에 push 하면 `deploy-pages.yml`이 빌드·배포
3. base path: `/newsletter-hub/` (`vite.config.ts`)

로컬에서 Pages와 같은 base로 미리보기:

```bash
set VITE_BASE=/newsletter-hub/
npm run build
npm run preview
```

## AI Studio → 여기 고치기 워크플로

1. **AI Studio**에서 초안·실험 (UI/Gmail 아이디어)
2. **Export / Download** ZIP
3. 이 폴더에 덮어쓴 뒤 말해 주기 (또는 `E:\untitled.zip`처럼 경로)
4. 여기서 충돌 정리 · Pages 빌드 · 커밋
5. push → github.io 반영

소스 of truth: **이 GitHub repo**  
Studio: **초안 공장**

## 스크립트

```bash
npm run check-links   # public/data/link-status.json 갱신
npm run build
npm run lint
```

## 문서

- [docs/NOTES_GMAIL.md](docs/NOTES_GMAIL.md) — 메모·Gmail
- [docs/GITHUB_X_RESEARCH.md](docs/GITHUB_X_RESEARCH.md) — 조사 노트
- [docs/FREE_PUBLIC_SOURCES.md](docs/FREE_PUBLIC_SOURCES.md) — 공개 출처

## 이용·저작권·개인정보 (요약)

- **디렉터리**: 출처 이름·공식 URL·짧은 한국어 소개만. 원문 전문·로고 무단 재배포 없음.
- **앱 안 리더**: 출처 선택만으로는 통신하지 않으며, 사용자가 본문 불러오기를 눌렀을 때만 공개 URL을 제3자 추출 서비스(Jina Reader, AllOrigins, corsproxy.io, CodeTabs)로 보냅니다. 이 앱의 서버에는 본문을 아카이브하지 않습니다.
- **개인 데이터**: 관심사·메모·구독 상태·내 출처는 이 브라우저에만 (이중 저장·탭 종료 시 플러시). 서버 계정 없음.
- **내 출처 안전 처리**: 사용자정보·포트·로컬/IP 주소가 든 URL은 거부하고, 쿼리·조각은 저장 전에 제거합니다. 백업 복원도 같은 검사를 거칩니다.
- **Gmail**: compose 창 URL만 (비밀번호 수집 없음).
- **삭제·정정**: GitHub Issues.
- 상세: 사이트 맨 아래 고지, `docs/REUSE_POLICY.md`, `docs/CATALOG_POLICY.md`.

법률 자문이 아닙니다.

## 라이선스

- 앱 소스: [MIT License](./LICENSE)
- 포함 라이브러리: [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)
- 카탈로그의 서비스명·상표: 각 권리자 소유. 원문·로고를 재배포하지 않고 공식 링크와 자체 작성 소개만 제공합니다.
- 링크·소개·재사용 등급은 참고 정보이며, 실제 재사용 전 해당 출처의 최신 약관과 라이선스를 다시 확인해야 합니다.
