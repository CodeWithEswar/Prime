import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SettingsHeading, SettingsSection } from "./settings-primitives";

interface ConnectionsSettingsViewProps {
  email: string;
  providers: string[];
}

export function ConnectionsSettingsView({
  email,
  providers,
}: ConnectionsSettingsViewProps) {
  const unique = [...new Set(providers)];
  return (
    <div className="space-y-5">
      <SettingsHeading
        title="Connected accounts"
        description="Sign-in methods linked to your PRIME account."
      />
      <SettingsSection title="Linked sign-in methods">
        <p className="text-sm text-[var(--text-secondary)] [overflow-wrap:anywhere]">
          Account email · {email}
        </p>
        {unique.length ? (
          <ul className="divide-y divide-[var(--border-subtle)]">
            {unique.map((provider) => (
              <li
                key={provider}
                className="flex min-w-0 flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium capitalize">
                    {provider === "email" ? "Email" : provider}
                  </p>
                </div>
                <span className="text-xs text-[var(--text-secondary)]">Connected</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">
            No linked providers were returned for this account.
          </p>
        )}
      </SettingsSection>
      <Button asChild variant="outline">
        <Link href="/settings/security">Manage account security</Link>
      </Button>
    </div>
  );
}
