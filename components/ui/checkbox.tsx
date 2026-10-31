import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, defaultChecked, onChange, onCheckedChange, ...props }, ref) => {
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

    return (
      <label className="relative inline-flex items-center justify-center cursor-pointer select-none">
        <input
          type="checkbox"
          ref={ref}
          checked={checked !== undefined ? checked : isChecked}
          onChange={handleChange}
          className="peer sr-only"
          {...props}
        />
        <div
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded-[var(--radius-xs)] border border-[var(--border-strong)] bg-[var(--surface)] text-white transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent)]/40 peer-disabled:cursor-not-allowed peer-disabled:opacity-40 peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]",
            className
          )}
        >
          {(checked !== undefined ? checked : isChecked) && (
            <svg
              className="h-3 w-3 stroke-current stroke-2"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.5 6L5 8.5L9.5 3.5"
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
