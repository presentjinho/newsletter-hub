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

Gemini 키는 선택. 현재 UI는 디렉터리·메모·Gmail compose 중심이며 `@google/genai`는 이후 AI 기능용 자리.

```bash
# 선택
cp .env.example .env.local
# GEMINI_API_KEY=...
```

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

## 라이선스

개인 프로젝트. 원문 복제 없이 공식 링크·자체 소개만 제공.
