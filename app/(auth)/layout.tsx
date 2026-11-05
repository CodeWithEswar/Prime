import type { Metadata } from "next";
import { AuthEnvironmentShell } from "@/components/auth/auth-environment";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthEnvironmentShell>{children}</AuthEnvironmentShell>;
}
