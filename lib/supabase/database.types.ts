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
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      account_security_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          active_request: string | null
          active_until: string | null
          archived: boolean
          context: Json
          created_at: string
          hint_depth: number
          id: string
          mode: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active_request?: string | null
          active_until?: string | null
          archived?: boolean
          context?: Json
          created_at?: string
          hint_depth?: number
          id?: string
          mode?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active_request?: string | null
          active_until?: string | null
          archived?: boolean
          context?: Json
          created_at?: string
          hint_depth?: number
          id?: string
          mode?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_feedback: {
        Row: {
          created_at: string
          message_id: string
          rating: string
          user_id: string
        }
        Insert: {
          created_at?: string
          message_id: string
          rating: string
          user_id: string
        }
        Update: {
          created_at?: string
          message_id?: string
          rating?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_feedback_message_id_user_id_fkey"
            columns: ["message_id", "user_id"]
            isOneToOne: true
            referencedRelation: "ai_messages"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          completed_at: string | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          input_tokens: number | null
          intent: string
          latency_ms: number | null
          model: string | null
          ordinal: number
          output_tokens: number | null
          parts: Json
          prompt_version: string | null
          request_id: string | null
          role: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          content?: string
          conversation_id: string
          created_at?: string
          id?: string
          input_tokens?: number | null
          intent?: string
          latency_ms?: number | null
          model?: string | null
          ordinal: number
          output_tokens?: number | null
          parts?: Json
          prompt_version?: string | null
          request_id?: string | null
          role: string
          status: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          input_tokens?: number | null
          intent?: string
          latency_ms?: number | null
          model?: string | null
          ordinal?: number
          output_tokens?: number | null
          parts?: Json
          prompt_version?: string | null
          request_id?: string | null
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_user_id_fkey"
            columns: ["conversation_id", "user_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      ai_tool_calls: {
        Row: {
          completed_at: string | null
          conversation_id: string
          created_at: string
          expires_at: string
          id: string
          input: Json
          message_id: string
          result: Json | null
          status: string
          tool_name: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          conversation_id: string
          created_at?: string
          expires_at?: string
          id?: string
          input: Json
          message_id: string
          result?: Json | null
          status?: string
          tool_name: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          conversation_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          input?: Json
          message_id?: string
          result?: Json | null
          status?: string
          tool_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tool_calls_conversation_id_user_id_fkey"
            columns: ["conversation_id", "user_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "ai_tool_calls_message_id_user_id_fkey"
            columns: ["message_id", "user_id"]
            isOneToOne: false
            referencedRelation: "ai_messages"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      ai_usage_buckets: {
        Row: {
          bucket: string
          used: number
          user_id: string
        }
        Insert: {
          bucket: string
          used?: number
          user_id: string
        }
        Update: {
          bucket?: string
          used?: number
          user_id?: string
        }
        Relationships: []
      }
      aptitude_assessment_attempts: {
        Row: {
          answers_summary: Json
          assessment_id: string
          auto_submitted: boolean
          completed_at: string | null
          created_at: string
          id: string
          score_achieved: number
          sectional_breakdown: Json
          started_at: string
          time_spent_seconds: number
          total_possible: number
          user_id: string
        }
        Insert: {
          answers_summary?: Json
          assessment_id: string
          auto_submitted?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          score_achieved?: number
          sectional_breakdown?: Json
          started_at?: string
          time_spent_seconds?: number
          total_possible?: number
          user_id: string
        }
        Update: {
          answers_summary?: Json
          assessment_id?: string
          auto_submitted?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          score_achieved?: number
          sectional_breakdown?: Json
          started_at?: string
          time_spent_seconds?: number
          total_possible?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aptitude_assessment_attempts_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "aptitude_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      aptitude_assessments: {
        Row: {
          assessment_type: string
          blueprint: Json
          created_at: string
          day_number: number
          id: string
          passing_percentage: number
          question_ids: string[]
          time_limit_minutes: number
          title: string
          total_marks: number
          track_slug: string
        }
        Insert: {
          assessment_type: string
          blueprint?: Json
          created_at?: string
          day_number: number
          id: string
          passing_percentage?: number
          question_ids?: string[]
          time_limit_minutes?: number
          title: string
          total_marks?: number
          track_slug: string
        }
        Update: {
          assessment_type?: string
          blueprint?: Json
          created_at?: string
          day_number?: number
          id?: string
          passing_percentage?: number
          question_ids?: string[]
          time_limit_minutes?: number
          title?: string
          total_marks?: number
          track_slug?: string
        }
        Relationships: []
      }
      aptitude_attempts: {
        Row: {
          confidence: number | null
          created_at: string
          hints_used: number
          id: string
          is_correct: boolean
          question_id: string
          selected_option_index: number | null
          session_id: string
          time_taken_ms: number
          topic_id: string
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          hints_used?: number
          id?: string
          is_correct: boolean
          question_id: string
          selected_option_index?: number | null
          session_id: string
          time_taken_ms?: number
          topic_id: string
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          hints_used?: number
          id?: string
          is_correct?: boolean
          question_id?: string
          selected_option_index?: number | null
          session_id?: string
          time_taken_ms?: number
          topic_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aptitude_attempts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "aptitude_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aptitude_attempts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "aptitude_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      aptitude_content_audit: {
        Row: {
          action: string
          after_state: Json | null
          before_state: Json | null
          created_at: string
          editor_id: string
          entity_id: string
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string
          editor_id: string
          entity_id: string
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string
          editor_id?: string
          entity_id?: string
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      aptitude_days: {
        Row: {
          created_at: string
          day_number: number
          description: string
          estimated_minutes: number
          id: string
          is_assessment_day: boolean
          sort_order: number
          subtitle: string
          title: string
          track_id: string
        }
        Insert: {
          created_at?: string
          day_number: number
          description?: string
          estimated_minutes?: number
          id: string
          is_assessment_day?: boolean
          sort_order: number
          subtitle?: string
          title: string
          track_id: string
        }
        Update: {
          created_at?: string
          day_number?: number
          description?: string
          estimated_minutes?: number
          id?: string
          is_assessment_day?: boolean
          sort_order?: number
          subtitle?: string
          title?: string
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aptitude_days_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "aptitude_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      aptitude_enrollments: {
        Row: {
          created_at: string
          current_day: number
          id: string
          is_paused: boolean
          pacing: string
          start_date: string
          target_completion_date: string | null
          template_version: string
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_day?: number
          id?: string
          is_paused?: boolean
          pacing?: string
          start_date?: string
          target_completion_date?: string | null
          template_version?: string
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_day?: number
          id?: string
          is_paused?: boolean
          pacing?: string
          start_date?: string
          target_completion_date?: string | null
          template_version?: string
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      aptitude_questions: {
        Row: {
          correct_option_index: number
          created_at: string
          difficulty: string
          distractor_rationales: Json
          formula_used: string | null
          id: string
          is_published: boolean
          options: Json
          provenance: string
          question_text: string
          question_type: string
          solution_explanation: string
          topic_id: string
          track_slug: string
        }
        Insert: {
          correct_option_index: number
          created_at?: string
          difficulty?: string
          distractor_rationales?: Json
          formula_used?: string | null
          id: string
          is_published?: boolean
          options?: Json
          provenance?: string
          question_text: string
          question_type?: string
          solution_explanation?: string
          topic_id: string
          track_slug: string
        }
        Update: {
          correct_option_index?: number
          created_at?: string
          difficulty?: string
          distractor_rationales?: Json
          formula_used?: string | null
          id?: string
          is_published?: boolean
          options?: Json
          provenance?: string
          question_text?: string
          question_type?: string
          solution_explanation?: string
          topic_id?: string
          track_slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "aptitude_questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "aptitude_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      aptitude_resource_reports: {
        Row: {
          created_at: string
          id: string
          issue_type: string
          note: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          topic_id: string
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          issue_type: string
          note?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          topic_id: string
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          issue_type?: string
          note?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          topic_id?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aptitude_resource_reports_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "aptitude_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      aptitude_topic_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          is_bookmarked: boolean
          last_activity_at: string
          needs_revision: boolean
          status: string
          topic_id: string
          updated_at: string
          user_id: string
          user_notes: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_bookmarked?: boolean
          last_activity_at?: string
          needs_revision?: boolean
          status?: string
          topic_id: string
          updated_at?: string
          user_id: string
          user_notes?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_bookmarked?: boolean
          last_activity_at?: string
          needs_revision?: boolean
          status?: string
          topic_id?: string
          updated_at?: string
          user_id?: string
          user_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aptitude_topic_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "aptitude_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      aptitude_topic_videos: {
        Row: {
          coverage_notes: string | null
          created_at: string
          id: string
          rank: number
          role: string
          topic_id: string
          video_id: string
        }
        Insert: {
          coverage_notes?: string | null
          created_at?: string
          id?: string
          rank?: number
          role?: string
          topic_id: string
          video_id: string
        }
        Update: {
          coverage_notes?: string | null
          created_at?: string
          id?: string
          rank?: number
          role?: string
          topic_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aptitude_topic_videos_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "aptitude_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aptitude_topic_videos_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "aptitude_videos"
            referencedColumns: ["video_id"]
          },
        ]
      }
      aptitude_topics: {
        Row: {
          concept_checklist: string[]
          created_at: string
          day_id: string
          day_number: number
          difficulty: string
          estimated_minutes: number
          formula_notes: string | null
          id: string
          objectives: string[]
          order_index: number
          prerequisites: string[]
          priority: string
          title: string
          track_slug: string
        }
        Insert: {
          concept_checklist?: string[]
          created_at?: string
          day_id: string
          day_number: number
          difficulty?: string
          estimated_minutes?: number
          formula_notes?: string | null
          id: string
          objectives?: string[]
          order_index: number
          prerequisites?: string[]
          priority?: string
          title: string
          track_slug: string
        }
        Update: {
          concept_checklist?: string[]
          created_at?: string
          day_id?: string
          day_number?: number
          difficulty?: string
          estimated_minutes?: number
          formula_notes?: string | null
          id?: string
          objectives?: string[]
          order_index?: number
          prerequisites?: string[]
          priority?: string
          title?: string
          track_slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "aptitude_topics_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "aptitude_days"
            referencedColumns: ["id"]
          },
        ]
      }
      aptitude_tracks: {
        Row: {
          color: string
          created_at: string
          description: string
          id: string
          order_index: number
          slug: string
          title: string
        }
        Insert: {
          color?: string
          created_at?: string
          description: string
          id: string
          order_index: number
          slug: string
          title: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string
          id?: string
          order_index?: number
          slug?: string
          title?: string
        }
        Relationships: []
      }
      aptitude_video_progress: {
        Row: {
          created_at: string
          id: string
          topic_id: string
          updated_at: string
          user_confirmed: boolean
          user_id: string
          video_id: string
          watched: boolean
          watched_at: string | null
          watched_seconds: number
        }
        Insert: {
          created_at?: string
          id?: string
          topic_id: string
          updated_at?: string
          user_confirmed?: boolean
          user_id: string
          video_id: string
          watched?: boolean
          watched_at?: string | null
          watched_seconds?: number
        }
        Update: {
          created_at?: string
          id?: string
          topic_id?: string
          updated_at?: string
          user_confirmed?: boolean
          user_id?: string
          video_id?: string
          watched?: boolean
          watched_at?: string | null
          watched_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "aptitude_video_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "aptitude_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aptitude_video_progress_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "aptitude_videos"
            referencedColumns: ["video_id"]
          },
        ]
      }
      aptitude_videos: {
        Row: {
          availability: string
          canonical_url: string
          channel_title: string
          created_at: string
          default_audio_language: string | null
          default_language: string | null
          duration_formatted: string
          duration_seconds: number
          embeddable: boolean
          review_notes: string | null
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          spoken_english_verified: boolean
          title: string
          topic_coverage_verified: boolean
          updated_at: string
          video_id: string
        }
        Insert: {
          availability?: string
          canonical_url: string
          channel_title?: string
          created_at?: string
          default_audio_language?: string | null
          default_language?: string | null
          duration_formatted?: string
          duration_seconds?: number
          embeddable?: boolean
          review_notes?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          spoken_english_verified?: boolean
          title: string
          topic_coverage_verified?: boolean
          updated_at?: string
          video_id: string
        }
        Update: {
          availability?: string
          canonical_url?: string
          channel_title?: string
          created_at?: string
          default_audio_language?: string | null
          default_language?: string | null
          duration_formatted?: string
          duration_seconds?: number
          embeddable?: boolean
          review_notes?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          spoken_english_verified?: boolean
          title?: string
          topic_coverage_verified?: boolean
          updated_at?: string
          video_id?: string
        }
        Relationships: []
      }
      availability_exceptions: {
        Row: {
          available_minutes: number
          created_at: string
          exception_date: string
          id: string
          is_unavailable: boolean
          reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          available_minutes?: number
          created_at?: string
          exception_date: string
          id?: string
          is_unavailable?: boolean
          reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          available_minutes?: number
          created_at?: string
          exception_date?: string
          id?: string
          is_unavailable?: boolean
          reason?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      availability_rules: {
        Row: {
          available_minutes: number
          created_at: string
          day_of_week: number
          id: string
          is_rest_day: boolean
          preferred_end_time: string | null
          preferred_start_time: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          available_minutes?: number
          created_at?: string
          day_of_week: number
          id?: string
          is_rest_day?: boolean
          preferred_end_time?: string | null
          preferred_start_time?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          available_minutes?: number
          created_at?: string
          day_of_week?: number
          id?: string
          is_rest_day?: boolean
          preferred_end_time?: string | null
          preferred_start_time?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      company_problem_stats: {
        Row: {
          acceptance_rate: number | null
          company_id: string
          created_at: string
          frequency: number | null
          id: string
          is_active: boolean
          problem_id: string
          raw_acceptance_rate: string | null
          raw_frequency: string | null
          source_id: string | null
          source_metadata: Json
          source_revision: string | null
          source_updated_at: string | null
          time_window: string
          updated_at: string
        }
        Insert: {
          acceptance_rate?: number | null
          company_id: string
          created_at?: string
          frequency?: number | null
          id?: string
          is_active?: boolean
          problem_id: string
          raw_acceptance_rate?: string | null
          raw_frequency?: string | null
          source_id?: string | null
          source_metadata?: Json
          source_revision?: string | null
          source_updated_at?: string | null
          time_window: string
          updated_at?: string
        }
        Update: {
          acceptance_rate?: number | null
          company_id?: string
          created_at?: string
          frequency?: number | null
          id?: string
          is_active?: boolean
          problem_id?: string
          raw_acceptance_rate?: string | null
          raw_frequency?: string | null
          source_id?: string | null
          source_metadata?: Json
          source_revision?: string | null
          source_updated_at?: string | null
          time_window?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_problem_stats_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_problem_stats_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_problem_stats_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "content_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      content_sources: {
        Row: {
          approval: Json | null
          attribution_required: boolean
          created_at: string
          id: string
          last_checked_at: string
          license: string | null
          license_url: string | null
          name: string
          redistribution_status: string
          repository_url: string | null
          revision: string
          slug: string
          source_type: string
          updated_at: string
        }
        Insert: {
          approval?: Json | null
          attribution_required?: boolean
          created_at?: string
          id?: string
          last_checked_at: string
          license?: string | null
          license_url?: string | null
          name: string
          redistribution_status: string
          repository_url?: string | null
          revision: string
          slug: string
          source_type: string
          updated_at?: string
        }
        Update: {
          approval?: Json | null
          attribution_required?: boolean
          created_at?: string
          id?: string
          last_checked_at?: string
          license?: string | null
          license_url?: string | null
          name?: string
          redistribution_status?: string
          repository_url?: string | null
          revision?: string
          slug?: string
          source_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      curricula: {
        Row: {
          created_at: string
          description: string | null
          estimated_problem_count: number
          id: string
          name: string
          slug: string
          status: string
          updated_at: string
          version: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          estimated_problem_count?: number
          id?: string
          name: string
          slug: string
          status?: string
          updated_at?: string
          version?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          estimated_problem_count?: number
          id?: string
          name?: string
          slug?: string
          status?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      curriculum_dependencies: {
        Row: {
          created_at: string
          curriculum_id: string
          dependency_type: string
          dependent_item_id: string
          id: string
          prerequisite_item_id: string
        }
        Insert: {
          created_at?: string
          curriculum_id: string
          dependency_type?: string
          dependent_item_id: string
          id?: string
          prerequisite_item_id: string
        }
        Update: {
          created_at?: string
          curriculum_id?: string
          dependency_type?: string
          dependent_item_id?: string
          id?: string
          prerequisite_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "curriculum_dependencies_curriculum_id_fkey"
            columns: ["curriculum_id"]
            isOneToOne: false
            referencedRelation: "curricula"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curriculum_dependencies_dependent_item_id_fkey"
            columns: ["dependent_item_id"]
            isOneToOne: false
            referencedRelation: "curriculum_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curriculum_dependencies_prerequisite_item_id_fkey"
            columns: ["prerequisite_item_id"]
            isOneToOne: false
            referencedRelation: "curriculum_items"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculum_items: {
        Row: {
          created_at: string
          curriculum_id: string
          id: string
          is_checkpoint: boolean
          is_required: boolean
          priority: string
          problem_id: string
          recommended_minutes: number
          selection_reason: string
          sequence: number
          stage_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          curriculum_id: string
          id?: string
          is_checkpoint?: boolean
          is_required?: boolean
          priority?: string
          problem_id: string
          recommended_minutes?: number
          selection_reason: string
          sequence: number
          stage_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          curriculum_id?: string
          id?: string
          is_checkpoint?: boolean
          is_required?: boolean
          priority?: string
          problem_id?: string
          recommended_minutes?: number
          selection_reason?: string
          sequence?: number
          stage_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "curriculum_items_curriculum_id_fkey"
            columns: ["curriculum_id"]
            isOneToOne: false
            referencedRelation: "curricula"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curriculum_items_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curriculum_items_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "curriculum_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculum_stages: {
        Row: {
          created_at: string
          curriculum_id: string
          description: string | null
          estimated_minutes: number
          estimated_problem_count: number
          id: string
          name: string
          sequence: number
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          curriculum_id: string
          description?: string | null
          estimated_minutes?: number
          estimated_problem_count?: number
          id?: string
          name: string
          sequence: number
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          curriculum_id?: string
          description?: string | null
          estimated_minutes?: number
          estimated_problem_count?: number
          id?: string
          name?: string
          sequence?: number
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "curriculum_stages_curriculum_id_fkey"
            columns: ["curriculum_id"]
            isOneToOne: false
            referencedRelation: "curricula"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_plans: {
        Row: {
          available_minutes: number
          completed_minutes: number
          created_at: string
          day_number: number
          id: string
          is_rest_day: boolean
          plan_date: string
          planned_minutes: number
          preparation_plan_id: string | null
          status: string
          updated_at: string
          user_id: string
          utilization_rate: number
        }
        Insert: {
          available_minutes?: number
          completed_minutes?: number
          created_at?: string
          day_number: number
          id?: string
          is_rest_day?: boolean
          plan_date: string
          planned_minutes?: number
          preparation_plan_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
          utilization_rate?: number
        }
        Update: {
          available_minutes?: number
          completed_minutes?: number
          created_at?: string
          day_number?: number
          id?: string
          is_rest_day?: boolean
          plan_date?: string
          planned_minutes?: number
          preparation_plan_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          utilization_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_plans_preparation_plan_id_fkey"
            columns: ["preparation_plan_id"]
            isOneToOne: false
            referencedRelation: "preparation_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_tasks: {
        Row: {
          carried_from_task_id: string | null
          carry_count: number
          completed_at: string | null
          completed_minutes: number
          created_at: string
          curriculum_item_id: string | null
          daily_plan_id: string
          decision_metadata: Json | null
          id: string
          is_locked: boolean
          original_date: string | null
          planned_minutes: number
          planning_intent_id: string | null
          priority: string
          problem_id: string | null
          revision_item_id: string | null
          scheduled_reason: string | null
          sort_order: number
          source: string
          status: string
          task_type: string
          title: string
          topic_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          carried_from_task_id?: string | null
          carry_count?: number
          completed_at?: string | null
          completed_minutes?: number
          created_at?: string
          curriculum_item_id?: string | null
          daily_plan_id: string
          decision_metadata?: Json | null
          id?: string
          is_locked?: boolean
          original_date?: string | null
          planned_minutes?: number
          planning_intent_id?: string | null
          priority?: string
          problem_id?: string | null
          revision_item_id?: string | null
          scheduled_reason?: string | null
          sort_order?: number
          source?: string
          status?: string
          task_type: string
          title: string
          topic_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          carried_from_task_id?: string | null
          carry_count?: number
          completed_at?: string | null
          completed_minutes?: number
          created_at?: string
          curriculum_item_id?: string | null
          daily_plan_id?: string
          decision_metadata?: Json | null
          id?: string
          is_locked?: boolean
          original_date?: string | null
          planned_minutes?: number
          planning_intent_id?: string | null
          priority?: string
          problem_id?: string | null
          revision_item_id?: string | null
          scheduled_reason?: string | null
          sort_order?: number
          source?: string
          status?: string
          task_type?: string
          title?: string
          topic_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_tasks_carried_from_task_id_fkey"
            columns: ["carried_from_task_id"]
            isOneToOne: false
            referencedRelation: "daily_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_tasks_curriculum_item_id_fkey"
            columns: ["curriculum_item_id"]
            isOneToOne: false
            referencedRelation: "curriculum_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_tasks_daily_plan_id_fkey"
            columns: ["daily_plan_id"]
            isOneToOne: false
            referencedRelation: "daily_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_tasks_intent_owner_fkey"
            columns: ["planning_intent_id", "user_id"]
            isOneToOne: false
            referencedRelation: "planning_intents"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "daily_tasks_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_tasks_revision_item_id_fkey"
            columns: ["revision_item_id"]
            isOneToOne: false
            referencedRelation: "revision_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_tasks_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "roadmap_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      dsa_import_runs: {
        Row: {
          id: string
          imported_at: string
          report: Json
          snapshot_hash: string
          source_revisions: Json
        }
        Insert: {
          id?: string
          imported_at?: string
          report: Json
          snapshot_hash: string
          source_revisions: Json
        }
        Update: {
          id?: string
          imported_at?: string
          report?: Json
          snapshot_hash?: string
          source_revisions?: Json
        }
        Relationships: []
      }
      dsa_problem_aliases: {
        Row: {
          alias: string
          created_at: string
          normalized_alias: string
          problem_id: string
          reason: string
          updated_at: string
        }
        Insert: {
          alias: string
          created_at?: string
          normalized_alias: string
          problem_id: string
          reason: string
          updated_at?: string
        }
        Update: {
          alias?: string
          created_at?: string
          normalized_alias?: string
          problem_id?: string
          reason?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dsa_problem_aliases_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      dsa_problem_identities: {
        Row: {
          created_at: string
          identity_key: string
          problem_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          identity_key: string
          problem_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          identity_key?: string
          problem_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dsa_problem_identities_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      dsa_problem_sources: {
        Row: {
          created_at: string
          id: string
          imported_at: string
          is_active: boolean
          problem_id: string
          source_id: string
          source_metadata: Json
          source_problem_id: string
          source_revision: string
          source_title: string
          source_url: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          imported_at?: string
          is_active?: boolean
          problem_id: string
          source_id: string
          source_metadata?: Json
          source_problem_id: string
          source_revision: string
          source_title: string
          source_url: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          imported_at?: string
          is_active?: boolean
          problem_id?: string
          source_id?: string
          source_metadata?: Json
          source_problem_id?: string
          source_revision?: string
          source_title?: string
          source_url?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dsa_problem_sources_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dsa_problem_sources_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "content_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_course_days: {
        Row: {
          course_id: string
          created_at: string
          day_number: number
          description: string
          difficulty: string
          estimated_minutes: number
          id: string
          importance: string
          interview_questions: string[]
          learning_outcomes: string[]
          practical_assignment: Json
          sort_order: number
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          day_number: number
          description: string
          difficulty?: string
          estimated_minutes?: number
          id?: string
          importance?: string
          interview_questions?: string[]
          learning_outcomes?: string[]
          practical_assignment?: Json
          sort_order: number
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          day_number?: number
          description?: string
          difficulty?: string
          estimated_minutes?: number
          id?: string
          importance?: string
          interview_questions?: string[]
          learning_outcomes?: string[]
          practical_assignment?: Json
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_course_days_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "learning_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_courses: {
        Row: {
          created_at: string
          description: string
          difficulty: string
          estimated_days: number
          estimated_minutes: number
          id: string
          slug: string
          status: string
          subject: string
          title: string
          updated_at: string
          version: string
        }
        Insert: {
          created_at?: string
          description: string
          difficulty?: string
          estimated_days?: number
          estimated_minutes?: number
          id?: string
          slug: string
          status?: string
          subject?: string
          title: string
          updated_at?: string
          version?: string
        }
        Update: {
          created_at?: string
          description?: string
          difficulty?: string
          estimated_days?: number
          estimated_minutes?: number
          id?: string
          slug?: string
          status?: string
          subject?: string
          title?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      learning_day_progress: {
        Row: {
          assignment_completed: boolean
          assignment_notes: string | null
          completed_at: string | null
          course_day_id: string | null
          course_slug: string | null
          created_at: string
          day_number: number | null
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assignment_completed?: boolean
          assignment_notes?: string | null
          completed_at?: string | null
          course_day_id?: string | null
          course_slug?: string | null
          created_at?: string
          day_number?: number | null
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assignment_completed?: boolean
          assignment_notes?: string | null
          completed_at?: string | null
          course_day_id?: string | null
          course_slug?: string | null
          created_at?: string
          day_number?: number | null
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      learning_day_videos: {
        Row: {
          course_day_id: string
          id: string
          is_required: boolean
          sort_order: number
          video_id: string
        }
        Insert: {
          course_day_id: string
          id?: string
          is_required?: boolean
          sort_order: number
          video_id: string
        }
        Update: {
          course_day_id?: string
          id?: string
          is_required?: boolean
          sort_order?: number
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_day_videos_course_day_id_fkey"
            columns: ["course_day_id"]
            isOneToOne: false
            referencedRelation: "learning_course_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_day_videos_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "learning_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_design_attempts: {
        Row: {
          case_id: string
          completed_at: string
          id: string
          notes: string | null
          rubric_scores: Json
          self_assessment: string | null
          user_id: string
        }
        Insert: {
          case_id: string
          completed_at?: string
          id?: string
          notes?: string | null
          rubric_scores?: Json
          self_assessment?: string | null
          user_id: string
        }
        Update: {
          case_id?: string
          completed_at?: string
          id?: string
          notes?: string | null
          rubric_scores?: Json
          self_assessment?: string | null
          user_id?: string
        }
        Relationships: []
      }
      learning_enrollments: {
        Row: {
          course_id: string
          created_at: string
          current_day: number
          id: string
          status: string
          target_completion_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          current_day?: number
          id?: string
          status?: string
          target_completion_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          current_day?: number
          id?: string
          status?: string
          target_completion_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "learning_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_exercise_attempts: {
        Row: {
          attempted_at: string
          confidence: number | null
          exercise_id: string
          id: string
          notes: string | null
          outcome: string
          time_taken_seconds: number | null
          user_id: string
        }
        Insert: {
          attempted_at?: string
          confidence?: number | null
          exercise_id: string
          id?: string
          notes?: string | null
          outcome?: string
          time_taken_seconds?: number | null
          user_id: string
        }
        Update: {
          attempted_at?: string
          confidence?: number | null
          exercise_id?: string
          id?: string
          notes?: string | null
          outcome?: string
          time_taken_seconds?: number | null
          user_id?: string
        }
        Relationships: []
      }
      learning_lab_attempts: {
        Row: {
          attempted_at: string
          course_slug: string
          id: string
          input_state: Json
          lab_id: string
          notes: string | null
          outcome: string
          result_state: Json
          scenario_id: string
          time_taken_seconds: number | null
          user_id: string
        }
        Insert: {
          attempted_at?: string
          course_slug?: string
          id?: string
          input_state?: Json
          lab_id: string
          notes?: string | null
          outcome?: string
          result_state?: Json
          scenario_id?: string
          time_taken_seconds?: number | null
          user_id: string
        }
        Update: {
          attempted_at?: string
          course_slug?: string
          id?: string
          input_state?: Json
          lab_id?: string
          notes?: string | null
          outcome?: string
          result_state?: Json
          scenario_id?: string
          time_taken_seconds?: number | null
          user_id?: string
        }
        Relationships: []
      }
      learning_sql_exercises: {
        Row: {
          course_day_id: string | null
          course_id: string
          created_at: string
          description: string
          difficulty: string
          estimated_minutes: number
          external_url: string
          id: string
          sort_order: number
          source_platform: string
          title: string
          topic: string
        }
        Insert: {
          course_day_id?: string | null
          course_id: string
          created_at?: string
          description: string
          difficulty?: string
          estimated_minutes?: number
          external_url: string
          id?: string
          sort_order: number
          source_platform: string
          title: string
          topic: string
        }
        Update: {
          course_day_id?: string | null
          course_id?: string
          created_at?: string
          description?: string
          difficulty?: string
          estimated_minutes?: number
          external_url?: string
          id?: string
          sort_order?: number
          source_platform?: string
          title?: string
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_sql_exercises_course_day_id_fkey"
            columns: ["course_day_id"]
            isOneToOne: false
            referencedRelation: "learning_course_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_sql_exercises_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "learning_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_user_segment_progress: {
        Row: {
          completed_at: string
          id: string
          notes: string | null
          segment_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          notes?: string | null
          segment_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          notes?: string | null
          segment_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_user_segment_progress_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "learning_video_segments"
            referencedColumns: ["segment_id"]
          },
        ]
      }
      learning_video_progress: {
        Row: {
          created_at: string
          difficulty_rating: string | null
          id: string
          needs_revision: boolean
          notes: string | null
          status: string
          updated_at: string
          user_id: string
          video_id: string
          watched_at: string | null
        }
        Insert: {
          created_at?: string
          difficulty_rating?: string | null
          id?: string
          needs_revision?: boolean
          notes?: string | null
          status?: string
          updated_at?: string
          user_id: string
          video_id: string
          watched_at?: string | null
        }
        Update: {
          created_at?: string
          difficulty_rating?: string | null
          id?: string
          needs_revision?: boolean
          notes?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          video_id?: string
          watched_at?: string | null
        }
        Relationships: []
      }
      learning_video_segments: {
        Row: {
          assigned_day: number
          concept_title: string
          created_at: string
          direct_url: string
          end_seconds: number | null
          id: string
          importance: string
          parent_youtube_id: string
          segment_id: string
          start_seconds: number
          topic_slug: string
        }
        Insert: {
          assigned_day: number
          concept_title: string
          created_at?: string
          direct_url: string
          end_seconds?: number | null
          id?: string
          importance?: string
          parent_youtube_id: string
          segment_id: string
          start_seconds: number
          topic_slug: string
        }
        Update: {
          assigned_day?: number
          concept_title?: string
          created_at?: string
          direct_url?: string
          end_seconds?: number | null
          id?: string
          importance?: string
          parent_youtube_id?: string
          segment_id?: string
          start_seconds?: number
          topic_slug?: string
        }
        Relationships: []
      }
      learning_videos: {
        Row: {
          channel_title: string
          course_id: string
          created_at: string
          difficulty: string
          duration_seconds: number
          id: string
          importance: string
          is_supplementary: boolean
          playlist_position: number
          source_url: string
          title: string
          topic_slug: string
          verification_status: string
          youtube_video_id: string
        }
        Insert: {
          channel_title?: string
          course_id: string
          created_at?: string
          difficulty?: string
          duration_seconds?: number
          id?: string
          importance?: string
          is_supplementary?: boolean
          playlist_position: number
          source_url: string
          title: string
          topic_slug: string
          verification_status?: string
          youtube_video_id: string
        }
        Update: {
          channel_title?: string
          course_id?: string
          created_at?: string
          difficulty?: string
          duration_seconds?: number
          id?: string
          importance?: string
          is_supplementary?: boolean
          playlist_position?: number
          source_url?: string
          title?: string
          topic_slug?: string
          verification_status?: string
          youtube_video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_videos_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "learning_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          body: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_deliveries: {
        Row: {
          attempt_count: number
          channel: string
          created_at: string
          delivered_at: string | null
          error_message: string | null
          failed_at: string | null
          failure_code: string | null
          id: string
          idempotency_key: string
          last_attempt_at: string | null
          next_attempt_at: string | null
          notification_id: string | null
          provider: string | null
          provider_message_id: string | null
          sent_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempt_count?: number
          channel: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          failure_code?: string | null
          id?: string
          idempotency_key: string
          last_attempt_at?: string | null
          next_attempt_at?: string | null
          notification_id?: string | null
          provider?: string | null
          provider_message_id?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempt_count?: number
          channel?: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          failure_code?: string | null
          id?: string
          idempotency_key?: string
          last_attempt_at?: string | null
          next_attempt_at?: string | null
          notification_id?: string | null
          provider?: string | null
          provider_message_id?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_deliveries_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_delivery_attempts: {
        Row: {
          attempt_number: number
          completed_at: string | null
          created_at: string
          delivery_id: string
          error_category: string | null
          error_message: string | null
          id: string
          outcome: string
          provider_message_id: string | null
          provider_response_code: string | null
          started_at: string
        }
        Insert: {
          attempt_number: number
          completed_at?: string | null
          created_at?: string
          delivery_id: string
          error_category?: string | null
          error_message?: string | null
          id?: string
          outcome: string
          provider_message_id?: string | null
          provider_response_code?: string | null
          started_at?: string
        }
        Update: {
          attempt_number?: number
          completed_at?: string | null
          created_at?: string
          delivery_id?: string
          error_category?: string | null
          error_message?: string | null
          id?: string
          outcome?: string
          provider_message_id?: string | null
          provider_response_code?: string | null
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_delivery_attempts_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "notification_deliveries"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          occurred_at: string
          payload: Json
          source_id: string
          source_type: string
          source_version: number
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          occurred_at?: string
          payload?: Json
          source_id: string
          source_type: string
          source_version?: number
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          occurred_at?: string
          payload?: Json
          source_id?: string
          source_type?: string
          source_version?: number
          user_id?: string
        }
        Relationships: []
      }
      notification_outbox: {
        Row: {
          aggregate_id: string
          aggregate_type: string
          aggregate_version: number
          attempt_count: number
          created_at: string
          event_type: string
          id: string
          payload: Json
          published_at: string | null
        }
        Insert: {
          aggregate_id: string
          aggregate_type: string
          aggregate_version?: number
          attempt_count?: number
          created_at?: string
          event_type: string
          id?: string
          payload?: Json
          published_at?: string | null
        }
        Update: {
          aggregate_id?: string
          aggregate_type?: string
          aggregate_version?: number
          attempt_count?: number
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          published_at?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          aptitude_reminder_enabled: boolean
          assessment_email_enabled: boolean
          created_at: string
          daily_digest_enabled: boolean
          daily_digest_local_time: string
          email_enabled: boolean
          id: string
          in_app_enabled: boolean
          missed_task_email_enabled: boolean
          quiet_hours_enabled: boolean
          quiet_hours_end: string
          quiet_hours_start: string
          revision_email_enabled: boolean
          session_email_enabled: boolean
          session_lead_time_minutes: number
          timezone: string
          unsubscribe_token: string
          updated_at: string
          user_id: string
          weekly_report_day: number
          weekly_report_enabled: boolean
          weekly_report_local_time: string
        }
        Insert: {
          aptitude_reminder_enabled?: boolean
          assessment_email_enabled?: boolean
          created_at?: string
          daily_digest_enabled?: boolean
          daily_digest_local_time?: string
          email_enabled?: boolean
          id?: string
          in_app_enabled?: boolean
          missed_task_email_enabled?: boolean
          quiet_hours_enabled?: boolean
          quiet_hours_end?: string
          quiet_hours_start?: string
          revision_email_enabled?: boolean
          session_email_enabled?: boolean
          session_lead_time_minutes?: number
          timezone?: string
          unsubscribe_token?: string
          updated_at?: string
          user_id: string
          weekly_report_day?: number
          weekly_report_enabled?: boolean
          weekly_report_local_time?: string
        }
        Update: {
          aptitude_reminder_enabled?: boolean
          assessment_email_enabled?: boolean
          created_at?: string
          daily_digest_enabled?: boolean
          daily_digest_local_time?: string
          email_enabled?: boolean
          id?: string
          in_app_enabled?: boolean
          missed_task_email_enabled?: boolean
          quiet_hours_enabled?: boolean
          quiet_hours_end?: string
          quiet_hours_start?: string
          revision_email_enabled?: boolean
          session_email_enabled?: boolean
          session_lead_time_minutes?: number
          timezone?: string
          unsubscribe_token?: string
          updated_at?: string
          user_id?: string
          weekly_report_day?: number
          weekly_report_enabled?: boolean
          weekly_report_local_time?: string
        }
        Relationships: []
      }
      notification_schedules: {
        Row: {
          attempt_count: number
          created_at: string
          event_type: string
          id: string
          idempotency_key: string
          lease_expires_at: string | null
          lease_owner: string | null
          metadata: Json
          scheduled_for: string
          source_id: string
          source_type: string
          source_version: number
          status: string
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          event_type: string
          id?: string
          idempotency_key: string
          lease_expires_at?: string | null
          lease_owner?: string | null
          metadata?: Json
          scheduled_for: string
          source_id: string
          source_type: string
          source_version?: number
          status?: string
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempt_count?: number
          created_at?: string
          event_type?: string
          id?: string
          idempotency_key?: string
          lease_expires_at?: string | null
          lease_owner?: string | null
          metadata?: Json
          scheduled_for?: string
          source_id?: string
          source_type?: string
          source_version?: number
          status?: string
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string
          category: string
          created_at: string
          deleted_at: string | null
          dismissed_at: string | null
          event_id: string | null
          id: string
          priority: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          body: string
          category: string
          created_at?: string
          deleted_at?: string | null
          dismissed_at?: string | null
          event_id?: string | null
          id?: string
          priority?: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          body?: string
          category?: string
          created_at?: string
          deleted_at?: string | null
          dismissed_at?: string | null
          event_id?: string | null
          id?: string
          priority?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "notification_events"
            referencedColumns: ["id"]
          },
        ]
      }
      planner_proposals: {
        Row: {
          applied_at: string | null
          changes: Json
          expires_at: string
          id: string
          local_day: string
          snapshot_version: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          changes: Json
          expires_at?: string
          id?: string
          local_day: string
          snapshot_version: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          changes?: Json
          expires_at?: string
          id?: string
          local_day?: string
          snapshot_version?: string
          user_id?: string
        }
        Relationships: []
      }
      planning_intents: {
        Row: {
          created_at: string
          id: string
          request: Json
          status: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          request: Json
          status?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          request?: Json
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      preparation_plans: {
        Row: {
          algorithm_version: string
          created_at: string
          daily_capacity_minutes: number
          feasibility_status: string
          feasibility_summary: Json
          generated_at: string
          id: string
          last_rebalanced_at: string | null
          plan_revision: number
          start_date: string
          status: string
          target_date: string
          target_role: string
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          algorithm_version?: string
          created_at?: string
          daily_capacity_minutes?: number
          feasibility_status?: string
          feasibility_summary?: Json
          generated_at?: string
          id?: string
          last_rebalanced_at?: string | null
          plan_revision?: number
          start_date?: string
          status?: string
          target_date: string
          target_role?: string
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          algorithm_version?: string
          created_at?: string
          daily_capacity_minutes?: number
          feasibility_status?: string
          feasibility_summary?: Json
          generated_at?: string
          id?: string
          last_rebalanced_at?: string | null
          plan_revision?: number
          start_date?: string
          status?: string
          target_date?: string
          target_role?: string
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      problem_attempts: {
        Row: {
          attempted_at: string
          confidence: number
          created_at: string
          id: string
          notes: string | null
          outcome: string
          problem_id: string
          time_taken_seconds: number
          user_id: string
        }
        Insert: {
          attempted_at?: string
          confidence: number
          created_at?: string
          id?: string
          notes?: string | null
          outcome: string
          problem_id: string
          time_taken_seconds?: number
          user_id: string
        }
        Update: {
          attempted_at?: string
          confidence?: number
          created_at?: string
          id?: string
          notes?: string | null
          outcome?: string
          problem_id?: string
          time_taken_seconds?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "problem_attempts_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      problem_collection_items: {
        Row: {
          collection_id: string
          created_at: string
          position: number | null
          problem_id: string
          section: string | null
          source_metadata: Json
          subsection: string | null
          updated_at: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          position?: number | null
          problem_id: string
          section?: string | null
          source_metadata?: Json
          subsection?: string | null
          updated_at?: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          position?: number | null
          problem_id?: string
          section?: string | null
          source_metadata?: Json
          subsection?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "problem_collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "problem_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "problem_collection_items_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      problem_collections: {
        Row: {
          collection_type: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          source_id: string | null
          updated_at: string
        }
        Insert: {
          collection_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          source_id?: string | null
          updated_at?: string
        }
        Update: {
          collection_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          source_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "problem_collections_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "content_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      problem_topics: {
        Row: {
          created_at: string
          problem_id: string
          topic_id: string
        }
        Insert: {
          created_at?: string
          problem_id: string
          topic_id: string
        }
        Update: {
          created_at?: string
          problem_id?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "problem_topics_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "problem_topics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "roadmap_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      problems: {
        Row: {
          acceptance_rate: number | null
          created_at: string
          difficulty: string
          estimated_minutes: number | null
          external_url: string | null
          id: string
          is_active: boolean
          leetcode_slug: string | null
          primary_topic_id: string | null
          prime_priority: string
          slug: string
          source: string
          title: string
          updated_at: string
        }
        Insert: {
          acceptance_rate?: number | null
          created_at?: string
          difficulty: string
          estimated_minutes?: number | null
          external_url?: string | null
          id?: string
          is_active?: boolean
          leetcode_slug?: string | null
          primary_topic_id?: string | null
          prime_priority?: string
          slug: string
          source?: string
          title: string
          updated_at?: string
        }
        Update: {
          acceptance_rate?: number | null
          created_at?: string
          difficulty?: string
          estimated_minutes?: number | null
          external_url?: string | null
          id?: string
          is_active?: boolean
          leetcode_slug?: string | null
          primary_topic_id?: string | null
          prime_priority?: string
          slug?: string
          source?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "problem_primary_topic_membership_fk"
            columns: ["id", "primary_topic_id"]
            isOneToOne: false
            referencedRelation: "problem_topics"
            referencedColumns: ["problem_id", "topic_id"]
          },
          {
            foreignKeyName: "problems_primary_topic_id_fkey"
            columns: ["primary_topic_id"]
            isOneToOne: false
            referencedRelation: "roadmap_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          degree: string | null
          display_name: string | null
          full_name: string | null
          graduation_year: number | null
          id: string
          institution: string | null
          specialization: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          degree?: string | null
          display_name?: string | null
          full_name?: string | null
          graduation_year?: number | null
          id: string
          institution?: string | null
          specialization?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          degree?: string | null
          display_name?: string | null
          full_name?: string | null
          graduation_year?: number | null
          id?: string
          institution?: string | null
          specialization?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      progress_snapshots: {
        Row: {
          aptitude_score: number | null
          consistency_score: number | null
          created_at: string
          dsa_score: number | null
          fundamentals_score: number | null
          id: string
          readiness_score: number | null
          retention_score: number | null
          snapshot_date: string
          sql_score: number | null
          user_id: string
        }
        Insert: {
          aptitude_score?: number | null
          consistency_score?: number | null
          created_at?: string
          dsa_score?: number | null
          fundamentals_score?: number | null
          id?: string
          readiness_score?: number | null
          retention_score?: number | null
          snapshot_date: string
          sql_score?: number | null
          user_id: string
        }
        Update: {
          aptitude_score?: number | null
          consistency_score?: number | null
          created_at?: string
          dsa_score?: number | null
          fundamentals_score?: number | null
          id?: string
          readiness_score?: number | null
          retention_score?: number | null
          snapshot_date?: string
          sql_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      revision_attempts: {
        Row: {
          confidence: number | null
          created_at: string
          id: string
          next_interval_days: number
          notes: string | null
          previous_interval_days: number
          rating: string
          reviewed_at: string
          revision_item_id: string
          time_spent_minutes: number
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          id?: string
          next_interval_days?: number
          notes?: string | null
          previous_interval_days?: number
          rating: string
          reviewed_at?: string
          revision_item_id: string
          time_spent_minutes?: number
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          id?: string
          next_interval_days?: number
          notes?: string | null
          previous_interval_days?: number
          rating?: string
          reviewed_at?: string
          revision_item_id?: string
          time_spent_minutes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revision_attempts_revision_item_id_fkey"
            columns: ["revision_item_id"]
            isOneToOne: false
            referencedRelation: "revision_items"
            referencedColumns: ["id"]
          },
        ]
      }
      revision_items: {
        Row: {
          bookmarked: boolean
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          interval_days: number
          last_reviewed_at: string | null
          next_review_at: string
          snooze_count: number
          snoozed_until: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bookmarked?: boolean
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          interval_days?: number
          last_reviewed_at?: string | null
          next_review_at?: string
          snooze_count?: number
          snoozed_until?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bookmarked?: boolean
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          interval_days?: number
          last_reviewed_at?: string | null
          next_review_at?: string
          snooze_count?: number
          snoozed_until?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      roadmap_dependencies: {
        Row: {
          created_at: string
          prerequisite_topic_id: string
          topic_id: string
        }
        Insert: {
          created_at?: string
          prerequisite_topic_id: string
          topic_id: string
        }
        Update: {
          created_at?: string
          prerequisite_topic_id?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_dependencies_prerequisite_topic_id_fkey"
            columns: ["prerequisite_topic_id"]
            isOneToOne: false
            referencedRelation: "roadmap_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roadmap_dependencies_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "roadmap_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmap_topics: {
        Row: {
          created_at: string
          description: string | null
          domain: string
          estimated_minutes: number
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          domain: string
          estimated_minutes?: number
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          domain?: string
          estimated_minutes?: number
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          created_at: string
          duration_seconds: number
          ended_at: string | null
          id: string
          session_type: string
          started_at: string
          task_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number
          ended_at?: string | null
          id?: string
          session_type?: string
          started_at?: string
          task_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number
          ended_at?: string | null
          id?: string
          session_type?: string
          started_at?: string
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "daily_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      system_health_probe: {
        Row: {
          id: number
          marker: string
          updated_at: string
        }
        Insert: {
          id: number
          marker?: string
          updated_at?: string
        }
        Update: {
          id?: number
          marker?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_appearance_preferences: {
        Row: {
          created_at: string
          font_scaling: string
          id: string
          motion_preference: string
          theme: string
          ui_density: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          font_scaling?: string
          id?: string
          motion_preference?: string
          theme?: string
          ui_density?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          font_scaling?: string
          id?: string
          motion_preference?: string
          theme?: string
          ui_density?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_data_export_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          download_token: string | null
          error_message: string | null
          expires_at: string
          export_data: Json | null
          id: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          download_token?: string | null
          error_message?: string | null
          expires_at?: string
          export_data?: Json | null
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          download_token?: string | null
          error_message?: string | null
          expires_at?: string
          export_data?: Json | null
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      user_deletion_requests: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          reason: string | null
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      user_learning_preferences: {
        Row: {
          aptitude_daily_target_minutes: number
          aptitude_track_focus: string
          created_at: string
          default_session_minutes: number
          difficulty_level: string
          enable_aptitude_module: boolean
          id: string
          instructional_language: string
          learning_pace: string
          preferred_language: string
          revision_mode: string
          show_supplementary_lessons: boolean
          updated_at: string
          user_id: string
          video_player_mode: string
        }
        Insert: {
          aptitude_daily_target_minutes?: number
          aptitude_track_focus?: string
          created_at?: string
          default_session_minutes?: number
          difficulty_level?: string
          enable_aptitude_module?: boolean
          id?: string
          instructional_language?: string
          learning_pace?: string
          preferred_language?: string
          revision_mode?: string
          show_supplementary_lessons?: boolean
          updated_at?: string
          user_id: string
          video_player_mode?: string
        }
        Update: {
          aptitude_daily_target_minutes?: number
          aptitude_track_focus?: string
          created_at?: string
          default_session_minutes?: number
          difficulty_level?: string
          enable_aptitude_module?: boolean
          id?: string
          instructional_language?: string
          learning_pace?: string
          preferred_language?: string
          revision_mode?: string
          show_supplementary_lessons?: boolean
          updated_at?: string
          user_id?: string
          video_player_mode?: string
        }
        Relationships: []
      }
      user_problem_mastery: {
        Row: {
          blockers: Json
          calculated_at: string
          created_at: string
          evidence: Json
          freshness: string
          id: string
          last_evidence_at: string | null
          level: string
          next_evidence: string | null
          policy_version: number
          problem_id: string
          requirements: Json
          score: number
          strengths: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          blockers?: Json
          calculated_at?: string
          created_at?: string
          evidence?: Json
          freshness?: string
          id?: string
          last_evidence_at?: string | null
          level: string
          next_evidence?: string | null
          policy_version?: number
          problem_id: string
          requirements?: Json
          score?: number
          strengths?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          blockers?: Json
          calculated_at?: string
          created_at?: string
          evidence?: Json
          freshness?: string
          id?: string
          last_evidence_at?: string | null
          level?: string
          next_evidence?: string | null
          policy_version?: number
          problem_id?: string
          requirements?: Json
          score?: number
          strengths?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_problem_mastery_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      user_problem_progress: {
        Row: {
          last_attempt_at: string | null
          mastery_score: number
          next_revision_at: string | null
          problem_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          last_attempt_at?: string | null
          mastery_score?: number
          next_revision_at?: string | null
          problem_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          last_attempt_at?: string | null
          mastery_score?: number
          next_revision_at?: string | null
          problem_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_problem_progress_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          daily_study_minutes: number
          difficulty_preference: string
          evening_email_enabled: boolean
          experience_level: string
          min_acceptable_compensation: number | null
          morning_email_enabled: boolean
          morning_email_time: string
          planner_buffer_percent: number
          primary_target_company: string | null
          rest_days: number[]
          start_date: string
          target_companies: string[]
          target_compensation_amount: number | null
          target_compensation_currency: string
          target_compensation_period: string
          target_date: string | null
          target_package: string | null
          target_role: string
          timezone: string
          updated_at: string
          user_id: string
          weekly_report_enabled: boolean
        }
        Insert: {
          created_at?: string
          daily_study_minutes?: number
          difficulty_preference?: string
          evening_email_enabled?: boolean
          experience_level?: string
          min_acceptable_compensation?: number | null
          morning_email_enabled?: boolean
          morning_email_time?: string
          planner_buffer_percent?: number
          primary_target_company?: string | null
          rest_days?: number[]
          start_date?: string
          target_companies?: string[]
          target_compensation_amount?: number | null
          target_compensation_currency?: string
          target_compensation_period?: string
          target_date?: string | null
          target_package?: string | null
          target_role?: string
          timezone?: string
          updated_at?: string
          user_id: string
          weekly_report_enabled?: boolean
        }
        Update: {
          created_at?: string
          daily_study_minutes?: number
          difficulty_preference?: string
          evening_email_enabled?: boolean
          experience_level?: string
          min_acceptable_compensation?: number | null
          morning_email_enabled?: boolean
          morning_email_time?: string
          planner_buffer_percent?: number
          primary_target_company?: string | null
          rest_days?: number[]
          start_date?: string
          target_companies?: string[]
          target_compensation_amount?: number | null
          target_compensation_currency?: string
          target_compensation_period?: string
          target_date?: string | null
          target_package?: string | null
          target_role?: string
          timezone?: string
          updated_at?: string
          user_id?: string
          weekly_report_enabled?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      begin_ai_turn: {
        Args: {
          p_context: Json
          p_conversation_id: string
          p_intent: string
          p_message: string
          p_mode: string
          p_request_id: string
          p_user_id: string
        }
        Returns: Json
      }
      claim_due_notification_schedules: {
        Args: {
          p_batch_size?: number
          p_lease_duration_seconds?: number
          p_lease_owner: string
        }
        Returns: {
          attempt_count: number
          created_at: string
          event_type: string
          id: string
          idempotency_key: string
          lease_expires_at: string | null
          lease_owner: string | null
          metadata: Json
          scheduled_for: string
          source_id: string
          source_type: string
          source_version: number
          status: string
          timezone: string
          updated_at: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "notification_schedules"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      commit_planner_proposal: {
        Args: { p_id: string; p_user: string }
        Returns: undefined
      }
      complete_problem_revision: {
        Args: {
          p_confidence?: number
          p_notes?: string
          p_problem_id: string
          p_rating: string
          p_time_spent_minutes?: number
        }
        Returns: Json
      }
      decide_ai_note: {
        Args: { p_action_id: string; p_confirm: boolean; p_user_id: string }
        Returns: Json
      }
      mark_all_notifications_read: {
        Args: { p_user_id: string }
        Returns: number
      }
      planner_snapshot: {
        Args: { p_day: string; p_user: string }
        Returns: Json
      }
      probe_system_health: { Args: never; Returns: Json }
      record_problem_attempt: {
        Args: {
          p_confidence?: number
          p_interval_days?: number
          p_next_status?: string
          p_notes?: string
          p_outcome: string
          p_problem_id: string
          p_time_taken_seconds?: number
        }
        Returns: Json
      }
      snooze_problem_revision: {
        Args: { p_problem_id: string; p_snooze_until: string }
        Returns: Json
      }
      toggle_revision_bookmark: {
        Args: { p_problem_id: string }
        Returns: boolean
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
