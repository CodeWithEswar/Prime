/**
 * Cloudflare Worker Shared Environment Bindings
 */
export interface WorkerEnv {
  ENVIRONMENT: "development" | "preview" | "production";
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
}
