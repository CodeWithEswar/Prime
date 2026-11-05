import { AuthSurface } from "@/components/auth/auth-form";
import { Button } from "@/components/ui/button";
export default function CheckEmailPage() {
  return (
    <AuthSurface>
      <h1 id="auth-heading">Check your email.</h1>
      <p className="auth-description">
        If your address can sign in, you’ll receive a link shortly.
      </p>
      <p className="auth-sent-note">
        Open the link to continue to PRIME. Check your spam folder if it doesn’t appear.
      </p>
      <Button asChild variant="secondary" className="auth-full-button">
        <a href="/login">Return to sign in</a>
      </Button>
    </AuthSurface>
  );
}
