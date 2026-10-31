import type { Category, RegistryItem, Subcategory } from "./types";

export const REGISTRY_ITEMS: readonly RegistryItem[] = [
  // =========================================================================
  // FOUNDATIONS (8 Items)
  // =========================================================================
  {
    slug: "colors",
    name: "Colors & Surfaces",
    category: "foundations",
    subcategory: "Tokens",
    description:
      "The canonical Pure Black (#000000) canvas, narrow black surface range (#030303 - #0D0D0D), white-alpha borders, and Pure Red (#FF0000) performance accent.",
    status: "stable",
    primitive: "CSS Variables",
    clientComponent: false,
    sections: ["preview", "description", "tokens", "usage", "prompt"],
    aiPrompt: `Use PRIME's canonical color tokens. Never introduce Zinc, Slate, or charcoal grays.
Canvas: #000000.
Surfaces: #000000 (base), #030303 (raised), #060606 (elevated), #090909 (interactive), #0D0D0D (hover).
Borders: rgba(255,255,255,0.07) subtle, 0.12 default, 0.20 strong.
Text: #ffffff primary, rgba(255,255,255,0.68) secondary, 0.46 tertiary, 0.28 disabled.
Pure Red: #ff0000, hover #ff1a1a, active #e60000, soft rgba(255,0,0,0.12), border rgba(255,0,0,0.35).
Red directs attention (5-8% visual weight); white carries info; black creates space.`,
  },
  {
    slug: "typography",
    name: "Typography",
    category: "foundations",
    subcategory: "Tokens",
    description:
      "Dual-font architecture: Geist Sans for clear editorial hierarchy and Geist Mono for tabular numeric statistics, timers, and problem metadata.",
    status: "stable",
    primitive: "next/font",
    clientComponent: false,
    sections: ["preview", "description", "scale", "usage", "prompt"],
    aiPrompt: `Implement typography with Geist Sans (primary interface) and Geist Mono (numbers, timers, problem counts, technical metadata).
Always use 'font-mono font-mono-numbers' on numerical metrics and statistics to enable tabular figures (tnum) and avoid layout shifts.`,
  },
  {
    slug: "spacing",
    name: "Spacing",
    category: "foundations",
    subcategory: "Tokens",
    description:
      "A developer-grade 4px-based geometric spacing scale calibrated for high information density and precise visual rhythm.",
    status: "stable",
    primitive: "Tailwind Scale",
    clientComponent: false,
    sections: ["preview", "description", "scale", "usage", "prompt"],
    aiPrompt: `Use PRIME's compact geometric spacing scale: 2px (0.5), 4px (1), 6px (1.5), 8px (2), 12px (3), 16px (4), 20px (5), 24px (6), 32px (8), 40px (10), 48px (12), 64px (16).
Prefer compact density. Do not inject arbitrary random margins.`,
  },
  {
    slug: "radius",
    name: "Radius",
    category: "foundations",
    subcategory: "Tokens",
    description:
      "Restrained, compact corner radius scale (4px - 12px) preventing playful or bubbly aesthetics.",
    status: "stable",
    primitive: "CSS Variables",
    clientComponent: false,
    sections: ["preview", "description", "scale", "usage", "prompt"],
    aiPrompt: `PRIME uses restrained radii: xs (4px) for badges and keycaps, sm (6px) for buttons, inputs, and chips, md (8px) for cards and panels, lg (10px) for modals and sheets, xl (12px) max.
Never use rounded-2xl, rounded-3xl, or rounded-full on cards.`,
  },
  {
    slug: "borders",
    name: "Borders & Focus",
    category: "foundations",
    subcategory: "Tokens",
    description:
      "White-alpha border system for crisp black-surface separation and high-visibility Pure Red focus rings without blooming halo.",
    status: "stable",
    primitive: "CSS Variables",
    clientComponent: false,
    sections: ["preview", "description", "usage", "prompt"],
    aiPrompt: `Borders in PRIME must use white-alpha edges:
Subtle: rgba(255, 255, 255, 0.07)
Default: rgba(255, 255, 255, 0.12)
Strong: rgba(255, 255, 255, 0.20)
Focus ring: outline: none; box-shadow: 0 0 0 1px #000000, 0 0 0 3px rgba(255, 0, 0, 0.72).`,
  },
  {
    slug: "elevation",
    name: "Elevation & Shadows",
    category: "foundations",
    subcategory: "Tokens",
    description:
      "Edge-based depth architecture on black surfaces using subtle top highlights (inset 0 1px 0 rgba(255,255,255,0.025)) and deep drop shadows.",
    status: "stable",
    primitive: "CSS Classes",
    clientComponent: false,
    sections: ["preview", "description", "usage", "prompt"],
    aiPrompt: `Depth on black surfaces is generated with edges and layered shadows:
shadow-elevation-1: inset 0 1px 0 rgba(255,255,255,0.025), 0 1px 2px rgba(0,0,0,0.8)
shadow-elevation-2: inset 0 1px 0 rgba(255,255,255,0.04), 0 2px 5px rgba(0,0,0,0.85)
shadow-elevation-3: inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 12px rgba(0,0,0,0.9)
shadow-elevation-4: inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 24px rgba(0,0,0,0.95).
Never brighten a card to gray to make it visible.`,
  },
  {
    slug: "motion",
    name: "Motion & Physics",
    category: "foundations",
    subcategory: "Tokens",
    description:
      "Physical, mechanical transition curves and restrained timings (80ms - 240ms) with full prefers-reduced-motion support.",
    status: "stable",
    primitive: "motion/react",
    clientComponent: false,
    sections: ["preview", "description", "usage", "prompt"],
    aiPrompt: `PRIME motion is mechanical and tactile.
Timings: instant 80ms, fast 120ms, normal 180ms, deliberate 240ms.
Easings: snappy [0.16, 1, 0.3, 1], easeOut, easeInOut, tactile.
Springs: tight (stiffness 450, damping 32), balanced (350, 28).
Reduced motion: disable transforms and durations immediately if prefers-reduced-motion: reduce is detected.`,
  },
  {
    slug: "iconography",
    name: "Iconography",
    category: "foundations",
    subcategory: "Tokens",
    description:
      "Strict Hugeicons standard across all surfaces. Standardized 14px, 16px, 18px, 20px, and 24px sizing with consistent 1.5 stroke width.",
    status: "stable",
    primitive: "@hugeicons/react",
    clientComponent: false,
    sections: ["preview", "description", "usage", "prompt"],
    aiPrompt: `PRIME uses Hugeicons exclusively via components/ui/icon.tsx.
Never import from Lucide, Heroicons, FontAwesome, or Tabler.
Standard sizes: 14 (compact/badges), 16 (inputs/buttons), 18 (default nav), 20 (headers), 24 (empty states).
Stroke width: 1.5. Always pair icon-only buttons with an accessible aria-label.`,
  },

  // =========================================================================
  // COMPONENTS (26 Items)
  // =========================================================================
  {
    slug: "button",
    name: "Button",
    category: "components",
    subcategory: "Actions",
    description:
      "Tactile solid neumorphic control system with Pure Red (#FF0000) primary action and black-on-black (#050505) secondary control.",
    status: "stable",
    primitive: "HTMLButtonElement + Slot",
    clientComponent: true,
    sections: [
      "preview",
      "description",
      "anatomy",
      "variants",
      "sizes",
      "states",
      "attributes",
      "accessibility",
      "keyboard",
      "responsive",
      "usage",
      "dodont",
      "prompt",
    ],
    anatomy: [
      { id: 1, label: "Leading icon", description: "Optional contextual action icon." },
      { id: 2, label: "Label", description: "Clear, concise imperative verb." },
      {
        id: 3,
        label: "Trailing icon",
        description: "Optional directional or status indicator.",
      },
    ],
    attributes: [
      {
        name: "variant",
        type: '"primary" | "secondary" | "outline" | "ghost" | "destructive" | "link"',
        default: '"primary"',
        description: "Visual emphasis and material styling.",
      },
      {
        name: "size",
        type: '"sm" | "default" | "lg" | "icon" | "icon-sm"',
        default: '"default"',
        description: "Vertical height and horizontal padding.",
      },
      {
        name: "loading",
        type: "boolean",
        default: "false",
        description: "Displays animated spinner and disables interaction.",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        description: "Disables interaction and reduces opacity to 30%.",
      },
      {
        name: "asChild",
        type: "boolean",
        default: "false",
        description: "Delegates rendering to child component via Radix Slot.",
      },
      {
        name: "children",
        type: "ReactNode",
        required: true,
        description: "Content rendered inside the button.",
      },
    ],
    keyboard: [
      { key: "Tab", behavior: "Focuses button with Pure Red ring" },
      { key: "Enter", behavior: "Activates button" },
      { key: "Space", behavior: "Activates button with tactile compression" },
    ],
    dodont: [
      {
        do: "Use Primary Button for the single most important action in a screen context.",
        doDescription: "Keeps attention focused on the primary path.",
        dont: "Place 3 primary red buttons next to each other.",
        dontDescription: "Dilutes pure red brand signal into noise.",
      },
      {
        do: "Label buttons with direct imperative verbs (e.g., 'Start Practice').",
        doDescription: "Communicates exactly what will happen.",
        dont: "Use vague labels like 'CLICK HERE'.",
        dontDescription: "Lacks context and hurts accessibility.",
      },
    ],
    aiPrompt: `Build the PRIME Button component using CVA, Radix Slot, and PRIME tokens.
Primary: .btn-neumorphic-primary (Pure Red #ff0000 with white highlight gradient, 1px compression on active).
Secondary: .btn-neumorphic-secondary (#050505 black surface with tactile white-alpha edge).
Outline: transparent background with white-alpha border.
Ghost: text-secondary hovering to white.
Destructive: pure red soft background with red-alpha border.
Focus ring: shadow-[0_0_0_1px_#000,0_0_0_3px_rgba(255,0,0,0.72)].`,
  },
  {
    slug: "input",
    name: "Input",
    category: "components",
    subcategory: "Forms",
    description:
      "Form input with pure black canvas background (#000000), white-alpha border (rgba(255,255,255,0.10)), and Pure Red focus ring.",
    status: "stable",
    primitive: "HTMLInputElement",
    clientComponent: false,
    sections: [
      "preview",
      "description",
      "states",
      "attributes",
      "accessibility",
      "responsive",
      "prompt",
    ],
    attributes: [
      {
        name: "type",
        type: "string",
        default: '"text"',
        description: "HTML input type (text, email, password, etc.).",
      },
      {
        name: "placeholder",
        type: "string",
        description: "Helper text displayed when input is empty.",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        description: "Disables typing and interaction.",
      },
      { name: "value", type: "string | number", description: "Controlled input value." },
      {
        name: "onChange",
        type: "(e: ChangeEvent<HTMLInputElement>) => void",
        description: "Value change handler.",
      },
    ],
    aiPrompt: `Implement PRIME Input on pure black canvas (#000000) with rgba(255,255,255,0.10) border.
Focus state: border-[rgba(255,0,0,0.65)] and shadow-[0_0_0_1px_#000,0_0_0_3px_rgba(255,0,0,0.72)].
Placeholder: rgba(255,255,255,0.35). Text: #ffffff. Never make input gray.`,
  },
  {
    slug: "search-input",
    name: "Search Input",
    category: "components",
    subcategory: "Forms",
    description:
      "Integrated search field featuring Hugeicons search icon, clear button, and physical keycap shortcut badge (⌘K).",
    status: "stable",
    primitive: "HTMLInputElement + Hugeicons",
    clientComponent: true,
    sections: ["preview", "description", "attributes", "accessibility", "prompt"],
    attributes: [
      {
        name: "shortcut",
        type: "string",
        default: '"⌘K"',
        description: "Keyboard badge text displayed on the right.",
      },
      {
        name: "onClear",
        type: "() => void",
        description: "Callback when the clear (X) button is pressed.",
      },
      {
        name: "size",
        type: '"sm" | "default"',
        default: '"default"',
        description: "Height of the search input.",
      },
      { name: "value", type: "string", description: "Search query value." },
    ],
    aiPrompt: `Implement PRIME SearchInput with Search01Icon on left, Cancel01Icon on clear, and physical keyboard shortcut badge on right.
Focus container ring: shadow-[0_0_0_1px_#000,0_0_0_3px_rgba(255,0,0,0.72)].`,
  },
  {
    slug: "textarea",
    name: "Textarea",
    category: "components",
    subcategory: "Forms",
    description:
      "Multiline text field on pure black canvas with white-alpha border and Pure Red focus ring.",
    status: "stable",
    primitive: "HTMLTextAreaElement",
    clientComponent: false,
    sections: ["preview", "description", "attributes", "accessibility", "prompt"],
    attributes: [
      { name: "placeholder", type: "string", description: "Placeholder guidance text." },
      {
        name: "rows",
        type: "number",
        default: "3",
        description: "Visible number of text lines.",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        description: "Disables editing.",
      },
    ],
    aiPrompt: `Build PRIME Textarea using min-h-[80px], pure black canvas background (#000000), border rgba(255,255,255,0.10), text white, and focus ring shadow-[0_0_0_1px_#000,0_0_0_3px_rgba(255,0,0,0.72)].`,
  },
  {
    slug: "checkbox",
    name: "Checkbox",
    category: "components",
    subcategory: "Forms",
    description:
      "Precision toggle with pure red active fill (#FF0000), crisp SVG checkmark, and accessible keyboard focus.",
    status: "stable",
    primitive: "HTMLInputElement (type=checkbox)",
    clientComponent: true,
    sections: [
      "preview",
      "description",
      "states",
      "attributes",
      "accessibility",
      "prompt",
    ],
    attributes: [
      { name: "checked", type: "boolean", description: "Controlled checked state." },
      {
        name: "onCheckedChange",
        type: "(checked: boolean) => void",
        description: "State change callback.",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        description: "Disables interaction.",
      },
    ],
    aiPrompt: `Build PRIME Checkbox using pure black base (#000000) and pure red (#ff0000) checked state with crisp SVG checkmark and focus ring shadow-[0_0_0_1px_#000,0_0_0_3px_rgba(255,0,0,0.72)].`,
  },
  {
    slug: "radio-group",
    name: "Radio Group",
    category: "components",
    subcategory: "Forms",
    description:
      "Single-selection control with pure black item container and Pure Red (#FF0000) center dot indicator.",
    status: "stable",
    primitive: "@radix-ui/react-radio-group",
    clientComponent: true,
    sections: ["preview", "description", "attributes", "accessibility", "prompt"],
    attributes: [
      { name: "value", type: "string", description: "Controlled selected value." },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "Selection change handler.",
      },
    ],
    aiPrompt: `Build PRIME RadioGroup using Radix RadioGroup. Unchecked: black circle with white-alpha border. Checked: border #ff0000 with inner dot #ff0000.`,
  },
  {
    slug: "switch",
    name: "Switch",
    category: "components",
    subcategory: "Forms",
    description:
      "Compact hardware toggle switch with Pure Red active fill and smooth physical thumb translation.",
    status: "stable",
    primitive: "@radix-ui/react-switch",
    clientComponent: true,
    sections: [
      "preview",
      "description",
      "states",
      "attributes",
      "accessibility",
      "prompt",
    ],
    attributes: [
      { name: "checked", type: "boolean", description: "Controlled switch state." },
      {
        name: "onCheckedChange",
        type: "(checked: boolean) => void",
        description: "Toggle state change callback.",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        description: "Disables toggle.",
      },
    ],
    aiPrompt: `Build PRIME Switch using Radix Switch. Inactive: #030303 background with rgba(255,255,255,0.12) border. Active: bg-[#ff0000] border-[#ff0000]. White circular thumb.`,
  },
  {
    slug: "select",
    name: "Select",
    category: "components",
    subcategory: "Forms",
    description:
      "Dropdown selection menu on elevated #060606 surface with Hugeicons tick indicators and smooth Radix Popper positioning.",
    status: "stable",
    primitive: "@radix-ui/react-select",
    clientComponent: true,
    sections: [
      "preview",
      "description",
      "attributes",
      "accessibility",
      "keyboard",
      "prompt",
    ],
    attributes: [
      { name: "value", type: "string", description: "Controlled selected item value." },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "Selection handler.",
      },
      {
        name: "placeholder",
        type: "string",
        description: "Text shown when no option is selected.",
      },
    ],
    aiPrompt: `Build PRIME Select using Radix Select. Trigger: pure black canvas with white-alpha border. Dropdown Content: #060606 elevated surface with shadow-elevation-3 and Tick02Icon in pure red for active item.`,
  },
  {
    slug: "tabs",
    name: "Tabs",
    category: "components",
    subcategory: "Navigation",
    description:
      "Dual tab styles: Line Tabs with Pure Red glowing active bar + Segmented Tabs with elevated pill controls.",
    status: "stable",
    primitive: "@radix-ui/react-tabs",
    clientComponent: true,
    sections: [
      "preview",
      "description",
      "variants",
      "attributes",
      "accessibility",
      "keyboard",
      "prompt",
    ],
    attributes: [
      { name: "value", type: "string", description: "Controlled active tab key." },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "Tab switch handler.",
      },
      {
        name: "variant",
        type: '"line" | "segmented"',
        default: '"line"',
        description: "Line tab with red underline or segmented pill.",
      },
    ],
    aiPrompt: `Build PRIME Tabs supporting variant='line' (bottom pure red glowing bar on active tab) and variant='segmented' (pills inside raised container).`,
  },
  {
    slug: "badge",
    name: "Badge",
    category: "components",
    subcategory: "Data Display",
    description:
      "Monochromatic difficulty badges (Easy, Medium, Hard) and accent badges with Geist Mono typography.",
    status: "stable",
    primitive: "HTMLDivElement",
    clientComponent: false,
    sections: ["preview", "description", "variants", "attributes", "prompt"],
    attributes: [
      {
        name: "variant",
        type: '"default" | "secondary" | "outline" | "accent" | "easy" | "medium" | "hard"',
        default: '"default"',
        description: "Visual style variant.",
      },
      {
        name: "children",
        type: "ReactNode",
        required: true,
        description: "Badge text or element.",
      },
    ],
    aiPrompt: `Build PRIME Badge using font-mono and monochromatic hierarchy:
easy: regular weight, subtle border
medium: medium weight, default border
hard: semi-bold weight, strong border
accent: pure red soft background with red-alpha border.
Never use green/yellow/red traffic lights for difficulty.`,
  },
  {
    slug: "status",
    name: "Status",
    category: "components",
    subcategory: "Data Display",
    description:
      "Preparation status lifecycle (Not Started, Learning, Solved, Needs Revision, Mastered) with Pure Red dedicated exclusively to Needs Revision.",
    status: "stable",
    primitive: "HTMLSpanElement",
    clientComponent: false,
    sections: ["preview", "description", "states", "attributes", "prompt"],
    attributes: [
      {
        name: "status",
        type: '"not_started" | "learning" | "solved" | "needs_revision" | "mastered"',
        required: true,
        description: "Preparation state.",
      },
      {
        name: "size",
        type: '"sm" | "default"',
        default: '"default"',
        description: "Compact vs standard badge size.",
      },
    ],
    aiPrompt: `Build PRIME StatusBadge strictly adhering to the monochromatic lifecycle:
not_started: 40% white alpha
learning: 80% white alpha
solved: solid white
needs_revision: pure red (#ff0000) pulsing dot and text
mastered: solid white.`,
  },
  {
    slug: "avatar",
    name: "Avatar",
    category: "components",
    subcategory: "Data Display",
    description:
      "Circular user avatar with image rendering, smooth loading, and fallback initials on raised black surface.",
    status: "stable",
    primitive: "@radix-ui/react-avatar",
    clientComponent: true,
    sections: ["preview", "description", "attributes", "accessibility", "prompt"],
    attributes: [
      { name: "src", type: "string", description: "Image source URL." },
      {
        name: "alt",
        type: "string",
        description: "Accessible description of user image.",
      },
      {
        name: "fallback",
        type: "string",
        required: true,
        description: "1-2 letter initials fallback.",
      },
    ],
    aiPrompt: `Build PRIME Avatar using Radix Avatar. Container: circle on #030303 with white-alpha border. Fallback: text-xs font-mono text-secondary.`,
  },
  {
    slug: "progress",
    name: "Progress",
    category: "components",
    subcategory: "Data Display",
    description:
      "Linear, segmented, and labeled progress indicators with flat Pure Red active fill on white-alpha track (rgba(255,255,255,0.07)).",
    status: "stable",
    primitive: "HTMLDivElement (role=progressbar)",
    clientComponent: false,
    sections: [
      "preview",
      "description",
      "variants",
      "attributes",
      "accessibility",
      "prompt",
    ],
    attributes: [
      {
        name: "value",
        type: "number",
        default: "0",
        description: "Current value (0 to 100).",
      },
      { name: "max", type: "number", default: "100", description: "Maximum value." },
      {
        name: "variant",
        type: '"default" | "segmented"',
        default: '"default"',
        description: "Continuous bar or discrete segments.",
      },
      {
        name: "segments",
        type: "number",
        default: "5",
        description: "Segment count when variant='segmented'.",
      },
      {
        name: "showLabel",
        type: "boolean",
        default: "false",
        description: "Renders percentage and count header.",
      },
    ],
    aiPrompt: `Build PRIME Progress with rgba(255,255,255,0.07) track and flat #ff0000 active fill. Support continuous and segmented bars with accessible role='progressbar'.`,
  },
  {
    slug: "table",
    name: "Table",
    category: "components",
    subcategory: "Data Display",
    description:
      "Pure black data table with thin white-alpha row separators (rgba(255,255,255,0.06)) and subtle hover/selection states.",
    status: "stable",
    primitive: "HTMLTableElement",
    clientComponent: false,
    sections: [
      "preview",
      "description",
      "attributes",
      "accessibility",
      "responsive",
      "prompt",
    ],
    attributes: [
      {
        name: "children",
        type: "ReactNode",
        required: true,
        description: "TableHeader, TableBody, TableRow, TableCell elements.",
      },
    ],
    aiPrompt: `Build PRIME Table on pure black canvas (#000000). Row borders: rgba(255,255,255,0.06). Row hover: rgba(255,255,255,0.025). Selected: rgba(255,0,0,0.04) with red indicator.`,
  },
  {
    slug: "calendar",
    name: "Calendar",
    category: "components",
    subcategory: "Data Display",
    description:
      "Custom monthly preparation calendar with Today (red outline), Selected (pure red solid fill), completed days (white dot), and revision dots.",
    status: "stable",
    primitive: "HTMLDivElement",
    clientComponent: true,
    sections: [
      "preview",
      "description",
      "states",
      "attributes",
      "accessibility",
      "keyboard",
      "prompt",
    ],
    attributes: [
      { name: "selected", type: "Date", description: "Currently selected date." },
      {
        name: "onSelect",
        type: "(date: Date) => void",
        description: "Date selection callback.",
      },
      {
        name: "completedDates",
        type: "Date[]",
        default: "[]",
        description: "Dates marked with completed white indicators.",
      },
      {
        name: "revisionDates",
        type: "Date[]",
        default: "[]",
        description: "Dates marked with due Pure Red dots.",
      },
    ],
    aiPrompt: `Build PRIME Calendar on pure black base. Month navigation with Hugeicons arrows.
Today: border #ff0000 outline. Selected: bg-[#ff0000] text-white. Completed: white dot. Revision due: pure red dot.`,
  },
  {
    slug: "tooltip",
    name: "Tooltip",
    category: "components",
    subcategory: "Overlays",
    description:
      "Elevated contextual tooltip on #060606 surface with subtle white-alpha border and fast 120ms fade animation.",
    status: "stable",
    primitive: "@radix-ui/react-tooltip",
    clientComponent: true,
    sections: ["preview", "description", "attributes", "accessibility", "prompt"],
    attributes: [
      {
        name: "children",
        type: "ReactNode",
        required: true,
        description: "Trigger element.",
      },
      {
        name: "content",
        type: "ReactNode",
        required: true,
        description: "Tooltip text or element.",
      },
      {
        name: "sideOffset",
        type: "number",
        default: "4",
        description: "Pixel distance from trigger.",
      },
    ],
    aiPrompt: `Build PRIME Tooltip using Radix Tooltip. Content: #060606 surface with rgba(255,255,255,0.20) border and shadow-elevation-2.`,
  },
  {
    slug: "dropdown-menu",
    name: "Dropdown Menu",
    category: "components",
    subcategory: "Overlays",
    description:
      "Action menu on elevated #060606 surface with keyboard shortcuts, separators, and destructive action item styling.",
    status: "stable",
    primitive: "@radix-ui/react-dropdown-menu",
    clientComponent: true,
    sections: [
      "preview",
      "description",
      "attributes",
      "accessibility",
      "keyboard",
      "prompt",
    ],
    attributes: [
      {
        name: "children",
        type: "ReactNode",
        required: true,
        description: "Trigger and items.",
      },
    ],
    aiPrompt: `Build PRIME DropdownMenu using Radix DropdownMenu. Menu content on #060606 elevated surface, white-alpha border, shadow-elevation-3, and pure red styling for destructive items.`,
  },
  {
    slug: "popover",
    name: "Popover",
    category: "components",
    subcategory: "Overlays",
    description:
      "Contextual card overlay for inline settings, date filters, or detailed inspection without modal interruption.",
    status: "stable",
    primitive: "@radix-ui/react-popover",
    clientComponent: true,
    sections: ["preview", "description", "attributes", "accessibility", "prompt"],
    attributes: [
      {
        name: "children",
        type: "ReactNode",
        required: true,
        description: "Trigger and popover body.",
      },
    ],
    aiPrompt: `Build PRIME Popover using Radix Popover. Content: #060606 surface, white-alpha border rgba(255,255,255,0.20), shadow-elevation-3.`,
  },
  {
    slug: "dialog",
    name: "Dialog",
    category: "components",
    subcategory: "Overlays",
    description:
      "Modal overlay on #030303 with dark backdrop (rgba(0,0,0,0.82)), focus trapping, and tactile close button.",
    status: "stable",
    primitive: "@radix-ui/react-dialog",
    clientComponent: true,
    sections: [
      "preview",
      "description",
      "attributes",
      "accessibility",
      "keyboard",
      "prompt",
    ],
    attributes: [
      { name: "open", type: "boolean", description: "Controlled open state." },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "Open state change handler.",
      },
    ],
    aiPrompt: `Build PRIME Dialog with backdrop rgba(0,0,0,0.82), content #030303, border rgba(255,255,255,0.12), tactile Cancel01Icon close button, and focus trap.`,
  },
  {
    slug: "alert-dialog",
    name: "Alert Dialog",
    category: "components",
    subcategory: "Overlays",
    description:
      "Destructive confirmation dialog demanding explicit user consent with cancel and confirm actions.",
    status: "stable",
    primitive: "@radix-ui/react-alert-dialog",
    clientComponent: true,
    sections: [
      "preview",
      "description",
      "attributes",
      "accessibility",
      "keyboard",
      "prompt",
    ],
    attributes: [
      { name: "open", type: "boolean", description: "Controlled open state." },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "Open state change handler.",
      },
    ],
    aiPrompt: `Build PRIME AlertDialog with backdrop rgba(0,0,0,0.82), content #030303, Cancel button (outline/secondary), and Action button (destructive).`,
  },
  {
    slug: "sheet",
    name: "Sheet / Drawer",
    category: "components",
    subcategory: "Overlays",
    description:
      "Responsive right-docked drawer panel for deep inspection of roadmap nodes, problems, and notes without leaving context.",
    status: "stable",
    primitive: "@radix-ui/react-dialog",
    clientComponent: true,
    sections: [
      "preview",
      "description",
      "attributes",
      "accessibility",
      "responsive",
      "prompt",
    ],
    attributes: [
      {
        name: "side",
        type: '"left" | "right" | "top" | "bottom"',
        default: '"right"',
        description: "Drawer dock position.",
      },
      { name: "open", type: "boolean", description: "Controlled open state." },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "Open state change handler.",
      },
    ],
    aiPrompt: `Build PRIME Sheet docked to the right on desktop, with slide-in animation, background #030303, and border rgba(255,255,255,0.12).`,
  },
  {
    slug: "command",
    name: "Command Palette",
    category: "components",
    subcategory: "Overlays",
    description:
      "Fast ⌘K command menu powered by cmdk with grouped sections, search filtering, and keyboard navigation.",
    status: "stable",
    primitive: "cmdk",
    clientComponent: true,
    sections: [
      "preview",
      "description",
      "attributes",
      "accessibility",
      "keyboard",
      "prompt",
    ],
    attributes: [
      { name: "open", type: "boolean", description: "Controlled open state." },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "Open state change handler.",
      },
    ],
    aiPrompt: `Build PRIME Command palette using cmdk inside Dialog. Header with Search01Icon, grouped items with keyboard shortcuts, and pure red selected indicators.`,
  },
  {
    slug: "skeleton",
    name: "Skeleton",
    category: "components",
    subcategory: "Feedback",
    description:
      "Monochromatic loading pulse indicator mirroring row, card, table, and metric geometry.",
    status: "stable",
    primitive: "HTMLDivElement",
    clientComponent: false,
    sections: ["preview", "description", "attributes", "prompt"],
    attributes: [
      {
        name: "className",
        type: "string",
        description: "Geometric width/height dimensions.",
      },
    ],
    aiPrompt: `Build PRIME Skeleton using bg-[#060606] with animate-pulse and compact radius.`,
  },
  {
    slug: "sonner",
    name: "Toast (Sonner)",
    category: "components",
    subcategory: "Feedback",
    description:
      "Global toast notification system styled on #030303 overlay surface with white text and Pure Red action buttons.",
    status: "stable",
    primitive: "sonner",
    clientComponent: true,
    sections: ["preview", "description", "attributes", "prompt"],
    attributes: [
      {
        name: "theme",
        type: '"dark"',
        default: '"dark"',
        description: "Enforced dark theme.",
      },
    ],
    aiPrompt: `Configure PRIME Sonner Toaster with background #030303, border rgba(255,255,255,0.12), action button #ff0000, and text white.`,
  },
  {
    slug: "card",
    name: "Card",
    category: "components",
    subcategory: "Layout",
    description:
      "Physical black-first card container with base, raised (#030303), and elevated (#060606) levels separated by white-alpha borders.",
    status: "stable",
    primitive: "HTMLDivElement",
    clientComponent: false,
    sections: ["preview", "description", "variants", "attributes", "prompt"],
    attributes: [
      {
        name: "elevation",
        type: '"base" | "raised" | "elevated"',
        default: '"raised"',
        description: "Surface level.",
      },
      {
        name: "interactive",
        type: "boolean",
        default: "false",
        description: "Enables hover border highlight and cursor-pointer.",
      },
    ],
    aiPrompt: `Build PRIME Card on pure black range (#000000 base, #030303 raised, #060606 elevated) with white-alpha borders and shadow-elevation-1 to 3. Never make cards gray.`,
  },
  {
    slug: "separator",
    name: "Separator",
    category: "components",
    subcategory: "Layout",
    description:
      "Thin 1px white-alpha divider (rgba(255,255,255,0.07)) for horizontal and vertical content grouping.",
    status: "stable",
    primitive: "HTMLDivElement",
    clientComponent: false,
    sections: ["preview", "description", "attributes", "prompt"],
    attributes: [
      {
        name: "orientation",
        type: '"horizontal" | "vertical"',
        default: '"horizontal"',
        description: "Divider axis.",
      },
    ],
    aiPrompt: `Build PRIME Separator using 1px rgba(255,255,255,0.07) background.`,
  },

  // =========================================================================
  // PATTERNS (12 Items)
  // =========================================================================
  {
    slug: "task-row",
    name: "Task Row",
    category: "patterns",
    subcategory: "Patterns",
    description:
      "Actionable task item composing checkbox, title, duration metadata, and Pure Red active indicator (▌).",
    status: "stable",
    primitive: "Composite Component",
    clientComponent: true,
    sections: ["preview", "description", "states", "attributes", "prompt"],
    attributes: [
      { name: "title", type: "string", required: true, description: "Task headline." },
      { name: "category", type: "string", description: "Category badge text." },
      { name: "duration", type: "string", description: "Estimated time duration." },
      {
        name: "completed",
        type: "boolean",
        default: "false",
        description: "Completed state with strikethrough.",
      },
      {
        name: "active",
        type: "boolean",
        default: "false",
        description: "Active state with red indicator.",
      },
    ],
    aiPrompt: `Build PRIME TaskRow pattern with checkbox, title, category, duration, and ▌ Pure Red left bar when active.`,
  },
  {
    slug: "problem-row",
    name: "Problem Row",
    category: "patterns",
    subcategory: "Patterns",
    description:
      "Interview problem representation with external link to LeetCode/TUF/GFG, monochromatic difficulty, and status badge.",
    status: "stable",
    primitive: "Composite Component",
    clientComponent: false,
    sections: ["preview", "description", "attributes", "prompt"],
    attributes: [
      {
        name: "id",
        type: "string | number",
        required: true,
        description: "Problem number (e.g. #001).",
      },
      { name: "title", type: "string", required: true, description: "Problem title." },
      {
        name: "difficulty",
        type: '"easy" | "medium" | "hard"',
        required: true,
        description: "Monochromatic difficulty.",
      },
      {
        name: "topic",
        type: "string",
        required: true,
        description: "Algorithmic topic.",
      },
      {
        name: "platform",
        type: "string",
        default: '"LeetCode"',
        description: "Destination platform.",
      },
      { name: "platformUrl", type: "string", description: "External URL." },
      {
        name: "status",
        type: "PreparationStatus",
        required: true,
        description: "Preparation status.",
      },
    ],
    aiPrompt: `Build PRIME ProblemRow with problem ID (#001), external link with ArrowUpRight01Icon, monochromatic difficulty badge, topic, and StatusBadge.`,
  },
  {
    slug: "revision-row",
    name: "Revision Row",
    category: "patterns",
    subcategory: "Patterns",
    description:
      "Spaced repetition item with interval badge (Day 1, 3, 7, 14, 30) and Pure Red urgency alerting for Due Today items.",
    status: "stable",
    primitive: "Composite Component",
    clientComponent: true,
    sections: ["preview", "description", "states", "attributes", "prompt"],
    attributes: [
      { name: "topic", type: "string", required: true, description: "Revision concept." },
      {
        name: "interval",
        type: "string",
        required: true,
        description: "Repetition interval badge.",
      },
      {
        name: "dueDate",
        type: "string",
        required: true,
        description: "Humanized due date.",
      },
      {
        name: "status",
        type: '"due_today" | "overdue" | "upcoming"',
        required: true,
        description: "Urgency state.",
      },
      { name: "onReview", type: "() => void", description: "Review trigger callback." },
    ],
    aiPrompt: `Build PRIME RevisionRow with interval badge and Pure Red (#ff0000) emphasis on due_today and overdue items. Primary neumorphic button for Review Now.`,
  },
  {
    slug: "metric",
    name: "Metric Card",
    category: "patterns",
    subcategory: "Patterns",
    description:
      "High-contrast tabular KPI display with Geist Mono figures, units, and trend indicators.",
    status: "stable",
    primitive: "Composite Component",
    clientComponent: false,
    sections: ["preview", "description", "attributes", "prompt"],
    attributes: [
      { name: "label", type: "string", required: true, description: "Metric title." },
      {
        name: "value",
        type: "string | number",
        required: true,
        description: "Tabular numerical figure.",
      },
      { name: "unit", type: "string", description: "Measurement unit." },
      { name: "helper", type: "string", description: "Subtext explanation." },
      {
        name: "trend",
        type: '{ value: string; direction: "up" | "down" | "neutral" }',
        description: "Directional trend.",
      },
      {
        name: "highlight",
        type: "boolean",
        default: "false",
        description: "Pure Red border highlight.",
      },
    ],
    aiPrompt: `Build PRIME Metric card with tabular mono figures (font-mono font-mono-numbers) on pure black canvas with white-alpha border.`,
  },
  {
    slug: "metric-strip",
    name: "Metric Strip",
    category: "patterns",
    subcategory: "Patterns",
    description:
      "Single-line minimal-chrome KPI strip as a clean alternative to multiple heavy separate cards.",
    status: "stable",
    primitive: "Composite Component",
    clientComponent: false,
    sections: ["preview", "description", "attributes", "prompt"],
    attributes: [
      {
        name: "items",
        type: "MetricStripItem[]",
        required: true,
        description: "Array of KPI metrics.",
      },
    ],
    aiPrompt: `Build PRIME MetricStrip as a horizontal low-chrome row divided by rgba(255,255,255,0.06) borders.`,
  },
  {
    slug: "activity-row",
    name: "Activity Row",
    category: "patterns",
    subcategory: "Patterns",
    description:
      "Chronological execution log item with mono timestamp and Hugeicons event icon.",
    status: "stable",
    primitive: "Composite Component",
    clientComponent: false,
    sections: ["preview", "description", "attributes", "prompt"],
    attributes: [
      {
        name: "icon",
        type: "IconSvgElement",
        required: true,
        description: "Event icon.",
      },
      {
        name: "title",
        type: "string",
        required: true,
        description: "Activity headline.",
      },
      { name: "description", type: "string", description: "Optional metadata." },
      {
        name: "timestamp",
        type: "string",
        required: true,
        description: "Mono relative timestamp.",
      },
    ],
    aiPrompt: `Build PRIME ActivityRow with icon on #030303 surface, title, description, and mono timestamp.`,
  },
  {
    slug: "keyboard-key",
    name: "Keyboard Key",
    category: "patterns",
    subcategory: "Patterns",
    description:
      "Tactile physical keycap badge (⌘, K, Esc, Enter) with bevel shadow and Geist Mono typography.",
    status: "stable",
    primitive: "HTMLElement (<kbd>)",
    clientComponent: false,
    sections: ["preview", "description", "attributes", "prompt"],
    attributes: [
      {
        name: "children",
        type: "ReactNode",
        required: true,
        description: "Keycap label.",
      },
    ],
    aiPrompt: `Build PRIME KeyboardKey as <kbd> on #030303 with border rgba(255,255,255,0.12) and inner bevel shadow.`,
  },
  {
    slug: "empty-state",
    name: "Empty State",
    category: "patterns",
    subcategory: "Patterns",
    description:
      "Zero-data placeholder on pure black canvas with dashed white-alpha border, icon, and optional CTA button.",
    status: "stable",
    primitive: "Composite Component",
    clientComponent: false,
    sections: ["preview", "description", "attributes", "prompt"],
    attributes: [
      { name: "icon", type: "IconSvgElement", description: "Central state icon." },
      { name: "title", type: "string", required: true, description: "Primary message." },
      {
        name: "description",
        type: "string",
        required: true,
        description: "Helpful next steps.",
      },
      { name: "action", type: "ReactNode", description: "CTA button." },
    ],
    aiPrompt: `Build PRIME EmptyState with dashed border rgba(255,255,255,0.14), icon in circle on #030303, title, and action.`,
  },
  {
    slug: "error-state",
    name: "Error State",
    category: "patterns",
    subcategory: "Patterns",
    description:
      "Inline or card error notification with Pure Red accent border (rgba(255,0,0,0.35)) and retry button.",
    status: "stable",
    primitive: "Composite Component",
    clientComponent: false,
    sections: ["preview", "description", "attributes", "prompt"],
    attributes: [
      { name: "title", type: "string", description: "Error headline." },
      {
        name: "message",
        type: "string",
        required: true,
        description: "Error explanation.",
      },
      {
        name: "variant",
        type: '"inline" | "card"',
        default: '"card"',
        description: "Inline banner or card.",
      },
      { name: "onRetry", type: "() => void", description: "Retry callback." },
    ],
    aiPrompt: `Build PRIME ErrorState supporting variant='inline' and variant='card' with Pure Red border rgba(255,0,0,0.35) and retry action.`,
  },
  {
    slug: "nav-item",
    name: "Nav Item",
    category: "patterns",
    subcategory: "Patterns",
    description:
      "Sidebar navigation element with ▌ Pure Red (#FF0000) active indicator line and white typography.",
    status: "stable",
    primitive: "HTMLAnchorElement",
    clientComponent: false,
    sections: ["preview", "description", "states", "attributes", "prompt"],
    attributes: [
      {
        name: "icon",
        type: "IconSvgElement",
        required: true,
        description: "Navigation icon.",
      },
      { name: "label", type: "string", required: true, description: "Navigation label." },
      { name: "badge", type: "string | number", description: "Optional counter badge." },
      {
        name: "active",
        type: "boolean",
        default: "false",
        description: "Active state with left ▌ red bar.",
      },
    ],
    aiPrompt: `Build PRIME NavItem with ▌ Pure Red (#ff0000) left indicator when active, background rgba(255,255,255,0.035), and white text.`,
  },
  {
    slug: "page-header",
    name: "Page Header",
    category: "patterns",
    subcategory: "Patterns",
    description:
      "High-clarity editorial header on pure black backdrop with title, description, badge, and action slots.",
    status: "stable",
    primitive: "HTMLDivElement",
    clientComponent: false,
    sections: ["preview", "description", "attributes", "prompt"],
    attributes: [
      { name: "title", type: "string", required: true, description: "Page title." },
      { name: "description", type: "string", description: "Page description." },
      { name: "badge", type: "ReactNode", description: "Metadata badge." },
      { name: "actions", type: "ReactNode", description: "Header action buttons." },
    ],
    aiPrompt: `Build PRIME PageHeader with title, description, badge, actions, and bottom border rgba(255,255,255,0.07).`,
  },
  {
    slug: "section-header",
    name: "Section Header",
    category: "patterns",
    subcategory: "Patterns",
    description:
      "Structural section divider separating visual modules with count indicator and trailing action.",
    status: "stable",
    primitive: "HTMLDivElement",
    clientComponent: false,
    sections: ["preview", "description", "attributes", "prompt"],
    attributes: [
      { name: "title", type: "string", required: true, description: "Section title." },
      { name: "description", type: "string", description: "Section description." },
      { name: "count", type: "string | number", description: "Counter badge." },
      { name: "action", type: "ReactNode", description: "Trailing action." },
    ],
    aiPrompt: `Build PRIME SectionHeader with title, count, description, and bottom border rgba(255,255,255,0.07).`,
  },
] as const;

// Helper utilities for Registry Consumer
export function getAllRegistryItems(): readonly RegistryItem[] {
  return REGISTRY_ITEMS;
}

export function getItemBySlug(slug: string): RegistryItem | undefined {
  return REGISTRY_ITEMS.find((item) => item.slug === slug);
}

export function getItemsByCategory(category: Category): RegistryItem[] {
  return REGISTRY_ITEMS.filter((item) => item.category === category);
}

export function getItemsBySubcategory(subcategory: Subcategory): RegistryItem[] {
  return REGISTRY_ITEMS.filter((item) => item.subcategory === subcategory);
}

export interface NavigationGroup {
  category: Category;
  title: string;
  subcategories: {
    title: Subcategory;
    items: RegistryItem[];
  }[];
}

export function getGroupedNavigation(): NavigationGroup[] {
  const categories: { category: Category; title: string }[] = [
    { category: "foundations", title: "Foundations" },
    { category: "components", title: "Components" },
    { category: "patterns", title: "Patterns" },
  ];

  return categories.map(({ category, title }) => {
    const items = getItemsByCategory(category);
    const subcategoryMap = new Map<Subcategory, RegistryItem[]>();

    items.forEach((item) => {
      const list = subcategoryMap.get(item.subcategory) || [];
      list.push(item);
      subcategoryMap.set(item.subcategory, list);
    });

    return {
      category,
      title,
      subcategories: Array.from(subcategoryMap.entries()).map(([subTitle, subItems]) => ({
        title: subTitle,
        items: subItems,
      })),
    };
  });
}

export function getPrevNext(slug: string): {
  prev?: { name: string; href: string };
  next?: { name: string; href: string };
} {
  const index = REGISTRY_ITEMS.findIndex((item) => item.slug === slug);
  if (index === -1) return {};

  const prevItem = REGISTRY_ITEMS[index - 1];
  const nextItem = REGISTRY_ITEMS[index + 1];

  return {
    prev: prevItem
      ? {
          name: prevItem.name,
          href: `/design-system/${prevItem.category}/${prevItem.slug}`,
        }
      : undefined,
    next: nextItem
      ? {
          name: nextItem.name,
          href: `/design-system/${nextItem.category}/${nextItem.slug}`,
        }
      : undefined,
  };
}

export function searchRegistry(query: string): RegistryItem[] {
  if (!query || query.trim() === "") return [];
  const q = query.toLowerCase().trim();
  return REGISTRY_ITEMS.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.slug.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.subcategory.toLowerCase().includes(q)
  );
}
