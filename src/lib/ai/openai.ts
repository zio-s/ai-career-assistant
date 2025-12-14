/**
 * OpenAI Provider
 *
 * OpenAI GPT-4o - 유료 AI 제공자 (선택)
 */

import OpenAI from 'openai';
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

const OPENAI_MODEL = 'gpt-4o-mini'; // Cost-effective option

export class OpenAIProvider implements AIProvider {
  readonly name = 'openai' as const;
  private client: OpenAI;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error('OPENAI_API_KEY is required');
    }
    this.client = new OpenAI({ apiKey: key });
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
        const stream = await this.client.chat.completions.create({
          model: OPENAI_MODEL,
          messages: [{ role: 'user', content: prompt }],
          stream: true,
          response_format: { type: 'json_object' },
        });

        let fullText = '';
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || '';
          fullText += text;
          callbacks.onToken?.(text);
        }
        callbacks.onComplete?.(fullText);

        const data = this.parseJsonResponse<GenerateCoverLetterResponse>(fullText);
        return { success: true, data };
      } else {
        // 일반 모드
        const result = await this.client.chat.completions.create({
          model: OPENAI_MODEL,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        });

        const text = result.choices[0]?.message?.content || '';
        const data = this.parseJsonResponse<GenerateCoverLetterResponse>(text);

        return {
          success: true,
          data,
          usage: {
            inputTokens: result.usage?.prompt_tokens || 0,
            outputTokens: result.usage?.completion_tokens || 0,
            totalTokens: result.usage?.total_tokens || 0,
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
      const result = await this.client.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      const text = result.choices[0]?.message?.content || '';
      const data = this.parseJsonResponse<ReviewCoverLetterResponse>(text);

      return {
        success: true,
        data,
        usage: {
          inputTokens: result.usage?.prompt_tokens || 0,
          outputTokens: result.usage?.completion_tokens || 0,
          totalTokens: result.usage?.total_tokens || 0,
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
      const result = await this.client.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      const text = result.choices[0]?.message?.content || '';
      const data = this.parseJsonResponse<AnalyzeResumeResponse>(text);

      return {
        success: true,
        data,
        usage: {
          inputTokens: result.usage?.prompt_tokens || 0,
          outputTokens: result.usage?.completion_tokens || 0,
          totalTokens: result.usage?.total_tokens || 0,
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
      const result = await this.client.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      const text = result.choices[0]?.message?.content || '';
      const data = this.parseJsonResponse<GenerateInterviewQuestionsResponse>(text);

      return {
        success: true,
        data,
        usage: {
          inputTokens: result.usage?.prompt_tokens || 0,
          outputTokens: result.usage?.completion_tokens || 0,
          totalTokens: result.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }
}
