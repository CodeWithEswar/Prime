import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL")
    .default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid Supabase project URL")
    .default("http://127.0.0.1:54321"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
});

export type ClientEnv = z.infer<typeof clientEnvSchema> & {
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
};

function validateClientEnv(): ClientEnv {
  const result = clientEnvSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!result.success) {
    console.error(
      "❌ Invalid client environment variables:",
      result.error.flatten().fieldErrors
    );
    throw new Error("Client environment validation failed");
  }

  const key =
    result.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    result.data.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "anon-key-placeholder-for-bootstrap";

  return {
    ...result.data,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: key,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key,
  };
}

export const clientEnv = validateClientEnv();
