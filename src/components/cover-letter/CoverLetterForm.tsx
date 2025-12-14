'use client';

/**
 * 자소서 생성 폼 컴포넌트
 *
 * Warm Editorial Design
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Building2,
  Briefcase,
  FileText,
  Tags,
  User,
  Sparkles,
  X,
  Info,
} from 'lucide-react';

export interface CoverLetterFormData {
  companyName: string;
  jobPosition: string;
  jobDescription: string;
  keywords: string[];
  userBackground: string;
  tone: 'formal' | 'friendly' | 'passionate';
  maxLength: number;
}

interface CoverLetterFormProps {
  onSubmit: (data: CoverLetterFormData) => void;
  isLoading?: boolean;
  initialData?: Partial<CoverLetterFormData>;
}

const TONE_OPTIONS = [
  { value: 'formal', label: '격식체', description: '전문적이고 정중한 톤' },
  { value: 'friendly', label: '친근체', description: '따뜻하고 친근한 톤' },
  { value: 'passionate', label: '열정체', description: '적극적이고 열정적인 톤' },
] as const;

const LENGTH_OPTIONS = [
  { value: 500, label: '간단히', description: '500자' },
  { value: 1000, label: '보통', description: '1000자' },
  { value: 1500, label: '상세히', description: '1500자' },
  { value: 2000, label: '풍부히', description: '2000자' },
] as const;

export function CoverLetterForm({ onSubmit, isLoading = false, initialData }: CoverLetterFormProps) {
  const [formData, setFormData] = useState<CoverLetterFormData>({
    companyName: initialData?.companyName || '',
    jobPosition: initialData?.jobPosition || '',
    jobDescription: initialData?.jobDescription || '',
    keywords: initialData?.keywords || [],
    userBackground: initialData?.userBackground || '',
    tone: initialData?.tone || 'formal',
    maxLength: initialData?.maxLength || 1000,
  });

  const [keywordInput, setKeywordInput] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof CoverLetterFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CoverLetterFormData, string>> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = '회사명을 입력해주세요';
    }
    if (!formData.jobPosition.trim()) {
      newErrors.jobPosition = '직무를 입력해주세요';
    }
    if (!formData.jobDescription.trim()) {
      newErrors.jobDescription = '채용공고 내용을 입력해주세요';
    } else if (formData.jobDescription.length < 50) {
      newErrors.jobDescription = '채용공고 내용을 50자 이상 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const addKeyword = () => {
    const keyword = keywordInput.trim();
    if (keyword && !formData.keywords.includes(keyword) && formData.keywords.length < 10) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword],
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword),
    }));
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 기본 정보 섹션 */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-[#E8E2D9]">
          <Building2 className="w-5 h-5 text-teal-600" />
          <h2 className="font-display text-lg font-semibold text-[#1E293B]">지원 정보</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 회사명 */}
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-[#1E293B] font-medium">
              회사명 <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={e => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="예: 삼성전자"
                className="pl-12 h-12 bg-white border-[#E8E2D9] rounded-xl focus:border-teal-500 focus:ring-teal-500/20"
                disabled={isLoading}
              />
            </div>
            {errors.companyName && (
              <p className="text-sm text-red-500">{errors.companyName}</p>
            )}
          </div>

          {/* 직무 */}
          <div className="space-y-2">
            <Label htmlFor="jobPosition" className="text-[#1E293B] font-medium">
              지원 직무 <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
              <Input
                id="jobPosition"
                value={formData.jobPosition}
                onChange={e => setFormData(prev => ({ ...prev, jobPosition: e.target.value }))}
                placeholder="예: 프론트엔드 개발자"
                className="pl-12 h-12 bg-white border-[#E8E2D9] rounded-xl focus:border-teal-500 focus:ring-teal-500/20"
                disabled={isLoading}
              />
            </div>
            {errors.jobPosition && (
              <p className="text-sm text-red-500">{errors.jobPosition}</p>
            )}
          </div>
        </div>

        {/* 채용공고 */}
        <div className="space-y-2">
          <Label htmlFor="jobDescription" className="text-[#1E293B] font-medium">
            채용공고 내용 <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <FileText className="absolute left-4 top-4 w-5 h-5 text-[#94A3B8]" />
            <Textarea
              id="jobDescription"
              value={formData.jobDescription}
              onChange={e => setFormData(prev => ({ ...prev, jobDescription: e.target.value }))}
              placeholder="채용공고의 자격요건, 우대사항, 담당업무 등을 붙여넣어 주세요..."
              className="pl-12 min-h-[180px] bg-white border-[#E8E2D9] rounded-xl focus:border-teal-500 focus:ring-teal-500/20 resize-none"
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-between text-sm">
            {errors.jobDescription ? (
              <p className="text-red-500">{errors.jobDescription}</p>
            ) : (
              <p className="text-[#94A3B8]">채용공고 내용을 자세히 입력할수록 맞춤형 자소서가 생성됩니다</p>
            )}
            <span className="text-[#94A3B8]">{formData.jobDescription.length}자</span>
          </div>
        </div>
      </section>

      {/* 추가 정보 섹션 */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-[#E8E2D9]">
          <User className="w-5 h-5 text-teal-600" />
          <h2 className="font-display text-lg font-semibold text-[#1E293B]">추가 정보 (선택)</h2>
        </div>

        {/* 키워드 */}
        <div className="space-y-2">
          <Label htmlFor="keywords" className="text-[#1E293B] font-medium flex items-center gap-2">
            <Tags className="w-4 h-4" />
            강조할 키워드
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="keywords"
                value={keywordInput}
                onChange={e => setKeywordInput(e.target.value)}
                onKeyDown={handleKeywordKeyDown}
                placeholder="예: 협업능력, React, 문제해결"
                className="h-12 bg-white border-[#E8E2D9] rounded-xl focus:border-teal-500 focus:ring-teal-500/20"
                disabled={isLoading}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={addKeyword}
              disabled={isLoading || !keywordInput.trim()}
              className="h-12 px-4 border-[#E8E2D9] rounded-xl hover:bg-teal-50 hover:border-teal-300"
            >
              추가
            </Button>
          </div>
          {formData.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.keywords.map(keyword => (
                <span
                  key={keyword}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full text-sm font-medium"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => removeKeyword(keyword)}
                    className="hover:text-teal-900"
                    disabled={isLoading}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <p className="text-sm text-[#94A3B8]">자소서에 강조하고 싶은 역량이나 기술을 입력하세요 (최대 10개)</p>
        </div>

        {/* 본인 배경 */}
        <div className="space-y-2">
          <Label htmlFor="userBackground" className="text-[#1E293B] font-medium">
            본인 경력/배경
          </Label>
          <Textarea
            id="userBackground"
            value={formData.userBackground}
            onChange={e => setFormData(prev => ({ ...prev, userBackground: e.target.value }))}
            placeholder="관련 경력, 프로젝트 경험, 보유 기술 등을 간략히 작성해주세요..."
            className="min-h-[120px] bg-white border-[#E8E2D9] rounded-xl focus:border-teal-500 focus:ring-teal-500/20 resize-none"
            disabled={isLoading}
          />
          <p className="text-sm text-[#94A3B8]">입력하신 정보가 자소서에 반영됩니다</p>
        </div>
      </section>

      {/* 스타일 설정 섹션 */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-[#E8E2D9]">
          <Sparkles className="w-5 h-5 text-teal-600" />
          <h2 className="font-display text-lg font-semibold text-[#1E293B]">스타일 설정</h2>
        </div>

        {/* 톤 선택 */}
        <div className="space-y-3">
          <Label className="text-[#1E293B] font-medium">작성 톤</Label>
          <div className="grid grid-cols-3 gap-3">
            {TONE_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, tone: option.value }))}
                disabled={isLoading}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  formData.tone === option.value
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-[#E8E2D9] bg-white hover:border-teal-200'
                }`}
              >
                <p className={`font-medium ${formData.tone === option.value ? 'text-teal-700' : 'text-[#1E293B]'}`}>
                  {option.label}
                </p>
                <p className="text-sm text-[#64748B] mt-1">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 분량 선택 */}
        <div className="space-y-3">
          <Label className="text-[#1E293B] font-medium">자소서 분량</Label>
          <div className="grid grid-cols-4 gap-3">
            {LENGTH_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, maxLength: option.value }))}
                disabled={isLoading}
                className={`p-3 rounded-xl border-2 transition-all text-center ${
                  formData.maxLength === option.value
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-[#E8E2D9] bg-white hover:border-teal-200'
                }`}
              >
                <p className={`font-medium ${formData.maxLength === option.value ? 'text-teal-700' : 'text-[#1E293B]'}`}>
                  {option.label}
                </p>
                <p className="text-xs text-[#64748B] mt-0.5">{option.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 안내 메시지 */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-medium mb-1">AI 자소서 생성 안내</p>
          <p className="text-amber-700">
            생성된 자소서는 참고용으로, 반드시 본인의 경험과 스타일에 맞게 수정하여 사용하세요.
            채용공고 내용이 상세할수록 더 맞춤화된 결과물을 받을 수 있습니다.
          </p>
        </div>
      </div>

      {/* 제출 버튼 */}
      <Button
        type="submit"
        size="lg"
        isLoading={isLoading}
        disabled={isLoading}
        className="w-full h-14 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl font-medium text-lg shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all"
      >
        {isLoading ? (
          'AI가 자소서를 작성하고 있습니다...'
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            자소서 생성하기
          </>
        )}
      </Button>
    </form>
  );
}
