/**
 * Cover Letter Prompts
 *
 * 자소서 생성/첨삭용 프롬프트 템플릿
 */

import type { GenerateCoverLetterParams, ReviewCoverLetterParams } from '../types';

const TONE_DESCRIPTIONS = {
  formal: '격식있고 전문적인 톤으로 작성해주세요.',
  friendly: '친근하고 따뜻한 톤으로 작성해주세요.',
  passionate: '열정적이고 적극적인 톤으로 작성해주세요.',
};

/**
 * 자소서 생성 프롬프트
 */
export function createGeneratePrompt(params: GenerateCoverLetterParams): string {
  const {
    jobDescription,
    companyName,
    jobPosition,
    keywords = [],
    userBackground,
    tone = 'formal',
    maxLength = 1500,
  } = params;

  const keywordSection = keywords.length > 0
    ? `\n## 강조할 키워드\n${keywords.join(', ')}`
    : '';

  const backgroundSection = userBackground
    ? `\n## 지원자 배경\n${userBackground}`
    : '';

  return `당신은 한국 취업 시장에 정통한 전문 자소서 컨설턴트입니다.
아래 정보를 바탕으로 설득력 있는 자기소개서를 작성해주세요.

# 입력 정보

## 회사 정보
- 회사명: ${companyName}
- 지원 직무: ${jobPosition}

## 채용공고 내용
${jobDescription}
${keywordSection}
${backgroundSection}

# 작성 가이드라인

1. **톤**: ${TONE_DESCRIPTIONS[tone]}
2. **길이**: 최대 ${maxLength}자 내외로 작성해주세요.
3. **구조**:
   - 지원 동기 (회사와 직무에 대한 관심)
   - 관련 경험/역량 (구체적 사례 포함)
   - 입사 후 포부 (기여 계획)

4. **핵심 원칙**:
   - 구체적인 수치와 사례를 포함하세요
   - 회사의 비전/가치와 본인을 연결하세요
   - 단순 나열보다 스토리텔링을 활용하세요
   - 채용공고의 요구사항을 반영하세요

# 출력 형식 (JSON)

{
  "content": "자소서 전체 내용",
  "highlights": ["강조된 포인트1", "강조된 포인트2", "강조된 포인트3"],
  "suggestions": ["추가 개선 제안1", "추가 개선 제안2"]
}

JSON 형식으로만 응답해주세요.`;
}

/**
 * 자소서 첨삭 프롬프트
 */
export function createReviewPrompt(params: ReviewCoverLetterParams): string {
  const { content, jobDescription, focusAreas = ['grammar', 'structure', 'content', 'persuasion'] } = params;

  const focusAreaDescriptions = {
    grammar: '맞춤법, 문법, 어휘 사용의 정확성',
    structure: '문단 구성, 논리적 흐름, 전체 구조',
    content: '내용의 구체성, 관련성, 차별성',
    persuasion: '설득력, 진정성, 인상적인 표현',
  };

  const focusSection = focusAreas
    .map(area => `- ${area}: ${focusAreaDescriptions[area]}`)
    .join('\n');

  const jobSection = jobDescription
    ? `\n## 지원 채용공고\n${jobDescription}`
    : '';

  return `당신은 한국 취업 시장에 정통한 전문 자소서 컨설턴트입니다.
아래 자소서를 분석하고 상세한 피드백을 제공해주세요.

# 분석할 자소서

${content}
${jobSection}

# 분석 중점 영역

${focusSection}

# 평가 기준

각 영역을 0-100점으로 평가하고, 구체적인 피드백과 개선 제안을 제시해주세요.

1. **강점**: 잘 작성된 부분을 구체적으로 언급
2. **개선점**: 수정이 필요한 부분과 이유
3. **제안**: 실제 적용 가능한 개선 방안

# 출력 형식 (JSON)

{
  "overallScore": 75,
  "feedback": [
    {
      "category": "grammar",
      "score": 85,
      "comments": ["문법적으로 대체로 정확합니다", "일부 어색한 표현이 있습니다"],
      "suggestions": ["'~했습니다' 반복 사용을 줄이세요", "접속사를 다양하게 활용하세요"]
    },
    {
      "category": "structure",
      "score": 70,
      "comments": ["서론-본론-결론 구조가 명확합니다"],
      "suggestions": ["각 문단의 주제문을 더 명확히 하세요"]
    }
  ],
  "strengths": ["구체적인 경험 사례가 잘 드러납니다", "회사에 대한 이해도가 높습니다"],
  "improvements": ["지원 동기를 더 구체적으로 작성하세요", "숫자를 활용한 성과 제시가 필요합니다"]
}

JSON 형식으로만 응답해주세요.`;
}

/**
 * 자소서 수정 제안 프롬프트
 */
export function createRevisePrompt(
  originalContent: string,
  feedback: string
): string {
  return `당신은 한국 취업 시장에 정통한 전문 자소서 컨설턴트입니다.
아래 피드백을 반영하여 자소서를 수정해주세요.

# 원본 자소서

${originalContent}

# 받은 피드백

${feedback}

# 수정 가이드라인

1. 피드백에서 지적된 문제점을 중심으로 수정하세요
2. 원본의 핵심 메시지와 스토리는 유지하세요
3. 자연스럽게 읽히도록 문장을 다듬으세요
4. 수정한 부분은 **강조**로 표시해주세요

# 출력 형식

수정된 자소서 전문을 작성해주세요. 마크다운 형식으로 수정된 부분을 **강조**해주세요.`;
}
