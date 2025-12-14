/**
 * 면접 질문 생성 API Route
 *
 * POST /api/ai/generate-questions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAIProvider, type GenerateInterviewQuestionsParams, type AIProviderType } from '@/lib/ai';
import { logAIUsage } from '@/lib/ai/usage-logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 최소 하나의 컨텍스트 필요
    const { coverLetter, resume, jobDescription, provider = 'gemini' } = body;

    if (!coverLetter && !resume && !jobDescription) {
      return NextResponse.json(
        {
          success: false,
          error: '자소서, 이력서, 또는 채용공고 중 하나 이상의 정보가 필요합니다.',
        },
        { status: 400 }
      );
    }

    // AI Provider 생성
    const aiProvider = createAIProvider(provider as AIProviderType);

    // 파라미터 구성
    const params: GenerateInterviewQuestionsParams = {
      coverLetter,
      resume,
      jobDescription,
      questionCount: body.questionCount || 10,
      categories: body.categories,
    };

    // 면접 질문 생성
    const result = await aiProvider.generateInterviewQuestions(params);

    if (!result.success) {
      await logAIUsage({
        feature: 'interview_generate',
        provider: provider as 'gemini' | 'openai',
        success: false,
        errorMessage: result.error,
      });
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    await logAIUsage({
      feature: 'interview_generate',
      provider: provider as 'gemini' | 'openai',
      inputTokens: result.usage?.inputTokens,
      outputTokens: result.usage?.outputTokens,
      success: true,
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      usage: result.usage,
      provider: aiProvider.name,
    });
  } catch (error) {
    console.error('Interview questions generation error:', error);
    await logAIUsage({
      feature: 'interview_generate',
      provider: 'gemini',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '면접 질문 생성 중 오류가 발생했습니다',
      },
      { status: 500 }
    );
  }
}
