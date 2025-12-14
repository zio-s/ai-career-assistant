export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_usage_logs: {
        Row: {
          ai_provider: string
          created_at: string | null
          error_message: string | null
          feature: string
          id: string
          input_tokens: number | null
          output_tokens: number | null
          success: boolean | null
          user_id: string
        }
        Insert: {
          ai_provider: string
          created_at?: string | null
          error_message?: string | null
          feature: string
          id?: string
          input_tokens?: number | null
          output_tokens?: number | null
          success?: boolean | null
          user_id: string
        }
        Update: {
          ai_provider?: string
          created_at?: string | null
          error_message?: string | null
          feature?: string
          id?: string
          input_tokens?: number | null
          output_tokens?: number | null
          success?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cover_letters: {
        Row: {
          ai_generated: boolean | null
          ai_provider: string | null
          company_name: string | null
          content: string
          created_at: string | null
          feedback: Json | null
          id: string
          job_description: string | null
          job_position: string | null
          resume_id: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_generated?: boolean | null
          ai_provider?: string | null
          company_name?: string | null
          content: string
          created_at?: string | null
          feedback?: Json | null
          id?: string
          job_description?: string | null
          job_position?: string | null
          resume_id?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_generated?: boolean | null
          ai_provider?: string | null
          company_name?: string | null
          content?: string
          created_at?: string | null
          feedback?: Json | null
          id?: string
          job_description?: string | null
          job_position?: string | null
          resume_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cover_letters_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cover_letters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_questions: {
        Row: {
          category: string | null
          cover_letter_id: string | null
          created_at: string | null
          difficulty: string | null
          id: string
          question: string
          suggested_answer: string | null
          user_answer: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          cover_letter_id?: string | null
          created_at?: string | null
          difficulty?: string | null
          id?: string
          question: string
          suggested_answer?: string | null
          user_answer?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          cover_letter_id?: string | null
          created_at?: string | null
          difficulty?: string | null
          id?: string
          question?: string
          suggested_answer?: string | null
          user_answer?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_questions_cover_letter_id_fkey"
            columns: ["cover_letter_id"]
            isOneToOne: false
            referencedRelation: "cover_letters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_questions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      resumes: {
        Row: {
          analysis_result: Json | null
          content: Json | null
          created_at: string | null
          file_url: string | null
          id: string
          raw_text: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analysis_result?: Json | null
          content?: Json | null
          created_at?: string | null
          file_url?: string | null
          id?: string
          raw_text?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analysis_result?: Json | null
          content?: Json | null
          created_at?: string | null
          file_url?: string | null
          id?: string
          raw_text?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resumes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          experience_level: string | null
          id: string
          name: string
          preferred_ai: string | null
          target_job: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          experience_level?: string | null
          id?: string
          name: string
          preferred_ai?: string | null
          target_job?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          experience_level?: string | null
          id?: string
          name?: string
          preferred_ai?: string | null
          target_job?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

// 편의 타입 aliases
export type User = Tables<'users'>
export type UserInsert = TablesInsert<'users'>
export type UserUpdate = TablesUpdate<'users'>

export type Resume = Tables<'resumes'>
export type ResumeInsert = TablesInsert<'resumes'>
export type ResumeUpdate = TablesUpdate<'resumes'>

export type CoverLetter = Tables<'cover_letters'>
export type CoverLetterInsert = TablesInsert<'cover_letters'>
export type CoverLetterUpdate = TablesUpdate<'cover_letters'>

export type InterviewQuestion = Tables<'interview_questions'>
export type InterviewQuestionInsert = TablesInsert<'interview_questions'>
export type InterviewQuestionUpdate = TablesUpdate<'interview_questions'>

export type AIUsageLog = Tables<'ai_usage_logs'>
export type AIUsageLogInsert = TablesInsert<'ai_usage_logs'>
export type AIUsageLogUpdate = TablesUpdate<'ai_usage_logs'>

// AI Provider 타입
export type AIProvider = 'gemini' | 'openai'
export type ExperienceLevel = 'entry' | 'experienced'
export type CoverLetterStatus = 'draft' | 'completed' | 'archived'
export type QuestionCategory = 'technical' | 'behavioral' | 'experience' | 'situational'
export type QuestionDifficulty = 'easy' | 'medium' | 'hard'
export type AIFeature = 'cover_letter_generate' | 'cover_letter_review' | 'resume_analyze' | 'interview_generate'
