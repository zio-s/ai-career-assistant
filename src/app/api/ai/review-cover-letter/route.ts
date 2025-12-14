/**
 * 자소서 첨삭 API Route
 *
 * POST /api/ai/review-cover-letter
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAIProvider, type ReviewCoverLetterParams, type AIProviderType } from '@/lib/ai';
import { logAIUsage } from '@/lib/ai/usage-logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 필수 필드 검증
    const { content, provider = 'gemini' } = body;

    if (!content) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 필드가 누락되었습니다: content',
        },
        { status: 400 }
      );
    }

    if (content.length < 100) {
      return NextResponse.json(
        {
          success: false,
          error: '자소서 내용이 너무 짧습니다. 최소 100자 이상 입력해주세요.',
        },
        { status: 400 }
      );
    }

    // AI Provider 생성
    const aiProvider = createAIProvider(provider as AIProviderType);

    // 파라미터 구성
    const params: ReviewCoverLetterParams = {
      content,
      jobDescription: body.jobDescription,
      focusAreas: body.focusAreas,
    };

    // 자소서 첨삭
    const result = await aiProvider.reviewCoverLetter(params);

    if (!result.success) {
      await logAIUsage({
        feature: 'cover_letter_review',
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
      feature: 'cover_letter_review',
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
    console.error('Cover letter review error:', error);
    await logAIUsage({
      feature: 'cover_letter_review',
      provider: 'gemini',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '자소서 첨삭 중 오류가 발생했습니다',
      },
      { status: 500 }
    );
  }
}
