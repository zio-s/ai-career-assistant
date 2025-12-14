'use client';

/**
 * Header 컴포넌트
 *
 * 대시보드 상단 헤더
 */

import { usePathname } from 'next/navigation';
import type { User } from '@/lib/database.types';
import { Badge } from '@/components/ui/badge';
import { User as UserIcon, Zap } from 'lucide-react';

interface HeaderProps {
  user: User | null;
}

const pageTitles: Record<string, string> = {
  '/dashboard': '대시보드',
  '/cover-letter': '자소서 관리',
  '/cover-letter/new': '새 자소서 작성',
  '/resume': '이력서 관리',
  '/interview': '면접 질문',
  '/settings': '설정',
};

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();

  // 현재 페이지 제목 결정
  const getPageTitle = () => {
    // 정확히 일치하는 경우
    if (pageTitles[pathname]) {
      return pageTitles[pathname];
    }

    // 부분 일치 (상세 페이지 등)
    for (const [path, title] of Object.entries(pageTitles)) {
      if (pathname.startsWith(path) && path !== '/') {
        return title;
      }
    }

    return '대시보드';
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Page Title */}
        <h1 className="text-xl font-semibold">{getPageTitle()}</h1>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* AI Provider Badge */}
          <Badge variant="secondary" className="gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            {user?.preferred_ai === 'openai' ? 'GPT-4o' : 'Gemini 2.5 Flash'}
          </Badge>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.name || '사용자'}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-accent" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
