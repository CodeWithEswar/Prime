import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  isRouteActive,
  AVAILABLE_NAVIGATION_ITEMS,
  getShellRoute,
} from "@/components/shell/navigation-config";
import { SidebarBrand } from "@/components/shell/sidebar-brand";
import { SidebarPreparationContext } from "@/components/shell/sidebar-preparation-context";
import { SidebarNavigation } from "@/components/shell/sidebar-navigation";
import { ContextBreadcrumb } from "@/components/shell/context-breadcrumb";
import { PageFrame } from "@/components/shell/page-frame";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Calendar03Icon,
  SourceCodeIcon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import type { PrimeNavItem, ShellPreparationContext } from "@/components/shell/types";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/practice/dsa",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

const mockTodayItem: PrimeNavItem = {
  id: "today",
  label: "Today",
  href: "/today",
  icon: Calendar03Icon,
  exact: true,
  group: "prepare",
};

const mockPracticeItem: PrimeNavItem = {
  id: "dsa",
  label: "DSA Practice",
  href: "/practice/dsa",
  icon: SourceCodeIcon,
  matchPrefixes: ["/practice"],
  group: "practice",
};

const mockSettingsItem: PrimeNavItem = {
  id: "settings",
  label: "Settings",
  href: "/settings",
  icon: Settings01Icon,
  matchPrefixes: ["/settings"],
  group: "workspace",
};

const mockPrepContext: ShellPreparationContext = {
  targetRole: "Staff Software Engineer",
  targetDate: "2026-12-31",
  startDate: "2026-10-01",
  dailyStudyMinutes: 60,
};

describe("PRIME Command Frame — Shell Unit Tests", () => {
  describe("isRouteActive() Route Matching", () => {
    it("matches exact root dashboard route", () => {
      expect(isRouteActive("/today", mockTodayItem)).toBe(true);
      expect(isRouteActive("/practice/dsa", mockTodayItem)).toBe(false);
    });

    it("matches nested routes under section prefixes", () => {
      expect(isRouteActive("/practice/dsa", mockPracticeItem)).toBe(true);
      expect(isRouteActive("/practice/dsa/two-sum", mockPracticeItem)).toBe(true);
      expect(isRouteActive("/roadmap", mockPracticeItem)).toBe(false);
    });

    it("matches settings nested routes", () => {
      expect(isRouteActive("/settings", mockSettingsItem)).toBe(true);
      expect(isRouteActive("/settings/profile", mockSettingsItem)).toBe(true);
      expect(isRouteActive("/today", mockSettingsItem)).toBe(false);
      expect(isRouteActive("/settings-unrelated", mockSettingsItem)).toBe(false);
    });
    it("gives Revision its own active state on the due catalog filter", () => {
      const query = new URLSearchParams("revision=due");
      const revision = AVAILABLE_NAVIGATION_ITEMS.find((i) => i.id === "revision")!;
      const practice = AVAILABLE_NAVIGATION_ITEMS.find((i) => i.id === "practice")!;
      expect(isRouteActive("/practice/dsa", revision, query)).toBe(true);
      expect(isRouteActive("/practice/dsa", practice, query)).toBe(false);
      expect(isRouteActive("/practice/dsa/two-sum", practice, query)).toBe(true);
    });
    it("only advertises implemented destinations and formats deep context", () => {
      expect(AVAILABLE_NAVIGATION_ITEMS.map((i) => i.href)).toEqual([
        "/roadmap",
        "/plan",
        "/calendar",
        "/revision",
        "/practice/dsa",
        "/aptitude",
        "/lab",
        "/roadmap/dbms",
        "/roadmap/os",
        "/roadmap/cn",
        "/roadmap/oop",
        "/readiness",
        "/mastery",
        "/analytics",
        "/ai",
        "/notes",
        "/notifications",
        "/settings",
        "/weather",
      ]);
      expect(getShellRoute("/practice/dsa/lru-cache")).toMatchObject({
        label: "LRU Cache",
        parent: "/practice/dsa",
      });
      expect(getShellRoute("/plan")).toMatchObject({
        label: "Planner",
      });
      expect(getShellRoute("/planner")).toMatchObject({
        label: "Planner",
      });
      expect(getShellRoute("/calendar")).toMatchObject({
        label: "Calendar",
      });
      expect(getShellRoute("/analytics")).toMatchObject({
        section: "Understand",
        label: "Analytics",
      });
      expect(getShellRoute("/roadmap/dbms")).toMatchObject({
        section: "Fundamentals",
        label: "DBMS",
      });
      expect(getShellRoute("/roadmap/os")).toMatchObject({
        section: "Fundamentals",
        label: "Operating Systems",
      });
      expect(getShellRoute("/roadmap/cn")).toMatchObject({
        section: "Fundamentals",
        label: "Computer Networks",
      });
      expect(getShellRoute("/roadmap/oop")).toMatchObject({
        section: "Fundamentals",
        label: "OOP (Java)",
      });
    });

    it("isolates roadmap active state from fundamentals sub-routes", () => {
      const roadmapItem = AVAILABLE_NAVIGATION_ITEMS.find((i) => i.id === "roadmap")!;
      const dbmsItem = AVAILABLE_NAVIGATION_ITEMS.find((i) => i.id === "dbms")!;
      const osItem = AVAILABLE_NAVIGATION_ITEMS.find((i) => i.id === "os")!;
      expect(isRouteActive("/roadmap", roadmapItem)).toBe(true);
      expect(isRouteActive("/roadmap/dbms", roadmapItem)).toBe(false);
      expect(isRouteActive("/roadmap/dbms", dbmsItem)).toBe(true);
      expect(isRouteActive("/roadmap/os", osItem)).toBe(true);
    });
  });

  describe("SidebarBrand", () => {
    it("renders full logo (mark and wordmark) when expanded", () => {
      const { container } = render(<SidebarBrand collapsed={false} />);
      expect(container.querySelector("svg[aria-label='PRIME Mark']")).toBeInTheDocument();
      expect(container.querySelector("svg[aria-label='PRIME']")).toBeInTheDocument();
    });

    it("renders mark only when collapsed", () => {
      const { container } = render(<SidebarBrand collapsed={true} />);
      expect(container.querySelector("svg[aria-label='PRIME Mark']")).toBeInTheDocument();
      expect(container.querySelector("svg[aria-label='PRIME']")).toBeNull();
    });
  });

  describe("SidebarPreparationContext", () => {
    it("returns null when context is empty", () => {
      const { container } = render(
        <SidebarPreparationContext context={null} collapsed={false} />
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders collapsed icon pill when collapsed", () => {
      const { container } = render(
        <TooltipProvider>
          <SidebarPreparationContext context={mockPrepContext} collapsed={true} />
        </TooltipProvider>
      );
      expect(container.firstChild).not.toBeNull();
      expect(
        screen.getByLabelText("Preparation target: Staff Software Engineer, Dec 31")
      ).toBeInTheDocument();
    });

    it("renders target role and formatted target date when expanded", () => {
      render(
        <TooltipProvider>
          <SidebarPreparationContext context={mockPrepContext} collapsed={false} />
        </TooltipProvider>
      );
      expect(screen.getByText("Staff Software Engineer")).toBeInTheDocument();
      expect(screen.getByText("Target Goal")).toBeInTheDocument();
      expect(screen.getByText("Dec 31")).toBeInTheDocument();
    });
  });

  describe("SidebarNavigation", () => {
    it("renders navigation groups and routes", () => {
      render(
        <TooltipProvider>
          <SidebarNavigation collapsed={false} revisionDueCount={0} />
        </TooltipProvider>
      );
      expect(screen.getByText("Prepare")).toBeInTheDocument();
      expect(screen.getByText("Fundamentals")).toBeInTheDocument();
      expect(screen.getByText("DBMS")).toBeInTheDocument();
      expect(screen.getByText("Operating Systems")).toBeInTheDocument();
      expect(screen.getByText("Computer Networks")).toBeInTheDocument();
      expect(screen.getByText("OOP (Java)")).toBeInTheDocument();
      expect(screen.getByText("Workspace")).toBeInTheDocument();
      expect(screen.getByText("DSA Practice")).toBeInTheDocument();
      expect(screen.getByText("Revision")).toBeInTheDocument();
    });

    it("displays pure red revision count when revision items are due", () => {
      render(
        <TooltipProvider>
          <SidebarNavigation collapsed={false} revisionDueCount={5} />
        </TooltipProvider>
      );
      const badge = screen.getByText("5");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("shell-attention");
      expect(
        screen.getByRole("link", { name: "Revision, 5 revisions due" })
      ).toBeInTheDocument();
    });

    it("does not render attention badge when revision count is 0", () => {
      render(
        <TooltipProvider>
          <SidebarNavigation collapsed={false} revisionDueCount={0} />
        </TooltipProvider>
      );
      expect(screen.queryByText("0")).toBeNull();
    });
  });

  describe("ContextBreadcrumb", () => {
    it("renders breadcrumb segments for current path", () => {
      render(<ContextBreadcrumb />);
      expect(screen.getByText("PRACTICE")).toBeInTheDocument();
      expect(screen.getByText("DSA")).toBeInTheDocument();
    });
  });

  describe("PageFrame", () => {
    it("renders content with workspace layout variant", () => {
      const { container } = render(
        <PageFrame variant="workspace" className="test-frame">
          <div>Workspace Content</div>
        </PageFrame>
      );
      expect(screen.getByText("Workspace Content")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("max-w-6xl");
    });

    it("renders wide-table layout variant", () => {
      const { container } = render(
        <PageFrame variant="wide-table">
          <div>Table Content</div>
        </PageFrame>
      );
      expect(container.firstChild).toHaveClass("max-w-none");
    });
  });
});
