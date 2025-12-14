/**
 * Resume Analysis Prompts
 *
 * 이력서 분석용 프롬프트 템플릿
 */

import type { AnalyzeResumeParams } from '../types';

/**
 * 이력서 분석 프롬프트
 */
export function createAnalyzeResumePrompt(params: AnalyzeResumeParams): string {
  const { content, targetJob, includeATSScore = true } = params;

  const targetJobSection = targetJob
    ? `\n## 목표 직무\n${targetJob}`
    : '';

  const atsSection = includeATSScore
    ? `
## ATS 최적화 분석
- 키워드 밀도 및 관련성
- 형식 호환성
- 필수 정보 포함 여부`
    : '';

  return `당신은 한국 취업 시장에 정통한 전문 이력서 컨설턴트입니다.
아래 이력서를 분석하고 상세한 피드백을 제공해주세요.

# 분석할 이력서

${content}
${targetJobSection}

# 분석 영역

## 기본 구성 분석
- 연락처 정보 완성도
- 학력/경력 기술 방식
- 기술 스택 표현 방식
${atsSection}

## 내용 분석
- 경력 기술의 구체성 (STAR 기법 활용 여부)
- 성과의 정량적 표현
- 직무 관련성

# 평가 기준

1. **전체 완성도**: 이력서의 기본적인 완성도
2. **직무 적합성**: 목표 직무와의 연관성
3. **표현력**: 경험과 성과의 효과적 전달
4. **차별화**: 다른 지원자와의 차별점

# 출력 형식 (JSON)

{
  "overallScore": 75,
  "atsScore": 68,
  "sections": [
    {
      "name": "기본 정보",
      "score": 90,
      "feedback": "연락처와 기본 정보가 잘 정리되어 있습니다."
    },
    {
      "name": "경력 사항",
      "score": 70,
      "feedback": "업무 내용은 기술되어 있으나, 구체적인 성과 수치가 부족합니다."
    },
    {
      "name": "기술 스택",
      "score": 80,
      "feedback": "관련 기술이 잘 나열되어 있습니다."
    }
  ],
  "keywords": {
    "found": ["Python", "데이터 분석", "SQL"],
    "missing": ["머신러닝", "통계", "시각화"]
  },
  "suggestions": [
    "각 경력에 구체적인 성과 수치를 추가하세요",
    "프로젝트 경험을 별도 섹션으로 분리하세요",
    "기술 스택에 숙련도 레벨을 표시하세요"
  ]
}

JSON 형식으로만 응답해주세요.`;
}
