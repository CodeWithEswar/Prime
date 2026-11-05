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
  CodeIcon,
  CheckmarkBadge01Icon,
  AlertCircleIcon,
  ArrowRight01Icon,
  FlashIcon,
} from "@hugeicons/core-free-icons";
import {
  DISPATCH_TYPES,
  simulateMethodInvocation,
  type DispatchExecutionResult,
} from "@/domain/oop";

interface DispatchStudioProps {
  onComplete?: () => void;
}

export function DispatchStudio({ onComplete }: DispatchStudioProps) {
  const [refType, setRefType] = useState<string>("PaymentMethod");
  const [runType, setRunType] = useState<string>("UpiPayment");
  const [methodCall, setMethodCall] = useState<string>("process(amount)");
  const [result, setResult] = useState<DispatchExecutionResult>(() =>
    simulateMethodInvocation("PaymentMethod", "UpiPayment", "process(amount)")
  );

  const handleSimulate = (method: string) => {
    setMethodCall(method);
    const res = simulateMethodInvocation(refType, runType, method);
    setResult(res);
    if (onComplete) onComplete();
  };

  const methodsList = [
    { label: "process(amount)", type: "virtual instance" },
    { label: "cancelTransaction()", type: "virtual instance" },
    { label: "generateQrCode()", type: "UpiPayment only" },
    { label: "verifyCvv()", type: "CardPayment only" },
    { label: "getGatewayName()", type: "static hidden" },
  ];

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#1F1F1F] pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#FF0000]">
              Laboratory 04
            </span>
            <Badge variant="outline" className="border-[#262626] bg-[#141414] text-[#CCCCCC]">
              Polymorphism & vtables
            </Badge>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Dynamic Method Dispatch vs Static Hiding
          </h2>
        </div>
      </div>

      {/* Main Grid: Reference vs Runtime Instance vs Execution Inspector */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Declaration & Assignment (4 cols) */}
        <div className="space-y-4 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 lg:col-span-4">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              Variable Declaration
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-[11px] text-[#888888]">Declared Reference Type (Compile-Time)</label>
              <div className="mt-1">
                <Select
                  value={refType}
                  onValueChange={(val) => {
                    setRefType(val);
                    setResult(simulateMethodInvocation(val, runType, methodCall));
                  }}
                >
                  <SelectTrigger className="h-9 w-full border-[#262626] bg-[#121212] px-3 text-xs text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(DISPATCH_TYPES).map((k) => (
                      <SelectItem key={k} value={k}>
                        {k}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-center py-1 text-[#FF0000]">
              <Icon icon={ArrowRight01Icon} size={16} className="rotate-90" />
            </div>

            <div>
              <label className="text-[11px] text-[#888888]">Runtime Instance Type (Heap Object)</label>
              <div className="mt-1">
                <Select
                  value={runType}
                  onValueChange={(val) => {
                    setRunType(val);
                    setResult(simulateMethodInvocation(refType, val, methodCall));
                  }}
                >
                  <SelectTrigger className="h-9 w-full border-[#262626] bg-[#121212] px-3 text-xs text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(DISPATCH_TYPES).map((k) => (
                      <SelectItem key={k} value={k}>
                        {k}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Generated Code Line */}
            <div className="rounded border border-[#1F1F1F] bg-[#050505] p-3 text-[11px] text-white">
              <span className="text-[#888888]">// Java Statement:</span>
              <div className="mt-1 font-bold">
                <span className="text-[#FF8080]">{refType}</span> obj = new{" "}
                <span className="text-green-400">{runType}</span>();
              </div>
            </div>
          </div>
        </div>

        {/* Center: Method Invocations (4 cols) */}
        <div className="space-y-4 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 lg:col-span-4">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              Invoke obj.method()
            </span>
          </div>

          <div className="space-y-2">
            {methodsList.map((m) => {
              const isSelected = methodCall === m.label;
              return (
                <button
                  key={m.label}
                  onClick={() => handleSimulate(m.label)}
                  className={`w-full rounded-lg border p-3 text-left font-mono text-xs transition-all ${
                    isSelected
                      ? "border-[#FF0000] bg-[#1A0A0A] text-white"
                      : "border-[#1F1F1F] bg-[#121212] text-[#CCCCCC] hover:border-[#333333]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">obj.{m.label};</span>
                    <span className="text-[10px] text-[#888888]">{m.type}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Dispatch Resolution Inspector (4 cols) */}
        <div className="space-y-4 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 lg:col-span-4">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              JVM Resolution
            </span>
            <Badge
              variant="outline"
              className={
                result.compilationSuccess
                  ? "border-green-500/30 text-green-400"
                  : "border-[#FF0000]/40 text-[#FF8080]"
              }
            >
              {result.compilationSuccess ? "Compiled OK" : "Compile Error"}
            </Badge>
          </div>

          {result.compilationSuccess ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="rounded border border-[#1F1F1F] bg-[#121212] p-3">
                <span className="text-[10px] uppercase text-[#888888]">Dispatch Mechanism</span>
                <div className="mt-1 font-bold text-[#FF4D4D]">
                  {result.dispatchType === "dynamic_virtual"
                    ? "Dynamic Method Dispatch (Virtual vtable)"
                    : result.dispatchType === "static_hidden"
                    ? "Static Method Hiding (Compile-time bind)"
                    : "Inherited Superclass Method"}
                </div>
              </div>

              <div className="rounded border border-[#1F1F1F] bg-[#121212] p-3">
                <span className="text-[10px] uppercase text-[#888888]">Executed Output</span>
                <div className="mt-1 text-white">{result.executedOutput}</div>
              </div>

              <div className="text-[11px] text-[#AAAAAA]">{result.explanation}</div>
            </div>
          ) : (
            <div className="space-y-3 font-mono text-xs">
              <div className="rounded border border-[#FF0000]/40 bg-[#FF0000]/10 p-3 text-[#FF8080]">
                <pre className="whitespace-pre-wrap text-[11px]">{result.compileErrorMessage}</pre>
              </div>
              <div className="text-[11px] text-[#AAAAAA]">{result.explanation}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

