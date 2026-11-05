import { AuthSurface } from "@/components/auth/auth-form";
import { Button } from "@/components/ui/button";
export default function AuthProblemPage() {
  return (
    <AuthSurface>
      <h1 id="auth-heading">Let’s try again.</h1>
      <p className="auth-description">
        We couldn’t complete sign-in. Your link may have expired, or the connection may
        have been interrupted.
      </p>
      <p className="auth-sent-note">
        Return to sign in and request a fresh link, or continue with Google.
      </p>
      <Button asChild className="auth-full-button">
        <a href="/login">Return to sign in</a>
      </Button>
    </AuthSurface>
  );
}
