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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      comments: {
        Row: {
          author_id: number
          body: string
          comment_id: number
          created_at: string | null
          post_id: number
          updated_at: string | null
          uuid: string
        }
        Insert: {
          author_id: number
          body: string
          comment_id?: number
          created_at?: string | null
          post_id: number
          updated_at?: string | null
          uuid?: string
        }
        Update: {
          author_id?: number
          body?: string
          comment_id?: number
          created_at?: string | null
          post_id?: number
          updated_at?: string | null
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "pending_member_approvals"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "pending_post_reviews"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "pending_post_reviews"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_feed_view"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["post_id"]
          },
        ]
      }
      community_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: number | null
          entity_type: string | null
          ip_address: unknown
          log_id: number
          member_id: number | null
          user_agent: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: number | null
          entity_type?: string | null
          ip_address?: unknown
          log_id?: number
          member_id?: number | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: number | null
          entity_type?: string | null
          ip_address?: unknown
          log_id?: number
          member_id?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_audit_logs_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "community_audit_logs_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "pending_member_approvals"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "community_audit_logs_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "pending_post_reviews"
            referencedColumns: ["author_id"]
          },
        ]
      }
      director_categories: {
        Row: {
          assigned_at: string | null
          assigned_by: number | null
          assignment_id: number
          category: string
          member_id: number
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: number | null
          assignment_id?: number
          category: string
          member_id: number
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: number | null
          assignment_id?: number
          category?: string
          member_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "director_categories_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "director_categories_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "pending_member_approvals"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "director_categories_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "pending_post_reviews"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "director_categories_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "director_categories_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "pending_member_approvals"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "director_categories_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "pending_post_reviews"
            referencedColumns: ["author_id"]
          },
        ]
      }
      external_achievements: {
        Row: {
          achievement_date: string | null
          achievement_end_date: string | null
          achievement_id: number
          achievement_type: string | null
          created_at: string | null
          description: string | null
          member_id: number
          proof_url: string | null
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: number | null
          status: string
          title: string
          updated_at: string | null
          uuid: string
        }
        Insert: {
          achievement_date?: string | null
          achievement_end_date?: string | null
          achievement_id?: number
          achievement_type?: string | null
          created_at?: string | null
          description?: string | null
          member_id: number
          proof_url?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: number | null
          status?: string
          title: string
          updated_at?: string | null
          uuid?: string
        }
        Update: {
          achievement_date?: string | null
          achievement_end_date?: string | null
          achievement_id?: number
          achievement_type?: string | null
          created_at?: string | null
          description?: string | null
          member_id?: number
          proof_url?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: number | null
          status?: string
          title?: string
          updated_at?: string | null
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_achievements_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "external_achievements_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "pending_member_approvals"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "external_achievements_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "pending_post_reviews"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "external_achievements_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "external_achievements_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "pending_member_approvals"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "external_achievements_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "pending_post_reviews"
            referencedColumns: ["author_id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follow_id: number
          followee_id: number
          follower_id: number
        }
        Insert: {
          created_at?: string
          follow_id?: number
          followee_id: number
          follower_id: number
        }
        Update: {
          created_at?: string
          follow_id?: number
          followee_id?: number
          follower_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "follows_followee_id_fkey"
            columns: ["followee_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "follows_followee_id_fkey"
            columns: ["followee_id"]
            isOneToOne: false
            referencedRelation: "pending_member_approvals"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "follows_followee_id_fkey"
            columns: ["followee_id"]
            isOneToOne: false
            referencedRelation: "pending_post_reviews"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "pending_member_approvals"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "pending_post_reviews"
            referencedColumns: ["author_id"]
          },
        ]
      }
      job_openings: {
        Row: {
          category: string
          closed_at: string | null
          commitment: string | null
          created_at: string | null
          created_by_name: string
          created_by_role: string
          deadline: string | null
          deleted_at: string | null
          description: string
          id: string
          linked_post_id: string | null
          opening_id: number
          skills: string[] | null
          status: string | null
          team_name: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          closed_at?: string | null
          commitment?: string | null
          created_at?: string | null
          created_by_name: string
          created_by_role: string
          deadline?: string | null
          deleted_at?: string | null
          description: string
          id?: string
          linked_post_id?: string | null
          opening_id?: number
          skills?: string[] | null
          status?: string | null
          team_name?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          closed_at?: string | null
          commitment?: string | null
          created_at?: string | null
          created_by_name?: string
          created_by_role?: string
          deadline?: string | null
          deleted_at?: string | null
          description?: string
          id?: string
          linked_post_id?: string | null
          opening_id?: number
          skills?: string[] | null
          status?: string | null
          team_name?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_openings_linked_post_id_fkey"
            columns: ["linked_post_id"]
            isOneToOne: false
            referencedRelation: "pending_post_reviews"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "job_openings_linked_post_id_fkey"
            columns: ["linked_post_id"]
            isOneToOne: false
            referencedRelation: "post_feed_view"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "job_openings_linked_post_id_fkey"
            columns: ["linked_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["uuid"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string | null
          like_id: number
          member_id: number
          post_id: number
        }
        Insert: {
          created_at?: string | null
          like_id?: number
          member_id: number
          post_id: number
        }
        Update: {
          created_at?: string | null
          like_id?: number
          member_id?: number
          post_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "likes_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "likes_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "pending_member_approvals"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "likes_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "pending_post_reviews"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "pending_post_reviews"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_feed_view"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["post_id"]
          },
        ]
      }
      members: {
        Row: {
          approved_at: string | null
          approved_by: number | null
          auth_uid: string | null
          avatar_url: string | null
          bio: string | null
          class_grade: string | null
          created_at: string | null
          email: string
          full_name: string
          google_id: string | null
          is_active: boolean | null
          join_reason: string | null
          last_login: string | null
          member_id: number
          phone: string | null
          rejection_note: string | null
          role: string | null
          school_id: number | null
          status: string | null
          updated_at: string | null
          uuid: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: number | null
          auth_uid?: string | null
          avatar_url?: string | null
          bio?: string | null
          class_grade?: string | null
          created_at?: string | null
          email: string
          full_name: string
          google_id?: string | null
          is_active?: boolean | null
          join_reason?: string | null
          last_login?: string | null
          member_id?: number
          phone?: string | null
          rejection_note?: string | null
          role?: string | null
          school_id?: number | null
          status?: string | null
          updated_at?: string | null
          uuid?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: number | null
          auth_uid?: string | null
          avatar_url?: string | null
          bio?: string | null
          class_grade?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          google_id?: string | null
          is_active?: boolean | null
          join_reason?: string | null
          last_login?: string | null
          member_id?: number
          phone?: string | null
          rejection_note?: string | null
          role?: string | null
          school_id?: number | null
          status?: string | null
          updated_at?: string | null
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "members_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "members_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "pending_member_approvals"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "members_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "pending_post_reviews"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "members_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["school_id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          full_note: string | null
          id: string
          is_read: boolean
          link: string | null
          member_id: number
          subtitle: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          full_note?: string | null
          id?: string
          is_read?: boolean
          link?: string | null
          member_id: number
          subtitle?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string
          full_note?: string | null
          id?: string
          is_read?: boolean
          link?: string | null
          member_id?: number
          subtitle?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "notifications_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "pending_member_approvals"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "notifications_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "pending_post_reviews"
            referencedColumns: ["author_id"]
          },
        ]
      }
      post_approvals: {
        Row: {
          approval_id: number
          approved_at: string | null
          approved_by: number
          category: string
          post_id: number
        }
        Insert: {
          approval_id?: number
          approved_at?: string | null
          approved_by: number
          category: string
          post_id: number
        }
        Update: {
          approval_id?: number
          approved_at?: string | null
          approved_by?: number
          category?: string
          post_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "post_approvals_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "post_approvals_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "pending_member_approvals"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "post_approvals_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "pending_post_reviews"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "post_approvals_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "pending_post_reviews"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "post_approvals_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_feed_view"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "post_approvals_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["post_id"]
          },
        ]
      }
      post_categories: {
        Row: {
          category: string
          post_category_id: number
          post_id: number
        }
        Insert: {
          category: string
          post_category_id?: number
          post_id: number
        }
        Update: {
          category?: string
          post_category_id?: number
          post_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "post_categories_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "pending_post_reviews"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "post_categories_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_feed_view"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "post_categories_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["post_id"]
          },
        ]
      }
      post_images: {
        Row: {
          blob_name: string
          blob_url: string
          created_at: string | null
          display_order: number | null
          file_size: number | null
          image_id: number
          post_id: number
        }
        Insert: {
          blob_name: string
          blob_url: string
          created_at?: string | null
          display_order?: number | null
          file_size?: number | null
          image_id?: number
          post_id: number
        }
        Update: {
          blob_name?: string
          blob_url?: string
          created_at?: string | null
          display_order?: number | null
          file_size?: number | null
          image_id?: number
          post_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "post_images_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "pending_post_reviews"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "post_images_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_feed_view"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "post_images_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["post_id"]
          },
        ]
      }
      post_tags: {
        Row: {
          created_at: string | null
          post_id: number
          tag_id: number
          tagged_member_id: number
        }
        Insert: {
          created_at?: string | null
          post_id: number
          tag_id?: number
          tagged_member_id: number
        }
        Update: {
          created_at?: string | null
          post_id?: number
          tag_id?: number
          tagged_member_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "pending_post_reviews"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_feed_view"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "post_tags_tagged_member_id_fkey"
            columns: ["tagged_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "post_tags_tagged_member_id_fkey"
            columns: ["tagged_member_id"]
            isOneToOne: false
            referencedRelation: "pending_member_approvals"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "post_tags_tagged_member_id_fkey"
            columns: ["tagged_member_id"]
            isOneToOne: false
            referencedRelation: "pending_post_reviews"
            referencedColumns: ["author_id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: number
          body: string
          category: string
          created_at: string | null
          deleted_at: string | null
          link_image: string | null
          link_title: string | null
          link_url: string | null
          pinned: boolean
          pinned_title: string | null
          post_id: number
          rejection_note: string | null
          reviewed_at: string | null
          reviewed_by: number | null
          status: string | null
          team_id: number | null
          updated_at: string | null
          uuid: string
        }
        Insert: {
          author_id: number
          body: string
          category: string
          created_at?: string | null
          deleted_at?: string | null
          link_image?: string | null
          link_title?: string | null
          link_url?: string | null
          pinned?: boolean
          pinned_title?: string | null
          post_id?: number
          rejection_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: number | null
          status?: string | null
          team_id?: number | null
          updated_at?: string | null
          uuid?: string
        }
        Update: {
          author_id?: number
          body?: string
          category?: string
          created_at?: string | null
          deleted_at?: string | null
          link_image?: string | null
          link_title?: string | null
          link_url?: string | null
          pinned?: boolean
          pinned_title?: string | null
          post_id?: number
          rejection_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: number | null
          status?: string | null
          team_id?: number | null
          updated_at?: string | null
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_posts_team"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "pending_member_approvals"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "pending_post_reviews"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "posts_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "posts_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "pending_member_approvals"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "posts_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "pending_post_reviews"
            referencedColumns: ["author_id"]
          },
        ]
      }
      saved_posts: {
        Row: {
          created_at: string
          member_id: number
          post_id: number
          saved_id: number
        }
        Insert: {
          created_at?: string
          member_id: number
          post_id: number
          saved_id?: number
        }
        Update: {
          created_at?: string
          member_id?: number
          post_id?: number
          saved_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "saved_posts_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "saved_posts_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "pending_member_approvals"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "saved_posts_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "pending_post_reviews"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "saved_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "pending_post_reviews"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "saved_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_feed_view"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "saved_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["post_id"]
          },
        ]
      }
      schools: {
        Row: {
          created_at: string
          location: string | null
          logo_url: string | null
          name: string
          school_id: number
          short_name: string | null
          updated_at: string
          uuid: string
          website: string | null
        }
        Insert: {
          created_at?: string
          location?: string | null
          logo_url?: string | null
          name: string
          school_id?: number
          short_name?: string | null
          updated_at?: string
          uuid?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          location?: string | null
          logo_url?: string | null
          name?: string
          school_id?: number
          short_name?: string | null
          updated_at?: string
          uuid?: string
          website?: string | null
        }
        Relationships: []
      }
      team_join_requests: {
        Row: {
          created_at: string | null
          member_id: number
          message: string | null
          request_id: number
          reviewed_at: string | null
          reviewed_by: number | null
          status: string | null
          team_id: number
          updated_at: string | null
          uuid: string
        }
        Insert: {
          created_at?: string | null
          member_id: number
          message?: string | null
          request_id?: number
          reviewed_at?: string | null
          reviewed_by?: number | null
          status?: string | null
          team_id: number
          updated_at?: string | null
          uuid?: string
        }
        Update: {
          created_at?: string | null
          member_id?: number
          message?: string | null
          request_id?: number
          reviewed_at?: string | null
          reviewed_by?: number | null
          status?: string | null
          team_id?: number
          updated_at?: string | null
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_join_requests_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "team_join_requests_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "pending_member_approvals"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "team_join_requests_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "pending_post_reviews"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "team_join_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "team_join_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "pending_member_approvals"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "team_join_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "pending_post_reviews"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "team_join_requests_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
        ]
      }
      team_members: {
        Row: {
          is_active: boolean | null
          joined_at: string | null
          left_at: string | null
          member_id: number
          role: string | null
          team_id: number
          team_member_id: number
        }
        Insert: {
          is_active?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          member_id: number
          role?: string | null
          team_id: number
          team_member_id?: number
        }
        Update: {
          is_active?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          member_id?: number
          role?: string | null
          team_id?: number
          team_member_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "team_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "team_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "pending_member_approvals"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "team_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "pending_post_reviews"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
        ]
      }
      teams: {
        Row: {
          category: string
          created_at: string | null
          created_by: number | null
          description: string | null
          is_active: boolean | null
          logo_url: string | null
          name: string
          team_id: number
          updated_at: string | null
          uuid: string
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: number | null
          description?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          team_id?: number
          updated_at?: string | null
          uuid?: string
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: number | null
          description?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          team_id?: number
          updated_at?: string | null
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "teams_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "pending_member_approvals"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "teams_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "pending_post_reviews"
            referencedColumns: ["author_id"]
          },
        ]
      }
      volunteer_applications: {
        Row: {
          age: number | null
          availability: string | null
          college: string | null
          created_at: string | null
          email: string
          full_name: string
          id: number
          instagram_handle: string | null
          interests: string[] | null
          phone: string | null
          previous_experience: string | null
          review_note: string | null
          reviewed: boolean | null
          added: boolean
          texted: boolean
          texted_by: string | null
          why_aquaterra: string
          year_of_study: string | null
        }
        Insert: {
          age?: number | null
          availability?: string | null
          college?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: number
          instagram_handle?: string | null
          interests?: string[] | null
          phone?: string | null
          previous_experience?: string | null
          review_note?: string | null
          reviewed?: boolean | null
          added?: boolean
          texted?: boolean
          texted_by?: string | null
          why_aquaterra: string
          year_of_study?: string | null
        }
        Update: {
          age?: number | null
          availability?: string | null
          college?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: number
          instagram_handle?: string | null
          interests?: string[] | null
          phone?: string | null
          previous_experience?: string | null
          review_note?: string | null
          reviewed?: boolean | null
          added?: boolean
          texted?: boolean
          texted_by?: string | null
          why_aquaterra?: string
          year_of_study?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      pending_member_approvals: {
        Row: {
          avatar_url: string | null
          bio: string | null
          class_grade: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          join_reason: string | null
          member_id: number | null
          phone: string | null
          uuid: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          class_grade?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          join_reason?: string | null
          member_id?: number | null
          phone?: string | null
          uuid?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          class_grade?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          join_reason?: string | null
          member_id?: number | null
          phone?: string | null
          uuid?: string | null
        }
        Relationships: []
      }
      pending_post_reviews: {
        Row: {
          author_avatar: string | null
          author_id: number | null
          author_name: string | null
          body: string | null
          category: string | null
          created_at: string | null
          link_url: string | null
          post_id: number | null
          uuid: string | null
        }
        Relationships: []
      }
      post_feed_view: {
        Row: {
          author_avatar: string | null
          author_id: number | null
          author_name: string | null
          author_role: string | null
          author_uuid: string | null
          body: string | null
          category: string | null
          comment_count: number | null
          created_at: string | null
          images: Json | null
          like_count: number | null
          link_image: string | null
          link_title: string | null
          link_url: string | null
          pinned: boolean | null
          pinned_title: string | null
          post_id: number | null
          status: string | null
          tagged_members: Json | null
          team_name: string | null
          team_uuid: string | null
          updated_at: string | null
          uuid: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "pending_member_approvals"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "pending_post_reviews"
            referencedColumns: ["author_id"]
          },
        ]
      }
    }
    Functions: {
      approve_post_category:
        | { Args: { p_category: string; p_post_uuid: string }; Returns: Json }
        | { Args: { p_category: string; p_post_uuid: string }; Returns: Json }
      get_current_member_id: { Args: never; Returns: number }
      is_assigned_to_category: { Args: { cat: string }; Returns: boolean }
      is_director: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
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
    Enums: {},
  },
} as const
