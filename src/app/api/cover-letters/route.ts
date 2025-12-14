/**
 * 자소서 CRUD API
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

// GET: 자소서 목록 조회
export async function GET() {
  try {
    const supabase = await createSupabaseServer();

    const { data: { user } } = await supabase.auth.getUser();

    // 비로그인 시 빈 배열 반환 (에러 대신)
    if (!user) {
      return NextResponse.json({ success: true, data: [] });
    }

    const { data, error } = await supabase
      .from('cover_letters')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Cover letters fetch error:', error);
    return NextResponse.json(
      { success: false, error: '자소서 목록을 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}

// POST: 자소서 생성
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다' }, { status: 401 });
    }

    const body = await request.json();
    const { title, companyName, jobPosition, jobDescription, content, aiGenerated, aiProvider } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: '제목과 내용은 필수입니다' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('cover_letters')
      .insert({
        user_id: user.id,
        title,
        company_name: companyName,
        job_position: jobPosition,
        job_description: jobDescription,
        content,
        ai_generated: aiGenerated ?? false,
        ai_provider: aiProvider,
        status: 'draft',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Cover letter create error:', error);
    return NextResponse.json(
      { success: false, error: '자소서 저장에 실패했습니다' },
      { status: 500 }
    );
  }
}
