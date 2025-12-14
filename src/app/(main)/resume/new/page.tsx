'use client';

/**
 * 이력서 분석 페이지 (파일 업로드 방식)
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  FileUser,
  Loader2,
  Save,
  Check,
  AlertCircle,
  TrendingUp,
  Target,
  Lightbulb,
  CheckCircle,
  XCircle,
  FileText,
} from 'lucide-react';
import FileUploader from '@/components/resume/FileUploader';
import type { AnalyzeResumeResponse } from '@/lib/ai/types';

export default function NewResumePage() {
  const router = useRouter();
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [targetJob, setTargetJob] = useState('');
  const [title, setTitle] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResumeResponse | null>(null);

  const handleFileContent = useCallback((content: string, name: string) => {
    setResumeText(content);
    setFileName(name);
    // 파일명에서 확장자 제거하여 기본 제목으로 설정
    const baseName = name.replace(/\.(pdf|doc|docx)$/i, '');
    setTitle(baseName);
    setError(null);
    setAnalysisResult(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!resumeText.trim()) {
      setError('이력서 파일을 먼저 업로드해주세요');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/ai/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: resumeText,
          targetJob: targetJob || undefined,
          includeATSScore: true,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setAnalysisResult(result.data);
      } else {
        setError(result.error || '분석에 실패했습니다');
      }
    } catch {
      setError('분석 중 오류가 발생했습니다');
    } finally {
      setIsAnalyzing(false);
    }
  }, [resumeText, targetJob]);

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      setError('제목을 입력해주세요');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          rawText: resumeText,
          analysisResult,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSaved(true);
        setTimeout(() => {
          router.push('/resume');
        }, 1000);
      } else {
        setError(result.error || '저장에 실패했습니다');
      }
    } catch {
      setError('저장에 실패했습니다');
    } finally {
      setIsSaving(false);
    }
  }, [title, resumeText, analysisResult, router]);

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
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <FileUser className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-[#1E293B]">이력서 AI 분석</h1>
            <p className="text-[#64748B]">이력서 파일을 업로드하고 AI 분석을 받아보세요</p>
          </div>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* 분석 결과가 없을 때 - 파일 업로드 폼 */}
      {!analysisResult && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6">
            {/* 파일 업로더 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#1E293B] mb-3">이력서 파일</label>
              <FileUploader onFileContent={handleFileContent} isLoading={isAnalyzing} />
            </div>

            {/* 업로드된 파일 정보 */}
            {fileName && (
              <div className="mb-6 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="font-medium text-indigo-900">{fileName}</p>
                    <p className="text-sm text-indigo-600">{resumeText.length.toLocaleString()}자 추출됨</p>
                  </div>
                </div>
              </div>
            )}

            {/* 목표 직무 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#1E293B] mb-2">
                목표 직무 (선택)
              </label>
              <input
                type="text"
                value={targetJob}
                onChange={e => setTargetJob(e.target.value)}
                placeholder="예: 프론트엔드 개발자, 데이터 분석가"
                className="w-full h-12 px-4 bg-white border border-[#E8E2D9] rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
              />
            </div>

            {/* 분석 시작 버튼 */}
            <div className="flex items-center justify-end pt-4 border-t border-[#E8E2D9]">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !resumeText.trim()}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isAnalyzing ? (
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
          </div>
        </div>
      )}

      {/* 분석 결과 */}
      {analysisResult && (
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

          {/* 저장 섹션 */}
          <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6">
            <h3 className="font-medium text-[#1E293B] mb-4">분석 결과 저장</h3>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-[#1E293B] mb-2">
                  이력서 제목
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="예: 2026 프론트엔드 이력서"
                  className="w-full h-12 px-4 bg-white border border-[#E8E2D9] rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                />
              </div>
              <Button
                onClick={handleSave}
                disabled={isSaving || isSaved || !title.trim()}
                className={`h-12 ${
                  isSaved
                    ? 'bg-green-600 hover:bg-green-600'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    저장 완료
                  </>
                ) : isSaving ? (
                  <>저장 중...</>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    저장하기
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* 다시 분석 버튼 */}
          <div className="text-center">
            <button
              onClick={() => {
                setAnalysisResult(null);
                setResumeText('');
                setFileName('');
                setTitle('');
              }}
              className="text-[#64748B] hover:text-[#1E293B] underline underline-offset-4"
            >
              다른 이력서 분석하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
