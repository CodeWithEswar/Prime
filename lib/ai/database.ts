import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
// Generated Postgres RPC types do not express nullable arguments. The deployed
// begin_ai_turn explicitly accepts SQL NULL to start a new conversation.
type BeginTurn = Database["public"]["Functions"]["begin_ai_turn"];
type AIDatabase = Omit<Database, "public"> & {
  public: Omit<Database["public"], "Functions"> & {
    Functions: Omit<Database["public"]["Functions"], "begin_ai_turn"> & {
      begin_ai_turn: Omit<BeginTurn, "Args"> & {
        Args: Omit<BeginTurn["Args"], "p_conversation_id"> & {
          p_conversation_id: string | null;
        };
      };
    };
  };
};
export type AIClient = SupabaseClient<AIDatabase>;
