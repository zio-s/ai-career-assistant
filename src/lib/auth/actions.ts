'use server';

/**
 * Auth Server Actions
 *
 * 회원가입, 로그인, 로그아웃 서버 액션
 */

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';

export type AuthResult = {
  success: boolean;
  error?: string;
};

/**
 * 이메일/비밀번호 회원가입
 * 이메일 인증 없이 바로 로그인 가능
 */
export async function signUp(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;

  if (!email || !password || !name) {
    return { success: false, error: '모든 필드를 입력해주세요' };
  }

  if (password.length < 6) {
    return { success: false, error: '비밀번호는 6자 이상이어야 합니다' };
  }

  // Supabase Auth 회원가입
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (authError) {
    // 이미 가입된 이메일 체크
    if (authError.message.includes('already registered')) {
      return { success: false, error: '이미 가입된 이메일입니다' };
    }
    return { success: false, error: '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.' };
  }

  if (!authData.user) {
    return { success: false, error: '회원가입에 실패했습니다' };
  }

  // Admin 클라이언트로 이메일 인증 자동 완료
  try {
    const adminClient = createAdminClient();
    await adminClient.auth.admin.updateUserById(authData.user.id, {
      email_confirm: true,
    });
  } catch {
    // Admin 권한이 없어도 계속 진행 (Supabase 대시보드에서 이메일 인증 비활성화 권장)
  }

  // users 테이블에 프로필 생성
  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email,
      name,
      preferred_ai: 'gemini',
    });

  if (profileError) {
    // 프로필 에러는 무시 (이미 존재하거나 권한 문제일 수 있음)
  }

  return { success: true };
}

/**
 * 이메일/비밀번호 로그인
 */
export async function signIn(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: '이메일과 비밀번호를 입력해주세요' };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // 이메일 미인증 에러 체크
    if (error.message.includes('Email not confirmed')) {
      return { success: false, error: '이메일 인증이 필요합니다. 이메일을 확인해주세요.' };
    }
    return { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다' };
  }

  return { success: true };
}

/**
 * 로그아웃
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

/**
 * 현재 사용자 가져오기
 */
export async function getCurrentUser() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // users 테이블에서 프로필 조회
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    ...user,
    profile,
  };
}
