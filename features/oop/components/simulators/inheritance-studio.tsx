"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from "@/components/ui/icon";
import {
  RefreshIcon,
  CheckmarkBadge01Icon,
  AlertCircleIcon,
  ArrowRight01Icon,
  Layers01Icon,
} from "@hugeicons/core-free-icons";
import {
  INITIAL_HIERARCHY,
  validateInheritance,
  traceConstructorChain,
  resolveMemberResolution,
} from "@/domain/oop";

interface InheritanceStudioProps {
  onComplete?: () => void;
}

export function InheritanceStudio({ onComplete }: InheritanceStudioProps) {
  const [classes] = useState(INITIAL_HIERARCHY);
  const [selectedClass, setSelectedClass] = useState<string>("ElectricCar");
  const [testMethod, setTestMethod] = useState<string>("start()");
  const [cycleTestChild, setCycleTestChild] = useState<string>("Vehicle");
  const [cycleTestSuper, setCycleTestSuper] = useState<string>("ElectricCar");
  const [validationResult, setValidationResult] = useState<{ valid: boolean; message: string } | null>(null);

  const constructorChain = traceConstructorChain(classes, selectedClass);
  const memberResolution = resolveMemberResolution(classes, selectedClass, testMethod);

  const handleTestCycle = () => {
    const res = validateInheritance(classes, cycleTestChild, cycleTestSuper);
    if (!res.valid) {
      setValidationResult({ valid: false, message: res.error || "Illegal cycle detected." });
    } else {
      setValidationResult({ valid: true, message: `Valid hierarchy path: ${res.chain?.join(" -> ")}` });
    }
    if (onComplete) onComplete();
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#1F1F1F] pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#FF0000]">
              Laboratory 03
            </span>
            <Badge variant="outline" className="border-[#262626] bg-[#141414] text-[#CCCCCC]">
              Inheritance & Constructor Chaining
            </Badge>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Single Superclass Invariant & Cycle Rejection
          </h2>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Class Hierarchy Tree (4 cols) */}
        <div className="space-y-4 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 lg:col-span-4">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              Class Hierarchy
            </span>
            <Badge variant="outline" className="text-xs text-green-400">
              Single Superclass Only
            </Badge>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {classes.map((cls, idx) => {
              const isSelected = cls.name === selectedClass;
              return (
                <div
                  key={cls.name}
                  onClick={() => setSelectedClass(cls.name)}
                  className={`cursor-pointer rounded-lg border p-3 transition-all ${
                    isSelected
                      ? "border-[#FF0000] bg-[#1A0A0A]"
                      : "border-[#1F1F1F] bg-[#121212] hover:border-[#333333]"
                  }`}
                  style={{ marginLeft: `${idx * 12}px` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">class {cls.name}</span>
                    {cls.superClass && (
                      <span className="text-[10px] text-[#888888]">extends {cls.superClass}</span>
                    )}
                  </div>
                  <div className="mt-2 text-[10px] text-[#888888]">
                    Methods: {cls.methods.join(", ")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Constructor Chain & Member Dispatch (5 cols) */}
        <div className="space-y-4 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 lg:col-span-5">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              Constructor Chaining: new {selectedClass}()
            </span>
            <Badge variant="outline" className="font-mono text-[11px] text-[#FF4D4D]">
              super() Order
            </Badge>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {constructorChain.map((step, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded border border-[#1F1F1F] bg-[#121212] p-2.5 text-white"
              >
                <span className="font-bold text-[#FF0000]">{idx + 1}.</span>
                <span>{step}</span>
                {idx === 0 && <span className="ml-auto text-[10px] text-green-400">Root Object</span>}
                {idx === constructorChain.length - 1 && (
                  <span className="ml-auto text-[10px] text-[#FF8080]">Concrete Instance</span>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-3 border-t border-[#1A1A1A] pt-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              Member Method Resolution
            </span>
            <div className="flex items-center gap-2 font-mono text-xs">
              <Select value={testMethod} onValueChange={setTestMethod}>
                <SelectTrigger className="h-8 w-44 border-[#262626] bg-[#161616] px-2.5 text-xs text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="start()">start()</SelectItem>
                  <SelectItem value="stop()">stop()</SelectItem>
                  <SelectItem value="charge()">charge()</SelectItem>
                  <SelectItem value="equals(Object)">equals(Object)</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex-1 rounded border border-[#1F1F1F] bg-[#121212] p-2 text-[11px]">
                {memberResolution ? (
                  <span>
                    Invokes in <strong className="text-white">{memberResolution.resolvedIn}</strong>{" "}
                    ({memberResolution.isOverridden ? "inherited" : "overridden / direct"})
                  </span>
                ) : (
                  <span className="text-[#FF4D4D]">Symbol not found in hierarchy</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Cycle Detection Invariant (3 cols) */}
        <div className="space-y-4 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 lg:col-span-3">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              Cycle Validator
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] text-[#888888]">Child Class</label>
              <div className="mt-1">
                <Select value={cycleTestChild} onValueChange={setCycleTestChild}>
                  <SelectTrigger className="h-8 w-full border-[#262626] bg-[#161616] px-2.5 font-mono text-xs text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.filter((c) => c.name !== "Object").map((c) => (
                      <SelectItem key={c.name} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-[#888888]">Extends Superclass</label>
              <div className="mt-1">
                <Select value={cycleTestSuper} onValueChange={setCycleTestSuper}>
                  <SelectTrigger className="h-8 w-full border-[#262626] bg-[#161616] px-2.5 font-mono text-xs text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.name} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleTestCycle}
              className="w-full border-[#262626] bg-[#141414] text-white hover:border-[#FF0000]"
            >
              Test Inheritance Validity
            </Button>

            {validationResult && (
              <div
                className={`rounded-lg border p-3 font-mono text-[11px] ${
                  validationResult.valid
                    ? "border-green-500/30 bg-green-500/10 text-green-300"
                    : "border-[#FF0000]/40 bg-[#FF0000]/10 text-[#FF8080]"
                }`}
              >
                <div className="flex items-start gap-1.5">
                  <Icon
                    icon={validationResult.valid ? CheckmarkBadge01Icon : AlertCircleIcon}
                    size={16}
                    className="mt-0.5 shrink-0"
                  />
                  <span>{validationResult.message}</span>
                </div>
              </div>
            )}

            <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-3 text-[11px] text-[#CCCCCC]">
              <span className="font-bold text-[#FF8080]">Single Superclass Invariant:</span> In Java, multiple class inheritance (`class C extends A, B`) is forbidden.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

