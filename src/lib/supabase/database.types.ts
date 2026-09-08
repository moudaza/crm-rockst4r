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
      clients: {
        Row: {
          address: string | null
          created_at: string
          document: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      google_calendar_connection: {
        Row: {
          access_token: string
          calendar_email: string | null
          calendar_id: string
          connected_at: string
          connected_by: string | null
          id: string
          refresh_token: string
          scope: string | null
          token_expires_at: string
          updated_at: string
        }
        Insert: {
          access_token: string
          calendar_email?: string | null
          calendar_id?: string
          connected_at?: string
          connected_by?: string | null
          id?: string
          refresh_token: string
          scope?: string | null
          token_expires_at: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          calendar_email?: string | null
          calendar_id?: string
          connected_at?: string
          connected_by?: string | null
          id?: string
          refresh_token?: string
          scope?: string | null
          token_expires_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_calendar_connection_connected_by_fkey"
            columns: ["connected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          converted_to_client_id: string | null
          created_at: string
          email: string | null
          id: string
          last_contacted_at: string | null
          name: string
          next_follow_up_at: string | null
          notes: string | null
          phone: string | null
          service_id: string | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          converted_to_client_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contacted_at?: string | null
          name: string
          next_follow_up_at?: string | null
          notes?: string | null
          phone?: string | null
          service_id?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          converted_to_client_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contacted_at?: string | null
          name?: string
          next_follow_up_at?: string | null
          notes?: string | null
          phone?: string | null
          service_id?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_converted_to_client_id_fkey"
            columns: ["converted_to_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          role_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          role_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          role_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          cancelled_at: string | null
          client_id: string | null
          confirmed_at: string | null
          created_at: string
          ends_at: string
          expires_at: string | null
          google_event_id: string | null
          id: string
          lead_id: string | null
          notes: string | null
          reserved_at: string
          service_id: string
          starts_at: string
          status: Database["public"]["Enums"]["reservation_status"]
          updated_at: string
        }
        Insert: {
          cancelled_at?: string | null
          client_id?: string | null
          confirmed_at?: string | null
          created_at?: string
          ends_at: string
          expires_at?: string | null
          google_event_id?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          reserved_at?: string
          service_id: string
          starts_at: string
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
        }
        Update: {
          cancelled_at?: string | null
          client_id?: string | null
          confirmed_at?: string | null
          created_at?: string
          ends_at?: string
          expires_at?: string | null
          google_event_id?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          reserved_at?: string
          service_id?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      service_availability_windows: {
        Row: {
          buffer_minutes: number
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          service_id: string
          start_time: string
          updated_at: string
        }
        Insert: {
          buffer_minutes?: number
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          service_id: string
          start_time: string
          updated_at?: string
        }
        Update: {
          buffer_minutes?: number
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          service_id?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_availability_windows_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          active: boolean
          created_at: string
          deposit_percentage: number | null
          description: string | null
          duration_minutes: number
          id: string
          name: string
          payment_type: Database["public"]["Enums"]["service_payment_type"]
          pre_reservation_minutes: number
          price: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          deposit_percentage?: number | null
          description?: string | null
          duration_minutes: number
          id?: string
          name: string
          payment_type?: Database["public"]["Enums"]["service_payment_type"]
          pre_reservation_minutes?: number
          price: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          deposit_percentage?: number | null
          description?: string | null
          duration_minutes?: number
          id?: string
          name?: string
          payment_type?: Database["public"]["Enums"]["service_payment_type"]
          pre_reservation_minutes?: number
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_pre_reservation: {
        Args: {
          p_client_id?: string
          p_lead_id?: string
          p_notes?: string
          p_service_id: string
          p_starts_at: string
        }
        Returns: {
          cancelled_at: string | null
          client_id: string | null
          confirmed_at: string | null
          created_at: string
          ends_at: string
          expires_at: string | null
          google_event_id: string | null
          id: string
          lead_id: string | null
          notes: string | null
          reserved_at: string
          service_id: string
          starts_at: string
          status: Database["public"]["Enums"]["reservation_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "reservations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      lead_status:
        | "NUEVO"
        | "CONTACTADO"
        | "COTIZACION_ENVIADA"
        | "EN_NEGOCIACION"
        | "RESERVADO"
        | "CLIENTE"
        | "PERDIDO"
      reservation_status: "PRE_RESERVED" | "CONFIRMED" | "EXPIRED" | "CANCELLED"
      service_payment_type: "FULL" | "DEPOSIT"
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
  public: {
    Enums: {
      lead_status: [
        "NUEVO",
        "CONTACTADO",
        "COTIZACION_ENVIADA",
        "EN_NEGOCIACION",
        "RESERVADO",
        "CLIENTE",
        "PERDIDO",
      ],
      reservation_status: ["PRE_RESERVED", "CONFIRMED", "EXPIRED", "CANCELLED"],
      service_payment_type: ["FULL", "DEPOSIT"],
    },
  },
} as const
