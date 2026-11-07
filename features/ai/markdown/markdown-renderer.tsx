"use client";

import { memo } from "react";
import {
  RichContentRenderer,
  FormattingBoundary,
  type RichContentRendererProps,
} from "../rich-content/rich-content-renderer";

export { FormattingBoundary };
export type RendererProps = RichContentRendererProps;

export default memo(
  RichContentRenderer,
  (a, b) =>
    a.content === b.content &&
    a.streaming === b.streaming &&
    a.mode === b.mode &&
    JSON.stringify(a.references ?? []) === JSON.stringify(b.references ?? [])
);
