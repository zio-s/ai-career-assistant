/**
 * Interview Questions Prompts
 *
 * 면접 예상 질문 생성용 프롬프트 템플릿
 */

import type { GenerateInterviewQuestionsParams } from '../types';

const CATEGORY_DESCRIPTIONS = {
  technical: '기술/전문 지식 관련 질문',
  behavioral: '행동/성향 파악 질문 (과거 경험 기반)',
  experience: '경력/프로젝트 경험 질문',
  situational: '상황 대처 질문 (가상 시나리오)',
};

/**
 * 면접 질문 생성 프롬프트
 */
export function createInterviewQuestionsPrompt(
  params: GenerateInterviewQuestionsParams
): string {
  const {
    coverLetter,
    resume,
    jobDescription,
    questionCount = 10,
    categories = ['technical', 'behavioral', 'experience', 'situational'],
  } = params;

  const coverLetterSection = coverLetter
    ? `\n## 지원자 자소서\n${coverLetter}`
    : '';

  const resumeSection = resume
    ? `\n## 지원자 이력서\n${resume}`
    : '';

  const jobSection = jobDescription
    ? `\n## 채용공고\n${jobDescription}`
    : '';

  const categorySection = categories
    .map(cat => `- ${cat}: ${CATEGORY_DESCRIPTIONS[cat]}`)
    .join('\n');

  return `당신은 한국 기업의 숙련된 면접관입니다.
아래 지원자 정보를 바탕으로 면접 예상 질문을 생성해주세요.

# 지원자 정보
${coverLetterSection}
${resumeSection}
${jobSection}

# 질문 유형

${categorySection}

# 생성 가이드라인

1. **질문 수**: 총 ${questionCount}개의 질문을 생성해주세요
2. **난이도 분배**: 쉬움(30%), 보통(50%), 어려움(20%)
3. **질문 특성**:
   - 자소서/이력서의 구체적인 내용을 언급하세요
   - 실제 면접에서 자주 나오는 형식을 따르세요
   - 후속 질문이 가능한 열린 질문을 포함하세요

4. **답변 팁**: 각 질문에 대한 답변 전략을 제시하세요
5. **예시 답변**: 어려운 질문에는 예시 답변을 포함하세요

# 출력 형식 (JSON)

{
  "questions": [
    {
      "id": "q1",
      "question": "자소서에서 언급하신 XX 프로젝트에 대해 자세히 설명해주세요.",
      "category": "experience",
      "difficulty": "medium",
      "tip": "STAR 기법을 활용하여 상황-과제-행동-결과 순으로 설명하세요.",
      "sampleAnswer": "해당 프로젝트에서 저는..."
    },
    {
      "id": "q2",
      "question": "팀에서 의견 충돌이 있었을 때 어떻게 해결하셨나요?",
      "category": "behavioral",
      "difficulty": "medium",
      "tip": "구체적인 사례와 함께 본인의 역할과 결과를 강조하세요."
    }
  ],
  "totalCount": ${questionCount}
}

JSON 형식으로만 응답해주세요.`;
}

/**
 * 면접 답변 피드백 프롬프트
 */
export function createAnswerFeedbackPrompt(
  question: string,
  answer: string
): string {
  return `당신은 한국 기업의 숙련된 면접관입니다.
아래 면접 답변을 평가하고 피드백을 제공해주세요.

# 면접 질문
${question}

# 지원자 답변
${answer}

# 평가 기준

1. **내용 적절성**: 질문의 의도에 맞는 답변인가
2. **구체성**: 구체적인 사례와 수치가 포함되었는가
3. **논리성**: 답변의 흐름이 논리적인가
4. **설득력**: 면접관을 설득할 수 있는가

# 출력 형식 (JSON)

{
  "score": 75,
  "strengths": ["구체적인 사례 제시", "논리적인 흐름"],
  "improvements": ["결과에 대한 수치 추가 필요", "본인의 역할을 더 강조하세요"],
  "revisedAnswer": "개선된 답변 예시..."
}

JSON 형식으로만 응답해주세요.`;
}
