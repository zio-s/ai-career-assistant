'use client';

/**
 * 자소서 생성 페이지
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CoverLetterForm, CoverLetterFormData, CoverLetterResult } from '@/components/cover-letter';
import { ArrowLeft, FileText, Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GenerateCoverLetterResponse } from '@/lib/ai/types';

export default function NewCoverLetterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const [result, setResult] = useState<GenerateCoverLetterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CoverLetterFormData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = useCallback(async (data: CoverLetterFormData) => {
    setIsLoading(true);
    setIsStreaming(true);
    setStreamContent('');
    setResult(null);
    setError(null);
    setFormData(data);
    setIsSaved(false);

    try {
      const params = new URLSearchParams({
        stream: 'true',
        jobDescription: data.jobDescription,
        companyName: data.companyName,
        jobPosition: data.jobPosition,
        tone: data.tone,
        maxLength: data.maxLength.toString(),
      });

      if (data.keywords.length > 0) {
        params.set('keywords', data.keywords.join(','));
      }
      if (data.userBackground) {
        params.set('userBackground', data.userBackground);
      }

      const response = await fetch(`/api/ai/generate-cover-letter?${params.toString()}`);

      if (!response.ok) {
        throw new Error('자소서 생성에 실패했습니다');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('스트리밍을 시작할 수 없습니다');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.slice(6));

              if (eventData.token) {
                fullContent += eventData.token;
                setStreamContent(fullContent);
              }

              if (eventData.fullText) {
                try {
                  const parsed = parseJsonFromStream(eventData.fullText);
                  setResult(parsed);
                } catch {
                  setResult({
                    content: eventData.fullText,
                    highlights: [],
                    suggestions: [],
                  });
                }
              }

              if (eventData.error) {
                throw new Error(eventData.error);
              }
            } catch {
              // JSON 파싱 에러는 무시
            }
          }
        }
      }
    } catch (err) {
      console.error('Cover letter generation error:', err);
      setError(err instanceof Error ? err.message : '자소서 생성 중 오류가 발생했습니다');

      // 폴백
      try {
        const response = await fetch('/api/ai/generate-cover-letter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            provider: 'gemini',
          }),
        });

        const apiResult = await response.json();

        if (apiResult.success) {
          setResult(apiResult.data);
          setError(null);
        } else {
          setError(apiResult.error || '자소서 생성에 실패했습니다');
        }
      } catch {
        setError('자소서 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, []);

  const handleRegenerate = useCallback(() => {
    if (formData) {
      handleSubmit(formData);
    }
  }, [formData, handleSubmit]);

  const handleSave = useCallback(async (content: string) => {
    if (!formData) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/cover-letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${formData.companyName} ${formData.jobPosition}`,
          companyName: formData.companyName,
          jobPosition: formData.jobPosition,
          jobDescription: formData.jobDescription,
          content,
          aiGenerated: true,
          aiProvider: 'gemini',
        }),
      });

      const saveResult = await response.json();

      if (saveResult.success) {
        setIsSaved(true);
        setTimeout(() => {
          router.push('/cover-letter');
        }, 1000);
      } else {
        setError(saveResult.error || '저장에 실패했습니다');
      }
    } catch {
      setError('저장에 실패했습니다');
    } finally {
      setIsSaving(false);
    }
  }, [formData, router]);

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
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-[#1E293B]">
              새 자소서 작성
            </h1>
            <p className="text-[#64748B]">
              AI가 맞춤형 자소서를 작성해드립니다
            </p>
          </div>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 animate-scale-in">
          {error}
        </div>
      )}

      {/* 결과가 있으면 결과 표시, 없으면 폼 표시 */}
      {(result || isStreaming) ? (
        <div className="space-y-6">
          <CoverLetterResult
            result={result}
            isStreaming={isStreaming}
            streamContent={streamContent}
            onRegenerate={handleRegenerate}
            onSave={handleSave}
            isRegenerating={isLoading}
          />

          {/* 저장 버튼 */}
          {result && !isStreaming && (
            <div className="flex justify-center gap-4 pt-4">
              <Button
                onClick={() => handleSave(result.content)}
                disabled={isSaving || isSaved}
                className={`rounded-xl ${
                  isSaved
                    ? 'bg-green-600 hover:bg-green-600'
                    : 'bg-teal-600 hover:bg-teal-700'
                }`}
              >
                {isSaved ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    저장 완료
                  </>
                ) : isSaving ? (
                  <>저장 중...</>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    저장하기
                  </>
                )}
              </Button>
              <button
                onClick={() => {
                  setResult(null);
                  setStreamContent('');
                  setFormData(null);
                  setIsSaved(false);
                }}
                className="text-[#64748B] hover:text-[#1E293B] underline underline-offset-4"
              >
                다른 자소서 작성하기
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8E2D9] p-8 shadow-sm">
          <CoverLetterForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            initialData={formData || undefined}
          />
        </div>
      )}
    </div>
  );
}

function parseJsonFromStream(text: string): GenerateCoverLetterResponse {
  let cleanText = text.trim();

  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.slice(7);
  } else if (cleanText.startsWith('```')) {
    cleanText = cleanText.slice(3);
  }
  if (cleanText.endsWith('```')) {
    cleanText = cleanText.slice(0, -3);
  }

  return JSON.parse(cleanText.trim());
}
