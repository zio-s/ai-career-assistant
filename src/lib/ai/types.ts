/**
 * AI Provider Types
 *
 * AI 서비스 제공자 공통 타입 정의
 */

export type AIProviderType = 'gemini' | 'openai';

// 자소서 생성 요청
export interface GenerateCoverLetterParams {
  jobDescription: string;        // 채용공고 내용
  companyName: string;           // 회사명
  jobPosition: string;           // 직무
  keywords?: string[];           // 강조할 키워드
  userBackground?: string;       // 사용자 경력/배경
  tone?: 'formal' | 'friendly' | 'passionate'; // 톤
  maxLength?: number;            // 최대 글자 수
}

// 자소서 첨삭 요청
export interface ReviewCoverLetterParams {
  content: string;               // 자소서 내용
  jobDescription?: string;       // 채용공고 (선택)
  focusAreas?: ('grammar' | 'structure' | 'content' | 'persuasion')[]; // 집중 분석 영역
}

// 이력서 분석 요청
export interface AnalyzeResumeParams {
  content: string;               // 이력서 텍스트 내용
  targetJob?: string;            // 목표 직무
  includeATSScore?: boolean;     // ATS 점수 포함
}

// 면접 질문 생성 요청
export interface GenerateInterviewQuestionsParams {
  coverLetter?: string;          // 자소서 내용
  resume?: string;               // 이력서 내용
  jobDescription?: string;       // 채용공고
  questionCount?: number;        // 질문 개수
  categories?: ('technical' | 'behavioral' | 'experience' | 'situational')[]; // 질문 유형
}

// AI 응답 기본 구조
export interface AIResponse<T = string> {
  success: boolean;
  data?: T;
  error?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

// 자소서 생성 응답
export interface GenerateCoverLetterResponse {
  content: string;               // 생성된 자소서
  highlights: string[];          // 강조된 포인트
  suggestions?: string[];        // 추가 제안 사항
}

// 자소서 첨삭 응답
export interface ReviewCoverLetterResponse {
  overallScore: number;          // 전체 점수 (0-100)
  feedback: {
    category: string;            // 피드백 카테고리
    score: number;               // 카테고리 점수
    comments: string[];          // 코멘트
    suggestions: string[];       // 개선 제안
  }[];
  strengths: string[];           // 강점
  improvements: string[];        // 개선점
  revisedContent?: string;       // 수정된 자소서 (선택)
}

// 이력서 분석 응답
export interface AnalyzeResumeResponse {
  overallScore: number;          // 전체 완성도 점수
  atsScore?: number;             // ATS 최적화 점수
  sections: {
    name: string;                // 섹션명
    score: number;               // 섹션 점수
    feedback: string;            // 피드백
  }[];
  keywords: {
    found: string[];             // 발견된 키워드
    missing: string[];           // 누락된 키워드
  };
  suggestions: string[];         // 개선 제안
}

// 면접 질문 응답
export interface InterviewQuestion {
  id: string;
  question: string;              // 질문
  category: 'technical' | 'behavioral' | 'experience' | 'situational';
  difficulty: 'easy' | 'medium' | 'hard';
  tip: string;                   // 답변 팁
  sampleAnswer?: string;         // 예시 답변
}

export interface GenerateInterviewQuestionsResponse {
  questions: InterviewQuestion[];
  totalCount: number;
}

// 스트리밍 콜백
export interface StreamCallbacks {
  onStart?: () => void;
  onToken?: (token: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

// AI Provider 인터페이스
export interface AIProvider {
  readonly name: AIProviderType;

  // 자소서 생성
  generateCoverLetter(
    params: GenerateCoverLetterParams,
    callbacks?: StreamCallbacks
  ): Promise<AIResponse<GenerateCoverLetterResponse>>;

  // 자소서 첨삭
  reviewCoverLetter(
    params: ReviewCoverLetterParams
  ): Promise<AIResponse<ReviewCoverLetterResponse>>;

  // 이력서 분석
  analyzeResume(
    params: AnalyzeResumeParams
  ): Promise<AIResponse<AnalyzeResumeResponse>>;

  // 면접 질문 생성
  generateInterviewQuestions(
    params: GenerateInterviewQuestionsParams
  ): Promise<AIResponse<GenerateInterviewQuestionsResponse>>;
}
