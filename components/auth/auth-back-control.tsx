"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { safeAuthReturn } from "@/features/auth/schema";

export function AuthBackControl() {
  const router = useRouter();
  return (
    <Link
      href="/"
      className="auth-back"
      aria-label="Go back"
      onClick={(event) => {
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        try {
          if (!document.referrer || window.history.length <= 1) return;
          const previous = new URL(document.referrer);
          const destination = safeAuthReturn(
            `${previous.pathname}${previous.search}${previous.hash}`
          );
          if (
            previous.origin === window.location.origin &&
            (destination !== "/" || previous.pathname === "/")
          ) {
            event.preventDefault();
            router.back();
          }
        } catch {
          /* The native home link remains a safe fallback. */
        }
      }}
    >
      <Icon icon={ArrowLeft02Icon} size={15} aria-hidden="true" />
      <span>Back</span>
    </Link>
  );
}
