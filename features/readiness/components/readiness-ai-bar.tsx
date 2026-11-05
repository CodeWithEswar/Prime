"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { SparklesIcon } from "@hugeicons/core-free-icons";

interface ReadinessAiBarProps {
  profileId: string;
}

const AI_PROMPTS = [
  {
    label: "Explain My Readiness",
    prompt:
      "Can you explain my current interview readiness status and break down what my demonstrated evidence indicates?",
  },
  {
    label: "What Is Holding Me Back?",
    prompt:
      "Analyze my readiness blockers and tell me which competencies are preventing stronger evidence alignment.",
  },
  {
    label: "Which Competency Next?",
    prompt:
      "Based on my target profile requirements and unassessed gaps, which single competency should I assess next?",
  },
  {
    label: "Help Me Plan Improvement",
    prompt:
      "Review my top priority readiness gaps and suggest a focused 7-day preparation schedule to address them.",
  },
];

export function ReadinessAiBar({ profileId }: ReadinessAiBarProps) {
  return (
    <Card elevation="raised">
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 space-y-0 p-3 pb-2 sm:px-4">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon
            icon={SparklesIcon}
            size={16}
            className="shrink-0 text-[var(--accent)]"
            aria-hidden="true"
          />
          PRIME AI Readiness Assistant
        </CardTitle>
        <Button asChild variant="secondary" size="sm">
          <Link href={`/ai?context=readiness&ref=${profileId}`}>Open chat</Link>
        </Button>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-1.5 p-3 pt-0 @min-[44rem]:grid-cols-4 sm:px-4">
        {AI_PROMPTS.map((item) => (
          <Button
            key={item.label}
            asChild
            variant="outline"
            size="sm"
            className="h-auto min-h-9 min-w-0 whitespace-normal px-2 py-1.5 text-center leading-tight"
          >
            <Link
              href={`/ai?context=readiness&ref=${profileId}&prompt=${encodeURIComponent(item.prompt)}`}
            >
              {item.label}
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
