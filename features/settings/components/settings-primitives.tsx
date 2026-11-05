"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const DraftContext = createContext<((dirty: boolean) => void) | null>(null);
const NavigationContext = createContext<((href: string) => void) | null>(null);

export function useSettingsNavigation() {
  const navigate = useContext(NavigationContext);
  if (!navigate) throw new Error("Settings navigation requires SettingsDraftGuard.");
  return navigate;
}

export function SettingsDraftGuard({ children }: { children: ReactNode }) {
  const [dirty, setDirty] = useState(false);
  const [destination, setDestination] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    const navigate = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor =
        event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (
        !(anchor instanceof HTMLAnchorElement) ||
        anchor.target ||
        anchor.hasAttribute("download")
      )
        return;
      const url = new URL(anchor.href);
      if (url.origin !== location.origin || url.pathname === pathname) return;
      event.preventDefault();
      setDestination(url.pathname + url.search + url.hash);
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", navigate, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", navigate, true);
    };
  }, [dirty, pathname]);

  return (
    <DraftContext.Provider value={setDirty}>
      <NavigationContext.Provider
        value={(href) => {
          if (dirty) setDestination(href);
          else router.push(href);
        }}
      >
        {children}
      </NavigationContext.Provider>
      <AlertDialog
        open={Boolean(destination)}
        onOpenChange={(open) => {
          if (!open) setDestination(null);
        }}
      >
        <AlertDialogContent className="w-[calc(100%-2rem)] p-4 sm:p-6">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Your changes will be lost when you leave this section.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <Button
              onClick={() => {
                if (!destination) return;
                const next = destination;
                setDirty(false);
                setDestination(null);
                router.push(next);
              }}
            >
              Discard changes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DraftContext.Provider>
  );
}

export function SettingsHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header className="space-y-1">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
        {description}
      </p>
    </header>
  );
}

export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <Card elevation="base" className="min-w-0 overflow-hidden">
      <section aria-labelledby={id}>
        <header className="space-y-1 border-b border-[var(--border-subtle)] px-4 py-3 sm:px-5">
          <h3 id={id} className="text-sm font-semibold">
            {title}
          </h3>
          {description && (
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              {description}
            </p>
          )}
        </header>
        <div className="min-w-0 space-y-4 p-4 sm:p-5">{children}</div>
      </section>
    </Card>
  );
}

export function SettingsField({
  id,
  label,
  description,
  children,
}: {
  id: string;
  label: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      {children}
      {description && (
        <p
          id={id + "-hint"}
          className="text-xs leading-relaxed text-[var(--text-secondary)]"
        >
          {description}
        </p>
      )}
    </div>
  );
}

export function SettingsSelect<T extends string>({
  id,
  value,
  options,
  onChange,
  disabled,
}: {
  id: string;
  value: T;
  options: readonly (readonly [T, string])[];
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next as T)}
      disabled={disabled}
    >
      <SelectTrigger id={id} className="w-full min-w-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-w-[calc(100vw-2rem)]">
        {options.map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function SettingsToggle({
  id,
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-4">
      <div className="min-w-0 space-y-1">
        <Label htmlFor={id} className="text-sm font-medium leading-normal">
          {label}
        </Label>
        {description && (
          <p
            id={id + "-hint"}
            className="text-xs leading-relaxed text-[var(--text-secondary)]"
          >
            {description}
          </p>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        aria-describedby={description ? id + "-hint" : undefined}
        className="shrink-0"
      />
    </div>
  );
}

type SaveResult = { ok: true; data?: unknown } | { ok: false; error: string };

export function useSettingsEditor<T>(
  initial: T,
  save: (value: T) => Promise<SaveResult>
) {
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();
  const markDirty = useContext(DraftContext);
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const mutation = useMutation({
    mutationFn: async (value: T) => {
      const result = await save(value);
      if (!result.ok) throw new Error(result.error);
      return value;
    },
    onSuccess: (value) => {
      setSaved(value);
      setMessage("Changes saved.");
      void queryClient.invalidateQueries({ queryKey: ["settings"] });
      if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel("prime-settings");
        channel.postMessage("updated");
        channel.close();
      }
      router.refresh();
    },
  });

  useEffect(() => {
    markDirty?.(dirty);
    return () => markDirty?.(false);
  }, [dirty, markDirty]);

  return {
    form,
    setForm,
    dirty,
    pending: mutation.isPending,
    error: mutation.error?.message ?? "",
    message: dirty ? "" : message,
    submit: () => {
      setMessage("");
      mutation.mutate(form);
    },
    cancel: () => {
      setForm(saved);
      setMessage("");
      mutation.reset();
    },
  };
}

export function SettingsSaveBar({
  dirty,
  pending,
  error,
  message,
  onCancel,
}: {
  dirty: boolean;
  pending: boolean;
  error: string;
  message: string;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-4">
      <div className="min-w-0 flex-1 text-sm">
        {error ? (
          <p role="alert" className="text-[var(--accent)]">
            {error}
          </p>
        ) : (
          <p role="status" className="text-[var(--text-secondary)]">
            {pending ? "Saving changes…" : dirty ? "Unsaved changes" : message}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={!dirty || pending}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!dirty} loading={pending}>
          Save changes
        </Button>
      </div>
    </div>
  );
}
