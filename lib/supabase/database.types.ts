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
      notifications: {
        Row: {
          id: string
          user_id: string
          event_id: string | null
          category: string
          title: string
          body: string
          action_url: string | null
          priority: "low" | "medium" | "high" | "urgent"
          read_at: string | null
          dismissed_at: string | null
          deleted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_id?: string | null
          category: string
          title: string
          body: string
          action_url?: string | null
          priority?: "low" | "medium" | "high" | "urgent"
          read_at?: string | null
          dismissed_at?: string | null
          deleted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_id?: string | null
          category?: string
          title?: string
          body?: string
          action_url?: string | null
          priority?: "low" | "medium" | "high" | "urgent"
          read_at?: string | null
          dismissed_at?: string | null
          deleted_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          id: string
          user_id: string
          timezone: string
          in_app_enabled: boolean
          email_enabled: boolean
          revision_email_enabled: boolean
          session_email_enabled: boolean
          assessment_email_enabled: boolean
          missed_task_email_enabled: boolean
          aptitude_reminder_enabled: boolean
          daily_digest_enabled: boolean
          weekly_report_enabled: boolean
          session_lead_time_minutes: number
          daily_digest_local_time: string
          weekly_report_day: number
          weekly_report_local_time: string
          quiet_hours_enabled: boolean
          quiet_hours_start: string
          quiet_hours_end: string
          unsubscribe_token: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          timezone?: string
          in_app_enabled?: boolean
          email_enabled?: boolean
          revision_email_enabled?: boolean
          session_email_enabled?: boolean
          assessment_email_enabled?: boolean
          missed_task_email_enabled?: boolean
          aptitude_reminder_enabled?: boolean
          daily_digest_enabled?: boolean
          weekly_report_enabled?: boolean
          session_lead_time_minutes?: number
          daily_digest_local_time?: string
          weekly_report_day?: number
          weekly_report_local_time?: string
          quiet_hours_enabled?: boolean
          quiet_hours_start?: string
          quiet_hours_end?: string
          unsubscribe_token?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          timezone?: string
          in_app_enabled?: boolean
          email_enabled?: boolean
          revision_email_enabled?: boolean
          session_email_enabled?: boolean
          assessment_email_enabled?: boolean
          missed_task_email_enabled?: boolean
          aptitude_reminder_enabled?: boolean
          daily_digest_enabled?: boolean
          weekly_report_enabled?: boolean
          session_lead_time_minutes?: number
          daily_digest_local_time?: string
          weekly_report_day?: number
          weekly_report_local_time?: string
          quiet_hours_enabled?: boolean
          quiet_hours_start?: string
          quiet_hours_end?: string
          unsubscribe_token?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_courses: {
        Row: {
          created_at: string
          description: string
          difficulty: "Easy" | "Medium" | "Hard"
          estimated_days: number
          estimated_minutes: number
          id: string
          slug: string
          status: "draft" | "published" | "archived"
          subject: string
          title: string
          updated_at: string
          version: string
        }
        Insert: {
          created_at?: string
          description: string
          difficulty?: "Easy" | "Medium" | "Hard"
          estimated_days?: number
          estimated_minutes?: number
          id?: string
          slug: string
          status?: "draft" | "published" | "archived"
          subject?: string
          title: string
          updated_at?: string
          version?: string
        }
        Update: {
          created_at?: string
          description?: string
          difficulty?: "Easy" | "Medium" | "Hard"
          estimated_days?: number
          estimated_minutes?: number
          id?: string
          slug?: string
          status?: "draft" | "published" | "archived"
          subject?: string
          title?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      learning_course_days: {
        Row: {
          course_id: string
          created_at: string
          day_number: number
          description: string
          difficulty: "Easy" | "Medium" | "Hard"
          estimated_minutes: number
          id: string
          importance: "Critical" | "High" | "Medium" | "Low"
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
          difficulty?: "Easy" | "Medium" | "Hard"
          estimated_minutes?: number
          id?: string
          importance?: "Critical" | "High" | "Medium" | "Low"
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
          difficulty?: "Easy" | "Medium" | "Hard"
          estimated_minutes?: number
          id?: string
          importance?: "Critical" | "High" | "Medium" | "Low"
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
          }
        ]
      }
      learning_videos: {
        Row: {
          channel_title: string
          course_id: string
          created_at: string
          difficulty: "Easy" | "Medium" | "Hard"
          duration_seconds: number
          id: string
          importance: "Critical" | "High" | "Medium" | "Low"
          is_supplementary: boolean
          playlist_position: number
          source_url: string
          title: string
          topic_slug: string
          verification_status: "verified" | "unverified" | "unavailable"
          youtube_video_id: string
        }
        Insert: {
          channel_title?: string
          course_id: string
          created_at?: string
          difficulty?: "Easy" | "Medium" | "Hard"
          duration_seconds?: number
          id?: string
          importance?: "Critical" | "High" | "Medium" | "Low"
          is_supplementary?: boolean
          playlist_position: number
          source_url: string
          title: string
          topic_slug: string
          verification_status?: "verified" | "unverified" | "unavailable"
          youtube_video_id: string
        }
        Update: {
          channel_title?: string
          course_id?: string
          created_at?: string
          difficulty?: "Easy" | "Medium" | "Hard"
          duration_seconds?: number
          id?: string
          importance?: "Critical" | "High" | "Medium" | "Low"
          is_supplementary?: boolean
          playlist_position?: number
          source_url?: string
          title?: string
          topic_slug?: string
          verification_status?: "verified" | "unverified" | "unavailable"
          youtube_video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_videos_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "learning_courses"
            referencedColumns: ["id"]
          }
        ]
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
          }
        ]
      }
      learning_sql_exercises: {
        Row: {
          course_day_id: string | null
          course_id: string
          created_at: string
          description: string
          difficulty: "Easy" | "Medium" | "Hard"
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
          difficulty?: "Easy" | "Medium" | "Hard"
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
          difficulty?: "Easy" | "Medium" | "Hard"
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
            foreignKeyName: "learning_sql_exercises_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "learning_courses"
            referencedColumns: ["id"]
          }
        ]
      }
      learning_enrollments: {
        Row: {
          course_id: string
          created_at: string
          current_day: number
          id: string
          status: "not_started" | "in_progress" | "completed" | "paused"
          target_completion_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          current_day?: number
          id?: string
          status?: "not_started" | "in_progress" | "completed" | "paused"
          target_completion_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          current_day?: number
          id?: string
          status?: "not_started" | "in_progress" | "completed" | "paused"
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
          }
        ]
      }
      learning_video_progress: {
        Row: {
          created_at: string
          id: string
          needs_revision: boolean
          notes: string | null
          status: "not_started" | "in_progress" | "watched" | "needs_revision" | "completed"
          updated_at: string
          user_id: string
          video_id: string
          watched_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          needs_revision?: boolean
          notes?: string | null
          status?: "not_started" | "in_progress" | "watched" | "needs_revision" | "completed"
          updated_at?: string
          user_id: string
          video_id: string
          watched_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          needs_revision?: boolean
          notes?: string | null
          status?: "not_started" | "in_progress" | "watched" | "needs_revision" | "completed"
          updated_at?: string
          user_id?: string
          video_id?: string
          watched_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_video_progress_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "learning_videos"
            referencedColumns: ["id"]
          }
        ]
      }
      learning_exercise_attempts: {
        Row: {
          attempted_at: string
          confidence: number | null
          exercise_id: string
          id: string
          notes: string | null
          outcome: "not_attempted" | "attempted" | "solved_independent" | "solved_hint" | "reviewed_solution" | "needs_revision"
          time_taken_seconds: number | null
          user_id: string
        }
        Insert: {
          attempted_at?: string
          confidence?: number | null
          exercise_id: string
          id?: string
          notes?: string | null
          outcome?: "not_attempted" | "attempted" | "solved_independent" | "solved_hint" | "reviewed_solution" | "needs_revision"
          time_taken_seconds?: number | null
          user_id: string
        }
        Update: {
          attempted_at?: string
          confidence?: number | null
          exercise_id?: string
          id?: string
          notes?: string | null
          outcome?: "not_attempted" | "attempted" | "solved_independent" | "solved_hint" | "reviewed_solution" | "needs_revision"
          time_taken_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_exercise_attempts_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "learning_sql_exercises"
            referencedColumns: ["id"]
          }
        ]
      }
      learning_day_progress: {
        Row: {
          assignment_completed: boolean
          assignment_notes: string | null
          completed_at: string | null
          course_day_id: string
          created_at: string
          id: string
          status: "not_started" | "in_progress" | "completed"
          updated_at: string
          user_id: string
        }
        Insert: {
          assignment_completed?: boolean
          assignment_notes?: string | null
          completed_at?: string | null
          course_day_id: string
          created_at?: string
          id?: string
          status?: "not_started" | "in_progress" | "completed"
          updated_at?: string
          user_id: string
        }
        Update: {
          assignment_completed?: boolean
          assignment_notes?: string | null
          completed_at?: string | null
          course_day_id?: string
          created_at?: string
          id?: string
          status?: "not_started" | "in_progress" | "completed"
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_day_progress_course_day_id_fkey"
            columns: ["course_day_id"]
            isOneToOne: false
            referencedRelation: "learning_course_days"
            referencedColumns: ["id"]
          }
        ]
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
          updated_at: string
          user_id: string
        }
        Insert: {
          available_minutes?: number
          created_at?: string
          day_of_week: number
          id?: string
          is_rest_day?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          available_minutes?: number
          created_at?: string
          day_of_week?: number
          id?: string
          is_rest_day?: boolean
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
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
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
          morning_email_enabled: boolean
          morning_email_time: string
          planner_buffer_percent: number
          rest_days: number[]
          start_date: string
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
          morning_email_enabled?: boolean
          morning_email_time?: string
          planner_buffer_percent?: number
          rest_days?: number[]
          start_date?: string
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
          morning_email_enabled?: boolean
          morning_email_time?: string
          planner_buffer_percent?: number
          rest_days?: number[]
          start_date?: string
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
      planner_snapshot: {
        Args: { p_day: string; p_user: string }
        Returns: Json
      }
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
