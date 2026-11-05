"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  RefreshIcon,
  Shield01Icon,
  AlertCircleIcon,
  CheckmarkBadge01Icon,
  SquareLock01Icon,
  SquareUnlock01Icon,
} from "@hugeicons/core-free-icons";
import {
  createEncapsulatedAccount,
  executeDeposit,
  executeWithdraw,
  simulateDirectFieldCorruption,
  type EncapsulatedAccount,
} from "@/domain/oop";

interface EncapsulationStudioProps {
  onComplete?: () => void;
}

export function EncapsulationStudio({ onComplete }: EncapsulationStudioProps) {
  const [account, setAccount] = useState<EncapsulatedAccount>(createEncapsulatedAccount);
  const [depositAmount, setDepositAmount] = useState(250);
  const [withdrawAmount, setWithdrawAmount] = useState(500);
  const [corruptVal, setCorruptVal] = useState(-999);
  const [feedback, setFeedback] = useState<{ isError: boolean; message: string } | null>(null);

  const handleDeposit = () => {
    const res = executeDeposit(account, depositAmount);
    setAccount(res.account);
    setFeedback({ isError: !res.success, message: res.errorMessage || res.explanation });
    if (onComplete) onComplete();
  };

  const handleWithdraw = () => {
    const res = executeWithdraw(account, withdrawAmount);
    setAccount(res.account);
    setFeedback({ isError: !res.success, message: res.errorMessage || res.explanation });
    if (onComplete) onComplete();
  };

  const handleCorrupt = () => {
    const res = simulateDirectFieldCorruption(account, corruptVal);
    setAccount(res.account);
    setFeedback({ isError: true, message: "Invariant violated! Direct field access assigned negative value." });
    if (onComplete) onComplete();
  };

  const handleToggleLock = () => {
    setAccount((prev) => ({
      ...prev,
      isLocked: !prev.isLocked,
      transactionLog: [
        ...prev.transactionLog,
        `Account ${!prev.isLocked ? "LOCKED" : "UNLOCKED"} via administrative guard.`,
      ],
    }));
  };

  const handleReset = () => {
    setAccount(createEncapsulatedAccount());
    setFeedback(null);
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#1F1F1F] pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#FF0000]">
              Laboratory 05
            </span>
            <Badge variant="outline" className="border-[#262626] bg-[#141414] text-[#CCCCCC]">
              Data Hiding & Invariants
            </Badge>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Encapsulation Boundary & Invariant Defense
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="border-[#262626] bg-[#141414] text-[#CCCCCC] hover:text-white"
          >
            <Icon icon={RefreshIcon} size={14} className="mr-1.5" />
            Reset Account
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          className={`rounded-lg border p-3 font-mono text-xs ${
            feedback.isError
              ? "border-[#FF0000]/40 bg-[#FF0000]/10 text-[#FF8080]"
              : "border-green-500/40 bg-green-500/10 text-green-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <Icon icon={feedback.isError ? AlertCircleIcon : CheckmarkBadge01Icon} size={16} />
            <span>{feedback.message}</span>
          </div>
        </div>
      )}

      {/* Main Grid: Encapsulated State vs Operations vs Log */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Account Capsule (4 cols) */}
        <div className="space-y-4 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 lg:col-span-4">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              Encapsulated Entity
            </span>
            <Badge
              variant="outline"
              className={account.balance < 0 ? "border-[#FF0000] text-[#FF8080]" : "border-green-500 text-green-400"}
            >
              {account.balance < 0 ? "Invariant Broken" : "Invariant Secure"}
            </Badge>
          </div>

          <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-4 font-mono text-xs text-white">
            <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-2">
              <span className="text-[#888888]">accountNumber</span>
              <span>{account.accountNumber}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[#888888]">balance</span>
              <span className={`text-base font-bold ${account.balance < 0 ? "text-[#FF0000]" : "text-green-400"}`}>
                ${account.balance.toFixed(2)}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-[#1F1F1F] pt-2">
              <span className="text-[#888888]">lockStatus</span>
              <span className={account.isLocked ? "text-[#FF8080]" : "text-[#CCCCCC]"}>
                {account.isLocked ? "LOCKED" : "UNLOCKED"}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleLock}
            className="w-full border-[#262626] bg-[#161616] text-[#CCCCCC] hover:text-white"
          >
            <Icon icon={account.isLocked ? SquareUnlock01Icon : SquareLock01Icon} size={14} className="mr-1.5" />
            {account.isLocked ? "Unlock Account" : "Lock Account"}
          </Button>
        </div>

        {/* Center: Public API Operations (4 cols) */}
        <div className="space-y-4 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 lg:col-span-4">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              Guarded Mutator API
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* Deposit */}
            <div className="rounded border border-[#1F1F1F] bg-[#121212] p-3">
              <label className="text-[11px] text-[#888888]">deposit(double amount)</label>
              <div className="mt-2 flex gap-2">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                  className="w-24 rounded border border-[#262626] bg-[#161616] px-2 py-1 text-white"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDeposit}
                  className="flex-1 bg-[#FF0000] text-white hover:bg-[#D90000]"
                >
                  Call deposit()
                </Button>
              </div>
            </div>

            {/* Withdraw */}
            <div className="rounded border border-[#1F1F1F] bg-[#121212] p-3">
              <label className="text-[11px] text-[#888888]">withdraw(double amount)</label>
              <div className="mt-2 flex gap-2">
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(parseFloat(e.target.value) || 0)}
                  className="w-24 rounded border border-[#262626] bg-[#161616] px-2 py-1 text-white"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleWithdraw}
                  className="flex-1 border-[#262626] bg-[#1A1A1A] text-white hover:border-[#FF0000]"
                >
                  Call withdraw()
                </Button>
              </div>
            </div>

            {/* Simulated Public Direct Access Breach */}
            <div className="rounded border border-[#FF0000]/30 bg-[#1A0A0A] p-3">
              <label className="text-[11px] text-[#FF8080]">Bypass: account.balance = value</label>
              <div className="mt-2 flex gap-2">
                <input
                  type="number"
                  value={corruptVal}
                  onChange={(e) => setCorruptVal(parseFloat(e.target.value) || 0)}
                  className="w-24 rounded border border-[#FF0000]/40 bg-[#161616] px-2 py-1 text-white"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCorrupt}
                  className="flex-1 border-[#FF0000]/60 text-[#FF8080] hover:bg-[#FF0000]/10"
                >
                  Force Direct Write
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Audit Log (4 cols) */}
        <div className="space-y-4 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 lg:col-span-4">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              Audit Trail
            </span>
          </div>

          <div className="h-64 space-y-1.5 overflow-y-auto font-mono text-[11px] text-[#888888]">
            {account.transactionLog.map((log, idx) => (
              <div key={idx} className="border-b border-[#141414] pb-1">
                <span className="text-[#FF4D4D]">&gt;</span> {log}
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-3 text-[11px] text-[#CCCCCC]">
            <span className="font-bold text-[#FF8080]">Lesson:</span> Encapsulation requires methods that reject illegal business states, not merely getters and setters.
          </div>
        </div>
      </div>
    </div>
  );
}

