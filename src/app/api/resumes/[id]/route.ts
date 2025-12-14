/**
 * 이력서 상세 API
 * 개인정보 암호화 적용
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';
import { encrypt, decrypt } from '@/lib/crypto';

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
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}

// GET: 이력서 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServer();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ success: false, error: '이력서를 찾을 수 없습니다' }, { status: 404 });
      }
      throw error;
    }

    // 암호화된 필드 복호화
    const decryptedData = {
      ...data,
      raw_text: data.raw_text ? decrypt(data.raw_text) : data.raw_text,
    };

    return NextResponse.json({ success: true, data: decryptedData });
  } catch (error) {
    console.error('Resume fetch error:', error);
    return NextResponse.json(
      { success: false, error: '이력서를 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}

// PATCH: 이력서 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServer();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다' }, { status: 401 });
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    // 암호화 적용
    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.rawText !== undefined) updateData.raw_text = body.rawText ? encrypt(body.rawText) : null;
    if (body.fileUrl !== undefined) updateData.file_url = body.fileUrl;
    if (body.analysisResult !== undefined) updateData.analysis_result = body.analysisResult;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('resumes')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    // 응답 시 복호화
    const decryptedData = {
      ...data,
      raw_text: data.raw_text ? decrypt(data.raw_text) : data.raw_text,
    };

    return NextResponse.json({ success: true, data: decryptedData });
  } catch (error) {
    console.error('Resume update error:', error);
    return NextResponse.json(
      { success: false, error: '이력서 수정에 실패했습니다' },
      { status: 500 }
    );
  }
}

// DELETE: 이력서 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServer();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다' }, { status: 401 });
    }

    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Resume delete error:', error);
    return NextResponse.json(
      { success: false, error: '이력서 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}
