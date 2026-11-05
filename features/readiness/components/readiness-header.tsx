"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Target02Icon } from "@hugeicons/core-free-icons";
import {
  TARGET_PROFILES,
  CANONICAL_COMPANIES,
  type ReadinessStatus,
} from "@/domain/readiness";
import { ReadinessStatusBadge } from "./readiness-status";

interface ReadinessHeaderProps {
  currentProfileId: string;
  currentCompanyId?: string;
  onProfileChange: (profileId: string) => void;
  onCompanyChange: (companyId: string) => void;
  onOpenCompare: (trigger: HTMLButtonElement) => void;
  overallAlignment: ReadinessStatus;
}

export function ReadinessHeader({
  currentProfileId,
  currentCompanyId = "all",
  onProfileChange,
  onCompanyChange,
  onOpenCompare,
  overallAlignment,
}: ReadinessHeaderProps) {
  return (
    <header className="space-y-3 sm:space-y-4">
      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Interview Readiness
          </h1>
          <ReadinessStatusBadge status={overallAlignment} />
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          See which skills your practice supports and where to focus for your target role.
        </p>
      </div>

      <Card
        elevation="raised"
        className="grid items-end gap-2.5 p-3 @min-[24rem]:grid-cols-2 @min-[36rem]:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_auto] sm:p-4"
      >
        <div className="min-w-0 space-y-1">
          <label
            htmlFor="readiness-profile"
            className="block text-xs font-medium text-[var(--text-secondary)]"
          >
            Target Profile
          </label>
          <Select value={currentProfileId} onValueChange={onProfileChange}>
            <SelectTrigger id="readiness-profile" className="h-9 min-w-0">
              <SelectValue placeholder="Select target profile" />
            </SelectTrigger>
            <SelectContent>
              {TARGET_PROFILES.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0 space-y-1">
          <label
            htmlFor="company-emphasis"
            className="block text-xs font-medium text-[var(--text-secondary)]"
          >
            Company Emphasis
          </label>
          <Select value={currentCompanyId} onValueChange={onCompanyChange}>
            <SelectTrigger id="company-emphasis" className="h-9 min-w-0">
              <SelectValue placeholder="Emphasis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">General Emphasis</SelectItem>
              {CANONICAL_COMPANIES.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="secondary"
          size="lg"
          aria-haspopup="dialog"
          onClick={(event) => onOpenCompare(event.currentTarget)}
          className="w-full @min-[24rem]:col-span-2 @min-[36rem]:col-span-1"
        >
          <Icon
            icon={Target02Icon}
            size={15}
            className="text-[var(--accent)]"
            aria-hidden="true"
          />
          Compare Targets
        </Button>
      </Card>
    </header>
  );
}
