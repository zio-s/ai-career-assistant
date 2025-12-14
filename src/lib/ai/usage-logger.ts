/**
 * AI 사용량 로깅 유틸리티
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';
import type { AIFeature, AIProvider } from '@/lib/database.types';

interface LogAIUsageParams {
  feature: AIFeature;
  provider: AIProvider;
  inputTokens?: number;
  outputTokens?: number;
  success?: boolean;
  errorMessage?: string;
}

async function createSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component에서 쿠키 설정 불가능한 경우 무시
          }
        },
      },
    }
  );
}

/**
 * AI 사용량을 로깅합니다.
 * 로그인한 사용자만 로깅되며, 실패해도 에러를 던지지 않습니다.
 */
export async function logAIUsage({
  feature,
  provider,
  inputTokens,
  outputTokens,
  success = true,
  errorMessage,
}: LogAIUsageParams): Promise<void> {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    // 비로그인 사용자는 로깅하지 않음
    if (!user) return;

    // 사용자 프로필 존재 확인 (없으면 생성)
    const { data: existingProfile } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!existingProfile) {
      await supabase.from('users').insert({
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.email?.split('@')[0] || '사용자',
        preferred_ai: 'gemini',
      });
    }

    // AI 사용량 로그 삽입
    await supabase.from('ai_usage_logs').insert({
      user_id: user.id,
      feature,
      ai_provider: provider,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      success,
      error_message: errorMessage,
    });
  } catch (error) {
    // 로깅 실패는 조용히 무시 (메인 기능에 영향 주지 않음)
    console.error('AI usage logging failed:', error);
  }
}
