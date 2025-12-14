/**
 * 이력서 분석 API Route
 *
 * POST /api/ai/analyze-resume
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAIProvider, type AnalyzeResumeParams, type AIProviderType } from '@/lib/ai';
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

    if (content.length < 50) {
      return NextResponse.json(
        {
          success: false,
          error: '이력서 내용이 너무 짧습니다. 최소 50자 이상 입력해주세요.',
        },
        { status: 400 }
      );
    }

    // AI Provider 생성
    const aiProvider = createAIProvider(provider as AIProviderType);

    // 파라미터 구성
    const params: AnalyzeResumeParams = {
      content,
      targetJob: body.targetJob,
      includeATSScore: body.includeATSScore ?? true,
    };

    // 이력서 분석
    const result = await aiProvider.analyzeResume(params);

    if (!result.success) {
      await logAIUsage({
        feature: 'resume_analyze',
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
      feature: 'resume_analyze',
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
    console.error('Resume analysis error:', error);
    await logAIUsage({
      feature: 'resume_analyze',
      provider: 'gemini',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '이력서 분석 중 오류가 발생했습니다',
      },
      { status: 500 }
    );
  }
}
