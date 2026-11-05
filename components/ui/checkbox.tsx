import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  onCheckedChange?: (checked: boolean) => void;
  containerClassName?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { className, containerClassName, checked, defaultChecked, onChange, onCheckedChange, disabled, ...props },
    ref
  ) => {
    const [isChecked, setIsChecked] = React.useState<boolean>(
      Boolean(checked ?? defaultChecked ?? false)
    );

    React.useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(checked);
      }
    }, [checked]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextChecked = e.target.checked;
      if (checked === undefined) {
        setIsChecked(nextChecked);
      }
      onChange?.(e);
      onCheckedChange?.(nextChecked);
    };

    const currentChecked = checked !== undefined ? checked : isChecked;

    return (
      <label
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center select-none",
          disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer",
          containerClassName
        )}
      >
        <input
          type="checkbox"
          ref={ref}
          checked={currentChecked}
          onChange={handleChange}
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        <div
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded-[var(--radius-xs)] border border-[var(--border-strong)] bg-[var(--prime-canvas)] text-white transition-all duration-100 peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent)]/50 peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-[var(--background)] hover:border-[var(--border-default)]",
            currentChecked &&
              "bg-[var(--accent)] border-[var(--accent)] shadow-[0_0_8px_rgba(255,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] hover:border-[var(--accent)]",
            className
          )}
        >
          {currentChecked && (
            <svg
              className="h-3 w-3 stroke-white stroke-[2.5]"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M2.5 6.2L4.8 8.5L9.5 3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";
