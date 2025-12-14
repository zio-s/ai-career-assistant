/**
 * Main Layout (Dashboard)
 *
 * 로그인 후 메인 앱 레이아웃 - 사이드바 + 메인 콘텐츠
 */

import { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

interface MainLayoutProps {
  children: ReactNode;
}

export default async function MainLayout({ children }: MainLayoutProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 사용자 프로필 조회
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <Sidebar user={profile} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen ml-64">
        <Header user={profile} />
        <main className="flex-1 p-6 bg-background">{children}</main>
      </div>
    </div>
  );
}
