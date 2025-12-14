/**
 * 면접 질문 CRUD API
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

// GET: 면접 질문 목록 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { searchParams } = new URL(request.url);
    const coverLetterId = searchParams.get('coverLetterId');

    const { data: { user } } = await supabase.auth.getUser();

    // 비로그인 시 빈 배열 반환
    if (!user) {
      return NextResponse.json({ success: true, data: [] });
    }

    let query = supabase
      .from('interview_questions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (coverLetterId) {
      query = query.eq('cover_letter_id', coverLetterId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Interview questions fetch error:', error);
    return NextResponse.json(
      { success: false, error: '면접 질문을 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}

// POST: 면접 질문 생성 (단건 또는 배치)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다' }, { status: 401 });
    }

    const body = await request.json();

    // 배치 저장 (AI 생성 결과)
    if (Array.isArray(body.questions)) {
      const questionsToInsert = body.questions.map((q: {
        question: string;
        category?: string;
        difficulty?: string;
        suggested_answer?: string;
        tip?: string;
        sampleAnswer?: string;
      }) => ({
        user_id: user.id,
        cover_letter_id: body.coverLetterId || null,
        question: q.question,
        category: q.category || 'experience',
        difficulty: q.difficulty || 'medium',
        suggested_answer: q.suggested_answer || q.tip || q.sampleAnswer || null,
      }));

      const { data, error } = await supabase
        .from('interview_questions')
        .insert(questionsToInsert)
        .select();

      if (error) throw error;

      return NextResponse.json({ success: true, data });
    }

    // 단건 저장
    const { question, category, difficulty, suggestedAnswer, coverLetterId } = body;

    if (!question) {
      return NextResponse.json(
        { success: false, error: '질문은 필수입니다' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('interview_questions')
      .insert({
        user_id: user.id,
        question,
        category: category || 'experience',
        difficulty: difficulty || 'medium',
        suggested_answer: suggestedAnswer,
        cover_letter_id: coverLetterId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Interview question create error:', error);
    return NextResponse.json(
      { success: false, error: '면접 질문 저장에 실패했습니다' },
      { status: 500 }
    );
  }
}

// DELETE: 면접 질문 삭제 (여러 건)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids')?.split(',');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다' }, { status: 401 });
    }

    if (!ids || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: '삭제할 질문 ID가 필요합니다' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('interview_questions')
      .delete()
      .in('id', ids)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Interview questions delete error:', error);
    return NextResponse.json(
      { success: false, error: '면접 질문 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}
