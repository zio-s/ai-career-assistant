'use client';

/**
 * 자소서 생성 결과 컴포넌트
 *
 * 생성된 자소서 표시 및 편집
 */

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Copy,
  Check,
  Download,
  RefreshCw,
  Sparkles,
  Lightbulb,
  Edit3,
  Save,
  X,
} from 'lucide-react';
import type { GenerateCoverLetterResponse } from '@/lib/ai/types';

interface CoverLetterResultProps {
  result: GenerateCoverLetterResponse | null;
  isStreaming?: boolean;
  streamContent?: string;
  onRegenerate?: () => void;
  onSave?: (content: string) => void;
  isRegenerating?: boolean;
}

export function CoverLetterResult({
  result,
  isStreaming = false,
  streamContent = '',
  onRegenerate,
  onSave,
  isRegenerating = false,
}: CoverLetterResultProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  // 스트리밍 중 자동 스크롤
  useEffect(() => {
    if (isStreaming && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [streamContent, isStreaming]);

  // 결과가 바뀌면 편집 내용 초기화
  useEffect(() => {
    if (result?.content) {
      setEditedContent(result.content);
    }
  }, [result?.content]);

  const displayContent = isStreaming ? streamContent : (isEditing ? editedContent : result?.content);

  const handleCopy = async () => {
    const content = isEditing ? editedContent : result?.content;
    if (content) {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const content = isEditing ? editedContent : result?.content;
    if (content) {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `자소서_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    onSave?.(editedContent);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(result?.content || '');
  };

  if (!result && !isStreaming) {
    return null;
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-[#1E293B]">
              {isStreaming ? 'AI가 자소서를 작성하고 있습니다...' : '생성된 자소서'}
            </h3>
            {!isStreaming && result && (
              <p className="text-sm text-[#64748B]">
                {result.content.length}자 작성됨
              </p>
            )}
          </div>
        </div>

        {/* 액션 버튼들 */}
        {!isStreaming && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="text-[#64748B] hover:text-[#1E293B]"
                >
                  <X className="w-4 h-4 mr-1" />
                  취소
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveEdit}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Save className="w-4 h-4 mr-1" />
                  저장
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="text-[#64748B] hover:text-[#1E293B]"
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  수정
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="text-[#64748B] hover:text-[#1E293B]"
                >
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="text-[#64748B] hover:text-[#1E293B]"
                >
                  <Download className="w-4 h-4 mr-1" />
                  다운로드
                </Button>
                {onRegenerate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRegenerate}
                    disabled={isRegenerating}
                    className="border-teal-200 text-teal-700 hover:bg-teal-50"
                  >
                    <RefreshCw className={`w-4 h-4 mr-1 ${isRegenerating ? 'animate-spin' : ''}`} />
                    다시 생성
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* 본문 */}
      <div
        ref={contentRef}
        className={`relative rounded-2xl border ${
          isStreaming
            ? 'border-teal-200 bg-teal-50/30'
            : 'border-[#E8E2D9] bg-white'
        } ${isEditing ? 'p-0' : 'p-6'} overflow-hidden`}
      >
        {isEditing ? (
          <Textarea
            value={editedContent}
            onChange={e => setEditedContent(e.target.value)}
            className="min-h-[400px] border-0 focus:ring-0 text-[#1E293B] leading-relaxed resize-none rounded-2xl"
          />
        ) : (
          <div
            className={`prose max-w-none text-[#1E293B] leading-relaxed whitespace-pre-wrap ${
              isStreaming ? 'max-h-[500px] overflow-y-auto' : ''
            }`}
          >
            {displayContent}
            {isStreaming && (
              <span className="inline-block w-2 h-5 bg-teal-500 animate-pulse ml-1" />
            )}
          </div>
        )}
      </div>

      {/* 하이라이트 & 제안사항 */}
      {!isStreaming && result && ((result.highlights?.length ?? 0) > 0 || (result.suggestions?.length ?? 0) > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* 강조 포인트 */}
          {result.highlights && result.highlights.length > 0 && (
            <div className="p-5 rounded-xl bg-teal-50 border border-teal-100">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <h4 className="font-medium text-teal-800">강조된 포인트</h4>
              </div>
              <ul className="space-y-2">
                {result.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-teal-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 추가 제안 */}
          {result.suggestions && result.suggestions.length > 0 && (
            <div className="p-5 rounded-xl bg-amber-50 border border-amber-100">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <h4 className="font-medium text-amber-800">추가 제안</h4>
              </div>
              <ul className="space-y-2">
                {result.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-amber-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
