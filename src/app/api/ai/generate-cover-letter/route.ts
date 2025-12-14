/**
 * 자소서 생성 API Route
 *
 * POST /api/ai/generate-cover-letter
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAIProvider, type GenerateCoverLetterParams, type AIProviderType } from '@/lib/ai';
import { logAIUsage } from '@/lib/ai/usage-logger';

/**
 * AI 에러 메시지를 사용자 친화적으로 변환
 */
function parseAIError(errorMessage: string): string {
  const msg = errorMessage.toLowerCase();

  // 할당량 초과 (우선 체크 - 429, quota, rate limit)
  if (msg.includes('429') || msg.includes('quota') || msg.includes('too many requests') || msg.includes('rate limit') || msg.includes('exceeded')) {
    return 'AI 서비스 이용량이 일시적으로 초과되었습니다. 잠시 후 다시 시도해주세요. (약 30초 후)';
  }
  // API 키 에러
  if (msg.includes('api key') || msg.includes('api_key') || msg.includes('401') || msg.includes('unauthorized') || msg.includes('invalid key')) {
    return 'AI 서비스 연결에 문제가 있습니다. 관리자에게 문의해주세요.';
  }
  // 네트워크 에러 (일반적인 네트워크 문제만)
  if (msg.includes('econnrefused') || msg.includes('enotfound') || msg.includes('etimedout')) {
    return '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.';
  }
  // 기타 에러
  return '자소서 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 필수 필드 검증
    const { jobDescription, companyName, jobPosition, provider = 'gemini' } = body;

    if (!jobDescription || !companyName || !jobPosition) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 필드가 누락되었습니다: jobDescription, companyName, jobPosition',
        },
        { status: 400 }
      );
    }

    // AI Provider 생성
    const aiProvider = createAIProvider(provider as AIProviderType);

    // 파라미터 구성
    const params: GenerateCoverLetterParams = {
      jobDescription,
      companyName,
      jobPosition,
      keywords: body.keywords,
      userBackground: body.userBackground,
      tone: body.tone,
      maxLength: body.maxLength,
    };

    // 자소서 생성
    const result = await aiProvider.generateCoverLetter(params);

    if (!result.success) {
      // 실패 로깅
      await logAIUsage({
        feature: 'cover_letter_generate',
        provider: provider as 'gemini' | 'openai',
        success: false,
        errorMessage: result.error,
      });
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // 성공 로깅
    await logAIUsage({
      feature: 'cover_letter_generate',
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
    console.error('Cover letter generation error:', error);
    // 에러 로깅
    await logAIUsage({
      feature: 'cover_letter_generate',
      provider: 'gemini',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '자소서 생성 중 오류가 발생했습니다',
      },
      { status: 500 }
    );
  }
}

/**
 * 스트리밍 자소서 생성 (Server-Sent Events)
 *
 * GET /api/ai/generate-cover-letter?stream=true&...
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const stream = searchParams.get('stream');

  if (stream !== 'true') {
    return NextResponse.json(
      { success: false, error: 'GET 요청은 stream=true 파라미터가 필요합니다' },
      { status: 400 }
    );
  }

  // 필수 파라미터 추출
  const jobDescription = searchParams.get('jobDescription');
  const companyName = searchParams.get('companyName');
  const jobPosition = searchParams.get('jobPosition');
  const provider = searchParams.get('provider') || 'gemini';

  if (!jobDescription || !companyName || !jobPosition) {
    return NextResponse.json(
      {
        success: false,
        error: '필수 파라미터가 누락되었습니다: jobDescription, companyName, jobPosition',
      },
      { status: 400 }
    );
  }

  // SSE 응답 설정
  const encoder = new TextEncoder();
  const customReadable = new ReadableStream({
    async start(controller) {
      try {
        const aiProvider = createAIProvider(provider as AIProviderType);

        const params: GenerateCoverLetterParams = {
          jobDescription,
          companyName,
          jobPosition,
          keywords: searchParams.get('keywords')?.split(','),
          userBackground: searchParams.get('userBackground') || undefined,
          tone: (searchParams.get('tone') as 'formal' | 'friendly' | 'passionate') || undefined,
          maxLength: searchParams.get('maxLength') ? parseInt(searchParams.get('maxLength')!) : undefined,
        };

        await aiProvider.generateCoverLetter(params, {
          onStart: () => {
            controller.enqueue(encoder.encode(`event: start\ndata: {}\n\n`));
          },
          onToken: (token) => {
            controller.enqueue(
              encoder.encode(`event: token\ndata: ${JSON.stringify({ token })}\n\n`)
            );
          },
          onComplete: (fullText) => {
            controller.enqueue(
              encoder.encode(`event: complete\ndata: ${JSON.stringify({ fullText })}\n\n`)
            );
            controller.close();
          },
          onError: (error) => {
            console.error('[AI Error]', error.message);
            const userMessage = parseAIError(error.message);
            controller.enqueue(
              encoder.encode(
                `event: error\ndata: ${JSON.stringify({ error: userMessage })}\n\n`
              )
            );
            controller.close();
          },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        const userMessage = parseAIError(message);
        controller.enqueue(
          encoder.encode(`event: error\ndata: ${JSON.stringify({ error: userMessage })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
