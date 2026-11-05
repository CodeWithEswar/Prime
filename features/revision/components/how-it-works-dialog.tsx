"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface HowItWorksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HowItWorksDialog({ open, onOpenChange }: HowItWorksDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden bg-[#0A0A0A] border-[#222222] text-[#EDEDED]">
        <DialogHeader className="sticky top-0 z-10 px-6 py-5 border-b border-[#1A1A1A] bg-[#0A0A0A]">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#FF0000] inline-block" />
            <span className="font-mono text-xs uppercase tracking-wider text-[#FF0000]">
              Spaced Repetition Protocol
            </span>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-white">
            How Spaced Repetition Works in PRIME
          </DialogTitle>
          <DialogDescription className="text-xs text-[#888888]">
            Deterministic retention scheduling engineered for technical interview mastery.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-sm leading-relaxed">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#333333] flex items-center justify-center font-mono font-bold text-xs text-[#FF0000]">
              1
            </div>
            <div>
              <h4 className="font-semibold text-white">Practice & Record</h4>
              <p className="mt-1 text-xs text-[#999999]">
                When you solve a DSA problem, log your attempt outcome (Independent, Hint, Solution Viewed).
                PRIME automatically initializes the problem into your revision queue with an appropriate starting interval.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#333333] flex items-center justify-center font-mono font-bold text-xs text-[#FF0000]">
              2
            </div>
            <div>
              <h4 className="font-semibold text-white">Timely Revision Reminders</h4>
              <p className="mt-1 text-xs text-[#999999]">
                Problems appear in your Revision Command when they are due. Daily email digests and shell attention badges
                signal overdue and due items before memory decay occurs.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#333333] flex items-center justify-center font-mono font-bold text-xs text-[#FF0000]">
              3
            </div>
            <div>
              <h4 className="font-semibold text-white">The Interval Ladder: 1 → 3 → 7 → 14 → 30</h4>
              <p className="mt-1 text-xs text-[#999999]">
                Each time you review a problem, rate your retention outcome:
              </p>
              <ul className="mt-2 space-y-1.5 text-xs">
                <li className="flex items-center gap-2">
                  <span className="font-mono text-[#FF4D4D] font-bold">Forgot:</span>
                  <span className="text-[#BBBBBB]">Resets interval back to 1 day for urgent reconsolidation.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-mono text-[#FFAA00] font-bold">Hard:</span>
                  <span className="text-[#BBBBBB]">Consolidates current stage; repeats interval.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-mono text-[#FFFFFF] font-bold">Okay:</span>
                  <span className="text-[#BBBBBB]">Advances 1 milestone along the ladder.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-mono text-[#4ADE80] font-bold">Easy:</span>
                  <span className="text-[#BBBBBB]">Accelerates progress; advances 2 milestones.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded border border-[#222222] bg-[#050505]">
            <h5 className="font-mono text-xs uppercase tracking-wide text-white">Permanent Mastery</h5>
            <p className="mt-1 text-xs text-[#888888]">
              Problems that survive repeated reviews through the 30-day stage become permanent conceptual instincts,
              ready for interview execution under high pressure.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

