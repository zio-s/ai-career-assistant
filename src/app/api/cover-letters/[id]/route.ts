/**
 * 자소서 상세 API
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

// GET: 자소서 상세 조회
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
      .from('cover_letters')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ success: false, error: '자소서를 찾을 수 없습니다' }, { status: 404 });
      }
      throw error;
    }

    // 암호화된 필드 복호화
    const decryptedData = {
      ...data,
      content: data.content ? decrypt(data.content) : data.content,
      company_name: data.company_name ? decrypt(data.company_name) : data.company_name,
      job_position: data.job_position ? decrypt(data.job_position) : data.job_position,
      job_description: data.job_description ? decrypt(data.job_description) : data.job_description,
    };

    return NextResponse.json({ success: true, data: decryptedData });
  } catch (error) {
    console.error('Cover letter fetch error:', error);
    return NextResponse.json(
      { success: false, error: '자소서를 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}

// PATCH: 자소서 수정
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
    if (body.content !== undefined) updateData.content = encrypt(body.content);
    if (body.companyName !== undefined) updateData.company_name = body.companyName ? encrypt(body.companyName) : null;
    if (body.jobPosition !== undefined) updateData.job_position = body.jobPosition ? encrypt(body.jobPosition) : null;
    if (body.jobDescription !== undefined) updateData.job_description = body.jobDescription ? encrypt(body.jobDescription) : null;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.feedback !== undefined) updateData.feedback = body.feedback;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('cover_letters')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    // 응답 시 복호화
    const decryptedData = {
      ...data,
      content: data.content ? decrypt(data.content) : data.content,
      company_name: data.company_name ? decrypt(data.company_name) : data.company_name,
      job_position: data.job_position ? decrypt(data.job_position) : data.job_position,
      job_description: data.job_description ? decrypt(data.job_description) : data.job_description,
    };

    return NextResponse.json({ success: true, data: decryptedData });
  } catch (error) {
    console.error('Cover letter update error:', error);
    return NextResponse.json(
      { success: false, error: '자소서 수정에 실패했습니다' },
      { status: 500 }
    );
  }
}

// DELETE: 자소서 삭제
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
      .from('cover_letters')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cover letter delete error:', error);
    return NextResponse.json(
      { success: false, error: '자소서 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}
