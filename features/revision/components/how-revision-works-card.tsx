"use client";

import { Icon } from "@/components/ui/icon";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";

interface HowRevisionWorksCardProps {
  onLearnMore?: () => void;
}

export function HowRevisionWorksCard({ onLearnMore }: HowRevisionWorksCardProps) {
  const steps = [
    {
      num: 1,
      title: "Practice a problem",
      description: "Record your attempt and get a revision schedule.",
    },
    {
      num: 2,
      title: "Review at the right time",
      description: "Revisit the problem when it becomes due.",
    },
    {
      num: 3,
      title: "Build long-term recall",
      description:
        "Your next review is scheduled based on how well you remembered it.",
    },
  ];

  return (
    <div className="p-4 sm:p-5 rounded-md border border-[#1C1C1C] bg-[#0A0A0A]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <h3 className="text-xs font-bold text-white tracking-wide">
            How Revision Works
          </h3>
          <button
            type="button"
            onClick={onLearnMore}
            className="text-[#666666] hover:text-white transition-colors"
            title="Read detailed protocol"
          >
            <Icon icon={InformationCircleIcon} size={13} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((st) => (
          <div key={st.num} className="flex items-start gap-3.5">
            <div className="flex-shrink-0 w-6 h-6 rounded-full border border-[#FF0000]/60 bg-[#160808] flex items-center justify-center font-mono font-bold text-[11px] text-[#FF4D4D]">
              {st.num}
            </div>
            <div>
              <div className="text-xs font-semibold text-white leading-tight">
                {st.title}
              </div>
              <div className="text-[11px] text-[#777777] mt-0.5 leading-snug">
                {st.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

