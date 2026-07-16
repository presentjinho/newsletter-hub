# 오늘의 편지함 · 메모 및 Gmail 연동 가이드

본 문서에서는 브라우저 기반의 메모 작성 기능과 Gmail 및 메일 전송 연동에 대해 설명합니다.

## 1. 메모 작성과 안전한 오프라인 보관
- **로컬 저장소**: 작성하는 메모는 브라우저의 `localStorage` (`letter-notes-v1`)에 즉시 저장됩니다. 별도의 가입이나 서버 업로드 과정이 없어 개인 지식 저술용으로 안전하게 사용할 수 있습니다.
- **분류 체계**: 메모는 각 뉴스레터 출처 폴더 외에, '일반 메모함' 및 사용자가 직접 정의한 '새 폴더'로 자유롭게 복사(복제)하거나 이동시킬 수 있습니다.

## 2. Gmail 편지 쓰기(Compose) 연동 원리
서버 측 API나 OAuth 인증 연동 없이 안전하게 사용자의 Google 계정 메일 작성 창으로 전달합니다.

### 로그인
- 이 앱은 **Google에 로그인하지 않습니다**. 비밀번호를 받지 않습니다.
- 「Google 로그인 확인」버튼 → `accounts.google.com` 계정 선택 → Gmail 홈.
- 이미 브라우저에 Google 세션이 있으면 바로 작성 창이 뜹니다.
- 로그인 후 **이 탭으로 돌아와** 메모의 「Gmail」을 다시 누르면 작성 창이 열립니다.

### 연동 주소
- compose: `https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=…&su=…&body=…`
- 가능하면 `AccountChooser?continue=` 로 감싸 로그인 유도 (`src/gmailCompose.ts`)
- 본문이 길면 URL 한도로 잘림 → 「복사」 사용

### 나에게 보내기
- 메모 섹션 이메일 칸 → `localStorage` `letter-gmail-pref`
- 비워 두면 compose의 to 칸이 비어 있음 (직접 입력)

### 안 될 때
1. 팝업 차단 해제
2. Google 로그인 확인
3. 주소 형식 (`you@gmail.com`)
4. 기본 메일 앱 / 클립보드 복사 대안
