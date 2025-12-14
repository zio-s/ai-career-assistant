'use client';

/**
 * 자소서 AI 첨삭 페이지
 */

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  MessageSquare,
  Loader2,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  FileText,
  RefreshCw,
  Save,
} from 'lucide-react';
import type { CoverLetter } from '@/lib/database.types';
import type { ReviewCoverLetterResponse } from '@/lib/ai/types';

const CATEGORY_LABELS: Record<string, string> = {
  grammar: '문법/맞춤법',
  structure: '구조/논리',
  content: '내용/구체성',
  persuasion: '설득력',
};

const CATEGORY_COLORS: Record<string, string> = {
  grammar: 'bg-blue-50 text-blue-700 border-blue-200',
  structure: 'bg-purple-50 text-purple-700 border-purple-200',
  content: 'bg-green-50 text-green-700 border-green-200',
  persuasion: 'bg-orange-50 text-orange-700 border-orange-200',
};

export default function CoverLetterReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null);
  const [reviewResult, setReviewResult] = useState<ReviewCoverLetterResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCoverLetter();
  }, [id]);

  const fetchCoverLetter = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/cover-letters/${id}`);
      const result = await response.json();

      if (result.success) {
        setCoverLetter(result.data);
        // 이미 첨삭 결과가 있으면 표시
        if (result.data.feedback) {
          setReviewResult(result.data.feedback as ReviewCoverLetterResponse);
        }
      } else {
        setError(result.error);
      }
    } catch {
      setError('자소서를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async () => {
    if (!coverLetter) return;

    setIsReviewing(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/review-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: coverLetter.content,
          jobDescription: coverLetter.job_description,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setReviewResult(result.data);
      } else {
        setError(result.error || '첨삭에 실패했습니다');
      }
    } catch {
      setError('첨삭 중 오류가 발생했습니다');
    } finally {
      setIsReviewing(false);
    }
  };

  const handleSaveReview = async () => {
    if (!reviewResult) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/cover-letters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: reviewResult }),
      });

      const result = await response.json();

      if (result.success) {
        router.push(`/cover-letter/${id}`);
      } else {
        setError(result.error || '저장에 실패했습니다');
      }
    } catch {
      setError('저장에 실패했습니다');
    } finally {
      setIsSaving(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error && !coverLetter) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="font-display text-xl font-semibold text-[#1E293B] mb-2">
            {error}
          </h3>
          <Link href="/cover-letter">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              목록으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <Link
          href={`/cover-letter/${id}`}
          className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#1E293B] mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          자소서로 돌아가기
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold text-[#1E293B]">
                AI 첨삭
              </h1>
              <p className="text-[#64748B]">
                {coverLetter?.title}
              </p>
            </div>
          </div>

          {!reviewResult && (
            <Button
              onClick={handleReview}
              disabled={isReviewing}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isReviewing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  첨삭 시작
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600">
          {error}
        </div>
      )}

      {/* 첨삭 결과 없을 때 */}
      {!reviewResult && !isReviewing && (
        <div className="bg-white rounded-2xl border border-[#E8E2D9] p-8">
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="font-display text-lg font-semibold text-[#1E293B] mb-2">
              AI 첨삭을 시작해보세요
            </h3>
            <p className="text-[#64748B] mb-6 max-w-md mx-auto">
              AI가 자소서를 분석하여 문법, 구조, 내용, 설득력 등 다양한 영역에서
              피드백을 제공합니다.
            </p>
            <Button
              onClick={handleReview}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              첨삭 시작하기
            </Button>
          </div>
        </div>
      )}

      {/* 분석 중 */}
      {isReviewing && (
        <div className="bg-white rounded-2xl border border-[#E8E2D9] p-8">
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold text-[#1E293B] mb-2">
              AI가 자소서를 분석하고 있습니다
            </h3>
            <p className="text-[#64748B]">
              잠시만 기다려주세요...
            </p>
          </div>
        </div>
      )}

      {/* 첨삭 결과 */}
      {reviewResult && (
        <div className="space-y-6">
          {/* 전체 점수 */}
          <div className={`rounded-2xl border p-6 ${getScoreBg(reviewResult.overallScore)}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">전체 점수</p>
                <p className={`text-4xl font-bold ${getScoreColor(reviewResult.overallScore)}`}>
                  {reviewResult.overallScore}
                  <span className="text-lg font-normal text-gray-500">/100</span>
                </p>
              </div>
              <TrendingUp className={`w-12 h-12 ${getScoreColor(reviewResult.overallScore)}`} />
            </div>
          </div>

          {/* 카테고리별 피드백 */}
          <div className="grid md:grid-cols-2 gap-4">
            {reviewResult.feedback.map((item, idx) => (
              <div
                key={idx}
                className={`rounded-xl border p-5 ${CATEGORY_COLORS[item.category] || 'bg-gray-50 text-gray-700 border-gray-200'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">
                    {CATEGORY_LABELS[item.category] || item.category}
                  </span>
                  <span className="text-lg font-bold">{item.score}점</span>
                </div>
                {item.comments.length > 0 && (
                  <ul className="space-y-1 text-sm mb-3">
                    {item.comments.map((comment, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 flex-shrink-0 opacity-50" />
                        {comment}
                      </li>
                    ))}
                  </ul>
                )}
                {item.suggestions.length > 0 && (
                  <div className="pt-3 border-t border-current border-opacity-20">
                    <p className="text-xs font-medium mb-2 opacity-70">개선 제안</p>
                    <ul className="space-y-1 text-sm">
                      {item.suggestions.map((suggestion, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0 opacity-70" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 강점 */}
          {reviewResult.strengths.length > 0 && (
            <div className="bg-green-50 rounded-xl border border-green-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-green-800">강점</h3>
              </div>
              <ul className="space-y-2">
                {reviewResult.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-green-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 개선점 */}
          {reviewResult.improvements.length > 0 && (
            <div className="bg-amber-50 rounded-xl border border-amber-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-amber-600" />
                <h3 className="font-medium text-amber-800">개선 필요</h3>
              </div>
              <ul className="space-y-2">
                {reviewResult.improvements.map((improvement, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-amber-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex justify-center gap-4 pt-4">
            <Button
              variant="outline"
              onClick={handleReview}
              disabled={isReviewing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isReviewing ? 'animate-spin' : ''}`} />
              다시 첨삭
            </Button>
            <Button
              onClick={handleSaveReview}
              disabled={isSaving}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isSaving ? (
                <>저장 중...</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  결과 저장
                </>
              )}
            </Button>
            <Link href={`/cover-letter/${id}`}>
              <Button variant="ghost">
                <FileText className="w-4 h-4 mr-2" />
                자소서 보기
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
