'use client';

/**
 * 자소서 목록 페이지
 */

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Plus,
  Search,
  Calendar,
  Building2,
  MoreVertical,
  Sparkles,
  Loader2,
  Trash2,
} from 'lucide-react';
import type { CoverLetter } from '@/lib/database.types';

export default function CoverLetterListPage() {
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchCoverLetters();
  }, []);

  const fetchCoverLetters = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/cover-letters');
      const result = await response.json();

      if (result.success) {
        setCoverLetters(result.data || []);
      } else {
        setError(result.error);
      }
    } catch {
      setError('자소서 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/cover-letters/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.success) {
        setCoverLetters(prev => prev.filter(letter => letter.id !== id));
      } else {
        alert(result.error);
      }
    } catch {
      alert('삭제에 실패했습니다');
    }
    setMenuOpenId(null);
  };

  const filteredLetters = coverLetters.filter(
    letter =>
      letter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (letter.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#1E293B]">내 자소서</h1>
          <p className="text-[#64748B] mt-1">작성한 자소서를 관리하고 새로운 자소서를 만들어보세요</p>
        </div>
        <Link href="/cover-letter/new">
          <Button className="bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl shadow-lg shadow-teal-500/20">
            <Plus className="w-5 h-5 mr-2" />
            새 자소서 작성
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
          placeholder="자소서 검색..."
          className="w-full h-12 pl-12 pr-4 bg-white border border-[#E8E2D9] rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all"
        />
      </div>

      {/* 자소서 목록 */}
      {filteredLetters.length > 0 ? (
        <div className="space-y-4">
          {filteredLetters.map(letter => (
            <div key={letter.id} className="relative">
              <Link href={`/cover-letter/${letter.id}`}>
                <div className="group bg-white rounded-xl border border-[#E8E2D9] p-5 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-500/5 transition-all cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                        <FileText className="w-6 h-6 text-teal-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-[#1E293B] group-hover:text-teal-700 transition-colors">
                            {letter.title}
                          </h3>
                          {letter.ai_generated && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full text-xs font-medium">
                              <Sparkles className="w-3 h-3" />
                              AI 생성
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              letter.status === 'completed'
                                ? 'bg-green-50 text-green-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {letter.status === 'completed' ? '완료' : '작성중'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[#64748B]">
                          {letter.company_name && (
                            <span className="flex items-center gap-1.5">
                              <Building2 className="w-4 h-4" />
                              {letter.company_name}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {formatDate(letter.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === letter.id ? null : letter.id);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-5 h-5 text-[#94A3B8]" />
                    </button>
                  </div>
                </div>
              </Link>

              {/* 드롭다운 메뉴 */}
              {menuOpenId === letter.id && (
                <div className="absolute right-0 top-16 z-10 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px]">
                  <button
                    onClick={() => handleDelete(letter.id)}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    삭제
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* 빈 상태 */
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-teal-600" />
          </div>
          <h3 className="font-display text-xl font-semibold text-[#1E293B] mb-2">
            {searchQuery ? '검색 결과가 없습니다' : '아직 작성한 자소서가 없어요'}
          </h3>
          <p className="text-[#64748B] mb-6">
            {searchQuery
              ? '다른 검색어로 시도해보세요'
              : 'AI의 도움을 받아 첫 번째 자소서를 작성해보세요'}
          </p>
          {!searchQuery && (
            <Link href="/cover-letter/new">
              <Button className="bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl">
                <Plus className="w-5 h-5 mr-2" />
                첫 자소서 작성하기
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
