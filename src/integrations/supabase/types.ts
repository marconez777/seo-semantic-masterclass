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
      backlink_leads: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          notes: string | null
          status: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          notes?: string | null
          status?: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string | null
          status?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      backlinks: {
        Row: {
          category: string | null
          created_at: string | null
          da: number | null
          domain: string | null
          dr: number | null
          id: string
          observacoes: string | null
          price: number | null
          status: string | null
          tipo: string | null
          traffic: number | null
          updated_at: string | null
          url: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          da?: number | null
          domain?: string | null
          dr?: number | null
          id?: string
          observacoes?: string | null
          price?: number | null
          status?: string | null
          tipo?: string | null
          traffic?: number | null
          updated_at?: string | null
          url: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          da?: number | null
          domain?: string | null
          dr?: number | null
          id?: string
          observacoes?: string | null
          price?: number | null
          status?: string | null
          tipo?: string | null
          traffic?: number | null
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      consulting_backlinks: {
        Row: {
          anchor_text: string | null
          client_id: string
          created_at: string
          dr: number | null
          id: string
          month: string
          position: number | null
          publication_url: string | null
          site_domain: string
          status: string
          target_url: string | null
        }
        Insert: {
          anchor_text?: string | null
          client_id: string
          created_at?: string
          dr?: number | null
          id?: string
          month: string
          position?: number | null
          publication_url?: string | null
          site_domain: string
          status?: string
          target_url?: string | null
        }
        Update: {
          anchor_text?: string | null
          client_id?: string
          created_at?: string
          dr?: number | null
          id?: string
          month?: string
          position?: number | null
          publication_url?: string | null
          site_domain?: string
          status?: string
          target_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consulting_backlinks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "consulting_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      consulting_blog_posts: {
        Row: {
          client_id: string
          created_at: string
          id: string
          month: string | null
          published_at: string | null
          status: string
          title: string
          url: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          month?: string | null
          published_at?: string | null
          status?: string
          title: string
          url?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          month?: string | null
          published_at?: string | null
          status?: string
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consulting_blog_posts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "consulting_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      consulting_clients: {
        Row: {
          created_at: string
          domain: string
          email: string | null
          id: string
          name: string
          status: string
          updated_at: string
          user_id: string | null
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          domain: string
          email?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          domain?: string
          email?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      consulting_keywords: {
        Row: {
          client_id: string
          cpc: number | null
          created_at: string
          id: string
          keyword: string
          position: number | null
          volume: number | null
        }
        Insert: {
          client_id: string
          cpc?: number | null
          created_at?: string
          id?: string
          keyword: string
          position?: number | null
          volume?: number | null
        }
        Update: {
          client_id?: string
          cpc?: number | null
          created_at?: string
          id?: string
          keyword?: string
          position?: number | null
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "consulting_keywords_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "consulting_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      consulting_page_keywords: {
        Row: {
          created_at: string
          id: string
          keyword: string
          page_id: string
          repartition: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          keyword: string
          page_id: string
          repartition?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          keyword?: string
          page_id?: string
          repartition?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "consulting_page_keywords_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "consulting_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      consulting_pages: {
        Row: {
          client_id: string
          created_at: string
          id: string
          main_keyword: string | null
          page_url: string | null
          position: number | null
          seo_description: string | null
          seo_title: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          main_keyword?: string | null
          page_url?: string | null
          position?: number | null
          seo_description?: string | null
          seo_title?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          main_keyword?: string | null
          page_url?: string | null
          position?: number | null
          seo_description?: string | null
          seo_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consulting_pages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "consulting_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      consulting_tasks: {
        Row: {
          client_id: string
          column_key: string
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          position: number | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          client_id: string
          column_key?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          position?: number | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          column_key?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          position?: number | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consulting_tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "consulting_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          notes: string | null
          read_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          notes?: string | null
          read_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          notes?: string | null
          read_at?: string | null
          status?: string
        }
        Relationships: []
      }
      favoritos: {
        Row: {
          backlink_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          backlink_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          backlink_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favoritos_backlink_id_fkey"
            columns: ["backlink_id"]
            isOneToOne: false
            referencedRelation: "backlinks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favoritos_backlink_id_fkey"
            columns: ["backlink_id"]
            isOneToOne: false
            referencedRelation: "backlinks_public"
            referencedColumns: ["id"]
          },
        ]
      }
      keyword_history: {
        Row: {
          checked_at: string
          id: string
          keyword_id: string
          position: number | null
        }
        Insert: {
          checked_at?: string
          id?: string
          keyword_id: string
          position?: number | null
        }
        Update: {
          checked_at?: string
          id?: string
          keyword_id?: string
          position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "keyword_history_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "tracked_keywords"
            referencedColumns: ["id"]
          },
        ]
      }
      keyword_monthly_snapshots: {
        Row: {
          checked_at: string
          id: string
          keyword_id: string
          month: string
          position: number | null
        }
        Insert: {
          checked_at?: string
          id?: string
          keyword_id: string
          month: string
          position?: number | null
        }
        Update: {
          checked_at?: string
          id?: string
          keyword_id?: string
          month?: string
          position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "keyword_monthly_snapshots_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "tracked_keywords"
            referencedColumns: ["id"]
          },
        ]
      }
      keyword_projects: {
        Row: {
          created_at: string
          device: string
          domain: string
          id: string
          name: string
          region: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device?: string
          domain: string
          id?: string
          name: string
          region?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device?: string
          domain?: string
          id?: string
          name?: string
          region?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items_new: {
        Row: {
          anchor_text: string | null
          backlink_id: string | null
          created_at: string | null
          id: string
          item_status: string | null
          mk_will_choose: boolean | null
          order_id: string
          price: number | null
          target_url: string | null
        }
        Insert: {
          anchor_text?: string | null
          backlink_id?: string | null
          created_at?: string | null
          id?: string
          item_status?: string | null
          mk_will_choose?: boolean | null
          order_id: string
          price?: number | null
          target_url?: string | null
        }
        Update: {
          anchor_text?: string | null
          backlink_id?: string | null
          created_at?: string | null
          id?: string
          item_status?: string | null
          mk_will_choose?: boolean | null
          order_id?: string
          price?: number | null
          target_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_new_backlink_id_fkey"
            columns: ["backlink_id"]
            isOneToOne: false
            referencedRelation: "backlinks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_new_backlink_id_fkey"
            columns: ["backlink_id"]
            isOneToOne: false
            referencedRelation: "backlinks_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_new_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_new"
            referencedColumns: ["id"]
          },
        ]
      }
      orders_new: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          payment_status: string | null
          status: string | null
          stripe_session_id: string | null
          total: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_status?: string | null
          status?: string | null
          stripe_session_id?: string | null
          total?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_status?: string | null
          status?: string | null
          stripe_session_id?: string | null
          total?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      page_seo_content: {
        Row: {
          canonical_url: string | null
          created_at: string | null
          faqs: Json | null
          h1_title: string | null
          h2_subtitle: string | null
          id: string
          intro_text: string | null
          main_content: string | null
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          page_slug: string
          updated_at: string | null
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string | null
          faqs?: Json | null
          h1_title?: string | null
          h2_subtitle?: string | null
          id?: string
          intro_text?: string | null
          main_content?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          page_slug: string
          updated_at?: string | null
        }
        Update: {
          canonical_url?: string | null
          created_at?: string | null
          faqs?: Json | null
          h1_title?: string | null
          h2_subtitle?: string | null
          id?: string
          intro_text?: string | null
          main_content?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          page_slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          category: string | null
          content: string | null
          cover_image: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          published: boolean | null
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_admin: boolean | null
          updated_at: string | null
          user_id: string | null
          whatsapp: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      tracked_keywords: {
        Row: {
          best_position: number | null
          created_at: string
          current_position: number | null
          id: string
          keyword: string
          last_checked_at: string | null
          previous_position: number | null
          project_id: string
        }
        Insert: {
          best_position?: number | null
          created_at?: string
          current_position?: number | null
          id?: string
          keyword: string
          last_checked_at?: string | null
          previous_position?: number | null
          project_id: string
        }
        Update: {
          best_position?: number | null
          created_at?: string
          current_position?: number | null
          id?: string
          keyword?: string
          last_checked_at?: string | null
          previous_position?: number | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracked_keywords_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "keyword_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      backlinks_public: {
        Row: {
          category: string | null
          created_at: string | null
          da: number | null
          domain: string | null
          dr: number | null
          id: string | null
          price: number | null
          tipo: string | null
          traffic: number | null
          url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          da?: number | null
          domain?: string | null
          dr?: number | null
          id?: string | null
          price?: number | null
          tipo?: string | null
          traffic?: number | null
          url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          da?: number | null
          domain?: string | null
          dr?: number | null
          id?: string | null
          price?: number | null
          tipo?: string | null
          traffic?: number | null
          url?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      promote_to_admin: { Args: { user_email: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
