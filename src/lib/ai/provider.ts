/**
 * AI Provider Factory
 *
 * AI 제공자 생성 및 관리
 */

import type { AIProvider, AIProviderType } from './types';
import { GeminiProvider } from './gemini';
import { OpenAIProvider } from './openai';

// 기본 AI 제공자 (무료)
export const DEFAULT_AI_PROVIDER: AIProviderType = 'gemini';

// 제공자 인스턴스 캐시
const providerCache = new Map<AIProviderType, AIProvider>();

/**
 * AI Provider 생성
 */
export function createAIProvider(type: AIProviderType = DEFAULT_AI_PROVIDER): AIProvider {
  // 캐시에서 확인
  const cached = providerCache.get(type);
  if (cached) {
    return cached;
  }

  // 새 인스턴스 생성
  let provider: AIProvider;

  switch (type) {
    case 'gemini':
      provider = new GeminiProvider();
      break;
    case 'openai':
      provider = new OpenAIProvider();
      break;
    default:
      throw new Error(`Unknown AI provider type: ${type}`);
  }

  // 캐시에 저장
  providerCache.set(type, provider);

  return provider;
}

/**
 * 기본 AI Provider 가져오기
 */
export function getDefaultProvider(): AIProvider {
  return createAIProvider(DEFAULT_AI_PROVIDER);
}

/**
 * 사용 가능한 AI Provider 목록
 */
export function getAvailableProviders(): { type: AIProviderType; name: string; description: string }[] {
  return [
    {
      type: 'gemini',
      name: 'Google Gemini',
      description: '무료 AI - Google Gemini 2.0 Flash (기본값)',
    },
    {
      type: 'openai',
      name: 'OpenAI GPT',
      description: '유료 AI - OpenAI GPT-4o-mini',
    },
  ];
}

/**
 * Provider 가용성 확인
 */
export function isProviderAvailable(type: AIProviderType): boolean {
  try {
    switch (type) {
      case 'gemini':
        return !!(process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY);
      case 'openai':
        return !!process.env.OPENAI_API_KEY;
      default:
        return false;
    }
  } catch {
    return false;
  }
}

// Re-export types and classes
export * from './types';
export { GeminiProvider } from './gemini';
export { OpenAIProvider } from './openai';
