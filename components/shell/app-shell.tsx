"use client";
import {
  useState,
  useSyncExternalStore,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
  type CSSProperties,
} from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motionDuration, motionEase } from "@/lib/motion";
import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";
import { SidebarSheet } from "./sidebar-sheet";
import { CommandSearch } from "./command-search";
import type { ShellData } from "./types";
import { SIDEBAR_PREFERENCE_COOKIE } from "./preference";
import "./shell.css";
import { WeatherProvider } from "@/features/weather/weather-provider";
import { AIProvider } from "@/features/ai/ai-provider";
const tabletQuery = "(min-width: 768px) and (max-width: 1099px)";
function subscribeTablet(listener: () => void) {
  const media = window.matchMedia(tabletQuery);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}
const getTablet = () => window.matchMedia(tabletQuery).matches;
export function AppShell({
  shellData,
  children,
  initialCollapsed = false,
  topbarActions,
  aiEnabled = false,
}: {
  shellData: ShellData;
  children: ReactNode;
  initialCollapsed?: boolean;
  topbarActions?: ReactNode;
  aiEnabled?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(initialCollapsed),
    [commandOpen, setCommandOpen] = useState(false),
    [sidebarOpen, setSidebarOpen] = useState(false);
  const tablet = useSyncExternalStore(subscribeTablet, getTablet, () => false),
    compact = tablet || collapsed;
  const commandOrigin = useRef<HTMLElement | null>(null);
  const sidebarOrigin = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1100px)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setSidebarOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);
  const changeCommandOpen = useCallback((open: boolean, trigger?: HTMLElement) => {
    if (open)
      commandOrigin.current = trigger ?? (document.activeElement as HTMLElement | null);
    setCommandOpen(open);
  }, []);
  const changeSidebarOpen = useCallback((open: boolean, trigger?: HTMLElement) => {
    if (open)
      sidebarOrigin.current = trigger ?? (document.activeElement as HTMLElement | null);
    setSidebarOpen(open);
  }, []);
  function restoreFocus(event: Event, origin: HTMLElement | null) {
    event.preventDefault();
    const target =
      origin?.isConnected && origin.getClientRects().length
        ? origin
        : document.getElementById("workspace-main");
    target?.focus();
  }
  const toggle = useCallback(
    (trigger?: HTMLElement) => {
      if (tablet) {
        changeSidebarOpen(true, trigger);
        return;
      }
      const next = !collapsed;
      setCollapsed(next);
      document.cookie = `${SIDEBAR_PREFERENCE_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
      try {
        localStorage.setItem(SIDEBAR_PREFERENCE_COOKIE, String(next));
      } catch {}
    },
    [tablet, collapsed, changeSidebarOpen]
  );
  return (
    <TooltipProvider delayDuration={150}>
      <AIProvider
        key={shellData.user?.id ?? "guest"}
        userId={shellData.user?.id ?? "guest"}
        enabled={aiEnabled}
      >
        <WeatherProvider
          key={shellData.user?.id ?? "guest"}
          userId={shellData.user?.id ?? "guest"}
        >
          <div
            className="prime-shell"
            data-collapsed={compact}
            style={
              {
                "--shell-motion": `${motionDuration.moderate}s`,
                "--shell-ease": `cubic-bezier(${motionEase.standard.join(",")})`,
              } as CSSProperties
            }
          >
            <a className="shell-skip" href="#workspace-main">
              Skip to workspace
            </a>
            <AppSidebar
              {...shellData}
              collapsed={compact}
              onToggleCollapse={toggle}
              onOpenShortcuts={(trigger) => changeCommandOpen(true, trigger)}
            />
            <div className="shell-workspace">
              <AppTopbar
                dayContext={shellData.dayContext}
                revisionDueCount={shellData.revisionDueCount}
                onOpenSearch={(trigger) => changeCommandOpen(true, trigger)}
                sidebarOpen={sidebarOpen}
                onOpenSidebar={(trigger) => changeSidebarOpen(true, trigger)}
                actions={topbarActions}
              />
              <main id="workspace-main" tabIndex={-1}>
                {children}
              </main>
            </div>
            <SidebarSheet
              user={shellData.user}
              revisionDueCount={shellData.revisionDueCount}
              open={sidebarOpen}
              onOpenChange={changeSidebarOpen}
              onCloseAutoFocus={(event) => restoreFocus(event, sidebarOrigin.current)}
            />
            <CommandSearch
              open={commandOpen}
              onOpenChange={changeCommandOpen}
              onCloseAutoFocus={(event) => restoreFocus(event, commandOrigin.current)}
            />
          </div>
        </WeatherProvider>
      </AIProvider>
    </TooltipProvider>
  );
}
