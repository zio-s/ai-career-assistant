/**
 * Auth Layout
 *
 * 로그인/회원가입 페이지 공통 레이아웃 - Warm Editorial Design
 */

import { ReactNode } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FFFBF5] flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="p-6">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-semibold text-[#1E293B]">
              Career AI
            </span>
          </Link>
        </header>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>

      {/* Right Side - Decorative (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[45%] bg-gradient-to-br from-teal-500 to-teal-600 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-16">
          <blockquote className="text-white/90">
            <p className="font-display text-3xl xl:text-4xl font-semibold leading-snug mb-6">
              "AI가 당신의 이야기를
              <br />
              빛나게 만들어드립니다"
            </p>
            <footer className="text-teal-100">
              <p className="text-lg font-medium">Career AI</p>
              <p className="text-sm opacity-80">취업 준비의 새로운 기준</p>
            </footer>
          </blockquote>

          {/* Features */}
          <div className="mt-12 space-y-4">
            {['자소서 자동 생성', '스마트 첨삭 피드백', '면접 질문 예측'].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-white/80">
                <div className="w-2 h-2 rounded-full bg-teal-300" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
