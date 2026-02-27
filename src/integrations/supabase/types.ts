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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_chats: {
        Row: {
          context_data: Json | null
          context_type: string | null
          created_at: string
          created_by_user_id: string
          id: string
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          context_data?: Json | null
          context_type?: string | null
          created_at?: string
          created_by_user_id: string
          id?: string
          title?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          context_data?: Json | null
          context_type?: string | null
          created_at?: string
          created_by_user_id?: string
          id?: string
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chats_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          chat_id: string
          content: string
          created_at: string
          id: string
          role: string
          workspace_id: string
        }
        Insert: {
          chat_id: string
          content: string
          created_at?: string
          id?: string
          role: string
          workspace_id: string
        }
        Update: {
          chat_id?: string
          content?: string
          created_at?: string
          id?: string
          role?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "ai_chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_messages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_todos: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string
          due_time: string | null
          id: string
          is_completed: boolean
          priority: string | null
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date: string
          due_time?: string | null
          id?: string
          is_completed?: boolean
          priority?: string | null
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string
          due_time?: string | null
          id?: string
          is_completed?: boolean
          priority?: string | null
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_todos_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      client_files: {
        Row: {
          client_id: string
          created_at: string
          file_type: string
          file_url: string
          folder_id: string | null
          filename: string
          id: string
          is_video: boolean
          mime_type: string | null
          size_bytes: number | null
          uploaded_by: string
          workspace_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          file_type: string
          file_url: string
          folder_id?: string | null
          filename: string
          id?: string
          is_video?: boolean
          mime_type?: string | null
          size_bytes?: number | null
          uploaded_by: string
          workspace_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          file_type?: string
          file_url?: string
          folder_id?: string | null
          filename?: string
          id?: string
          is_video?: boolean
          mime_type?: string | null
          size_bytes?: number | null
          uploaded_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_files_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_files_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "client_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_files_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      client_folders: {
        Row: {
          client_id: string
          created_at: string
          created_by: string
          id: string
          name: string
          parent_folder_id: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by: string
          id?: string
          name: string
          parent_folder_id?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          parent_folder_id?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_folders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "client_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_folders_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      client_messages: {
        Row: {
          attachment_id: string | null
          client_id: string
          content: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
          sender_type: string
          workspace_id: string
        }
        Insert: {
          attachment_id?: string | null
          client_id: string
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
          sender_type: string
          workspace_id: string
        }
        Update: {
          attachment_id?: string | null
          client_id?: string
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
          sender_type?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_messages_attachment_id_fkey"
            columns: ["attachment_id"]
            isOneToOne: false
            referencedRelation: "client_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_messages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_messages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      client_onboarding_questions: {
        Row: {
          client_id: string
          created_at: string
          id: string
          is_required: boolean
          options_json: Json | null
          placeholder: string | null
          question_order: number
          question_text: string
          question_type: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          is_required?: boolean
          options_json?: Json | null
          placeholder?: string | null
          question_order?: number
          question_text: string
          question_type?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          is_required?: boolean
          options_json?: Json | null
          placeholder?: string | null
          question_order?: number
          question_text?: string
          question_type?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_onboarding_questions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_onboarding_questions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      client_onboarding_responses: {
        Row: {
          client_id: string
          created_at: string
          id: string
          question_id: string
          response_text: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          question_id: string
          response_text?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          question_id?: string
          response_text?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_onboarding_responses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_onboarding_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "client_onboarding_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_onboarding_responses_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      client_pins: {
        Row: {
          client_id: string
          created_at: string
          email: string | null
          id: string
          pin_hash: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          email?: string | null
          id?: string
          pin_hash: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          email?: string | null
          id?: string
          pin_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_pins_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_tasks: {
        Row: {
          client_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          status: string
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_tasks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          access_until: string | null
          business_name: string | null
          created_at: string
          email: string | null
          goals: string | null
          id: string
          instagram_handle: string | null
          name: string
          onboarding_completed: boolean
          onboarding_completed_at: string | null
          phone: string | null
          subscription_status: string
          updated_at: string
          user_id: string | null
          workspace_id: string
        }
        Insert: {
          access_until?: string | null
          business_name?: string | null
          created_at?: string
          email?: string | null
          goals?: string | null
          id?: string
          instagram_handle?: string | null
          name: string
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          phone?: string | null
          subscription_status?: string
          updated_at?: string
          user_id?: string | null
          workspace_id: string
        }
        Update: {
          access_until?: string | null
          business_name?: string | null
          created_at?: string
          email?: string | null
          goals?: string | null
          id?: string
          instagram_handle?: string | null
          name?: string
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          phone?: string | null
          subscription_status?: string
          updated_at?: string
          user_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      connected_google_calendars: {
        Row: {
          access_role: string | null
          calendar_id: string
          created_at: string
          description: string | null
          id: string
          primary_calendar: boolean | null
          summary: string | null
          time_zone: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          access_role?: string | null
          calendar_id: string
          created_at?: string
          description?: string | null
          id?: string
          primary_calendar?: boolean | null
          summary?: string | null
          time_zone?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          access_role?: string | null
          calendar_id?: string
          created_at?: string
          description?: string | null
          id?: string
          primary_calendar?: boolean | null
          summary?: string | null
          time_zone?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connected_google_calendars_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      connected_youtube_channels: {
        Row: {
          channel_id: string
          created_at: string
          custom_url: string | null
          description: string | null
          id: string
          last_synced_at: string | null
          subscriber_count: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_count: number | null
          view_count: number | null
          workspace_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          custom_url?: string | null
          description?: string | null
          id?: string
          last_synced_at?: string | null
          subscriber_count?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_count?: number | null
          view_count?: number | null
          workspace_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          custom_url?: string | null
          description?: string | null
          id?: string
          last_synced_at?: string | null
          subscriber_count?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_count?: number | null
          view_count?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connected_youtube_channels_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      email_verifications: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          token: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      files: {
        Row: {
          created_at: string
          file_type: string
          id: string
          mime_type: string | null
          original_name: string | null
          size_bytes: number | null
          storage_path: string
          uploaded_by: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          file_type: string
          id?: string
          mime_type?: string | null
          original_name?: string | null
          size_bytes?: number | null
          storage_path: string
          uploaded_by: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          file_type?: string
          id?: string
          mime_type?: string | null
          original_name?: string | null
          size_bytes?: number | null
          storage_path?: string
          uploaded_by?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "files_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      filter_runs: {
        Row: {
          created_at: string
          exclude_keywords: string[] | null
          generate_openers: boolean
          id: string
          include_keywords: string[] | null
          matching_profiles: number
          name: string
          original_headers: string[] | null
          prompt_id: string | null
          prompt_snapshot: string | null
          total_profiles: number
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          exclude_keywords?: string[] | null
          generate_openers?: boolean
          id?: string
          include_keywords?: string[] | null
          matching_profiles?: number
          name: string
          original_headers?: string[] | null
          prompt_id?: string | null
          prompt_snapshot?: string | null
          total_profiles?: number
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          exclude_keywords?: string[] | null
          generate_openers?: boolean
          id?: string
          include_keywords?: string[] | null
          matching_profiles?: number
          name?: string
          original_headers?: string[] | null
          prompt_id?: string | null
          prompt_snapshot?: string | null
          total_profiles?: number
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "filter_runs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      google_calendar_tokens: {
        Row: {
          access_token: string
          created_at: string
          id: string
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          id?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          id?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_calendar_tokens_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          accepted_at: string | null
          client_id: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invite_type: string
          invited_by: string
          role: Database["public"]["Enums"]["workspace_role"]
          token: string
          workspace_id: string
        }
        Insert: {
          accepted_at?: string | null
          client_id?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invite_type?: string
          invited_by: string
          role?: Database["public"]["Enums"]["workspace_role"]
          token: string
          workspace_id: string
        }
        Update: {
          accepted_at?: string | null
          client_id?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invite_type?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          token?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          assigned_to: string | null
          client_id: string | null
          created_at: string
          created_by: string
          description: string | null
          end_time: string
          google_event_id: string | null
          id: string
          location: string | null
          meeting_link: string | null
          start_time: string
          status: string
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          end_time: string
          google_event_id?: string | null
          id?: string
          location?: string | null
          meeting_link?: string | null
          start_time: string
          status?: string
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_time?: string
          google_event_id?: string | null
          id?: string
          location?: string | null
          meeting_link?: string | null
          start_time?: string
          status?: string
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_responses: {
        Row: {
          business_name: string | null
          completed_at: string | null
          created_at: string
          has_team: boolean | null
          id: string
          kpi_file_path: string | null
          revenue_range: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          business_name?: string | null
          completed_at?: string | null
          created_at?: string
          has_team?: boolean | null
          id?: string
          kpi_file_path?: string | null
          revenue_range?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          business_name?: string | null
          completed_at?: string | null
          created_at?: string
          has_team?: boolean | null
          id?: string
          kpi_file_path?: string | null
          revenue_range?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_responses_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      password_resets: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          token: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      portal_roles: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["portal_role"]
          user_id: string
          workspace_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["portal_role"]
          user_id: string
          workspace_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["portal_role"]
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_roles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_roles_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_workspace_id: string | null
          display_name: string | null
          email_verified: boolean | null
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_workspace_id?: string | null
          display_name?: string | null
          email_verified?: boolean | null
          full_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_workspace_id?: string | null
          display_name?: string | null
          email_verified?: boolean | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_workspace_id_fkey"
            columns: ["current_workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      run_data: {
        Row: {
          id: string
          row_data: Json
          row_index: number
          run_id: string
        }
        Insert: {
          id?: string
          row_data?: Json
          row_index?: number
          run_id: string
        }
        Update: {
          id?: string
          row_data?: Json
          row_index?: number
          run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "run_data_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "filter_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      setter_codes: {
        Row: {
          code_hash: string
          created_at: string
          email: string
          id: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          code_hash: string
          created_at?: string
          email: string
          id?: string
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          code_hash?: string
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "setter_codes_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      setter_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
          sender_type: string
          setter_id: string
          workspace_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
          sender_type: string
          setter_id: string
          workspace_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
          sender_type?: string
          setter_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "setter_messages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      setter_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          setter_id: string
          status: string
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          setter_id: string
          status?: string
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          setter_id?: string
          status?: string
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "setter_tasks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      video_optimizations: {
        Row: {
          created_at: string
          fixes_json: Json | null
          id: string
          score: number | null
          thumbnail_ideas_json: Json | null
          titles_json: Json | null
          updated_at: string
          video_id: string
          why_json: Json | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          fixes_json?: Json | null
          id?: string
          score?: number | null
          thumbnail_ideas_json?: Json | null
          titles_json?: Json | null
          updated_at?: string
          video_id: string
          why_json?: Json | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          fixes_json?: Json | null
          id?: string
          score?: number | null
          thumbnail_ideas_json?: Json | null
          titles_json?: Json | null
          updated_at?: string
          video_id?: string
          why_json?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_optimizations_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "youtube_videos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_optimizations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          role: Database["public"]["Enums"]["workspace_role"]
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      youtube_videos: {
        Row: {
          channel_id: string
          comment_count: number | null
          created_at: string
          description: string | null
          duration: string | null
          id: string
          is_short: boolean | null
          last_synced_at: string | null
          like_count: number | null
          published_at: string | null
          tags: Json | null
          thumbnails_json: Json | null
          title: string
          updated_at: string
          video_id: string
          view_count: number | null
          workspace_id: string
        }
        Insert: {
          channel_id: string
          comment_count?: number | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_short?: boolean | null
          last_synced_at?: string | null
          like_count?: number | null
          published_at?: string | null
          tags?: Json | null
          thumbnails_json?: Json | null
          title: string
          updated_at?: string
          video_id: string
          view_count?: number | null
          workspace_id: string
        }
        Update: {
          channel_id?: string
          comment_count?: number | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_short?: boolean | null
          last_synced_at?: string | null
          like_count?: number | null
          published_at?: string | null
          tags?: Json | null
          thumbnails_json?: Json | null
          title?: string
          updated_at?: string
          video_id?: string
          view_count?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "youtube_videos_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "connected_youtube_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "youtube_videos_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_client: { Args: { _client_id: string }; Returns: boolean }
      create_workspace_for_user: {
        Args: { p_user_id: string; p_workspace_name: string }
        Returns: string
      }
      get_client_id_for_user: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: string
      }
      get_workspace_role: {
        Args: { ws_id: string }
        Returns: Database["public"]["Enums"]["workspace_role"]
      }
      has_portal_role: {
        Args: {
          _role: Database["public"]["Enums"]["portal_role"]
          _user_id: string
          _workspace_id: string
        }
        Returns: boolean
      }
      is_coach: { Args: { _workspace_id: string }; Returns: boolean }
      is_run_owner: { Args: { run_id: string }; Returns: boolean }
      is_workspace_member: { Args: { ws_id: string }; Returns: boolean }
      is_workspace_owner: { Args: { ws_id: string }; Returns: boolean }
    }
    Enums: {
      portal_role: "coach" | "client" | "setter"
      workspace_role: "owner" | "setter"
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

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      portal_role: ["coach", "client", "setter"],
      workspace_role: ["owner", "setter"],
    },
  },
} as const
