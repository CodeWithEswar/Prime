import { describe, expect, it } from "vitest";
import {
  simulateEncapsulation,
  OSI_LAYERS_DATA,
  simulatePacketJourney,
  calculateIPv4Subnet,
  allocateVLSM,
  simulateTCPHandshake,
  simulateTCPTeardown,
  simulateSlidingWindow,
  simulateDNSResolution,
  runDijkstra,
  runBellmanFord,
  simulateHTTPLifecycle,
  gradeTroubleshootingAnswer,
  TROUBLESHOOTING_SCENARIOS,
} from "@/domain/cn";

describe("1. OSI & TCP/IP Protocol Stack Simulator", () => {
  it("encapsulates payload across all 7 OSI layers in proper sequence", () => {
    const payload = "GET /index.html HTTP/1.1";
    const steps = simulateEncapsulation(payload);
    expect(steps.length).toBe(7);

    // Layer 7 is Application
    expect(steps[0].layer).toBe(7);
    expect(steps[0].pdu).toBe("Data");
    expect(steps[0].layerName).toBe("Application");

    // Layer 4 is Transport
    expect(steps[3].layer).toBe(4);
    expect(steps[3].pdu).toBe("Segment");

    // Layer 3 is Network
    expect(steps[4].layer).toBe(3);
    expect(steps[4].pdu).toBe("Packet");

    // Layer 2 is Data Link
    expect(steps[5].layer).toBe(2);
    expect(steps[5].pdu).toBe("Frame");

    // Layer 1 is Physical
    expect(steps[6].layer).toBe(1);
    expect(steps[6].pdu).toBe("Bits");
  });

  it("verifies OSI layer metadata and TCP/IP equivalences", () => {
    expect(OSI_LAYERS_DATA[7].tcpipEquivalent).toBe("Application Layer");
    expect(OSI_LAYERS_DATA[4].tcpipEquivalent).toBe("Transport Layer");
    expect(OSI_LAYERS_DATA[3].tcpipEquivalent).toBe("Internet Layer");
    expect(OSI_LAYERS_DATA[2].tcpipEquivalent).toBe("Network Access / Link Layer");
    expect(OSI_LAYERS_DATA[1].tcpipEquivalent).toBe("Network Access / Link Layer");
  });
});

describe("2. Packet Journey Visualizer", () => {
  it("traces packet path across client, router, NAT, Internet and destination server", () => {
    const hops = simulatePacketJourney("https://api.prime.dev");

    expect(hops.length).toBe(7);
    expect(hops[0].stageName).toContain("Browser URL Entry");
    expect(hops[1].protocol).toContain("DNS");
    expect(hops[2].protocol).toContain("ARP");
    expect(hops[3].protocol).toContain("NAT");
    expect(hops[4].protocol).toContain("BGP");
    expect(hops[5].protocol).toContain("TCP");
    expect(hops[6].protocol).toContain("HTTP/2");
  });
});

describe("3. IPv4 Subnet Calculator", () => {
  it("calculates standard /24 subnet correctly", () => {
    const res = calculateIPv4Subnet("192.168.10.45", 24);
    expect(res.networkAddress).toBe("192.168.10.0");
    expect(res.broadcastAddress).toBe("192.168.10.255");
    expect(res.firstUsableIp).toBe("192.168.10.1");
    expect(res.lastUsableIp).toBe("192.168.10.254");
    expect(res.totalAddresses).toBe(256);
    expect(res.usableHosts).toBe(254);
    expect(res.subnetMask).toBe("255.255.255.0");
    expect(res.wildcardMask).toBe("0.0.0.255");
    expect(res.isPrivate).toBe(true);
    expect(res.ipClass).toBe("C");
  });

  it("handles RFC 3021 /31 point-to-point links correctly", () => {
    const res = calculateIPv4Subnet("10.0.0.1", 31);
    expect(res.networkAddress).toBe("10.0.0.0");
    expect(res.broadcastAddress).toBe("10.0.0.1");
    expect(res.firstUsableIp).toBe("10.0.0.0");
    expect(res.lastUsableIp).toBe("10.0.0.1");
    expect(res.totalAddresses).toBe(2);
    expect(res.usableHosts).toBe(2); // In /31, both addresses are usable for host endpoints
    expect(res.isSpecialRoute).toBe(true);
  });

  it("handles /32 single host routes correctly", () => {
    const res = calculateIPv4Subnet("172.16.5.99", 32);
    expect(res.networkAddress).toBe("172.16.5.99");
    expect(res.broadcastAddress).toBe("172.16.5.99");
    expect(res.firstUsableIp).toBe("172.16.5.99");
    expect(res.lastUsableIp).toBe("172.16.5.99");
    expect(res.totalAddresses).toBe(1);
    expect(res.usableHosts).toBe(1);
  });
});

describe("4. VLSM Allocator", () => {
  it("sorts subnets by required hosts descending (Largest-First Rule)", () => {
    const demands = [
      { name: "Sales", requiredHosts: 10 },
      { name: "Engineering", requiredHosts: 120 },
      { name: "HR", requiredHosts: 25 },
      { name: "Point-to-Point", requiredHosts: 2 },
    ];

    const result = allocateVLSM("192.168.0.0", 24, demands);
    expect(result.allocations.length).toBe(4);

    // First allocation must be Engineering (120 hosts -> /25)
    expect(result.allocations[0].name).toBe("Engineering");
    expect(result.allocations[0].prefixLength).toBe(25);
    expect(result.allocations[0].allocatedHosts).toBe(126);

    // Second allocation must be HR (25 hosts -> /27)
    expect(result.allocations[1].name).toBe("HR");
    expect(result.allocations[1].prefixLength).toBe(27);

    // Third allocation must be Sales (10 hosts -> /28)
    expect(result.allocations[2].name).toBe("Sales");
    expect(result.allocations[2].prefixLength).toBe(28);

    // Fourth allocation must be Point-to-Point (2 hosts -> /30)
    expect(result.allocations[3].name).toBe("Point-to-Point");
    expect(result.allocations[3].prefixLength).toBe(30);

    expect(result.overflow).toBe(false);
  });

  it("detects address overflow when requests exceed base network capacity", () => {
    const demands = [
      { name: "DC-1", requiredHosts: 200 },
      { name: "DC-2", requiredHosts: 100 },
    ];
    // /24 only has 254 usable hosts, 200 + 100 requires 256 + 128 = 384 addresses
    const result = allocateVLSM("192.168.1.0", 24, demands);
    expect(result.overflow).toBe(true);
    expect(result.errorMessage).toBeDefined();
  });
});

describe("5. TCP 3-Way Handshake & Teardown", () => {
  it("simulates full 3-way handshake with accurate ISN and ACK numbering", () => {
    const clientISN = 1000;
    const serverISN = 5000;
    const steps = simulateTCPHandshake(clientISN, serverISN);

    expect(steps.length).toBe(3);

    // Step 1: SYN from client
    expect(steps[0].flags.SYN).toBe(true);
    expect(steps[0].seq).toBe(1000);
    expect(steps[0].ack).toBe(0);
    expect(steps[0].clientState).toBe("SYN_SENT");

    // Step 2: SYN-ACK from server
    expect(steps[1].flags.SYN).toBe(true);
    expect(steps[1].flags.ACK).toBe(true);
    expect(steps[1].seq).toBe(5000);
    expect(steps[1].ack).toBe(1001); // clientISN + 1
    expect(steps[1].serverState).toBe("SYN_RECEIVED");

    // Step 3: ACK from client
    expect(steps[2].flags.ACK).toBe(true);
    expect(steps[2].seq).toBe(1001);
    expect(steps[2].ack).toBe(5001); // serverISN + 1
    expect(steps[2].clientState).toBe("ESTABLISHED");
    expect(steps[2].serverState).toBe("ESTABLISHED");
  });

  it("simulates 4-way teardown with TIME_WAIT on active closer", () => {
    const steps = simulateTCPTeardown(2000, 7000);
    expect(steps.length).toBe(4);
    expect(steps[0].flags.FIN).toBe(true);
    expect(steps[3].clientState).toBe("TIME_WAIT");
    expect(steps[3].serverState).toBe("CLOSED");
  });
});

describe("6. ARQ / Sliding Window Protocols", () => {
  it("simulates Stop-and-Wait protocol", () => {
    const result = simulateSlidingWindow("STOP_AND_WAIT", 4, 1, 1);

    expect(result.windowSize).toBe(1);
    expect(result.trace.length).toBeGreaterThan(4);
    const lostEvents = result.trace.filter((e) => e.type === "LOST_PACKET");
    expect(lostEvents.length).toBe(1);
    expect(result.efficiencyPercentage).toBeLessThan(100);
  });

  it("simulates Go-Back-N retransmitting entire unacknowledged window on loss", () => {
    const result = simulateSlidingWindow("GO_BACK_N", 6, 4, 2);

    expect(result.protocol).toBe("GO_BACK_N");
    const retransmits = result.trace.filter((e) => e.type === "TIMEOUT_RETRANSMIT");
    expect(retransmits.length).toBeGreaterThan(0);
    expect(retransmits[0].description).toContain("GO BACK and retransmit");
  });

  it("simulates Selective Repeat retransmitting only the lost frame", () => {
    const result = simulateSlidingWindow("SELECTIVE_REPEAT", 6, 4, 2);

    expect(result.protocol).toBe("SELECTIVE_REPEAT");
    const retransmits = result.trace.filter((e) => e.type === "TIMEOUT_RETRANSMIT");
    expect(retransmits.length).toBe(1);
    expect(retransmits[0].packetSeq).toBe(2);
    expect(retransmits[0].description).toContain("ONLY lost Packet #2 is retransmitted");
  });
});

describe("7. DNS Resolution Hierarchy & Cache Explorer", () => {
  it("resolves iteratively from Root -> TLD -> Auth server when cache is empty", () => {
    const steps = simulateDNSResolution("learn.prime.dev", "A", false);
    expect(steps.length).toBe(5);

    expect(steps[0].serverType).toBe("BROWSER_CACHE");
    expect(steps[0].isCacheHit).toBe(false);

    expect(steps[1].serverType).toBe("RECURSIVE_RESOLVER");
    expect(steps[2].serverType).toBe("ROOT_SERVER");
    expect(steps[3].serverType).toBe("TLD_SERVER");
    expect(steps[4].serverType).toBe("AUTHORITATIVE");
    expect(steps[4].response).toContain("AUTHORITATIVE ANSWER");
  });

  it("resolves immediately on cache hit without contacting root servers", () => {
    const steps = simulateDNSResolution("learn.prime.dev", "A", true);
    expect(steps.length).toBe(1);
    expect(steps[0].isCacheHit).toBe(true);
    expect(steps[0].response).toContain("CACHE HIT");
  });
});

describe("8. Routing Algorithms (Dijkstra & Bellman-Ford)", () => {
  const nodes = [
    { id: "Router-A", name: "A" },
    { id: "Router-B", name: "B" },
    { id: "Router-C", name: "C" },
    { id: "Router-D", name: "D" },
  ];

  const edges = [
    { from: "Router-A", to: "Router-B", weight: 2 },
    { from: "Router-A", to: "Router-D", weight: 6 },
    { from: "Router-B", to: "Router-C", weight: 3 },
    { from: "Router-B", to: "Router-D", weight: 2 },
    { from: "Router-C", to: "Router-D", weight: 1 },
  ];

  it("computes shortest paths via Dijkstra algorithm correctly", () => {
    const res = runDijkstra(nodes, edges, "Router-A");
    expect(res.shortestDistances["Router-A"]).toBe(0);
    expect(res.shortestDistances["Router-B"]).toBe(2);
    expect(res.shortestDistances["Router-D"]).toBe(4); // A -> B (2) -> D (2) = 4
    expect(res.previousHops["Router-D"]).toBe("Router-B");
  });

  it("computes shortest paths via Bellman-Ford and detects negative cycles", () => {
    const res = runBellmanFord(nodes, edges, "Router-A");
    expect(res.hasNegativeCycle).toBe(false);
    expect(res.shortestDistances["Router-D"]).toBe(4);

    // Negative weight cycle test
    const cycleNodes = [{ id: "A" }, { id: "B" }, { id: "C" }];
    const cycleEdges = [
      { from: "A", to: "B", weight: 1 },
      { from: "B", to: "C", weight: -2 },
      { from: "C", to: "B", weight: -3 }, // cycle between B and C with weight -5
    ];
    const negRes = runBellmanFord(cycleNodes, cycleEdges, "A");
    expect(negRes.hasNegativeCycle).toBe(true);
  });
});

describe("9. HTTP Lifecycle Simulator", () => {
  it("models HTTP/1.1 vs HTTP/2 vs HTTP/3 differences", () => {
    const h1 = simulateHTTPLifecycle("https://api.prime.dev", "HTTP/1.1");
    expect(h1.length).toBe(7);
    expect(h1[2].protocol).toBe("TCP (Port 443)");
    expect(h1[4].details["Multiplexing"]).toContain("None");

    const h2 = simulateHTTPLifecycle("https://api.prime.dev", "HTTP/2");
    expect(h2[4].details["Multiplexing"]).toContain("Binary Framing Multiplex");

    const h3 = simulateHTTPLifecycle("https://api.prime.dev", "HTTP/3");
    expect(h3[2].protocol).toContain("QUIC (UDP Port 443)");
    expect(h3[3].durationMs).toBe(0); // TLS 1.3 zero additional ms because combined with QUIC handshake!
    expect(h3[4].details["Multiplexing"]).toContain("QUIC Independent Streams");
  });
});

describe("10. Network Troubleshooting Scenarios", () => {
  it("grades diagnostic hypotheses accurately against ground truth", () => {
    expect(TROUBLESHOOTING_SCENARIOS.length).toBe(7);

    const scenario = TROUBLESHOOTING_SCENARIOS[0]; // DNS failure
    const correctGrade = gradeTroubleshootingAnswer(scenario.id, scenario.correctCauseIndex);
    expect(correctGrade.isCorrect).toBe(true);
    expect(correctGrade.explanation).toContain("8.8.8.8");

    const incorrectGrade = gradeTroubleshootingAnswer(scenario.id, 999);
    expect(incorrectGrade.isCorrect).toBe(false);
  });
});
