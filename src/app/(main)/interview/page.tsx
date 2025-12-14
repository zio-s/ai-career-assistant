'use client';

/**
 * 면접 질문 생성 및 연습 페이지
 */

import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { VioletSelect } from '@/components/ui/select';
import {
  MessageCircle,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Save,
  Check,
  RefreshCw,
  FileText,
  FileUser,
  AlertCircle,
} from 'lucide-react';
import type { CoverLetter, Resume, InterviewQuestion } from '@/lib/database.types';
import type { InterviewQuestion as AIInterviewQuestion } from '@/lib/ai/types';

const CATEGORY_LABELS: Record<string, string> = {
  technical: '기술/전문',
  behavioral: '행동/성향',
  experience: '경력/경험',
  situational: '상황 대처',
};

const CATEGORY_COLORS: Record<string, string> = {
  technical: 'bg-blue-50 text-blue-700 border-blue-200',
  behavioral: 'bg-purple-50 text-purple-700 border-purple-200',
  experience: 'bg-green-50 text-green-700 border-green-200',
  situational: 'bg-orange-50 text-orange-700 border-orange-200',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: '쉬움',
  medium: '보통',
  hard: '어려움',
};

function InterviewPageContent() {
  const searchParams = useSearchParams();
  const coverLetterId = searchParams.get('coverLetterId');
  const resumeId = searchParams.get('resumeId');

  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<string>(coverLetterId || '');
  const [selectedResume, setSelectedResume] = useState<string>(resumeId || '');
  const [jobDescription, setJobDescription] = useState('');
  const [questionCount, setQuestionCount] = useState(10);

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [questions, setQuestions] = useState<AIInterviewQuestion[]>([]);
  const [savedQuestions, setSavedQuestions] = useState<InterviewQuestion[]>([]);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [coverLettersRes, resumesRes, savedQuestionsRes] = await Promise.all([
        fetch('/api/cover-letters'),
        fetch('/api/resumes'),
        fetch('/api/interview-questions'),
      ]);

      const [clResult, resumeResult, sqResult] = await Promise.all([
        coverLettersRes.json(),
        resumesRes.json(),
        savedQuestionsRes.json(),
      ]);

      if (clResult.success) setCoverLetters(clResult.data || []);
      if (resumeResult.success) setResumes(resumeResult.data || []);
      if (sqResult.success) setSavedQuestions(sqResult.data || []);
    } catch {
      setError('데이터를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!selectedCoverLetter && !selectedResume && !jobDescription.trim()) {
      setError('자소서, 이력서, 또는 채용공고 중 하나 이상을 선택해주세요');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setQuestions([]);
    setIsSaved(false);

    try {
      const selectedCL = coverLetters.find(cl => cl.id === selectedCoverLetter);
      const selectedR = resumes.find(r => r.id === selectedResume);

      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coverLetter: selectedCL?.content,
          resume: selectedR?.raw_text,
          jobDescription: jobDescription || undefined,
          questionCount,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setQuestions(result.data.questions);
      } else {
        setError(result.error || '질문 생성에 실패했습니다');
      }
    } catch {
      setError('질문 생성 중 오류가 발생했습니다');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedCoverLetter, selectedResume, jobDescription, questionCount, coverLetters, resumes]);

  const handleSave = useCallback(async () => {
    if (questions.length === 0) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/interview-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: questions.map(q => ({
            question: q.question,
            category: q.category,
            difficulty: q.difficulty,
            suggested_answer: q.tip || q.sampleAnswer,
          })),
          coverLetterId: selectedCoverLetter || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSaved(true);
        // 저장된 질문 목록 새로고침
        const savedRes = await fetch('/api/interview-questions');
        const savedResult = await savedRes.json();
        if (savedResult.success) setSavedQuestions(savedResult.data || []);
      } else {
        setError(result.error || '저장에 실패했습니다');
      }
    } catch {
      setError('저장에 실패했습니다');
    } finally {
      setIsSaving(false);
    }
  }, [questions, selectedCoverLetter]);

  const toggleQuestion = (id: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-[#1E293B]">
              면접 예상 질문
            </h1>
            <p className="text-[#64748B]">
              AI가 자소서와 이력서를 분석하여 면접 질문을 생성합니다
            </p>
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

      {/* 질문이 없을 때 - 설정 폼 */}
      {questions.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 mb-6">
          <h2 className="font-medium text-[#1E293B] mb-4">질문 생성 설정</h2>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* 자소서 선택 */}
            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                자소서 선택 (선택)
              </label>
              <VioletSelect
                value={selectedCoverLetter}
                onChange={setSelectedCoverLetter}
                placeholder="선택 안함"
                options={[
                  { value: '', label: '선택 안함' },
                  ...coverLetters.map(cl => ({
                    value: cl.id,
                    label: cl.title,
                  })),
                ]}
              />
            </div>

            {/* 이력서 선택 */}
            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-2">
                <FileUser className="w-4 h-4 inline mr-1" />
                이력서 선택 (선택)
              </label>
              <VioletSelect
                value={selectedResume}
                onChange={setSelectedResume}
                placeholder="선택 안함"
                options={[
                  { value: '', label: '선택 안함' },
                  ...resumes.map(r => ({
                    value: r.id,
                    label: r.title,
                  })),
                ]}
              />
            </div>
          </div>

          {/* 채용공고 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#1E293B] mb-2">
              채용공고 (선택)
            </label>
            <Textarea
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="채용공고 내용을 붙여넣기 하세요..."
              className="min-h-[120px] resize-none border-[#E8E2D9] rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          {/* 질문 개수 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#1E293B] mb-2">
              질문 개수
            </label>
            <VioletSelect
              value={String(questionCount)}
              onChange={(val) => setQuestionCount(Number(val))}
              className="w-40"
              options={[
                { value: '5', label: '5개' },
                { value: '10', label: '10개' },
                { value: '15', label: '15개' },
                { value: '20', label: '20개' },
              ]}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-violet-600 hover:bg-violet-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                질문 생성 중...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                AI 면접 질문 생성
              </>
            )}
          </Button>
        </div>
      )}

      {/* 생성된 질문 목록 */}
      {questions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-[#1E293B]">
              생성된 질문 ({questions.length}개)
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setQuestions([])}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                다시 생성
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || isSaved}
                className={isSaved ? 'bg-green-600 hover:bg-green-600' : 'bg-violet-600 hover:bg-violet-700'}
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
                    질문 저장
                  </>
                )}
              </Button>
            </div>
          </div>

          {questions.map((question, idx) => (
            <div
              key={question.id || idx}
              className="bg-white rounded-xl border border-[#E8E2D9] overflow-hidden"
            >
              <button
                onClick={() => toggleQuestion(question.id || String(idx))}
                className="w-full p-4 flex items-start justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center font-medium text-sm">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-medium text-[#1E293B]">{question.question}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[question.category]}`}>
                        {CATEGORY_LABELS[question.category]}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {DIFFICULTY_LABELS[question.difficulty]}
                      </span>
                    </div>
                  </div>
                </div>
                {expandedQuestions.has(question.id || String(idx)) ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedQuestions.has(question.id || String(idx)) && (
                <div className="px-4 pb-4 border-t border-[#E8E2D9]">
                  {/* 답변 팁 */}
                  {question.tip && (
                    <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                      <div className="flex items-center gap-2 text-amber-700 mb-1">
                        <Lightbulb className="w-4 h-4" />
                        <span className="font-medium text-sm">답변 팁</span>
                      </div>
                      <p className="text-sm text-amber-800">{question.tip}</p>
                    </div>
                  )}

                  {/* 예시 답변 */}
                  {question.sampleAnswer && (
                    <div className="mt-3 p-3 bg-violet-50 rounded-lg">
                      <p className="font-medium text-sm text-violet-700 mb-1">예시 답변</p>
                      <p className="text-sm text-violet-800">{question.sampleAnswer}</p>
                    </div>
                  )}

                  {/* 내 답변 */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-[#1E293B] mb-2">
                      내 답변 연습
                    </label>
                    <Textarea
                      value={userAnswers[question.id || String(idx)] || ''}
                      onChange={e =>
                        setUserAnswers(prev => ({
                          ...prev,
                          [question.id || String(idx)]: e.target.value,
                        }))
                      }
                      placeholder="여기에 답변을 작성해보세요..."
                      className="min-h-[100px] resize-none border-[#E8E2D9] rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 저장된 질문 (자소서/이력서가 없을 때만 표시) */}
      {questions.length === 0 && savedQuestions.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-[#1E293B]">저장된 질문</h2>
            <Link href="/interview/saved" className="text-sm text-violet-600 hover:text-violet-700 hover:underline">
              전체 보기 ({savedQuestions.length}개) →
            </Link>
          </div>
          <div className="space-y-3">
            {savedQuestions.slice(0, 5).map((q, idx) => (
              <div
                key={q.id}
                className="bg-white rounded-xl border border-[#E8E2D9] p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center font-medium text-sm">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-[#1E293B]">{q.question}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {q.category && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[q.category]}`}>
                          {CATEGORY_LABELS[q.category]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {savedQuestions.length > 5 && (
              <Link href="/interview/saved" className="block">
                <div className="text-center py-3 bg-violet-50 rounded-xl text-violet-600 hover:bg-violet-100 transition-colors">
                  외 {savedQuestions.length - 5}개의 질문 더보기
                </div>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 빈 상태 */}
      {questions.length === 0 && savedQuestions.length === 0 && coverLetters.length === 0 && resumes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#E8E2D9]">
          <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-violet-600" />
          </div>
          <h3 className="font-display text-lg font-semibold text-[#1E293B] mb-2">
            아직 자소서나 이력서가 없어요
          </h3>
          <p className="text-[#64748B] mb-6">
            먼저 자소서나 이력서를 작성/분석하면 맞춤 면접 질문을 생성할 수 있어요
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/cover-letter/new">
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                자소서 작성
              </Button>
            </Link>
            <Link href="/resume/new">
              <Button variant="outline">
                <FileUser className="w-4 h-4 mr-2" />
                이력서 분석
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    }>
      <InterviewPageContent />
    </Suspense>
  );
}
