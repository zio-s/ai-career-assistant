/**
 * 이력서 CRUD API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';

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

// GET: 이력서 목록 조회
export async function GET() {
  try {
    const supabase = await createSupabaseServer();

    const { data: { user } } = await supabase.auth.getUser();

    // 비로그인 시 빈 배열 반환
    if (!user) {
      return NextResponse.json({ success: true, data: [] });
    }

    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Resumes fetch error:', error);
    return NextResponse.json(
      { success: false, error: '이력서 목록을 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}

// POST: 이력서 생성
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다' }, { status: 401 });
    }

    // 사용자 프로필 존재 확인 및 자동 생성
    const { data: existingProfile } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!existingProfile) {
      // 프로필이 없으면 자동 생성
      await supabase.from('users').insert({
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.email?.split('@')[0] || '사용자',
        preferred_ai: 'gemini',
      });
    }

    const body = await request.json();
    const { title, content, rawText, fileUrl, analysisResult } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: '제목은 필수입니다' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        title,
        content,
        raw_text: rawText,
        file_url: fileUrl,
        analysis_result: analysisResult,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Resume create error:', error);
    // 상세 에러 메시지 포함
    const errorMessage = error instanceof Error ? error.message : '이력서 저장에 실패했습니다';
    return NextResponse.json(
      { success: false, error: errorMessage, details: String(error) },
      { status: 500 }
    );
  }
}
