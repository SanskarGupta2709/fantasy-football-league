export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      fixtures: {
        Row: {
          created_at: string
          id: string
          match_id: string | null
          scheduled_date: string
          stage: string
          status: string
          team_a_id: string
          team_b_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id?: string | null
          scheduled_date: string
          stage?: string
          status?: string
          team_a_id: string
          team_b_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string | null
          scheduled_date?: string
          stage?: string
          status?: string
          team_a_id?: string
          team_b_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fixtures_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_team_a_id_fkey"
            columns: ["team_a_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_team_b_id_fkey"
            columns: ["team_b_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_scorers: {
        Row: {
          assists: number
          goals: number
          id: string
          match_id: string
          player_id: string
          red_cards: number
          team_id: string
          yellow_cards: number
        }
        Insert: {
          assists?: number
          goals?: number
          id?: string
          match_id: string
          player_id: string
          red_cards?: number
          team_id: string
          yellow_cards?: number
        }
        Update: {
          assists?: number
          goals?: number
          id?: string
          match_id?: string
          player_id?: string
          red_cards?: number
          team_id?: string
          yellow_cards?: number
        }
        Relationships: [
          {
            foreignKeyName: "goal_scorers_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_scorers_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_scorers_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          id: string
          match_date: string
          round: Database["public"]["Enums"]["match_round"]
          team_a_id: string
          team_a_score: number
          team_b_id: string
          team_b_score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_date: string
          round: Database["public"]["Enums"]["match_round"]
          team_a_id: string
          team_a_score?: number
          team_b_id: string
          team_b_score?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_date?: string
          round?: Database["public"]["Enums"]["match_round"]
          team_a_id?: string
          team_a_score?: number
          team_b_id?: string
          team_b_score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_team_a_id_fkey"
            columns: ["team_a_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team_b_id_fkey"
            columns: ["team_b_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          assists: number
          created_at: string
          goals: number
          id: string
          jersey_number: number
          name: string
          position: Database["public"]["Enums"]["player_position"]
          red_cards: number
          team_id: string
          updated_at: string
          yellow_cards: number
        }
        Insert: {
          assists?: number
          created_at?: string
          goals?: number
          id?: string
          jersey_number: number
          name: string
          position: Database["public"]["Enums"]["player_position"]
          red_cards?: number
          team_id: string
          updated_at?: string
          yellow_cards?: number
        }
        Update: {
          assists?: number
          created_at?: string
          goals?: number
          id?: string
          jersey_number?: number
          name?: string
          position?: Database["public"]["Enums"]["player_position"]
          red_cards?: number
          team_id?: string
          updated_at?: string
          yellow_cards?: number
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          draws: number
          goals_against: number
          goals_for: number
          id: string
          logo: string
          losses: number
          manager: string
          matches_played: number
          name: string
          points: number
          updated_at: string
          user_id: string
          wins: number
        }
        Insert: {
          created_at?: string
          draws?: number
          goals_against?: number
          goals_for?: number
          id?: string
          logo: string
          losses?: number
          manager: string
          matches_played?: number
          name: string
          points?: number
          updated_at?: string
          user_id: string
          wins?: number
        }
        Update: {
          created_at?: string
          draws?: number
          goals_against?: number
          goals_for?: number
          id?: string
          logo?: string
          losses?: number
          manager?: string
          matches_played?: number
          name?: string
          points?: number
          updated_at?: string
          user_id?: string
          wins?: number
        }
        Relationships: []
      }
      tournament_bracket: {
        Row: {
          bracket_data: Json
          created_at: string
          id: string
          stage: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bracket_data?: Json
          created_at?: string
          id?: string
          stage?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bracket_data?: Json
          created_at?: string
          id?: string
          stage?: string
          updated_at?: string
          user_id?: string
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
      match_round:
        | "Group Stage"
        | "Round of 16"
        | "Quarter Finals"
        | "Semi Finals"
        | "Final"
      player_position: "Forward" | "Midfielder" | "Defender" | "Goalkeeper"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      match_round: [
        "Group Stage",
        "Round of 16",
        "Quarter Finals",
        "Semi Finals",
        "Final",
      ],
      player_position: ["Forward", "Midfielder", "Defender", "Goalkeeper"],
    },
  },
} as const
