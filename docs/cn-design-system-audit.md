# PRIME — Computer Networks Design System Audit & Reuse Matrix

## 1. Visual & Interaction Philosophy

The Computer Networks module strictly reuses PRIME's core design tokens and components. No secondary icon libraries, shadow UI primitives, or competing themes are permitted.

- **Primary Canvas:** Pure Black (`#000000`)
- **Active Accent:** Pure Red (`#FF0000`)
- **Typography:** Geist Sans (editorial headers and body) & Geist Mono (CIDR, IP/MAC addresses, ports, hex dumps, and calculation traces)
- **Icons:** Solely `@hugeicons/core-free-icons` via `@/components/ui/icon`
- **Surfaces:** Subdued near-black elevations (`#0A0A0A`, `#121212`, `#141414`), borders `#1F1F1F`
- **Three-Density Hierarchy:**
  - *Overview:* Calm editorial layout with compact metrics rail.
  - *Day Study:* Focused two-column workspace with clear learning outcomes and lesson checklists.
  - *Network Engineering Lab:* High-precision technical instrument with three-pane desktop layout (Parameters, Canvas, Trace Inspector).

---

## 2. Reusable Component Matrix

| Required CN Pattern | Exported PRIME Component | Props / Usage | Compliance Notes |
| :--- | :--- | :--- | :--- |
| **Primary CTAs** | `Button` (`@/components/ui/button`) | `variant="default"`, `bg-[#FF0000] text-white hover:bg-[#D90000]` | Tactile click, red reserved for primary actions |
| **Secondary & Filter Actions** | `Button` (`@/components/ui/button`) | `variant="outline"`, `border-[#262626] bg-[#141414] text-[#CCCCCC]` | Subdued dark borders, white text on hover |
| **Section Navigation** | `Tabs`, `TabsList`, `TabsTrigger` (`@/components/ui/tabs`) | Standardized top sub-nav bar | Avoids secondary permanent sidebars |
| **Containers & Panels** | `Card` (`@/components/ui/card`) | Surface `#0A0A0A`, border `#1F1F1F` | No rounded card-in-card nesting or indiscriminate glassmorphism |
| **Data Tables** | `Table`, `TableHeader`, `TableRow` (`@/components/ui/table`) | Compact padding, sticky headers | Dense 135-video library with search and filters |
| **Progression Rails** | `Progress` (`@/components/ui/progress`) | `h-2 bg-[#1A1A1A]`, indicator `#FF0000` | Smooth width transitions |
| **Status Indicators** | `Badge` (`@/components/ui/badge`) | `variant="outline"`, verified green / critical red | Textual label accompanying any color cues for WCAG 2.2 AA |
| **Drawers & Sheets** | `Sheet`, `Drawer` (`@/components/ui/sheet`, `@/components/ui/drawer`) | Mobile filters, packet trace inspectors | Touch-friendly sheets with focus trapping |
| **Modals** | `Dialog` (`@/components/ui/dialog`) | Video player modal, plan confirmation | Accessible focus restoration |

---

## 3. Responsive Breakpoints

- **Desktop (≥1280px):** Full three-pane engineering lab (Configuration / Canvas / Trace Inspector).
- **Tablet (768px–1279px):** Two-column layout with collapsible trace inspector in Sheet.
- **Mobile (360px–430px):** Single-column layout, horizontal day selector, touch-friendly simulation buttons, responsive SVG charts with zero horizontal scroll overflow.

