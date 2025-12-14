'use client';

/**
 * 이력서 목록 페이지
 */

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  FileUser,
  Plus,
  Search,
  Calendar,
  MoreVertical,
  Loader2,
  Trash2,
  TrendingUp,
  Target,
} from 'lucide-react';
import type { Resume } from '@/lib/database.types';
import type { AnalyzeResumeResponse } from '@/lib/ai/types';

export default function ResumeListPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/resumes');
      const result = await response.json();

      if (result.success) {
        setResumes(result.data || []);
      } else {
        setError(result.error);
      }
    } catch {
      setError('이력서 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/resumes/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.success) {
        setResumes(prev => prev.filter(resume => resume.id !== id));
      } else {
        alert(result.error);
      }
    } catch {
      alert('삭제에 실패했습니다');
    }
    setMenuOpenId(null);
  };

  const filteredResumes = resumes.filter(resume =>
    resume.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const getAnalysisScore = (resume: Resume): number | null => {
    const analysis = resume.analysis_result as AnalyzeResumeResponse | null;
    return analysis?.overallScore ?? null;
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'bg-gray-50 text-gray-600';
    if (score >= 80) return 'bg-green-50 text-green-700';
    if (score >= 60) return 'bg-amber-50 text-amber-700';
    return 'bg-red-50 text-red-700';
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#1E293B]">내 이력서</h1>
          <p className="text-[#64748B] mt-1">이력서를 업로드하고 AI 분석을 받아보세요</p>
        </div>
        <Link href="/resume/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20">
            <Plus className="w-5 h-5 mr-2" />
            파일 업로드
          </Button>
        </Link>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600">
          {error}
        </div>
      )}

      {/* 검색 */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="이력서 검색..."
          className="w-full h-12 pl-12 pr-4 bg-white border border-[#E8E2D9] rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
        />
      </div>

      {/* 이력서 목록 */}
      {filteredResumes.length > 0 ? (
        <div className="space-y-4">
          {filteredResumes.map(resume => {
            const score = getAnalysisScore(resume);
            return (
              <div key={resume.id} className="relative">
                <Link href={`/resume/${resume.id}`}>
                  <div className="group bg-white rounded-xl border border-[#E8E2D9] p-5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                          <FileUser className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-[#1E293B] group-hover:text-indigo-700 transition-colors">
                              {resume.title}
                            </h3>
                            {score !== null && (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getScoreColor(score)}`}>
                                <TrendingUp className="w-3 h-3" />
                                {score}점
                              </span>
                            )}
                            {!score && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 text-gray-600 rounded-full text-xs font-medium">
                                <Target className="w-3 h-3" />
                                미분석
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-[#64748B]">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              {formatDate(resume.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          setMenuOpenId(menuOpenId === resume.id ? null : resume.id);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-[#94A3B8]" />
                      </button>
                    </div>
                  </div>
                </Link>

                {/* 드롭다운 메뉴 */}
                {menuOpenId === resume.id && (
                  <div className="absolute right-0 top-16 z-10 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px]">
                    <button
                      onClick={() => handleDelete(resume.id)}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      삭제
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* 빈 상태 */
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
            <FileUser className="w-10 h-10 text-indigo-600" />
          </div>
          <h3 className="font-display text-xl font-semibold text-[#1E293B] mb-2">
            {searchQuery ? '검색 결과가 없습니다' : '아직 분석한 이력서가 없어요'}
          </h3>
          <p className="text-[#64748B] mb-6">
            {searchQuery
              ? '다른 검색어로 시도해보세요'
              : '이력서를 업로드하고 AI 분석을 받아보세요'}
          </p>
          {!searchQuery && (
            <Link href="/resume/new">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                <Plus className="w-5 h-5 mr-2" />
                첫 이력서 업로드하기
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
