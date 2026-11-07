import {
  Calendar01Icon,
  Calendar02Icon,
  Route01Icon,
  Task01Icon,
  SourceCodeIcon,
  RotateRight01Icon,
  Analytics01Icon,
  Note01Icon,
  Settings01Icon,
  CloudIcon,
  AiChat01Icon,
  Flowchart01Icon,
  Target02Icon,
  Award01Icon,
  Database01Icon,
  CpuIcon,
  NetworkIcon,
  JavaIcon,
  Brain02Icon,
  Notification01Icon,
  VideoReplayIcon,
  CourseIcon,
  Playlist01Icon,
} from "@hugeicons/core-free-icons";
import type { NavGroup, PrimeNavItem } from "./types";
// Future destinations stay defined but their placeholder screens are not advertised.
export const NAVIGATION_GROUPS: NavGroup[] = [
  {
    id: "prepare",
    label: "Prepare",
    items: [
      {
        id: "today",
        label: "Today",
        href: "/today",
        icon: Calendar01Icon,
        group: "prepare",
        exact: true,
        available: false,
      },
      {
        id: "roadmap",
        label: "Roadmap",
        href: "/roadmap",
        icon: Route01Icon,
        group: "prepare",
        matchPrefixes: ["/roadmap"],
      },
      {
        id: "plan",
        label: "Planner",
        href: "/plan",
        icon: Task01Icon,
        group: "prepare",
        matchPrefixes: ["/plan", "/planner"],
      },
      {
        id: "calendar",
        label: "Calendar",
        href: "/calendar",
        icon: Calendar02Icon,
        group: "prepare",
        matchPrefixes: ["/calendar"],
      },
      {
        id: "revision",
        label: "Revision",
        href: "/revision",
        icon: RotateRight01Icon,
        group: "prepare",
        attention: "revision",
      },
    ],
  },
  {
    id: "practice",
    label: "Practice",
    items: [
      {
        id: "practice",
        label: "DSA Practice",
        href: "/practice/dsa",
        icon: SourceCodeIcon,
        group: "practice",
        matchPrefixes: ["/practice/dsa", "/practice"],
      },
      {
        id: "dsa-playlists",
        label: "DSA Playlists",
        href: "/practice/dsa/playlists",
        icon: VideoReplayIcon,
        group: "practice",
        matchPrefixes: ["/practice/dsa/playlists", "/dsa/playlists"],
      },
      {
        id: "kunal-bootcamp",
        label: "Kunal Java + DSA",
        href: "/practice/dsa/playlists/kunal-kushwaha",
        icon: Playlist01Icon,
        group: "practice",
        matchPrefixes: [
          "/practice/dsa/playlists/kunal-kushwaha",
          "/dsa/playlists/kunal-kushwaha",
          "/app/dsa/playlists/kunal-kushwaha",
          "/practice/dsa/playlists/kunal-java-dsa",
          "/dsa/playlists/kunal-java-dsa",
        ],
      },
      {
        id: "striver-a2z",
        label: "Striver A2Z Sheet",
        href: "/practice/dsa/sheets/striver-a2z",
        icon: CourseIcon,
        group: "practice",
        matchPrefixes: ["/practice/dsa/sheets/striver-a2z", "/dsa/sheets/striver-a2z", "/app/dsa/sheets/striver-a2z"],
      },
      {
        id: "aptitude",
        label: "Aptitude & Reasoning",
        href: "/aptitude",
        icon: Brain02Icon,
        group: "practice",
        matchPrefixes: ["/aptitude", "/practice/aptitude"],
      },
      {
        id: "lab",
        label: "Algorithm Lab",
        href: "/lab",
        icon: Flowchart01Icon,
        group: "practice",
        matchPrefixes: ["/lab"],
      },
    ],
  },
  {
    id: "fundamentals",
    label: "Fundamentals",
    items: [
      {
        id: "dbms",
        label: "DBMS",
        href: "/roadmap/dbms",
        icon: Database01Icon,
        group: "fundamentals",
        matchPrefixes: ["/roadmap/dbms", "/fundamentals/dbms"],
      },
      {
        id: "os",
        label: "Operating Systems",
        href: "/roadmap/os",
        icon: CpuIcon,
        group: "fundamentals",
        matchPrefixes: ["/roadmap/os", "/fundamentals/os"],
      },
      {
        id: "cn",
        label: "Computer Networks",
        href: "/roadmap/cn",
        icon: NetworkIcon,
        group: "fundamentals",
        matchPrefixes: ["/roadmap/cn", "/fundamentals/cn"],
      },
      {
        id: "oop",
        label: "OOP (Java)",
        href: "/roadmap/oop",
        icon: JavaIcon,
        group: "fundamentals",
        matchPrefixes: ["/roadmap/oop", "/fundamentals/oop"],
      },
    ],
  },
  {
    id: "understand",
    label: "Understand",
    items: [
      {
        id: "readiness",
        label: "Readiness",
        href: "/readiness",
        icon: Award01Icon,
        group: "understand",
        matchPrefixes: ["/readiness"],
      },
      {
        id: "mastery",
        label: "Mastery",
        href: "/mastery",
        icon: Target02Icon,
        group: "understand",
      },
      {
        id: "progress",
        label: "Analytics",
        href: "/analytics",
        icon: Analytics01Icon,
        group: "understand",
        matchPrefixes: ["/analytics", "/progress"],
      },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    items: [
      {
        id: "ai",
        label: "PRIME AI",
        href: "/ai",
        icon: AiChat01Icon,
        group: "workspace",
        aiOnly: true,
      },
      {
        id: "notes",
        label: "Notes",
        href: "/notes",
        icon: Note01Icon,
        group: "workspace",
      },
      {
        id: "notifications",
        label: "Notifications",
        href: "/notifications",
        icon: Notification01Icon,
        group: "workspace",
      },
      {
        id: "settings",
        label: "Settings",
        href: "/settings",
        icon: Settings01Icon,
        group: "workspace",
      },
      {
        id: "weather",
        label: "Weather",
        href: "/weather",
        icon: CloudIcon,
        group: "workspace",
      },
    ],
  },
];
export const AVAILABLE_NAVIGATION_GROUPS = NAVIGATION_GROUPS.map((g) => ({
  ...g,
  items: g.items.filter((i) => i.available !== false),
})).filter((g) => g.items.length);
export const AVAILABLE_NAVIGATION_ITEMS = AVAILABLE_NAVIGATION_GROUPS.flatMap(
  (g) => g.items
);
export type ShellSearchParams = { get: (name: string) => string | null };
export function isRouteActive(
  pathname: string,
  item: PrimeNavItem,
  query?: ShellSearchParams
): boolean {
  const revision =
    pathname === "/practice/dsa" &&
    ["due", "overdue"].includes(query?.get("revision") ?? "");
  if (item.id === "revision" && revision) return true;
  if (item.id === "practice" && revision) return false;

  const isFundamentalsRoute = [
    "/roadmap/dbms",
    "/roadmap/os",
    "/roadmap/cn",
    "/roadmap/oop",
    "/fundamentals/dbms",
    "/fundamentals/os",
    "/fundamentals/cn",
    "/fundamentals/oop",
  ].some((fPath) => pathname === fPath || pathname.startsWith(`${fPath}/`));
  if (item.id === "roadmap" && isFundamentalsRoute) return false;

  const isKunalRoute = [
    "/practice/dsa/playlists/kunal-kushwaha",
    "/practice/dsa/playlists/kunal-java-dsa",
    "/dsa/playlists/kunal-kushwaha",
    "/dsa/playlists/kunal-java-dsa",
    "/app/dsa/playlists/kunal-kushwaha",
  ].some((kPath) => pathname === kPath || pathname.startsWith(`${kPath}/`));
  if (item.id === "dsa-playlists" && isKunalRoute) return false;

  const isPlaylistRoute = [
    "/practice/dsa/playlists",
    "/dsa/playlists",
  ].some((pPath) => pathname === pPath || pathname.startsWith(`${pPath}/`));

  const isStriverRoute = [
    "/practice/dsa/sheets/striver-a2z",
    "/dsa/sheets/striver-a2z",
    "/app/dsa/sheets/striver-a2z",
  ].some((sPath) => pathname === sPath || pathname.startsWith(`${sPath}/`));

  const isAptitudeRoute = [
    "/aptitude",
    "/practice/aptitude",
  ].some((aPath) => pathname === aPath || pathname.startsWith(`${aPath}/`));

  if (
    item.id === "practice" &&
    (isStriverRoute || isKunalRoute || isPlaylistRoute || isAptitudeRoute)
  ) {
    return false;
  }

  if (item.exact) return pathname === item.href;
  return (item.matchPrefixes?.length ? item.matchPrefixes : [item.href]).some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
export function getShellRoute(pathname: string, query?: ShellSearchParams) {
  if (
    pathname === "/practice/dsa/playlists/kunal-kushwaha" ||
    pathname.startsWith("/practice/dsa/playlists/kunal-kushwaha/") ||
    pathname === "/practice/dsa/playlists/kunal-java-dsa" ||
    pathname.startsWith("/practice/dsa/playlists/kunal-java-dsa/")
  ) {
    const isAnalytics = pathname.endsWith("/analytics");
    return {
      section: "Practice",
      label: isAnalytics ? "Kunal DSA Analytics" : "Kunal Java + DSA",
      parent: isAnalytics ? "/practice/dsa/playlists/kunal-kushwaha" : "/practice/dsa/playlists",
      id: "kunal-bootcamp",
    };
  }
  if (pathname === "/aptitude" || pathname.startsWith("/aptitude/"))
    return {
      section: "Practice",
      label: "Aptitude & Reasoning",
      parent: null,
      id: "aptitude",
    };
  if (pathname === "/lab" || pathname.startsWith("/lab/"))
    return {
      section: "Algorithm Lab",
      label:
        pathname === "/lab"
          ? "Explore"
          : pathname
              .split("/")[2]
              .split("-")
              .map((word) => word.toUpperCase())
              .join(" "),
      parent: pathname === "/lab" ? null : "/lab",
      id: "lab",
    };
  if (pathname === "/ai")
    return { section: "Intelligence", label: "PRIME AI", parent: null, id: "ai" };
  if (pathname === "/mastery" || pathname.startsWith("/mastery/"))
    return { section: "Understand", label: "Mastery", parent: null, id: "mastery" };
  if (pathname === "/analytics")
    return { section: "Understand", label: "Analytics", parent: null, id: "progress" };
  if (
    pathname === "/roadmap/dbms" ||
    pathname.startsWith("/roadmap/dbms/") ||
    pathname === "/fundamentals/dbms" ||
    pathname.startsWith("/fundamentals/dbms/")
  )
    return { section: "Fundamentals", label: "DBMS", parent: "/roadmap", id: "dbms" };
  if (
    pathname === "/roadmap/os" ||
    pathname.startsWith("/roadmap/os/") ||
    pathname === "/fundamentals/os" ||
    pathname.startsWith("/fundamentals/os/")
  )
    return {
      section: "Fundamentals",
      label: "Operating Systems",
      parent: "/roadmap",
      id: "os",
    };
  if (
    pathname === "/roadmap/cn" ||
    pathname.startsWith("/roadmap/cn/") ||
    pathname === "/fundamentals/cn" ||
    pathname.startsWith("/fundamentals/cn/")
  )
    return {
      section: "Fundamentals",
      label: "Computer Networks",
      parent: "/roadmap",
      id: "cn",
    };
  if (
    pathname === "/roadmap/oop" ||
    pathname.startsWith("/roadmap/oop/") ||
    pathname === "/fundamentals/oop" ||
    pathname.startsWith("/fundamentals/oop/")
  )
    return {
      section: "Fundamentals",
      label: "OOP (Java)",
      parent: "/roadmap",
      id: "oop",
    };
  const parts = pathname.split("/").filter(Boolean);
  const revision =
    pathname === "/practice/dsa" &&
    ["due", "overdue"].includes(query?.get("revision") ?? "");
  const acronyms: Record<string, string> = {
    dsa: "DSA",
    lru: "LRU",
    sql: "SQL",
    bst: "BST",
    cn: "CN",
    os: "OS",
    dbms: "DBMS",
    oop: "OOP",
  };
  const format = (s: string) => {
    try {
      s = decodeURIComponent(s);
    } catch {}
    return s
      .split("-")
      .map((word) => acronyms[word] ?? word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  if (
    pathname === "/practice/dsa/playlists" ||
    (pathname.startsWith("/practice/dsa/playlists/") &&
      !pathname.startsWith("/practice/dsa/playlists/kunal-"))
  ) {
    const isAnalytics = pathname.endsWith("/analytics");
    const isCatalog = pathname === "/practice/dsa/playlists";
    return {
      section: "Practice",
      label: isCatalog
        ? "DSA Playlists"
        : isAnalytics
          ? "Playlist Analytics"
          : format(parts[3] ?? "Course"),
      parent: isCatalog ? "/practice/dsa" : "/practice/dsa/playlists",
      id: "dsa-playlists",
    };
  }
  if (parts[0] === "practice")
    return {
      section: "Practice",
      label: parts[2] ? format(parts[2]) : revision ? "Revision" : "DSA",
      parent: parts[2] ? "/practice/dsa" : null,
      id: revision ? "revision" : "practice",
    };
  const item = NAVIGATION_GROUPS.flatMap((g) => g.items).find(
    (i) =>
      i.id === parts[0] ||
      Boolean(i.matchPrefixes?.some((prefix) => prefix === `/${parts[0]}`))
  );
  return {
    section: parts[1] ? (item?.label ?? format(parts[0])) : "Workspace",
    label: parts[1] ? format(parts[1]) : (item?.label ?? "Workspace"),
    parent: parts[1] ? `/${parts[0]}` : null,
    id: item?.id ?? "workspace",
  };
}
