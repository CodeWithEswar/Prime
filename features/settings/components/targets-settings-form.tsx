"use client";

import { useState } from "react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { PlannerDateField } from "@/features/planner/components/planner-date-field";
import {
  SettingsField,
  SettingsHeading,
  SettingsSaveBar,
  SettingsSection,
  SettingsSelect,
  useSettingsEditor,
} from "./settings-primitives";
import { updateCareerTargetsAction } from "../server/actions";
import type { CareerTargets } from "../types";

export function TargetsSettingsForm({ targets }: { targets: CareerTargets }) {
  const legacyLpa = targets.targetPackage?.match(/^\s*(\d+(?:\.\d+)?)\s+LPA\s*$/i);
  const initialAmount =
    targets.targetCompensationCurrency === "INR" &&
    targets.targetCompensationPeriod === "annual" &&
    legacyLpa &&
    Number(legacyLpa[1]) === targets.targetCompensationAmount
      ? Number(legacyLpa[1]) * 100_000
      : targets.targetCompensationAmount;
  const editor = useSettingsEditor(
    {
      ...targets,
      targetCompanies: targets.targetCompanies ?? [],
      primaryTargetCompany: targets.primaryTargetCompany ?? "",
      targetCompensationAmount: initialAmount?.toString() ?? "",
      minAcceptableCompensation: targets.minAcceptableCompensation?.toString() ?? "",
      targetDate: targets.targetDate ?? "",
    },
    (value) =>
      updateCareerTargetsAction({
        ...value,
        primaryTargetCompany: value.primaryTargetCompany || null,
        targetCompensationAmount: value.targetCompensationAmount
          ? Number(value.targetCompensationAmount)
          : null,
        minAcceptableCompensation: value.minAcceptableCompensation
          ? Number(value.minAcceptableCompensation)
          : null,
        targetDate: value.targetDate || null,
        targetPackage: value.targetCompensationAmount
          ? value.targetCompensationCurrency +
            " " +
            value.targetCompensationAmount +
            " / " +
            (value.targetCompensationPeriod === "annual" ? "year" : "month")
          : targets.targetCompensationAmount != null
            ? null
            : targets.targetPackage,
      })
  );
  const { form, setForm } = editor;
  const [company, setCompany] = useState("");
  function addCompany() {
    const next = company.trim();
    if (!next || form.targetCompanies.length >= 20) return;
    if (form.targetCompanies.some((name) => name.toLowerCase() === next.toLowerCase()))
      return;
    setForm({ ...form, targetCompanies: [...form.targetCompanies, next] });
    setCompany("");
  }

  return (
    <div className="space-y-5">
      <SettingsHeading
        title="Career targets"
        description="Set your role, company preferences, and preparation goals."
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          editor.submit();
        }}
        className="space-y-4"
      >
        <fieldset disabled={editor.pending} className="min-w-0 space-y-4">
          <SettingsSection title="Career goal">
            <div className="grid min-w-0 gap-4 @min-[36rem]:grid-cols-2">
              <SettingsField id="target-role" label="Target role">
                <Input
                  id="target-role"
                  required
                  minLength={2}
                  maxLength={80}
                  value={form.targetRole}
                  onChange={(event) =>
                    setForm({ ...form, targetRole: event.target.value })
                  }
                />
              </SettingsField>
              <SettingsField id="target-experience" label="Experience level">
                <SettingsSelect
                  id="target-experience"
                  value={form.experienceLevel}
                  onChange={(experienceLevel) => setForm({ ...form, experienceLevel })}
                  options={[
                    ["beginner", "Beginner"],
                    ["intermediate", "Intermediate"],
                    ["advanced", "Advanced"],
                  ]}
                />
              </SettingsField>
              <SettingsField id="target-date" label="Preparation target date">
                <PlannerDateField
                  id="target-date"
                  label="Preparation target date"
                  value={form.targetDate || undefined}
                  min="2020-01-01"
                  max="2035-12-31"
                  onChange={(targetDate) => setForm({ ...form, targetDate })}
                />
                {form.targetDate && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setForm({ ...form, targetDate: "" })}
                  >
                    Clear date
                  </Button>
                )}
              </SettingsField>
              <SettingsField id="target-difficulty" label="Preparation focus">
                <SettingsSelect
                  id="target-difficulty"
                  value={form.difficultyPreference}
                  onChange={(difficultyPreference) =>
                    setForm({ ...form, difficultyPreference })
                  }
                  options={[
                    ["foundational", "Build foundations"],
                    ["balanced", "Balanced"],
                    ["aggressive", "Intensive"],
                  ]}
                />
              </SettingsField>
            </div>
          </SettingsSection>
          <SettingsSection title="Target companies">
            <SettingsField id="target-company" label="Add a company">
              <div className="flex min-w-0 gap-2">
                <Input
                  id="target-company"
                  value={company}
                  maxLength={80}
                  onChange={(event) => setCompany(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addCompany();
                    }
                  }}
                  className="min-w-0"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCompany}
                  disabled={!company.trim() || form.targetCompanies.length >= 20}
                >
                  Add
                </Button>
              </div>
            </SettingsField>
            {form.targetCompanies.length > 0 && (
              <ul className="divide-y divide-[var(--border-subtle)]">
                {form.targetCompanies.map((name) => (
                  <li
                    key={name}
                    className="flex min-w-0 items-center justify-between gap-3 py-2"
                  >
                    <span className="text-sm [overflow-wrap:anywhere]">{name}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label={"Remove " + name}
                      onClick={() => {
                        const next = form.targetCompanies.filter((item) => item !== name);
                        setForm({
                          ...form,
                          targetCompanies: next,
                          primaryTargetCompany:
                            form.primaryTargetCompany === name
                              ? ""
                              : form.primaryTargetCompany,
                        });
                      }}
                    >
                      <Icon icon={Cancel01Icon} size={14} />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            {form.targetCompanies.length > 0 && (
              <SettingsField id="primary-company" label="Primary company">
                <SettingsSelect
                  id="primary-company"
                  value={
                    form.primaryTargetCompany
                      ? "company:" + form.primaryTargetCompany
                      : "__none"
                  }
                  onChange={(value) =>
                    setForm({
                      ...form,
                      primaryTargetCompany:
                        value === "__none" ? "" : value.slice("company:".length),
                    })
                  }
                  options={[
                    ["__none", "No primary company"],
                    ...form.targetCompanies.map(
                      (name) => ["company:" + name, name] as const
                    ),
                  ]}
                />
              </SettingsField>
            )}
          </SettingsSection>
          <SettingsSection
            title="Compensation"
            description="Optional. Enter the full amount in the selected currency."
          >
            <div className="grid min-w-0 gap-4 @min-[36rem]:grid-cols-2">
              <SettingsField id="compensation-currency" label="Currency">
                <SettingsSelect
                  id="compensation-currency"
                  value={form.targetCompensationCurrency}
                  onChange={(targetCompensationCurrency) =>
                    setForm({ ...form, targetCompensationCurrency })
                  }
                  options={[
                    ["INR", "INR · Indian rupee"],
                    ["USD", "USD · US dollar"],
                    ["EUR", "EUR · Euro"],
                    ["GBP", "GBP · Pound sterling"],
                    ...(!["INR", "USD", "EUR", "GBP"].includes(
                      form.targetCompensationCurrency
                    )
                      ? [
                          [
                            form.targetCompensationCurrency,
                            form.targetCompensationCurrency,
                          ] as const,
                        ]
                      : []),
                  ]}
                />
              </SettingsField>
              <SettingsField id="compensation-period" label="Pay period">
                <SettingsSelect
                  id="compensation-period"
                  value={form.targetCompensationPeriod}
                  onChange={(targetCompensationPeriod) =>
                    setForm({ ...form, targetCompensationPeriod })
                  }
                  options={[
                    ["annual", "Annual"],
                    ["monthly", "Monthly"],
                  ]}
                />
              </SettingsField>
              <SettingsField id="compensation-target" label="Target amount">
                <Input
                  id="compensation-target"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.targetCompensationAmount}
                  onChange={(event) =>
                    setForm({ ...form, targetCompensationAmount: event.target.value })
                  }
                />
              </SettingsField>
              <SettingsField id="compensation-minimum" label="Minimum acceptable amount">
                <Input
                  id="compensation-minimum"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.minAcceptableCompensation}
                  onChange={(event) =>
                    setForm({ ...form, minAcceptableCompensation: event.target.value })
                  }
                />
              </SettingsField>
            </div>
            {targets.targetPackage && !targets.targetCompensationAmount && (
              <p className="text-xs text-[var(--text-secondary)]">
                Previously saved target · {targets.targetPackage}
              </p>
            )}
          </SettingsSection>
        </fieldset>
        <SettingsSaveBar {...editor} onCancel={editor.cancel} />
      </form>
    </div>
  );
}
