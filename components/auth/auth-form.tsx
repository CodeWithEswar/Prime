"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useSpring } from "motion/react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircleIcon,
  Mail01Icon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PrimeLogo } from "@/components/branding";
import {
  DEFAULT_AUTH_REDIRECT,
  emailSignInSchema,
  maskAuthEmail,
  safeAuthReturn,
} from "@/features/auth/schema";
import { useAuthEnvironment, useAuthQuery } from "./auth-environment";
import { motionSpring, usePrimeReducedMotion } from "@/lib/motion";

type Credentials = { email: string };
class SignInFailure extends Error {}
export function AuthSurface({ children }: { children: React.ReactNode }) {
  return (
    <section className="auth-surface" aria-labelledby="auth-heading">
      <div className="auth-surface-brand">
        <PrimeLogo size="sm" />
      </div>
      {children}
    </section>
  );
}
export function LoginForm() {
  const reduced = usePrimeReducedMotion();
  const googlePointer = useMotionValue(0);
  const googleHighlight = useSpring(googlePointer, motionSpring.control);
  const { phase, setPhase } = useAuthEnvironment();
  const query = useAuthQuery();
  const nextParam = query.get("next");
  const next = nextParam && nextParam !== "/" ? safeAuthReturn(nextParam) : DEFAULT_AUTH_REDIRECT;
  const [pending, setPending] = useState<"email" | "google" | null>(null);
  const [error, setError] = useState("");
  const [googleAvailable, setGoogleAvailable] = useState<boolean | null>(null);
  const [sentTo, setSentTo] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const locked = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const feedbackRef = useRef<HTMLHeadingElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Credentials>({
    resolver: zodResolver(emailSignInSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { email: "" },
  });
  useEffect(() => () => abortRef.current?.abort(), []);
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/auth/methods", { signal: controller.signal })
      .then((response) => response.json())
      .then((methods) => setGoogleAvailable(methods.google === true))
      .catch(() => {
        if (!controller.signal.aborted) setGoogleAvailable(false);
      });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (!sentTo) return;
    feedbackRef.current?.focus();
    const id = window.setInterval(
      () => setCooldown((value) => Math.max(0, value - 1)),
      1000
    );
    return () => window.clearInterval(id);
  }, [sentTo]);
  async function send(method: "email" | "google", email?: string) {
    if (locked.current) return;
    if (!navigator.onLine) {
      setError("You appear to be offline. Reconnect and try again.");
      setPhase("error");
      return;
    }
    locked.current = true;
    setPending(method);
    setError("");
    setPhase("submitting");
    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    let redirecting = false;
    try {
      const body = new FormData();
      body.set("next", next);
      if (email) body.set("email", email);
      const response = await fetch(`/auth/${method}`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body,
        signal: controller.signal,
        credentials: "same-origin",
      });
      const data = await response.json();
      if (!response.ok || !data.ok)
        throw new SignInFailure(
          response.status === 429
            ? "Please wait a moment before trying again."
            : "We couldn’t sign you in. Please try again shortly."
        );
      if (method === "google") {
        const destination = new URL(data.url);
        const configured = new URL(
          process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321"
        );
        if (destination.origin !== configured.origin)
          throw new SignInFailure("We couldn’t start sign-in. Please try again.");
        redirecting = true;
        window.location.assign(destination.toString());
        return;
      }
      setSentTo(email!);
      setCooldown(60);
      setPhase("sent");
    } catch (caught) {
      setError(
        caught instanceof SignInFailure
          ? caught.message
          : caught instanceof Error && caught.name === "AbortError"
            ? "The connection took too long. Please try again."
            : "We couldn’t connect. Check your connection and try again."
      );
      setPhase("error");
    } finally {
      window.clearTimeout(timeout);
      if (!redirecting) {
        locked.current = false;
        setPending(null);
      }
      abortRef.current = null;
    }
  }
  if (sentTo)
    return (
      <AuthSurface>
        <div className="auth-sent-symbol">
          <Icon icon={Mail01Icon} size={26} aria-hidden="true" />
        </div>
        <h1 id="auth-heading" ref={feedbackRef} tabIndex={-1}>
          Check your email.
        </h1>
        <p className="auth-description">
          If an account is available for <strong>{maskAuthEmail(sentTo)}</strong>, you’ll
          receive a sign-in link shortly.
        </p>
        <p className="auth-sent-note">
          Open the link to continue. Check your spam folder if it doesn’t appear.
        </p>
        {error && <AuthFeedback message={error} />}
        <Button
          type="button"
          className="auth-full-button"
          variant="secondary"
          disabled={!!pending || cooldown > 0}
          loading={pending === "email"}
          onClick={() => send("email", sentTo)}
        >
          Send another link
        </Button>
        <p className="auth-cooldown" aria-live="off">
          {cooldown > 0 ? `You can try again in ${cooldown}s.` : "Ready to send again."}
        </p>
        <button
          className="auth-text-action"
          type="button"
          disabled={!!pending}
          onClick={() => {
            setSentTo("");
            setError("");
            setPhase("idle");
            window.requestAnimationFrame(() =>
              document.getElementById("auth-email")?.focus()
            );
          }}
        >
          Use another email
        </button>
      </AuthSurface>
    );
  return (
    <AuthSurface>
      <h1 id="auth-heading">Welcome back.</h1>
      <p className="auth-description">Continue your preparation where you left off.</p>
      <form
        action="/auth/google"
        method="post"
        onSubmit={(event) => {
          event.preventDefault();
          void send("google");
        }}
      >
        <input type="hidden" name="next" value={query.get("next") || ""} />
        <Button
          type="submit"
          variant="outline"
          className="auth-google auth-full-button"
          disabled={!!pending || googleAvailable !== true}
          loading={pending === "google"}
          onPointerMove={(event) => {
            if (reduced || event.pointerType !== "mouse") return;
            const bounds = event.currentTarget.getBoundingClientRect();
            googlePointer.set(event.clientX - bounds.left - bounds.width / 2);
          }}
          onPointerLeave={() => googlePointer.set(0)}
        >
          <motion.span
            className="auth-google-highlight"
            aria-hidden="true"
            style={{ x: reduced ? 0 : googleHighlight }}
          />
          <span className="auth-google-label">
            <span className="google-identity">
              <Image src="/brand/providers/google-g.png" alt="" width={18} height={18} />
            </span>
            <span>
              {pending === "google" ? "Connecting to Google…" : "Continue with Google"}
            </span>
          </span>
        </Button>
      </form>
      <p className="auth-provider-note" aria-live="polite">
        {googleAvailable === false
          ? "Google sign-in is currently unavailable."
          : "\u00a0"}
      </p>
      <div className="auth-divider">
        <span />
        or continue with email
        <span />
      </div>
      <form
        action="/auth/email"
        method="post"
        noValidate
        onSubmit={(event) => {
          void handleSubmit(
            (values) => send("email", values.email),
            () => setPhase("error")
          )(event);
        }}
        aria-busy={pending === "email"}
      >
        <input type="hidden" name="next" value={query.get("next") || ""} />
        <div className="auth-field">
          <label htmlFor="auth-email">Email address</label>
          <Input
            {...register("email")}
            id="auth-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="you@example.com"
            disabled={!!pending}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "auth-email-error" : "auth-email-help"}
            onFocus={() => setPhase("email-focus")}
            onBlur={(event) => {
              void register("email").onBlur(event);
              if (phase === "email-focus") setPhase("idle");
            }}
          />
          <span className="auth-focus-trace" aria-hidden="true" />
          {errors.email ? (
            <p id="auth-email-error" className="auth-field-error" role="alert">
              <Icon icon={AlertCircleIcon} size={14} aria-hidden="true" />
              {errors.email.message}
            </p>
          ) : (
            <p id="auth-email-help" className="auth-field-help">
              We’ll send you a link. No password needed.
            </p>
          )}
        </div>
        {error && <AuthFeedback message={error} />}
        <Button
          type="submit"
          className="auth-full-button auth-continue"
          disabled={!!pending}
          loading={pending === "email"}
        >
          {pending === "email" ? "Sending your link…" : "Continue with email"}
        </Button>
      </form>
      <p className="auth-bottom-note">One clear next step in your preparation.</p>
    </AuthSurface>
  );
}
export function AuthFeedback({ message }: { message: string }) {
  return (
    <p className="auth-feedback" role="alert">
      <Icon icon={AlertCircleIcon} size={16} aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}
export function AuthCompletion() {
  const { setPhase } = useAuthEnvironment();
  const query = useAuthQuery();
  const reduced = usePrimeReducedMotion();
  const router = useRouter();
  const nextParam = query.get("next");
  const next = nextParam && nextParam !== "/" ? safeAuthReturn(nextParam) : DEFAULT_AUTH_REDIRECT;
  useEffect(() => {
    setPhase("success");
    const id = window.setTimeout(() => router.replace(next), reduced ? 0 : 500);
    return () => window.clearTimeout(id);
  }, [next, reduced, router, setPhase]);
  return (
    <AuthSurface>
      <div className="auth-sent-symbol">
        <Icon icon={CheckmarkCircle01Icon} size={27} aria-hidden="true" />
      </div>
      <h1 id="auth-heading">You’re signed in.</h1>
      <p className="auth-description" role="status">
        Continuing to PRIME…
      </p>
      <Button asChild className="auth-full-button">
        <a href={next}>Continue</a>
      </Button>
    </AuthSurface>
  );
}
