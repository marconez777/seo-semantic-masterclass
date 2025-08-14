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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      backlinks: {
        Row: {
          category: string
          created_at: string
          da: number | null
          dr: number | null
          id: string
          is_active: boolean
          link_type: string | null
          price_cents: number
          requirements: string[] | null
          site_name: string
          site_url: string
          traffic: number | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          da?: number | null
          dr?: number | null
          id?: string
          is_active?: boolean
          link_type?: string | null
          price_cents: number
          requirements?: string[] | null
          site_name: string
          site_url: string
          traffic?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          da?: number | null
          dr?: number | null
          id?: string
          is_active?: boolean
          link_type?: string | null
          price_cents?: number
          requirements?: string[] | null
          site_name?: string
          site_url?: string
          traffic?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      backlinks_public: {
        Row: {
          category: string
          da: number | null
          dr: number | null
          id: string
          is_active: boolean
          price_cents: number
          site_name: string
          site_url: string
          traffic: number | null
        }
        Insert: {
          category: string
          da?: number | null
          dr?: number | null
          id: string
          is_active?: boolean
          price_cents: number
          site_name: string
          site_url: string
          traffic?: number | null
        }
        Update: {
          category?: string
          da?: number | null
          dr?: number | null
          id?: string
          is_active?: boolean
          price_cents?: number
          site_name?: string
          site_url?: string
          traffic?: number | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string
          id: string
          image: string | null
          schema_data: Json | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          image?: string | null
          schema_data?: Json | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          image?: string | null
          schema_data?: Json | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      favoritos: {
        Row: {
          backlink_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          backlink_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          backlink_id?: string
          created_at?: string
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
        ]
      }
      order_items: {
        Row: {
          anchor_text: string | null
          backlink_id: string
          created_at: string
          id: string
          order_id: string
          price_cents: number
          publication_status: Database["public"]["Enums"]["publication_status"]
          publication_url: string | null
          quantity: number
          target_url: string | null
          updated_at: string
        }
        Insert: {
          anchor_text?: string | null
          backlink_id: string
          created_at?: string
          id?: string
          order_id: string
          price_cents: number
          publication_status?: Database["public"]["Enums"]["publication_status"]
          publication_url?: string | null
          quantity?: number
          target_url?: string | null
          updated_at?: string
        }
        Update: {
          anchor_text?: string | null
          backlink_id?: string
          created_at?: string
          id?: string
          order_id?: string
          price_cents?: number
          publication_status?: Database["public"]["Enums"]["publication_status"]
          publication_url?: string | null
          quantity?: number
          target_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_backlink_id_fkey"
            columns: ["backlink_id"]
            isOneToOne: false
            referencedRelation: "backlinks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          abacate_bill_id: string | null
          abacate_url: string | null
          created_at: string
          id: string
          status: Database["public"]["Enums"]["order_status"]
          total_cents: number
          updated_at: string
          user_id: string
        }
        Insert: {
          abacate_bill_id?: string | null
          abacate_url?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_cents: number
          updated_at?: string
          user_id: string
        }
        Update: {
          abacate_bill_id?: string | null
          abacate_url?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_cents?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pedidos_pii: {
        Row: {
          created_at: string
          customer_cpf: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          order_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_cpf?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          order_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_cpf?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          order_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_pii_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content_md: string
          created_at: string
          featured_image_url: string | null
          id: string
          published: boolean
          seo_description: string | null
          seo_title: string | null
          slug: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content_md: string
          created_at?: string
          featured_image_url?: string | null
          id?: string
          published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content_md?: string
          created_at?: string
          featured_image_url?: string | null
          id?: string
          published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrypt_pii: {
        Args: { encrypted_data: string }
        Returns: string
      }
      encrypt_pii: {
        Args: { data: string }
        Returns: string
      }
      get_decrypted_pii_secure: {
        Args: { p_order_id: string }
        Returns: {
          customer_cpf: string
          customer_email: string
          customer_name: string
          customer_phone: string
          order_id: string
        }[]
      }
      get_multiple_decrypted_pii_secure: {
        Args: { p_order_ids: string[] }
        Returns: {
          customer_cpf: string
          customer_email: string
          customer_name: string
          customer_phone: string
          order_id: string
        }[]
      }
      get_pii_encryption_key: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      insert_encrypted_pii: {
        Args: {
          p_customer_cpf?: string
          p_customer_email?: string
          p_customer_name?: string
          p_customer_phone?: string
          p_order_id: string
        }
        Returns: undefined
      }
      insert_encrypted_pii_secure: {
        Args: {
          p_customer_cpf?: string
          p_customer_email?: string
          p_customer_name?: string
          p_customer_phone?: string
          p_order_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      order_status: "pending" | "paid" | "cancelled" | "refunded"
      publication_status: "pending" | "in_progress" | "published" | "rejected"
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
      app_role: ["admin", "moderator", "user"],
      order_status: ["pending", "paid", "cancelled", "refunded"],
      publication_status: ["pending", "in_progress", "published", "rejected"],
    },
  },
} as const
