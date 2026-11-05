"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Settings01Icon,
  Logout01Icon,
  Search01Icon,
  MoreVerticalIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { signOutAction } from "./actions";
import type { ShellUserData } from "./types";
import { cn } from "@/lib/utils";
export function SidebarUser({
  user,
  collapsed,
  onOpenShortcuts,
  className,
}: {
  user: ShellUserData | null;
  collapsed: boolean;
  onOpenShortcuts?: (trigger?: HTMLElement) => void;
  className?: string;
}) {
  const [pending, setPending] = useState(false),
    [error, setError] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const name = user?.displayName || user?.email?.split("@")[0] || "Account";
  const parts = name.trim().split(/\s+/),
    initials = (
      parts.length > 1 ? parts[0][0] + parts.at(-1)![0] : name.slice(0, 2)
    ).toUpperCase();
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
  const trigger = (
    <button
      ref={triggerRef}
      type="button"
      className="shell-user-trigger"
      aria-label="User Account Menu"
    >
      <Avatar className="shell-user-avatar">
        {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <span className="shell-user-copy shell-label">
        <span>{name}</span>
        <small>Account &amp; preferences</small>
      </span>
      {!collapsed && (
        <Icon
          icon={MoreVerticalIcon}
          size={15}
          aria-hidden="true"
          className="shell-label"
        />
      )}
    </button>
  );
  return (
    <div className={cn("shell-user-area", className)}>
      <DropdownMenu>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" className="shell-tooltip">
              {name}
            </TooltipContent>
          </Tooltip>
        ) : (
          <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        )}
        <DropdownMenuContent
          side="right"
          align="end"
          sideOffset={12}
          className="shell-user-menu w-60 bg-black border-[var(--border-default)] p-1.5"
        >
          <DropdownMenuLabel className="px-2.5 py-3">
            <span className="block text-xs font-medium">{name}</span>
            <span className="block mt-1 text-[10px] font-normal text-[var(--text-tertiary)] truncate">
              {user?.email}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="text-xs">
            <Link href="/settings">
              <Icon icon={Settings01Icon} size={17} aria-hidden="true" className="mr-3" />
              Account settings
            </Link>
          </DropdownMenuItem>
          {onOpenShortcuts && (
            <DropdownMenuItem
              onSelect={() =>
                requestAnimationFrame(() =>
                  onOpenShortcuts(triggerRef.current ?? undefined)
                )
              }
              className="text-xs"
            >
              <Icon icon={Search01Icon} size={17} aria-hidden="true" className="mr-3" />
              Quick navigation
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={pending}
            onSelect={(event) => {
              event.preventDefault();
              void logout();
            }}
            className="text-xs"
          >
            <Icon icon={Logout01Icon} size={17} aria-hidden="true" className="mr-3" />
            {pending ? "Signing out…" : "Sign out"}
          </DropdownMenuItem>
          {error && (
            <p role="alert" className="shell-user-error px-2.5 py-2">
              {error}
            </p>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
