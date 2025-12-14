# AI Career Assistant

AI 기반 취업 준비 도우미 - 자소서 생성/첨삭, 이력서 분석, 면접 예상 질문 서비스

## 주요 기능

### 1. 자소서 생성 및 첨삭
- 채용공고 + 키워드 기반 AI 자소서 초안 생성 (스트리밍)
- 기존 자소서 AI 첨삭 (점수, 피드백, 개선점)
- 자소서 관리 (저장, 수정, 삭제)

### 2. 이력서 분석
- PDF 이력서 업로드 및 파싱
- AI 분석 (완성도, ATS 점수, 개선점)
- 섹션별 상세 피드백

### 3. 면접 예상 질문
- 자소서/이력서 기반 맞춤 질문 생성
- 카테고리별 분류 (기술, 행동, 경험, 상황)
- 예시 답변 및 팁 제공
- 질문 저장 및 관리

### 4. 대시보드
- 작성한 자소서, 분석한 이력서, 저장된 면접 질문 현황
- AI 사용 통계
- 빠른 액션 버튼

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth/DB | Supabase |
| AI | Google Gemini 2.5 Flash (기본, 무료) / OpenAI GPT-4o (선택) |
| Deploy | Vercel |

## 프로젝트 구조

```
ai-career-assistant/
├── src/
│   ├── app/
│   │   ├── (auth)/          # 로그인/회원가입
│   │   ├── (main)/          # 메인 앱 페이지
│   │   │   ├── dashboard/   # 대시보드
│   │   │   ├── cover-letter/# 자소서 관리
│   │   │   ├── resume/      # 이력서 관리
│   │   │   ├── interview/   # 면접 질문
│   │   │   └── settings/    # 설정
│   │   └── api/             # API Routes
│   │       ├── ai/          # AI 관련 API
│   │       ├── cover-letters/
│   │       ├── resumes/
│   │       └── interview-questions/
│   ├── components/
│   │   ├── ui/              # 공통 UI 컴포넌트
│   │   ├── modal/           # 모달 시스템
│   │   ├── layout/          # 레이아웃 컴포넌트
│   │   ├── cover-letter/    # 자소서 관련
│   │   └── resume/          # 이력서 관련
│   └── lib/
│       ├── ai/              # AI Provider 추상화
│       ├── auth/            # 인증 액션
│       └── supabase/        # Supabase 클라이언트
├── public/
└── package.json
```

## DB 스키마

```sql
-- users: 사용자 정보
-- resumes: 이력서 데이터
-- cover_letters: 자소서 데이터
-- interview_questions: 면접 질문
-- ai_usage_logs: AI 사용 로그
```

## 시작하기

### 1. 의존성 설치

```bash
yarn install
```

### 2. 환경 변수 설정

`.env.local` 파일 생성 후 필요한 환경 변수 설정

### 3. 개발 서버 실행

```bash
yarn dev
```

[http://localhost:3000](http://localhost:3000)에서 확인

## 배포

Vercel을 통한 자동 배포 지원

```bash
yarn build
```

## 라이선스

MIT License
