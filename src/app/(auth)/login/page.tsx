'use client';

/**
 * 로그인 페이지 - Warm Editorial Design
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@/lib/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await signIn(formData);

    if (result.success) {
      router.push('/dashboard');
      router.refresh();
    } else {
      setError(result.error || '로그인에 실패했습니다');
      setIsLoading(false);
    }
  }

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-[#1E293B] mb-2">
          다시 만나서 반가워요
        </h1>
        <p className="text-[#64748B]">
          계정에 로그인하고 취업 준비를 계속하세요
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
              placeholder="••••••••"
              className="pl-12 h-12 bg-white border-[#E8E2D9] rounded-xl focus:border-teal-500 focus:ring-teal-500/20 text-[#1E293B] placeholder:text-[#94A3B8]"
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
              로그인 중...
            </>
          ) : (
            <>
              로그인
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </form>

      {/* Footer */}
      <p className="mt-8 text-center text-[#64748B]">
        아직 계정이 없으신가요?{' '}
        <Link
          href="/register"
          className="text-teal-600 hover:text-teal-700 font-medium hover:underline"
        >
          무료로 가입하기
        </Link>
      </p>
    </div>
  );
}
