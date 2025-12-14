/**
 * 프로필 API
 * GET: 현재 사용자 프로필 조회
 * PUT: 프로필 업데이트
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

// GET: 프로필 조회
export async function GET() {
  try {
    const supabase = await createSupabaseServer();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      // 프로필이 없으면 생성
      if (error.code === 'PGRST116') {
        const { data: newProfile, error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || user.email?.split('@')[0] || '사용자',
            preferred_ai: 'gemini',
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return NextResponse.json({ success: true, data: newProfile });
      }
      throw error;
    }

    // 암호화된 필드 복호화
    const decryptedData = {
      ...data,
      target_job: data.target_job ? decrypt(data.target_job) : data.target_job,
    };

    return NextResponse.json({ success: true, data: decryptedData });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '프로필을 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}

// PUT: 프로필 업데이트
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다' }, { status: 401 });
    }

    const body = await request.json();
    const { name, target_job, experience_level, preferred_ai } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ success: false, error: '이름은 필수입니다' }, { status: 400 });
    }

    // 민감 데이터 암호화
    const { data, error } = await supabase
      .from('users')
      .update({
        name: name.trim(),
        target_job: target_job ? encrypt(target_job) : null,
        experience_level,
        preferred_ai,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    // 응답 시 복호화
    const decryptedData = {
      ...data,
      target_job: data.target_job ? decrypt(data.target_job) : data.target_job,
    };

    return NextResponse.json({ success: true, data: decryptedData });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '프로필 저장에 실패했습니다' },
      { status: 500 }
    );
  }
}
