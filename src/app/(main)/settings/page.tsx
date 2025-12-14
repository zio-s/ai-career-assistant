'use client';

/**
 * 설정 페이지
 * 프로필 및 AI 제공자 설정
 */

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Settings,
  User,
  Zap,
  Loader2,
  Check,
  Sparkles,
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  target_job: string | null;
  experience_level: string | null;
  preferred_ai: string | null;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  // 폼 상태
  const [name, setName] = useState('');
  const [targetJob, setTargetJob] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [preferredAi, setPreferredAi] = useState('gemini');

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      const result = await response.json();

      if (result.success && result.data) {
        const data = result.data;
        setProfile(data);
        setName(data.name || '');
        setTargetJob(data.target_job || '');
        setExperienceLevel(data.experience_level || '');
        setPreferredAi(data.preferred_ai || 'gemini');
      }
    } catch (err) {
      setError('프로필을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          target_job: targetJob || null,
          experience_level: experienceLevel || null,
          preferred_ai: preferredAi,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setError(result.error || '저장에 실패했습니다');
      }
    } catch (err) {
      setError('저장 중 오류가 발생했습니다');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-[#1E293B]">
              설정
            </h1>
            <p className="text-[#64748B]">프로필 및 AI 설정을 관리하세요</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
          {error}
        </div>
      )}

      {saveSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 text-sm text-green-600 flex items-center gap-2">
          <Check className="w-4 h-4" />
          설정이 저장되었습니다
        </div>
      )}

      <div className="space-y-6">
        {/* 프로필 섹션 */}
        <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-teal-600" />
            <h2 className="font-semibold text-[#1E293B]">프로필 정보</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#64748B]">
                이메일
              </Label>
              <Input
                id="email"
                value={profile?.email || ''}
                disabled
                className="bg-gray-50 text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#1E293B]">
                이름
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                className="border-[#E8E2D9] focus:border-teal-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetJob" className="text-[#1E293B]">
                목표 직무
              </Label>
              <Input
                id="targetJob"
                value={targetJob}
                onChange={(e) => setTargetJob(e.target.value)}
                placeholder="예: 프론트엔드 개발자, 마케팅 매니저"
                className="border-[#E8E2D9] focus:border-teal-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#1E293B]">경력 수준</Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setExperienceLevel('entry')}
                  className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-colors ${
                    experienceLevel === 'entry'
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-[#E8E2D9] text-[#64748B] hover:bg-gray-50'
                  }`}
                >
                  신입
                </button>
                <button
                  type="button"
                  onClick={() => setExperienceLevel('experienced')}
                  className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-colors ${
                    experienceLevel === 'experienced'
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-[#E8E2D9] text-[#64748B] hover:bg-gray-50'
                  }`}
                >
                  경력
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI 설정 섹션 */}
        <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-teal-600" />
            <h2 className="font-semibold text-[#1E293B]">AI 설정</h2>
          </div>

          <div className="space-y-2">
            <Label className="text-[#1E293B]">AI 제공자</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPreferredAi('gemini')}
                className={`py-4 px-4 rounded-xl border text-left transition-colors ${
                  preferredAi === 'gemini'
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-[#E8E2D9] hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-[#1E293B]">Gemini 2.5 Flash</span>
                </div>
                <p className="text-xs text-[#64748B]">Google AI - 무료</p>
              </button>
              <button
                type="button"
                onClick={() => setPreferredAi('openai')}
                className={`py-4 px-4 rounded-xl border text-left transition-colors ${
                  preferredAi === 'openai'
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-[#E8E2D9] hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-[#1E293B]">GPT-4o</span>
                </div>
                <p className="text-xs text-[#64748B]">OpenAI - 유료</p>
              </button>
            </div>
          </div>
        </div>

        {/* 저장 버튼 */}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-xl"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              저장 중...
            </>
          ) : (
            '설정 저장'
          )}
        </Button>
      </div>
    </div>
  );
}
