"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@/components/ui/icon";
import {
  Layers01Icon,
  Globe02Icon,
  CalculatorIcon,
  Shield01Icon,
  GitForkIcon,
  Alert02Icon,
} from "@hugeicons/core-free-icons";
import { OSITCPIPStudio } from "./simulators/osi-tcpip-studio";
import { PacketJourneyStudio } from "./simulators/packet-journey-studio";
import { IPv4SubnetStudio } from "./simulators/ipv4-subnet-studio";
import { VLSMAllocatorStudio } from "./simulators/vlsm-allocator-studio";
import { TCPHandshakeStudio } from "./simulators/tcp-handshake-studio";
import { SlidingWindowStudio } from "./simulators/sliding-window-studio";
import { DNSExplorerStudio } from "./simulators/dns-explorer-studio";
import { RoutingAlgorithmsStudio } from "./simulators/routing-algorithms-studio";
import { HTTPLifecycleStudio } from "./simulators/http-lifecycle-studio";
import { TroubleshootingStudio } from "./simulators/troubleshooting-studio";

interface CNLabPanelProps {
  activeLabSlug?: string;
  onRecordLabAttempt?: (labId: string, status: "attempted" | "completed" | "needs_revision", notes?: string) => void;
}

export function CNLabPanel({
  activeLabSlug = "osi-tcpip",
  onRecordLabAttempt,
}: CNLabPanelProps) {
  const [selectedLab, setSelectedLab] = useState<string>(activeLabSlug);

  const labs = [
    { id: "osi-tcpip", title: "1. OSI & TCP/IP Stack", icon: Layers01Icon },
    { id: "packet-journey", title: "2. Packet Journey", icon: Globe02Icon },
    { id: "ipv4-subnet", title: "3. IPv4 Subnet Calculator", icon: CalculatorIcon },
    { id: "vlsm-allocator", title: "4. VLSM Allocator", icon: Layers01Icon },
    { id: "tcp-handshake", title: "5. TCP Handshake & Teardown", icon: Shield01Icon },
    { id: "sliding-window", title: "6. Sliding Window ARQ", icon: Layers01Icon },
    { id: "dns-explorer", title: "7. DNS Resolution", icon: Globe02Icon },
    { id: "routing-algorithms", title: "8. Routing (Dijkstra/BF)", icon: GitForkIcon },
    { id: "http-lifecycle", title: "9. HTTP/3 Lifecycle", icon: Globe02Icon },
    { id: "troubleshooting", title: "10. Troubleshooting Lab", icon: Alert02Icon },
  ];

  return (
    <div className="space-y-6">
      {/* Studio Selector Bar (Tabs) */}
      <Tabs value={selectedLab} onValueChange={setSelectedLab} className="w-full">
        <TabsList
          layoutId="cn-lab-panel-tabs"
          className="h-auto w-full justify-start gap-1.5 overflow-x-auto bg-[#0A0A0A] p-1.5 border border-[#1F1F1F] rounded-xl no-scrollbar flex-nowrap sm:flex-wrap"
        >
          {labs.map((lab) => (
            <TabsTrigger
              key={lab.id}
              value={lab.id}
              className="h-8 px-3 text-xs shrink-0 data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-[#FF0000] data-[state=active]:shadow-sm text-[#888888] hover:text-white"
            >
              <Icon icon={lab.icon} size={14} className="mr-1.5 shrink-0" />
              {lab.title}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Active Studio Rendering */}
      <div>
        {selectedLab === "osi-tcpip" && (
          <OSITCPIPStudio
            onComplete={() =>
              onRecordLabAttempt?.("cn-lab-osi-tcpip", "completed", "Verified 7-layer encapsulation and TCP/IP stack mapping")
            }
          />
        )}
        {selectedLab === "packet-journey" && (
          <PacketJourneyStudio
            onComplete={() =>
              onRecordLabAttempt?.("cn-lab-packet-journey", "completed", "Traced 7-stage end-to-end request path")
            }
          />
        )}
        {selectedLab === "ipv4-subnet" && (
          <IPv4SubnetStudio
            onComplete={() =>
              onRecordLabAttempt?.("cn-lab-ipv4-subnet", "completed", "Calculated standard /24 and RFC 3021 /31 subnets")
            }
          />
        )}
        {selectedLab === "vlsm-allocator" && (
          <VLSMAllocatorStudio
            onComplete={() =>
              onRecordLabAttempt?.("cn-lab-vlsm-allocator", "completed", "Allocated subnets with largest-first boundary alignment")
            }
          />
        )}
        {selectedLab === "tcp-handshake" && (
          <TCPHandshakeStudio
            onComplete={() =>
              onRecordLabAttempt?.("cn-lab-tcp-handshake", "completed", "Verified 3-way handshake and 4-way teardown with TIME_WAIT")
            }
          />
        )}
        {selectedLab === "sliding-window" && (
          <SlidingWindowStudio
            onComplete={() =>
              onRecordLabAttempt?.("cn-lab-sliding-window", "completed", "Compared Stop-and-Wait, GBN, and Selective Repeat under loss")
            }
          />
        )}
        {selectedLab === "dns-explorer" && (
          <DNSExplorerStudio
            onComplete={() =>
              onRecordLabAttempt?.("cn-lab-dns-explorer", "completed", "Walked iterative DNS hierarchy from root to authoritative server")
            }
          />
        )}
        {selectedLab === "routing-algorithms" && (
          <RoutingAlgorithmsStudio
            onComplete={() =>
              onRecordLabAttempt?.("cn-lab-routing-algorithms", "completed", "Computed shortest path via Dijkstra and verified Bellman-Ford")
            }
          />
        )}
        {selectedLab === "http-lifecycle" && (
          <HTTPLifecycleStudio
            onComplete={() =>
              onRecordLabAttempt?.("cn-lab-http-lifecycle", "completed", "Compared HTTP/1.1 vs HTTP/2 vs HTTP/3 QUIC latency")
            }
          />
        )}
        {selectedLab === "troubleshooting" && (
          <TroubleshootingStudio
            onComplete={() =>
              onRecordLabAttempt?.("cn-lab-troubleshooting", "completed", "Diagnosed production networking failure scenarios")
            }
          />
        )}
      </div>
    </div>
  );
}

