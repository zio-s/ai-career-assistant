/**
 * 랜딩 페이지
 *
 * AI 커리어 어시스턴트 - Warm Editorial Design
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Sparkles,
  FileSearch,
  MessageSquare,
  ArrowRight,
  Check,
  Zap,
  Shield,
  Clock,
} from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: '자소서 생성',
    description: '채용공고 URL이나 키워드만 입력하면 AI가 맞춤형 자소서를 작성합니다',
    color: 'bg-teal-50 text-teal-600',
  },
  {
    icon: Sparkles,
    title: '스마트 첨삭',
    description: '작성한 자소서의 강점과 약점을 분석하고 구체적인 개선안을 제시합니다',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: FileSearch,
    title: '이력서 분석',
    description: 'PDF 이력서를 업로드하면 완성도 점수와 ATS 최적화 팁을 제공합니다',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: MessageSquare,
    title: '면접 준비',
    description: '자소서와 이력서 기반 예상 질문을 생성하고 모범 답변을 제안합니다',
    color: 'bg-rose-50 text-rose-600',
  },
];

const benefits = [
  { icon: Zap, text: '무료 AI (Google Gemini) 무제한 사용' },
  { icon: Shield, text: '개인정보 안전하게 암호화 보관' },
  { icon: Clock, text: '실시간 스트리밍으로 빠른 응답' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FFFBF5]">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-amber-100/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-72 h-72 bg-rose-100/30 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-[#E8E2D9]">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/40 transition-shadow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-semibold text-[#1E293B]">
              Career AI
            </span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-[#64748B] hover:text-[#1E293B] hover:bg-transparent">
                로그인
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-full px-6 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all">
                무료로 시작
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-sm font-medium mb-8 animate-slide-down">
              <Zap className="w-4 h-4" />
              Google Gemini AI 무료 사용
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-[#1E293B] leading-[1.1] mb-6 animate-slide-up">
              취업 준비,
              <br />
              <span className="text-gradient">AI와 함께</span> 시작하세요
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-[#64748B] leading-relaxed mb-10 max-w-2xl mx-auto animate-slide-up delay-100">
              자소서 작성부터 면접 준비까지, 당신의 취업 여정을
              <br className="hidden md:block" />
              AI가 처음부터 끝까지 함께합니다
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-200">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-full px-8 h-14 text-lg font-medium shadow-xl shadow-teal-500/20 hover:shadow-teal-500/30 hover:-translate-y-0.5 transition-all"
                >
                  무료로 시작하기
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-6 mt-12 text-sm text-[#64748B] animate-fade-in delay-300">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2">
                  <benefit.icon className="w-4 h-4 text-teal-600" />
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 bg-white/50">
        <div className="max-w-6xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-[#1E293B] mb-4">
              당신의 취업을 돕는 네 가지 기능
            </h2>
            <p className="text-[#64748B] text-lg">
              AI가 제공하는 체계적인 취업 준비 솔루션
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group relative bg-white rounded-2xl p-8 border border-[#E8E2D9] hover:border-teal-200 hover:shadow-xl hover:shadow-teal-500/5 transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-5`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="font-display text-xl font-semibold text-[#1E293B] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#64748B] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="relative py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-[#1E293B] mb-4">
              간단한 3단계로 시작하세요
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: '회원가입', desc: '이메일로 30초 만에 가입' },
              { step: '02', title: '정보 입력', desc: '지원할 회사와 직무 정보 입력' },
              { step: '03', title: 'AI 생성', desc: '맞춤형 자소서를 즉시 받아보세요' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-50 text-teal-600 font-display text-2xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-[#1E293B] text-lg mb-2">{item.title}</h3>
                <p className="text-[#64748B]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl p-12 md:p-16 text-center overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4">
                지금 바로 시작하세요
              </h2>
              <p className="text-teal-100 text-lg mb-8 max-w-md mx-auto">
                무료로 가입하고 AI의 도움을 받아
                <br />
                완벽한 자소서를 작성해보세요
              </p>
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-white text-teal-600 hover:bg-teal-50 rounded-full px-8 h-14 text-lg font-semibold shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  무료 회원가입
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 border-t border-[#E8E2D9]">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-[#94A3B8]">
            © 2026 Career AI. Crafted with care by 변세민
          </p>
        </div>
      </footer>
    </div>
  );
}
