'use client';

/**
 * 이력서 상세 페이지
 */

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  FileUser,
  Loader2,
  TrendingUp,
  Target,
  Lightbulb,
  CheckCircle,
  XCircle,
  RefreshCw,
  MessageCircle,
  AlertCircle,
  Download,
  FileText,
  File,
} from 'lucide-react';
import type { Resume } from '@/lib/database.types';
import type { AnalyzeResumeResponse } from '@/lib/ai/types';
import {
  downloadResumeAnalysisAsPDF,
  downloadResumeAnalysisAsWord,
} from '@/lib/utils/download';

export default function ResumeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [resume, setResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  useEffect(() => {
    fetchResume();
  }, [id]);

  const fetchResume = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/resumes/${id}`);
      const result = await response.json();

      if (result.success) {
        setResume(result.data);
      } else {
        setError(result.error);
      }
    } catch {
      setError('이력서를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReanalyze = async () => {
    if (!resume?.raw_text) return;

    setIsReanalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: resume.raw_text,
          includeATSScore: true,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 저장
        const saveResponse = await fetch(`/api/resumes/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ analysisResult: result.data }),
        });

        const saveResult = await saveResponse.json();
        if (saveResult.success) {
          setResume(saveResult.data);
        }
      } else {
        setError(result.error || '재분석에 실패했습니다');
      }
    } catch {
      setError('재분석 중 오류가 발생했습니다');
    } finally {
      setIsReanalyzing(false);
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
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="font-display text-xl font-semibold text-[#1E293B] mb-2">
            {error || '이력서를 찾을 수 없습니다'}
          </h3>
          <Link href="/resume">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              목록으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const analysisResult = resume.analysis_result as AnalyzeResumeResponse | null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <Link
          href="/resume"
          className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#1E293B] mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          이력서 목록으로
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <FileUser className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold text-[#1E293B]">
                {resume.title}
              </h1>
              <p className="text-[#64748B]">
                {new Date(resume.created_at || '').toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 다운로드 버튼 */}
            {resume.analysis_result && (
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                  className="border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  다운로드
                </Button>
                {showDownloadMenu && (
                  <div className="absolute right-0 top-11 z-10 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px]">
                    <button
                      onClick={() => {
                        downloadResumeAnalysisAsPDF({
                          title: resume.title,
                          analysis: resume.analysis_result as unknown as AnalyzeResumeResponse,
                          rawText: resume.raw_text || undefined,
                        });
                        setShowDownloadMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <File className="w-4 h-4 text-red-500" />
                      PDF로 저장
                    </button>
                    <button
                      onClick={() => {
                        downloadResumeAnalysisAsWord({
                          title: resume.title,
                          analysis: resume.analysis_result as unknown as AnalyzeResumeResponse,
                          rawText: resume.raw_text || undefined,
                        });
                        setShowDownloadMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-blue-500" />
                      Word로 저장
                    </button>
                  </div>
                )}
              </div>
            )}

            <Button
              variant="outline"
              onClick={handleReanalyze}
              disabled={isReanalyzing}
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isReanalyzing ? 'animate-spin' : ''}`} />
              재분석
            </Button>
            <Link href={`/interview?resumeId=${id}`}>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <MessageCircle className="w-4 h-4 mr-2" />
                면접 질문 생성
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 분석 결과 */}
      {analysisResult ? (
        <div className="space-y-6">
          {/* 전체 점수 */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className={`rounded-2xl border p-6 ${getScoreBg(analysisResult.overallScore)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">전체 완성도</p>
                  <p className={`text-4xl font-bold ${getScoreColor(analysisResult.overallScore)}`}>
                    {analysisResult.overallScore}
                    <span className="text-lg font-normal text-gray-500">/100</span>
                  </p>
                </div>
                <TrendingUp className={`w-12 h-12 ${getScoreColor(analysisResult.overallScore)}`} />
              </div>
            </div>

            {analysisResult.atsScore !== undefined && (
              <div className={`rounded-2xl border p-6 ${getScoreBg(analysisResult.atsScore)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">ATS 최적화</p>
                    <p className={`text-4xl font-bold ${getScoreColor(analysisResult.atsScore)}`}>
                      {analysisResult.atsScore}
                      <span className="text-lg font-normal text-gray-500">/100</span>
                    </p>
                  </div>
                  <Target className={`w-12 h-12 ${getScoreColor(analysisResult.atsScore)}`} />
                </div>
              </div>
            )}
          </div>

          {/* 섹션별 점수 */}
          <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6">
            <h3 className="font-medium text-[#1E293B] mb-4">섹션별 분석</h3>
            <div className="space-y-4">
              {analysisResult.sections.map((section, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-16 text-right">
                    <span className={`text-xl font-bold ${getScoreColor(section.score)}`}>
                      {section.score}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#1E293B]">{section.name}</p>
                    <p className="text-sm text-[#64748B]">{section.feedback}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 키워드 분석 */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-xl border border-green-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-green-800">발견된 키워드</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysisResult.keywords.found.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl border border-amber-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-5 h-5 text-amber-600" />
                <h3 className="font-medium text-amber-800">추가 권장 키워드</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysisResult.keywords.missing.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 개선 제안 */}
          <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-indigo-600" />
              <h3 className="font-medium text-indigo-800">개선 제안</h3>
            </div>
            <ul className="space-y-2">
              {analysisResult.suggestions.map((suggestion, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-indigo-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#E8E2D9]">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="font-display text-lg font-semibold text-[#1E293B] mb-2">
            분석 결과가 없습니다
          </h3>
          <p className="text-[#64748B] mb-6">
            이력서를 다시 분석해보세요
          </p>
          <Button
            onClick={handleReanalyze}
            disabled={isReanalyzing}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isReanalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                분석 중...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                AI 분석 시작
              </>
            )}
          </Button>
        </div>
      )}

      {/* 이력서 원문 */}
      {resume.raw_text && (
        <div className="mt-6 bg-white rounded-2xl border border-[#E8E2D9] p-6">
          <h3 className="font-medium text-[#1E293B] mb-4">이력서 원문</h3>
          <div className="prose max-w-none text-[#1E293B] leading-relaxed whitespace-pre-wrap text-sm bg-gray-50 rounded-xl p-4 max-h-[400px] overflow-y-auto">
            {resume.raw_text}
          </div>
        </div>
      )}
    </div>
  );
}
