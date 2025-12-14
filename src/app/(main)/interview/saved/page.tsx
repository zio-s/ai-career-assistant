'use client';

/**
 * 저장된 면접 질문 목록 페이지
 */

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  MessageCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Trash2,
  Sparkles,
} from 'lucide-react';
import type { InterviewQuestion } from '@/lib/database.types';

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

export default function SavedInterviewQuestionsPage() {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/interview-questions');
      const result = await response.json();

      if (result.success) {
        setQuestions(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 질문을 삭제하시겠습니까?')) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/interview-questions/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.success) {
        setQuestions(prev => prev.filter(q => q.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete question:', error);
    } finally {
      setDeletingId(null);
    }
  };

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

  const filteredQuestions = selectedCategory === 'all'
    ? questions
    : questions.filter(q => q.category === selectedCategory);

  const categories = ['all', 'technical', 'behavioral', 'experience', 'situational'];

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
        <Link
          href="/interview"
          className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#1E293B] mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          면접 질문 생성으로
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold text-[#1E293B]">
                저장된 면접 질문
              </h1>
              <p className="text-[#64748B]">
                총 {questions.length}개의 질문이 저장되어 있습니다
              </p>
            </div>
          </div>
          <Link href="/interview">
            <Button className="bg-violet-600 hover:bg-violet-700">
              <Sparkles className="w-4 h-4 mr-2" />
              새 질문 생성
            </Button>
          </Link>
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-violet-600 text-white'
                : 'bg-white text-[#64748B] border border-[#E8E2D9] hover:bg-violet-50'
            }`}
          >
            {cat === 'all' ? '전체' : CATEGORY_LABELS[cat]}
            {cat !== 'all' && (
              <span className="ml-1.5 opacity-70">
                ({questions.filter(q => q.category === cat).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 질문 목록 */}
      {filteredQuestions.length > 0 ? (
        <div className="space-y-3">
          {filteredQuestions.map((question, idx) => (
            <div
              key={question.id}
              className="bg-white rounded-xl border border-[#E8E2D9] overflow-hidden"
            >
              <div className="p-4 flex items-start justify-between">
                <button
                  onClick={() => toggleQuestion(question.id)}
                  className="flex-1 flex items-start gap-3 text-left"
                >
                  <span className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center font-medium text-sm flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-[#1E293B]">{question.question}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {question.category && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[question.category]}`}>
                          {CATEGORY_LABELS[question.category]}
                        </span>
                      )}
                      {question.difficulty && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {DIFFICULTY_LABELS[question.difficulty]}
                        </span>
                      )}
                    </div>
                  </div>
                  {expandedQuestions.has(question.id) ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(question.id)}
                  disabled={deletingId === question.id}
                  className="ml-2 p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  {deletingId === question.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>

              {expandedQuestions.has(question.id) && (
                <div className="px-4 pb-4 border-t border-[#E8E2D9]">
                  {/* 추천 답변 */}
                  {question.suggested_answer && (
                    <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                      <div className="flex items-center gap-2 text-amber-700 mb-1">
                        <Lightbulb className="w-4 h-4" />
                        <span className="font-medium text-sm">추천 답변</span>
                      </div>
                      <p className="text-sm text-amber-800 whitespace-pre-wrap">
                        {question.suggested_answer}
                      </p>
                    </div>
                  )}

                  {/* 내 답변 */}
                  {question.user_answer && (
                    <div className="mt-3 p-3 bg-violet-50 rounded-lg">
                      <p className="font-medium text-sm text-violet-700 mb-1">내 답변</p>
                      <p className="text-sm text-violet-800 whitespace-pre-wrap">
                        {question.user_answer}
                      </p>
                    </div>
                  )}

                  {/* 저장 날짜 */}
                  <p className="mt-3 text-xs text-[#94A3B8]">
                    저장일: {new Date(question.created_at || '').toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#E8E2D9]">
          <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-violet-600" />
          </div>
          <h3 className="font-display text-lg font-semibold text-[#1E293B] mb-2">
            {selectedCategory === 'all' ? '저장된 질문이 없습니다' : '해당 카테고리에 질문이 없습니다'}
          </h3>
          <p className="text-[#64748B] mb-6">
            면접 질문을 생성하고 저장해보세요
          </p>
          <Link href="/interview">
            <Button className="bg-violet-600 hover:bg-violet-700">
              <Sparkles className="w-4 h-4 mr-2" />
              면접 질문 생성하기
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
