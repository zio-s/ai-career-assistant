/**
 * Gemini AI Provider
 *
 * Google Gemini 2.0 Flash - 무료 AI 제공자
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import type {
  AIProvider,
  AIResponse,
  GenerateCoverLetterParams,
  GenerateCoverLetterResponse,
  ReviewCoverLetterParams,
  ReviewCoverLetterResponse,
  AnalyzeResumeParams,
  AnalyzeResumeResponse,
  GenerateInterviewQuestionsParams,
  GenerateInterviewQuestionsResponse,
  StreamCallbacks,
} from './types';
import { createGeneratePrompt, createReviewPrompt } from './prompts/cover-letter';
import { createAnalyzeResumePrompt } from './prompts/resume';
import { createInterviewQuestionsPrompt } from './prompts/interview';

// Gemini 2.5 Flash - 최신 무료 모델
const GEMINI_MODEL = 'gemini-2.5-flash';

export class GeminiProvider implements AIProvider {
  readonly name = 'gemini' as const;
  private client: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GOOGLE_GEMINI_API_KEY is required');
    }
    this.client = new GoogleGenerativeAI(key);
    this.model = this.client.getGenerativeModel({ model: GEMINI_MODEL });
  }

  /**
   * JSON 응답 파싱 헬퍼
   */
  private parseJsonResponse<T>(text: string): T {
    // Remove markdown code blocks if present
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.slice(7);
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.slice(3);
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.slice(0, -3);
    }
    return JSON.parse(cleanText.trim()) as T;
  }

  /**
   * 자소서 생성
   */
  async generateCoverLetter(
    params: GenerateCoverLetterParams,
    callbacks?: StreamCallbacks
  ): Promise<AIResponse<GenerateCoverLetterResponse>> {
    try {
      const prompt = createGeneratePrompt(params);

      if (callbacks) {
        // 스트리밍 모드
        callbacks.onStart?.();
        const result = await this.model.generateContentStream(prompt);

        let fullText = '';
        for await (const chunk of result.stream) {
          const text = chunk.text();
          fullText += text;
          callbacks.onToken?.(text);
        }
        callbacks.onComplete?.(fullText);

        const data = this.parseJsonResponse<GenerateCoverLetterResponse>(fullText);
        return { success: true, data };
      } else {
        // 일반 모드
        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        const data = this.parseJsonResponse<GenerateCoverLetterResponse>(text);

        return {
          success: true,
          data,
          usage: {
            inputTokens: result.response.usageMetadata?.promptTokenCount || 0,
            outputTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
            totalTokens: result.response.usageMetadata?.totalTokenCount || 0,
          },
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      callbacks?.onError?.(error instanceof Error ? error : new Error(message));
      return { success: false, error: message };
    }
  }

  /**
   * 자소서 첨삭
   */
  async reviewCoverLetter(
    params: ReviewCoverLetterParams
  ): Promise<AIResponse<ReviewCoverLetterResponse>> {
    try {
      const prompt = createReviewPrompt(params);
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const data = this.parseJsonResponse<ReviewCoverLetterResponse>(text);

      return {
        success: true,
        data,
        usage: {
          inputTokens: result.response.usageMetadata?.promptTokenCount || 0,
          outputTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: result.response.usageMetadata?.totalTokenCount || 0,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * 이력서 분석
   */
  async analyzeResume(
    params: AnalyzeResumeParams
  ): Promise<AIResponse<AnalyzeResumeResponse>> {
    try {
      const prompt = createAnalyzeResumePrompt(params);
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const data = this.parseJsonResponse<AnalyzeResumeResponse>(text);

      return {
        success: true,
        data,
        usage: {
          inputTokens: result.response.usageMetadata?.promptTokenCount || 0,
          outputTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: result.response.usageMetadata?.totalTokenCount || 0,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * 면접 질문 생성
   */
  async generateInterviewQuestions(
    params: GenerateInterviewQuestionsParams
  ): Promise<AIResponse<GenerateInterviewQuestionsResponse>> {
    try {
      const prompt = createInterviewQuestionsPrompt(params);
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const data = this.parseJsonResponse<GenerateInterviewQuestionsResponse>(text);

      return {
        success: true,
        data,
        usage: {
          inputTokens: result.response.usageMetadata?.promptTokenCount || 0,
          outputTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: result.response.usageMetadata?.totalTokenCount || 0,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }
}
