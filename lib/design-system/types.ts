export type Category = "foundations" | "components" | "patterns";

export type Subcategory =
  | "Tokens"
  | "Actions"
  | "Forms"
  | "Navigation"
  | "Data Display"
  | "Feedback"
  | "Overlays"
  | "Layout"
  | "Patterns";

export type ComponentStatus = "stable" | "experimental" | "deprecated";

export interface ApiProperty {
  name: string;
  type: string;
  default?: string;
  required?: boolean;
  description: string;
  deprecated?: boolean;
}

export interface KeyboardShortcut {
  key: string;
  behavior: string;
}

export interface DoDontItem {
  do: string;
  doDescription: string;
  dont: string;
  dontDescription: string;
}

export interface AnatomyItem {
  id: number;
  label: string;
  description: string;
}

export interface RegistryItem {
  slug: string;
  name: string;
  category: Category;
  subcategory: Subcategory;
  description: string;
  status: ComponentStatus;
  primitive?: string;
  clientComponent?: boolean;
  sections: readonly string[];
  attributes?: ApiProperty[];
  keyboard?: KeyboardShortcut[];
  dodont?: DoDontItem[];
  anatomy?: AnatomyItem[];
  aiPrompt: string;
}
