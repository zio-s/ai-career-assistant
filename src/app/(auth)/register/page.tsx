'use client';

/**
 * 회원가입 페이지 - Warm Editorial Design
 * 이메일 인증 제거 - 바로 로그인 가능
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, User, ArrowRight, Check } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    // 비밀번호 확인
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다');
      setIsLoading(false);
      return;
    }

    const result = await signUp(formData);

    if (result.success) {
      // 바로 로그인 페이지로 이동 (이메일 인증 없이)
      router.push('/login?registered=true');
    } else {
      setError(result.error || '회원가입에 실패했습니다');
      setIsLoading(false);
    }
  }

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-[#1E293B] mb-2">
          취업 준비, 시작해볼까요?
        </h1>
        <p className="text-[#64748B]">
          30초 만에 가입하고 AI의 도움을 받아보세요
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 animate-scale-in">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name" className="text-[#1E293B] font-medium">
            이름
          </Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="홍길동"
              className="pl-12 h-12 bg-white border-[#E8E2D9] rounded-xl focus:border-teal-500 focus:ring-teal-500/20 text-[#1E293B] placeholder:text-[#94A3B8]"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-[#1E293B] font-medium">
            이메일
          </Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="hello@example.com"
              className="pl-12 h-12 bg-white border-[#E8E2D9] rounded-xl focus:border-teal-500 focus:ring-teal-500/20 text-[#1E293B] placeholder:text-[#94A3B8]"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-[#1E293B] font-medium">
            비밀번호
          </Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="6자 이상"
              className="pl-12 h-12 bg-white border-[#E8E2D9] rounded-xl focus:border-teal-500 focus:ring-teal-500/20 text-[#1E293B] placeholder:text-[#94A3B8]"
              minLength={6}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-[#1E293B] font-medium">
            비밀번호 확인
          </Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="비밀번호 재입력"
              className="pl-12 h-12 bg-white border-[#E8E2D9] rounded-xl focus:border-teal-500 focus:ring-teal-500/20 text-[#1E293B] placeholder:text-[#94A3B8]"
              minLength={6}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl font-medium text-base shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              가입 중...
            </>
          ) : (
            <>
              무료로 시작하기
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </form>

      {/* Benefits */}
      <div className="mt-6 p-4 rounded-xl bg-teal-50/50 border border-teal-100">
        <p className="text-sm text-teal-700 font-medium mb-2">가입하면 바로 이용 가능</p>
        <div className="space-y-1.5 text-sm text-[#64748B]">
          {['무료 AI 자소서 생성', '스마트 첨삭 피드백', '면접 예상 질문'].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-teal-600" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p className="mt-6 text-center text-[#64748B]">
        이미 계정이 있으신가요?{' '}
        <Link
          href="/login"
          className="text-teal-600 hover:text-teal-700 font-medium hover:underline"
        >
          로그인
        </Link>
      </p>
    </div>
  );
}
