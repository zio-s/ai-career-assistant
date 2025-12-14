/**
 * 대시보드 페이지
 *
 * 사용자 메인 대시보드 - 통계 및 빠른 액션
 */

import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { decrypt } from '@/lib/crypto';
import {
  FileText,
  FileSearch,
  MessageSquare,
  Plus,
  TrendingUp,
  Clock,
  Zap,
} from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 통계 데이터 조회
  const [coverLettersResult, resumesResult, questionsResult, usageLogsResult] =
    await Promise.all([
      supabase
        .from('cover_letters')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id),
      supabase
        .from('resumes')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id),
      supabase
        .from('interview_questions')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id),
      supabase
        .from('ai_usage_logs')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id),
    ]);

  const stats = {
    coverLetters: coverLettersResult.count || 0,
    resumes: resumesResult.count || 0,
    questions: questionsResult.count || 0,
    aiUsage: usageLogsResult.count || 0,
  };

  // 최근 활동 조회
  const { data: recentCoverLettersRaw } = await supabase
    .from('cover_letters')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3);

  // 암호화된 필드 복호화
  const recentCoverLetters = recentCoverLettersRaw?.map((letter) => ({
    ...letter,
    company_name: letter.company_name ? decrypt(letter.company_name) : letter.company_name,
    job_position: letter.job_position ? decrypt(letter.job_position) : letter.job_position,
  }));

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold mb-2">안녕하세요! 👋</h2>
        <p className="text-muted-foreground">
          AI와 함께 취업 준비를 시작해보세요.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/cover-letter/new" className="block">
          <Card className="border-border/50 hover:border-accent/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Plus className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">새 자소서 작성</h3>
                  <p className="text-sm text-muted-foreground">
                    AI가 초안을 작성해드립니다
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/resume" className="block">
          <Card className="border-border/50 hover:border-accent/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <FileSearch className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold">이력서 분석</h3>
                  <p className="text-sm text-muted-foreground">
                    PDF 업로드로 분석 시작
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/interview" className="block">
          <Card className="border-border/50 hover:border-accent/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold">면접 준비</h3>
                  <p className="text-sm text-muted-foreground">
                    예상 질문 생성하기
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/cover-letter" className="block">
          <Card className="border-border/50 hover:border-accent/50 transition-colors cursor-pointer h-full">
            <CardHeader className="pb-2">
              <CardDescription>작성한 자소서</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{stats.coverLetters}</span>
                <FileText className="w-8 h-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/resume" className="block">
          <Card className="border-border/50 hover:border-accent/50 transition-colors cursor-pointer h-full">
            <CardHeader className="pb-2">
              <CardDescription>분석한 이력서</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{stats.resumes}</span>
                <FileSearch className="w-8 h-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/interview/saved" className="block">
          <Card className="border-border/50 hover:border-accent/50 transition-colors cursor-pointer h-full">
            <CardHeader className="pb-2">
              <CardDescription>면접 질문</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{stats.questions}</span>
                <MessageSquare className="w-8 h-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardDescription>AI 사용 횟수</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{stats.aiUsage}</span>
              <Zap className="w-8 h-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">최근 자소서</CardTitle>
              <CardDescription>최근에 작성한 자소서 목록</CardDescription>
            </div>
            <Link href="/cover-letter">
              <Button variant="outline" size="sm">
                전체 보기
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentCoverLetters && recentCoverLetters.length > 0 ? (
            <div className="space-y-4">
              {recentCoverLetters.map((letter) => (
                <Link
                  key={letter.id}
                  href={`/cover-letter/${letter.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-accent/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-medium">{letter.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {letter.company_name || '회사 미지정'} •{' '}
                          {letter.job_position || '직무 미지정'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {new Date(letter.created_at!).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                아직 작성한 자소서가 없습니다
              </p>
              <Link href="/cover-letter/new">
                <Button>첫 자소서 작성하기</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
