import * as React from "react";
import { Search01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export interface SearchInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  shortcut?: string;
  onClear?: () => void;
  size?: "sm" | "default";
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    { className, value, onChange, onClear, shortcut = "⌘K", size = "default", ...props },
    ref
  ) => {
    const hasValue = Boolean(value && String(value).length > 0);

    return (
      <div
        className={cn(
          "relative flex items-center w-full group rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.10)] bg-[var(--prime-canvas)] transition-all duration-100 focus-within:border-[rgba(255,0,0,0.65)] focus-within:shadow-[0_0_0_1px_#000000,0_0_0_3px_rgba(255,0,0,0.72)]",
          size === "sm" ? "h-8" : "h-9",
          className
        )}
      >
        <span className="flex items-center justify-center pl-3 pr-2 text-[var(--text-tertiary)] group-focus-within:text-[var(--text-secondary)] pointer-events-none">
          <Icon icon={Search01Icon} size={size === "sm" ? 14 : 16} />
        </span>
        <input
          ref={ref}
          type="search"
          value={value}
          onChange={onChange}
          className="flex-1 bg-transparent py-1 text-sm text-white placeholder:text-[rgba(255,255,255,0.35)] outline-none min-w-0 pr-2"
          {...props}
        />
        {hasValue && onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="mr-2 p-0.5 rounded text-[var(--text-tertiary)] hover:text-white hover:bg-[var(--surface-hover)] transition-colors"
            aria-label="Clear search"
          >
            <Icon icon={Cancel01Icon} size={14} />
          </button>
        ) : shortcut ? (
          <span className="mr-2.5 inline-flex items-center px-1.5 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--surface-raised)] font-mono text-[10px] text-[var(--text-tertiary)] pointer-events-none tracking-wider">
            {shortcut}
          </span>
        ) : null}
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";
