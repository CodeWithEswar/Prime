"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RevisionHeader } from "./revision-header";
import { RevisionMetrics } from "./revision-metrics";
import { RevisionTabs } from "./revision-tabs";
import { RevisionQueue } from "./revision-queue";
import { RevisionLoadChart } from "./revision-load-chart";
import { RetentionTrendChart } from "./retention-trend-chart";
import { HowRevisionWorksCard } from "./how-revision-works-card";
import { RecordRevisionDialog } from "./record-revision-dialog";
import { SnoozeDialog } from "./snooze-dialog";
import { HowItWorksDialog } from "./how-it-works-dialog";
import type {
  RevisionDashboardData,
  RevisionProblemItem,
  RevisionTab,
} from "../types";

interface RevisionCommandCenterProps {
  initialData: RevisionDashboardData;
}

export function RevisionCommandCenter({ initialData }: RevisionCommandCenterProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState<RevisionTab>("due_queue");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const [reviewingItem, setReviewingItem] = useState<RevisionProblemItem | null>(null);
  const [snoozingItem, setSnoozingItem] = useState<RevisionProblemItem | null>(null);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 min-w-0">
      {/* 1. Header */}
      <RevisionHeader />

      {/* 2. Top Summary Metrics */}
      <RevisionMetrics
        counts={data.counts}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* 3. Navigation Tabs & Topic Filter */}
      <RevisionTabs
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        selectedTopic={selectedTopic}
        onSelectTopic={setSelectedTopic}
        topics={data.topics}
      />

      {/* 4. Main Two-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Revision Queue */}
        <div className="lg:col-span-8 space-y-6 min-w-0">
          <RevisionQueue
            items={data.items}
            activeTab={activeTab}
            selectedTopic={selectedTopic}
            onReview={(item) => setReviewingItem(item)}
            onSnooze={(item) => setSnoozingItem(item)}
          />
        </div>

        {/* Right Column: Visual Workload & Retention Rail */}
        <div className="lg:col-span-4 space-y-4 min-w-0">
          <RevisionLoadChart workload={data.workload} />
          <RetentionTrendChart trend={data.retentionTrend} />
          <HowRevisionWorksCard onLearnMore={() => setHowItWorksOpen(true)} />
        </div>
      </div>

      {/* Modals & Dialogs */}
      <RecordRevisionDialog
        item={reviewingItem}
        open={Boolean(reviewingItem)}
        onOpenChange={(open) => !open && setReviewingItem(null)}
        onSuccess={handleRefresh}
      />

      <SnoozeDialog
        item={snoozingItem}
        open={Boolean(snoozingItem)}
        onOpenChange={(open) => !open && setSnoozingItem(null)}
        onSuccess={handleRefresh}
      />

      <HowItWorksDialog
        open={howItWorksOpen}
        onOpenChange={setHowItWorksOpen}
      />
    </div>
  );
}

