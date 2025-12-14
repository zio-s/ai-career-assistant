'use client';

/**
 * 자소서 상세/편집 페이지
 */

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  FileText,
  Save,
  Edit3,
  X,
  Sparkles,
  MessageSquare,
  Loader2,
  Check,
  Building2,
  Calendar,
  Copy,
  Download,
  File,
} from 'lucide-react';
import type { CoverLetter } from '@/lib/database.types';
import {
  downloadCoverLetterAsPDF,
  downloadCoverLetterAsWord,
} from '@/lib/utils/download';

export default function CoverLetterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

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
        setEditedContent(result.data.content);
      } else {
        setError(result.error);
      }
    } catch {
      setError('자소서를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!coverLetter) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/cover-letters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editedContent }),
      });

      const result = await response.json();

      if (result.success) {
        setCoverLetter(result.data);
        setIsEditing(false);
      } else {
        setError(result.error);
      }
    } catch {
      setError('저장에 실패했습니다');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async () => {
    if (coverLetter?.content) {
      await navigator.clipboard.writeText(coverLetter.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!coverLetter) return;

    const blob = new Blob([coverLetter.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${coverLetter.title}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error || !coverLetter) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="font-display text-xl font-semibold text-[#1E293B] mb-2">
            {error || '자소서를 찾을 수 없습니다'}
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
          href="/cover-letter"
          className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#1E293B] mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          자소서 목록으로
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display text-2xl font-semibold text-[#1E293B]">
                  {coverLetter.title}
                </h1>
                {coverLetter.ai_generated && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full text-xs font-medium">
                    <Sparkles className="w-3 h-3" />
                    AI 생성
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-[#64748B]">
                {coverLetter.company_name && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    {coverLetter.company_name}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(coverLetter.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedContent(coverLetter.content);
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  취소
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {isSaving ? (
                    <>저장 중...</>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-1" />
                      저장
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setIsEditing(true)}>
                  <Edit3 className="w-4 h-4 mr-1" />
                  수정
                </Button>
                <Button variant="ghost" onClick={handleCopy}>
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 mr-1 text-green-600" />
                      복사됨
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      복사
                    </>
                  )}
                </Button>
                <div className="relative">
                  <Button variant="ghost" onClick={() => setShowDownloadMenu(!showDownloadMenu)}>
                    <Download className="w-4 h-4 mr-1" />
                    다운로드
                  </Button>
                  {showDownloadMenu && (
                    <div className="absolute right-0 top-10 z-10 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px]">
                      <button
                        onClick={() => {
                          downloadCoverLetterAsPDF({
                            title: coverLetter.title,
                            content: coverLetter.content,
                            companyName: coverLetter.company_name || undefined,
                            jobPosition: coverLetter.job_position || undefined,
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
                          downloadCoverLetterAsWord({
                            title: coverLetter.title,
                            content: coverLetter.content,
                            companyName: coverLetter.company_name || undefined,
                            jobPosition: coverLetter.job_position || undefined,
                          });
                          setShowDownloadMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4 text-blue-500" />
                        Word로 저장
                      </button>
                      <button
                        onClick={() => {
                          handleDownload();
                          setShowDownloadMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4 text-gray-500" />
                        텍스트로 저장
                      </button>
                    </div>
                  )}
                </div>
                <Link href={`/cover-letter/${id}/review`}>
                  <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    AI 첨삭
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div className="bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden">
        {isEditing ? (
          <Textarea
            value={editedContent}
            onChange={e => setEditedContent(e.target.value)}
            className="min-h-[500px] border-0 focus:ring-0 text-[#1E293B] leading-relaxed resize-none p-6"
          />
        ) : (
          <div className="p-6">
            <div className="prose max-w-none text-[#1E293B] leading-relaxed whitespace-pre-wrap">
              {coverLetter.content}
            </div>
          </div>
        )}
      </div>

      {/* 글자 수 */}
      <div className="mt-4 text-right text-sm text-[#64748B]">
        {isEditing ? editedContent.length : coverLetter.content.length}자
      </div>

      {/* 첨삭 결과가 있는 경우 */}
      {coverLetter.feedback && (
        <div className="mt-8 p-6 rounded-2xl bg-amber-50 border border-amber-100">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-amber-600" />
            <h3 className="font-medium text-amber-800">AI 첨삭 결과</h3>
          </div>
          <pre className="text-sm text-amber-700 whitespace-pre-wrap">
            {JSON.stringify(coverLetter.feedback, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
