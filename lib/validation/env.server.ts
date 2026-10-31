import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().default("http://127.0.0.1:54321"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1)
    .default("anon-key-placeholder-for-bootstrap"),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1)
    .default("service-role-key-placeholder-for-bootstrap"),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("PRIME <notifications@primeprep.app>"),
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

function validateServerEnv(): ServerEnv {
  const result = serverEnvSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
  });

  if (!result.success) {
    console.error(
      "❌ Invalid server environment variables:",
      result.error.flatten().fieldErrors
    );
    throw new Error("Server environment validation failed");
  }

  return result.data;
}

export const serverEnv = validateServerEnv();
