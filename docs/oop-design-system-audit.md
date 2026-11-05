# PRIME — Object-Oriented Programming (OOP) with Java: Design System Audit & Reuse Matrix

## 1. Visual & Interaction Philosophy

The OOP with Java module strictly conforms to PRIME's established brand identity and design language. No external styling libraries, secondary themes, or conflicting component primitives are introduced.

- **Primary Canvas:** Pure Black (`#000000`)
- **Accent & Primary Focus:** Pure Red (`#FF0000`), hovered to `#D90000`
- **Typography:**
  - *Editorial & Headings:* Geist Sans
  - *Code & Syntax:* Geist Mono (classes, methods, memory pointers, Java snippets, bytecode traces)
- **Icons:** `@hugeicons/core-free-icons` rendered through `@/components/ui/icon`
- **Elevations & Surfaces:**
  - Base canvas: `#000000`
  - Cards & Containers: `#0A0A0A`
  - Elevated Popovers & Dialogs: `#121212`
  - Subtle Technical Borders: `#1F1F1F`
- **Interactive Steppers & Controls:**
  - Solid tactile button styling with crisp borders and subtle pressed depth
  - Code syntax blocks scroll horizontally within isolated containers without breaking page viewport flow.

---

## 2. Reusable Component Matrix

| Required OOP Pattern | PRIME Exported Component | Props / Styling | Architectural Purpose |
| :--- | :--- | :--- | :--- |
| **Primary Actions** | `Button` (`@/components/ui/button`) | `variant="primary"`, `bg-[#FF0000] text-white` | Video enrollment, day completion, simulator stepping |
| **Secondary & Filter Actions** | `Button` (`@/components/ui/button`) | `variant="outline"`, `border-[#262626] bg-[#141414]` | Filter by difficulty/day, reset simulator |
| **Navigation & Tabs** | `Tabs`, `TabsList`, `TabsTrigger` (`@/components/ui/tabs`) | Standardized top sub-nav bar | Switching between Overview, Roadmap, Videos, Labs, Practice, Revision, Analytics |
| **Containers & Surfaces** | `Card` (`@/components/ui/card`) | Surface `#0A0A0A`, border `#1F1F1F` | Video lesson cards, lab studios, LLD case containers |
| **Status Badges** | `Badge` (`@/components/ui/badge`) | `variant="outline"`, green/red/amber borders | Verified status, difficulty labels, interview importance |
| **Progress Trackers** | `Progress` (`@/components/ui/progress`) | `h-2 bg-[#1A1A1A]`, indicator `#FF0000` | 12-day curriculum completion, video completion |
| **Modals & Overlays** | `Dialog` (`@/components/ui/dialog`) | Centered modal with backdrop `#000000/80` | YouTube video player modal, code detail view |
| **Drawers & Inspectors** | `Sheet` (`@/components/ui/sheet`) | Slide-over drawer with focus trap | Mobile lab parameters, LLD design rubrics, notes drawer |
| **Data Tables** | `Table`, `TableHeader`, `TableRow` (`@/components/ui/table`) | Compact padding, sticky headers | Access Modifier Matrix, Video Manifest library |

---

## 3. Responsive Breakpoints & Accessibility

- **Mobile (360px – 430px):** Single-column layout. Code blocks scroll horizontally with `overflow-x-auto`. Touch targets $\ge 44\text{px}$.
- **Tablet (768px – 1023px):** Balanced two-column layout. Simulator parameters and diagram surfaces reflow into stacked panels.
- **Desktop ($\ge 1024\text{px}$):** Multi-pane technical layout with side-by-side interactive code preview, live heap/stack diagram, and execution log.
- **WCAG 2.2 AA Compliance:** Color contrast ratios $\ge 4.5:1$. Textual badges accompany all color-coded indicators. Keyboard-navigable steppers and screen-reader accessible SVG diagrams.

