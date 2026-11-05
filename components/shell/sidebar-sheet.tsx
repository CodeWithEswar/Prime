"use client";
import { useState } from "react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { PrimeLogo } from "@/components/branding";
import { Icon } from "@/components/ui/icon";
import { Logout01Icon } from "@hugeicons/core-free-icons";
import { SidebarNavigation } from "./sidebar-navigation";
import { signOutAction } from "./actions";
import type { ShellUserData } from "./types";
export function SidebarSheet({
  open,
  onOpenChange,
  onCloseAutoFocus,
  user,
  revisionDueCount = 0,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus?: (event: Event) => void;
  user: ShellUserData | null;
  revisionDueCount?: number;
}) {
  const [pending, setPending] = useState(false),
    [error, setError] = useState("");
  async function logout() {
    setPending(true);
    setError("");
    try {
      await signOutAction();
    } catch {
      setPending(false);
      setError("Couldn’t sign out. Please try again.");
    }
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        id="prime-sidebar-sheet"
        side="left"
        className="shell-sidebar-sheet"
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <div className="shell-sidebar-sheet-heading">
          <Link
            href="/practice/dsa"
            aria-label="PRIME Home"
            onClick={() => onOpenChange(false)}
          >
            <PrimeLogo size="sm" />
          </Link>
          <SheetTitle className="sr-only">Workspace navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Navigation and account controls.
          </SheetDescription>
        </div>
        <SidebarNavigation
          id="prime-sidebar-sheet-navigation"
          collapsed={false}
          revisionDueCount={revisionDueCount}
          onNavigate={() => onOpenChange(false)}
        />
        <div className="shell-sidebar-sheet-account">
          <span>{user?.displayName || "Account"}</span>
          <small>{user?.email}</small>
          <button type="button" onClick={logout} disabled={pending}>
            <Icon icon={Logout01Icon} size={18} aria-hidden="true" />
            {pending ? "Signing out…" : "Sign out"}
          </button>
          {error && <p role="alert">{error}</p>}
        </div>
      </SheetContent>
    </Sheet>
  );
}
