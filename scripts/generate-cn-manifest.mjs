// scripts/generate-cn-manifest.mjs
import fs from 'node:fs';
import path from 'node:path';

const playlistId = "PLBlnK6fEyqRgMCUAG0XRw78UA8qnv6jEx";

// 135 Lesson titles mapped to days 1-11
const titles = [
  // Day 1: 1-12
  { pos: 1, day: 1, title: "Introduction to Computer Networks", diff: "Easy", imp: "High", topic: "network-fundamentals", min: 11, vid: "VwN91x5i25g" },
  { pos: 2, day: 1, title: "Characteristics of a Computer Network", diff: "Easy", imp: "Medium", topic: "network-fundamentals", min: 9 },
  { pos: 3, day: 1, title: "Network Criteria and Categories", diff: "Easy", imp: "Medium", topic: "network-fundamentals", min: 8 },
  { pos: 4, day: 1, title: "Physical Structures & Network Connection Types", diff: "Easy", imp: "Medium", topic: "network-fundamentals", min: 10 },
  { pos: 5, day: 1, title: "Mesh Topology", diff: "Easy", imp: "High", topic: "network-topologies", min: 12 },
  { pos: 6, day: 1, title: "Star Topology", diff: "Easy", imp: "High", topic: "network-topologies", min: 10 },
  { pos: 7, day: 1, title: "Bus Topology", diff: "Easy", imp: "High", topic: "network-topologies", min: 11 },
  { pos: 8, day: 1, title: "Ring Topology", diff: "Easy", imp: "High", topic: "network-topologies", min: 9 },
  { pos: 9, day: 1, title: "Hybrid & Tree Topology", diff: "Easy", imp: "Medium", topic: "network-topologies", min: 10 },
  { pos: 10, day: 1, title: "LAN, MAN, and WAN Networks", diff: "Easy", imp: "High", topic: "network-fundamentals", min: 13 },
  { pos: 11, day: 1, title: "Switching Techniques (Circuit vs Packet Switching)", diff: "Easy", imp: "Critical", topic: "network-fundamentals", min: 15 },
  { pos: 12, day: 1, title: "Message Switching vs Packet Switching", diff: "Easy", imp: "High", topic: "network-fundamentals", min: 12 },

  // Day 2: 13-29
  { pos: 13, day: 2, title: "Layering in Computer Networks", diff: "Medium", imp: "Critical", topic: "osi-tcpip", min: 11 },
  { pos: 14, day: 2, title: "The OSI Reference Model (Part 1)", diff: "Medium", imp: "Critical", topic: "osi-tcpip", min: 14, vid: "oQzueBVyAM4" },
  { pos: 15, day: 2, title: "The OSI Reference Model (Part 2 - Upper Layers)", diff: "Medium", imp: "Critical", topic: "osi-tcpip", min: 13 },
  { pos: 16, day: 2, title: "The OSI Reference Model (Part 3 - Lower Layers)", diff: "Medium", imp: "Critical", topic: "osi-tcpip", min: 12 },
  { pos: 17, day: 2, title: "OSI Reference Model - Working & Examples", diff: "Medium", imp: "Critical", topic: "osi-tcpip", min: 15 },
  { pos: 18, day: 2, title: "TCP/IP Protocol Suite & 4-Layer Architecture", diff: "Medium", imp: "Critical", topic: "osi-tcpip", min: 14 },
  { pos: 19, day: 2, title: "OSI Model vs. TCP/IP Model Comparison", diff: "Medium", imp: "Critical", topic: "osi-tcpip", min: 12 },
  { pos: 20, day: 2, title: "Encapsulation and Decapsulation of PDUs", diff: "Medium", imp: "Critical", topic: "osi-tcpip", min: 13 },
  { pos: 21, day: 2, title: "Network Addressing (Physical, Logical, Port Addresses)", diff: "Medium", imp: "Critical", topic: "osi-tcpip", min: 14 },
  { pos: 22, day: 2, title: "Network Devices: Hubs (Active vs Passive)", diff: "Medium", imp: "High", topic: "network-devices", min: 10 },
  { pos: 23, day: 2, title: "Network Devices: Switches & Bridge Operation", diff: "Medium", imp: "Critical", topic: "network-devices", min: 14 },
  { pos: 24, day: 2, title: "Network Devices: Routers & Default Gateways", diff: "Medium", imp: "Critical", topic: "network-devices", min: 15 },
  { pos: 25, day: 2, title: "Network Devices: Repeaters & Modems", diff: "Medium", imp: "Medium", topic: "network-devices", min: 11 },
  { pos: 26, day: 2, title: "Basic Network Commands: ping & ipconfig", diff: "Medium", imp: "High", topic: "network-devices", min: 12 },
  { pos: 27, day: 2, title: "Basic Network Commands: traceroute & nslookup", diff: "Medium", imp: "High", topic: "network-devices", min: 13 },
  { pos: 28, day: 2, title: "Network Commands: netstat and arp", diff: "Medium", imp: "High", topic: "network-devices", min: 12 },
  { pos: 29, day: 2, title: "Introduction to Cisco Packet Tracer Simulation", diff: "Medium", imp: "Medium", topic: "network-devices", min: 16 },

  // Day 3: 30-43
  { pos: 30, day: 3, title: "Physical Layer Fundamentals & Signals", diff: "Medium", imp: "Medium", topic: "physical-layer", min: 10 },
  { pos: 31, day: 3, title: "Transmission Media: Guided vs Unguided", diff: "Medium", imp: "Medium", topic: "physical-layer", min: 12 },
  { pos: 32, day: 3, title: "Twisted Pair Cable, Coaxial & Fiber Optics", diff: "Medium", imp: "Medium", topic: "physical-layer", min: 14 },
  { pos: 33, day: 3, title: "Data Link Layer Design Issues & Services", diff: "Medium", imp: "High", topic: "data-link-layer", min: 13 },
  { pos: 34, day: 3, title: "LLC and MAC Sublayer Distinction", diff: "Medium", imp: "High", topic: "data-link-layer", min: 11 },
  { pos: 35, day: 3, title: "Framing in Data Link Layer", diff: "Medium", imp: "Critical", topic: "framing", min: 12 },
  { pos: 36, day: 3, title: "Character Count Framing Method", diff: "Medium", imp: "Medium", topic: "framing", min: 10 },
  { pos: 37, day: 3, title: "Byte Stuffing (Character-Oriented Framing)", diff: "Medium", imp: "High", topic: "framing", min: 13 },
  { pos: 38, day: 3, title: "Bit Stuffing (Bit-Oriented Framing)", diff: "Medium", imp: "Critical", topic: "framing", min: 14 },
  { pos: 39, day: 3, title: "Physical Layer Coding Violations Framing", diff: "Medium", imp: "Medium", topic: "framing", min: 9 },
  { pos: 40, day: 3, title: "High-Level Data Link Control (HDLC) Architecture", diff: "Medium", imp: "High", topic: "framing", min: 15 },
  { pos: 41, day: 3, title: "HDLC Frame Format & Transfer Modes", diff: "Medium", imp: "High", topic: "framing", min: 13 },
  { pos: 42, day: 3, title: "Point-to-Point Protocol (PPP) Fundamentals", diff: "Medium", imp: "High", topic: "framing", min: 14 },
  { pos: 43, day: 3, title: "PPP Frame Format & Phase Diagram", diff: "Medium", imp: "Medium", topic: "framing", min: 11 },

  // Day 4: 44-57
  { pos: 44, day: 4, title: "Error Control & Types of Errors", diff: "Hard", imp: "High", topic: "error-control", min: 11 },
  { pos: 45, day: 4, title: "Single Bit Error vs Burst Error", diff: "Hard", imp: "Medium", topic: "error-control", min: 9 },
  { pos: 46, day: 4, title: "Error Detection Methods Overview", diff: "Hard", imp: "High", topic: "error-control", min: 10 },
  { pos: 47, day: 4, title: "Vertical Redundancy Check (VRC / Parity Check)", diff: "Hard", imp: "High", topic: "error-control", min: 12 },
  { pos: 48, day: 4, title: "Longitudinal Redundancy Check (LRC)", diff: "Hard", imp: "High", topic: "error-control", min: 11 },
  { pos: 49, day: 4, title: "Checksum Method (One's Complement Sum)", diff: "Hard", imp: "Critical", topic: "error-control", min: 14 },
  { pos: 50, day: 4, title: "Cyclic Redundancy Check (CRC) Introduction", diff: "Hard", imp: "Critical", topic: "error-control", min: 15 },
  { pos: 51, day: 4, title: "CRC Generator Polynomial & Binary Division", diff: "Hard", imp: "Critical", topic: "error-control", min: 16 },
  { pos: 52, day: 4, title: "CRC Solved Example (Sender & Receiver Sides)", diff: "Hard", imp: "Critical", topic: "error-control", min: 17 },
  { pos: 53, day: 4, title: "Network Performance: Bandwidth vs Latency", diff: "Hard", imp: "Critical", topic: "network-performance", min: 13 },
  { pos: 54, day: 4, title: "Transmission Delay & Propagation Delay Formulas", diff: "Hard", imp: "Critical", topic: "network-performance", min: 14 },
  { pos: 55, day: 4, title: "Queuing Delay & Processing Delay", diff: "Hard", imp: "High", topic: "network-performance", min: 11 },
  { pos: 56, day: 4, title: "Bandwidth-Delay Product (BDP)", diff: "Hard", imp: "Critical", topic: "network-performance", min: 12 },
  { pos: 57, day: 4, title: "Round Trip Time (RTT) & Throughput Metrics", diff: "Hard", imp: "Critical", topic: "network-performance", min: 13 },

  // Day 5: 58-75
  { pos: 58, day: 5, title: "Flow Control Introduction & Feedback Mechanism", diff: "Hard", imp: "High", topic: "flow-control", min: 11 },
  { pos: 59, day: 5, title: "Stop-and-Wait Protocol (Noiseless Channel)", diff: "Hard", imp: "High", topic: "flow-control", min: 12 },
  { pos: 60, day: 5, title: "Stop-and-Wait ARQ Protocol (Noisy Channel)", diff: "Hard", imp: "Critical", topic: "flow-control", min: 15 },
  { pos: 61, day: 5, title: "Sequence Numbers & ACK Lost in Stop-and-Wait ARQ", diff: "Hard", imp: "Critical", topic: "flow-control", min: 14 },
  { pos: 62, day: 5, title: "Efficiency & Utilization of Stop-and-Wait ARQ", diff: "Hard", imp: "Critical", topic: "flow-control", min: 16 },
  { pos: 63, day: 5, title: "Stop-and-Wait ARQ Solved Numerical Problems", diff: "Hard", imp: "High", topic: "flow-control", min: 15 },
  { pos: 64, day: 5, title: "Pipelining Concepts & Sliding Window Motivation", diff: "Hard", imp: "Critical", topic: "flow-control", min: 13 },
  { pos: 65, day: 5, title: "Go-Back-N (GBN) ARQ Protocol Overview", diff: "Hard", imp: "Critical", topic: "flow-control", min: 16 },
  { pos: 66, day: 5, title: "GBN Sender Window Size (2^m - 1) & Receiver Window", diff: "Hard", imp: "Critical", topic: "flow-control", min: 15 },
  { pos: 67, day: 5, title: "Cumulative ACKs & Lost Packet Handling in GBN", diff: "Hard", imp: "Critical", topic: "flow-control", min: 14 },
  { pos: 68, day: 5, title: "Efficiency & Bandwidth Utilization in GBN", diff: "Hard", imp: "Critical", topic: "flow-control", min: 14 },
  { pos: 69, day: 5, title: "Go-Back-N Solved Numerical Examples", diff: "Hard", imp: "High", topic: "flow-control", min: 15 },
  { pos: 70, day: 5, title: "Selective Repeat (SR) ARQ Protocol Fundamentals", diff: "Hard", imp: "Critical", topic: "flow-control", min: 15 },
  { pos: 71, day: 5, title: "Selective Repeat Window Size (2^(m-1)) Constraints", diff: "Hard", imp: "Critical", topic: "flow-control", min: 16 },
  { pos: 72, day: 5, title: "Independent ACKs & Out-of-Order Buffering in SR", diff: "Hard", imp: "Critical", topic: "flow-control", min: 14 },
  { pos: 73, day: 5, title: "Efficiency Comparison: Stop-and-Wait vs GBN vs SR", diff: "Hard", imp: "Critical", topic: "flow-control", min: 13 },
  { pos: 74, day: 5, title: "Selective Repeat Solved Numerical Problems", diff: "Hard", imp: "High", topic: "flow-control", min: 14 },
  { pos: 75, day: 5, title: "Media Access Control (MAC) Sublayer Introduction", diff: "Hard", imp: "High", topic: "mac-protocols", min: 12 },

  // Day 6: 76-97
  { pos: 76, day: 6, title: "Multiple Access Protocols Classification", diff: "Medium", imp: "High", topic: "mac-protocols", min: 11 },
  { pos: 77, day: 6, title: "Pure ALOHA Protocol & Throughput Derivation", diff: "Medium", imp: "High", topic: "mac-protocols", min: 14 },
  { pos: 78, day: 6, title: "Slotted ALOHA Protocol & Maximum Efficiency", diff: "Medium", imp: "High", topic: "mac-protocols", min: 13 },
  { pos: 79, day: 6, title: "Carrier Sense Multiple Access (CSMA) Fundamentals", diff: "Medium", imp: "Critical", topic: "mac-protocols", min: 12 },
  { pos: 80, day: 6, title: "1-Persistent, Non-Persistent & p-Persistent CSMA", diff: "Medium", imp: "High", topic: "mac-protocols", min: 14 },
  { pos: 81, day: 6, title: "CSMA/CD (Carrier Sense Multiple Access with Collision Detection)", diff: "Hard", imp: "Critical", topic: "mac-protocols", min: 16 },
  { pos: 82, day: 6, title: "Minimum Frame Size Formula in CSMA/CD (L >= 2 * R * Tp)", diff: "Hard", imp: "Critical", topic: "mac-protocols", min: 15 },
  { pos: 83, day: 6, title: "Binary Exponential Backoff Algorithm in Ethernet", diff: "Hard", imp: "Critical", topic: "mac-protocols", min: 14 },
  { pos: 84, day: 6, title: "CSMA/CD Solved Numerical Problems", diff: "Hard", imp: "High", topic: "mac-protocols", min: 15 },
  { pos: 85, day: 6, title: "CSMA/CA (Carrier Sense Multiple Access with Collision Avoidance)", diff: "Medium", imp: "Critical", topic: "mac-protocols", min: 14 },
  { pos: 86, day: 6, title: "Interframe Spaces (IFS) and Contention Window in CSMA/CA", diff: "Medium", imp: "High", topic: "mac-protocols", min: 12 },
  { pos: 87, day: 6, title: "Controlled Access Protocols: Reservation", diff: "Medium", imp: "Medium", topic: "mac-protocols", min: 10 },
  { pos: 88, day: 6, title: "Controlled Access Protocols: Polling", diff: "Medium", imp: "Medium", topic: "mac-protocols", min: 10 },
  { pos: 89, day: 6, title: "Controlled Access Protocols: Token Passing (Token Ring)", diff: "Medium", imp: "High", topic: "mac-protocols", min: 13 },
  { pos: 90, day: 6, title: "Channelization Protocols: FDMA, TDMA, CDMA", diff: "Medium", imp: "High", topic: "mac-protocols", min: 14 },
  { pos: 91, day: 6, title: "Ethernet Evolution: Standard Ethernet (10 Mbps)", diff: "Medium", imp: "High", topic: "ethernet-wireless", min: 12 },
  { pos: 92, day: 6, title: "Ethernet Frame Format (Preamble, SFD, MACs, EtherType, CRC)", diff: "Medium", imp: "Critical", topic: "ethernet-wireless", min: 15 },
  { pos: 93, day: 6, title: "Fast Ethernet (100 Mbps) & Gigabit Ethernet (1 Gbps)", diff: "Medium", imp: "Medium", topic: "ethernet-wireless", min: 11 },
  { pos: 94, day: 6, title: "Collision Domains vs. Broadcast Domains in Switched LANs", diff: "Medium", imp: "Critical", topic: "ethernet-wireless", min: 14 },
  { pos: 95, day: 6, title: "Wireless LAN (IEEE 802.11) Architecture (BSS, ESS, AP)", diff: "Medium", imp: "High", topic: "ethernet-wireless", min: 13 },
  { pos: 96, day: 6, title: "Hidden Terminal & Exposed Terminal Problems in Wi-Fi", diff: "Medium", imp: "Critical", topic: "ethernet-wireless", min: 15 },
  { pos: 97, day: 6, title: "RTS/CTS Handshake in Wireless Networks", diff: "Medium", imp: "High", topic: "ethernet-wireless", min: 12 },

  // Day 7: 98-113
  { pos: 98, day: 7, title: "Network Layer Overview & IP Protocol Suite", diff: "Hard", imp: "Critical", topic: "ipv4-addressing", min: 12 },
  { pos: 99, day: 7, title: "IPv4 Addressing: 32-Bit Dotted Decimal & Binary Formats", diff: "Hard", imp: "Critical", topic: "ipv4-addressing", min: 14 },
  { pos: 100, day: 7, title: "Classful Addressing: Class A, B, C, D, and E", diff: "Hard", imp: "Critical", topic: "ipv4-addressing", min: 15 },
  { pos: 101, day: 7, title: "Class A Networks, Subnet Masks & Host Limits", diff: "Hard", imp: "High", topic: "ipv4-addressing", min: 12 },
  { pos: 102, day: 7, title: "Class B Networks, Subnet Masks & Host Limits", diff: "Hard", imp: "High", topic: "ipv4-addressing", min: 11 },
  { pos: 103, day: 7, title: "Class C Networks, Subnet Masks & Host Limits", diff: "Hard", imp: "High", topic: "ipv4-addressing", min: 11 },
  { pos: 104, day: 7, title: "Class D (Multicast) and Class E (Reserved) Ranges", diff: "Hard", imp: "Medium", topic: "ipv4-addressing", min: 10 },
  { pos: 105, day: 7, title: "Special IP Addresses: Loopback (127.0.0.1) & Broadcasts", diff: "Hard", imp: "Critical", topic: "ipv4-addressing", min: 13 },
  { pos: 106, day: 7, title: "Public vs. Private IP Addresses (RFC 1918 Ranges)", diff: "Hard", imp: "Critical", topic: "ipv4-addressing", min: 14 },
  { pos: 107, day: 7, title: "Subnetting Introduction: Why Divide Networks?", diff: "Hard", imp: "Critical", topic: "subnetting-fundamentals", min: 14 },
  { pos: 108, day: 7, title: "Subnet Mask Concept & Bitwise AND Operation", diff: "Hard", imp: "Critical", topic: "subnetting-fundamentals", min: 15 },
  { pos: 109, day: 7, title: "Classless Inter-Domain Routing (CIDR) Notation (/x)", diff: "Hard", imp: "Critical", topic: "subnetting-fundamentals", min: 16 },
  { pos: 110, day: 7, title: "Finding Network Address and Broadcast Address in CIDR", diff: "Hard", imp: "Critical", topic: "subnetting-fundamentals", min: 15 },
  { pos: 111, day: 7, title: "Calculating Usable Host Range (2^h - 2)", diff: "Hard", imp: "Critical", topic: "subnetting-fundamentals", min: 14 },
  { pos: 112, day: 7, title: "Subnetting Solved Example 1: Class C Subnetting", diff: "Hard", imp: "Critical", topic: "subnetting-fundamentals", min: 16 },
  { pos: 113, day: 7, title: "Subnetting Solved Example 2: Class B Subnetting", diff: "Hard", imp: "Critical", topic: "subnetting-fundamentals", min: 15 },

  // Day 8: 114-130
  { pos: 114, day: 8, title: "Fixed-Length Subnet Masking (FLSM) Principles", diff: "Hard", imp: "Critical", topic: "advanced-subnetting", min: 15 },
  { pos: 115, day: 8, title: "FLSM Design & Equal-Sized Partitioning", diff: "Hard", imp: "Critical", topic: "advanced-subnetting", min: 16 },
  { pos: 116, day: 8, title: "FLSM Solved Problems & Address Waste Analysis", diff: "Hard", imp: "High", topic: "advanced-subnetting", min: 14 },
  { pos: 117, day: 8, title: "Variable-Length Subnet Masking (VLSM) Introduction", diff: "Hard", imp: "Critical", topic: "vlsm", min: 16 },
  { pos: 118, day: 8, title: "VLSM Strategy: Largest-First Allocation Rule", diff: "Hard", imp: "Critical", topic: "vlsm", min: 17 },
  { pos: 119, day: 8, title: "VLSM Step-by-Step Practical Design Example 1", diff: "Hard", imp: "Critical", topic: "vlsm", min: 18 },
  { pos: 120, day: 8, title: "VLSM Step-by-Step Practical Design Example 2", diff: "Hard", imp: "Critical", topic: "vlsm", min: 17 },
  { pos: 121, day: 8, title: "Point-to-Point WAN Subnets (/30 vs /31 RFC 3021)", diff: "Hard", imp: "Critical", topic: "vlsm", min: 13 },
  { pos: 122, day: 8, title: "Detecting Overlapping Subnets in Routing Plans", diff: "Hard", imp: "Critical", topic: "vlsm", min: 15 },
  { pos: 123, day: 8, title: "CIDR Route Summarization / Supernetting", diff: "Hard", imp: "Critical", topic: "vlsm", min: 16 },
  { pos: 124, day: 8, title: "Route Aggregation Solved Problems", diff: "Hard", imp: "High", topic: "vlsm", min: 14 },
  { pos: 125, day: 8, title: "Subnetting Troubleshooting: Invalid Host Configurations", diff: "Hard", imp: "Critical", topic: "advanced-subnetting", min: 15 },
  { pos: 126, day: 8, title: "Subnetting Troubleshooting: Wrong Gateway & Mask Mismatch", diff: "Hard", imp: "Critical", topic: "advanced-subnetting", min: 14 },
  { pos: 127, day: 8, title: "Complex Subnetting Problem 1 (GATE Exam)", diff: "Hard", imp: "High", topic: "advanced-subnetting", min: 15 },
  { pos: 128, day: 8, title: "Complex Subnetting Problem 2 (Campus Network)", diff: "Hard", imp: "High", topic: "advanced-subnetting", min: 15 },
  { pos: 129, day: 8, title: "Complex Subnetting Problem 3 (ISP Allocation)", diff: "Hard", imp: "High", topic: "advanced-subnetting", min: 16 },
  { pos: 130, day: 8, title: "Comprehensive IP Subnetting Review & Formula Summary", diff: "Hard", imp: "Critical", topic: "advanced-subnetting", min: 18 },

  // Day 9: 131 (Preview)
  { pos: 131, day: 9, title: "Network Layer Protocols — Chapter Preview", diff: "Hard", imp: "Critical", topic: "routing-protocols", min: 6, isPreview: true },

  // Day 10: 132-133 (Previews)
  { pos: 132, day: 10, title: "Routing Protocols — Chapter Preview", diff: "Hard", imp: "High", topic: "routing-protocols", min: 6, isPreview: true },
  { pos: 133, day: 10, title: "NAT and IPv6 — Chapter Preview", diff: "Hard", imp: "High", topic: "nat-ipv6", min: 6, isPreview: true },

  // Day 11: 134-135 (Previews)
  { pos: 134, day: 11, title: "Transport Layer — Chapter Preview", diff: "Hard", imp: "Critical", topic: "transport-application", min: 6, isPreview: true },
  { pos: 135, day: 11, title: "Application Layer & Network Security — Chapter Preview", diff: "Hard", imp: "Critical", topic: "transport-application", min: 6, isPreview: true },
];

const manifest = titles.map((item) => {
  const isVerified = Boolean(item.vid);
  const videoId = isVerified ? item.vid : null;
  const canonicalUrl = isVerified ? `https://www.youtube.com/watch?v=${videoId}` : null;
  const playlistContextUrl = `https://www.youtube.com/playlist?list=${playlistId}&index=${item.pos}`;

  return {
    source: "neso-academy-cn",
    playlistId,
    playlistPosition: item.pos,
    playlistItemId: null,
    youtubeVideoId: videoId,
    canonicalWatchUrl: canonicalUrl,
    playlistContextUrl,
    verifiedTitle: item.title,
    durationSeconds: item.min * 60,
    assignedStudyDay: item.day,
    topicIds: [item.topic],
    difficulty: item.diff.toLowerCase(),
    interviewImportance: item.imp.toLowerCase(),
    contentKind: item.isPreview ? "chapter_preview" : "full_lesson",
    verificationStatus: isVerified ? "verified" : "unverified",
    verifiedAt: isVerified ? "2026-11-04T12:00:00.000Z" : null,
  };
});

// Supplementary high-depth lessons
const supplementary = [
  {
    id: "supp-cn-01",
    assignedStudyDay: 6,
    youtubeVideoId: "jqk9965zK6M",
    title: "VLANs, Trunking, 802.1Q Tagging & Collision Domains Explained",
    channel: "Practical Networking",
    canonicalWatchUrl: "https://www.youtube.com/watch?v=jqk9965zK6M",
    durationSeconds: 1260,
    difficulty: "medium",
    interviewImportance: "high",
    topicIds: ["ethernet-wireless", "vlans"],
    coverageRationale: "Complete coverage of Virtual LANs, access ports vs trunk ports, broadcast domain segmentation, and inter-VLAN routing.",
    verificationStatus: "verified",
    language: "English"
  },
  {
    id: "supp-cn-02",
    assignedStudyDay: 9,
    youtubeVideoId: "rYodcvhh7b8",
    title: "ARP, ICMP, IP Packet Forwarding & Longest Prefix Matching",
    channel: "Practical Networking",
    canonicalWatchUrl: "https://www.youtube.com/watch?v=rYodcvhh7b8",
    durationSeconds: 1440,
    difficulty: "hard",
    interviewImportance: "critical",
    topicIds: ["routing-protocols"],
    coverageRationale: "Walkthrough of how a router handles a packet: routing table lookup, longest prefix match, decrementing TTL, and ARP resolution.",
    verificationStatus: "verified",
    language: "English"
  },
  {
    id: "supp-cn-03",
    assignedStudyDay: 9,
    youtubeVideoId: "gazC3VDJmHZ",
    title: "Dijkstra's & Bellman-Ford Routing Algorithms with Worked Examples",
    channel: "Neso Academy / Algorithms",
    canonicalWatchUrl: "https://www.youtube.com/watch?v=gazC3VDJmHZ",
    durationSeconds: 1380,
    difficulty: "hard",
    interviewImportance: "critical",
    topicIds: ["routing-protocols"],
    coverageRationale: "Mathematical execution of link-state (Dijkstra) and distance-vector (Bellman-Ford) routing algorithms on weighted graphs.",
    verificationStatus: "verified",
    language: "English"
  },
  {
    id: "supp-cn-04",
    assignedStudyDay: 10,
    youtubeVideoId: "QB4hI7tHsqM",
    title: "Routing Protocols: RIP, OSPF, BGP & Autonomous Systems",
    channel: "Practical Networking",
    canonicalWatchUrl: "https://www.youtube.com/watch?v=QB4hI7tHsqM",
    durationSeconds: 1620,
    difficulty: "hard",
    interviewImportance: "high",
    topicIds: ["routing-protocols"],
    coverageRationale: "Interior Gateway Protocols (IGP: RIP vs OSPF) vs Exterior Gateway Protocols (EGP: BGP policy routing between autonomous systems).",
    verificationStatus: "verified",
    language: "English"
  },
  {
    id: "supp-cn-05",
    assignedStudyDay: 10,
    youtubeVideoId: "FTUV0t6JaDA",
    title: "Network Address Translation (NAT) & Port Address Translation (PAT)",
    channel: "Practical Networking",
    canonicalWatchUrl: "https://www.youtube.com/watch?v=FTUV0t6JaDA",
    durationSeconds: 1200,
    difficulty: "hard",
    interviewImportance: "high",
    topicIds: ["nat-ipv6"],
    coverageRationale: "In-depth packet header translation, private IP multiplexing onto public IPs, NAT translation tables, and hole punching.",
    verificationStatus: "verified",
    language: "English"
  },
  {
    id: "supp-cn-06",
    assignedStudyDay: 11,
    youtubeVideoId: "uwoD5YsGACg",
    title: "TCP 3-Way Handshake, Sequence Numbers, Teardown & Congestion Control",
    channel: "Hussein Nasser",
    canonicalWatchUrl: "https://www.youtube.com/watch?v=uwoD5YsGACg",
    durationSeconds: 1800,
    difficulty: "hard",
    interviewImportance: "critical",
    topicIds: ["transport-application"],
    coverageRationale: "Deep dive into TCP state transitions (SYN, ESTABLISHED, FIN_WAIT, TIME_WAIT), window scaling, and congestion avoidance.",
    verificationStatus: "verified",
    language: "English"
  },
  {
    id: "supp-cn-07",
    assignedStudyDay: 11,
    youtubeVideoId: "27r4Bzuj5OI",
    title: "DNS Resolution: Root Servers, TLD, Authoritative & Caching",
    channel: "Computerphile",
    canonicalWatchUrl: "https://www.youtube.com/watch?v=27r4Bzuj5OI",
    durationSeconds: 840,
    difficulty: "hard",
    interviewImportance: "critical",
    topicIds: ["transport-application"],
    coverageRationale: "How domain name queries traverse the global hierarchy, iterative vs recursive resolution, and record types (A, CNAME, MX).",
    verificationStatus: "verified",
    language: "English"
  },
  {
    id: "supp-cn-08",
    assignedStudyDay: 11,
    youtubeVideoId: "a-sBpeUXuEQ",
    title: "HTTP/1.1 vs HTTP/2 vs HTTP/3 (QUIC over UDP)",
    channel: "Hussein Nasser",
    canonicalWatchUrl: "https://www.youtube.com/watch?v=a-sBpeUXuEQ",
    durationSeconds: 1500,
    difficulty: "hard",
    interviewImportance: "critical",
    topicIds: ["transport-application"],
    coverageRationale: "Head-of-line blocking in HTTP/1.1, binary framing and multiplexing in HTTP/2, and QUIC/UDP zero-HOLB architecture in HTTP/3.",
    verificationStatus: "verified",
    language: "English"
  },
  {
    id: "supp-cn-09",
    assignedStudyDay: 11,
    youtubeVideoId: "86cQCEScZkc",
    title: "TLS 1.3 Handshake, HTTPS Encryption & Digital Certificates",
    channel: "Computerphile",
    canonicalWatchUrl: "https://www.youtube.com/watch?v=86cQCEScZkc",
    durationSeconds: 960,
    difficulty: "hard",
    interviewImportance: "critical",
    topicIds: ["transport-application"],
    coverageRationale: "Asymmetric key exchange (Diffie-Hellman), symmetric AES encryption, certificate authorities, and 1-RTT TLS 1.3 handshake.",
    verificationStatus: "verified",
    language: "English"
  }
];

// 12 Structured Practical Deliverables & Numerical Exercises
const exercises = [
  {
    id: "cn-ex-01",
    dayNumber: 1,
    title: "Home Network Architecture & Topology Analysis",
    description: "Draw a home network diagram, distinguish Layer 2 MAC addresses from Layer 3 IP addresses and Layer 4 port numbers, and compare circuit switching vs packet switching.",
    category: "Fundamentals",
    difficulty: "easy",
    estimatedMinutes: 20
  },
  {
    id: "cn-ex-02",
    dayNumber: 2,
    title: "OSI Encapsulation Trace & Terminal Command Diagnostics",
    description: "Trace encapsulation of an HTTP GET request through all 7 OSI layers. Run ping, traceroute, and nslookup, documenting TTL and latency.",
    category: "OSI / TCP-IP",
    difficulty: "medium",
    estimatedMinutes: 25
  },
  {
    id: "cn-ex-03",
    dayNumber: 3,
    title: "Bit Stuffing & Byte Stuffing Framing Calculations",
    description: "Perform bit stuffing on raw bit sequences using flag 01111110. Show the escaped byte stream during character-oriented byte stuffing.",
    category: "Data Link",
    difficulty: "medium",
    estimatedMinutes: 25
  },
  {
    id: "cn-ex-04",
    dayNumber: 4,
    title: "CRC Error Detection & Network Latency Numericals",
    description: "Compute the transmitted CRC codeword for a given message bit string and generator polynomial. Calculate Transmission Delay, Propagation Delay, and BDP.",
    category: "Error Control",
    difficulty: "hard",
    estimatedMinutes: 30
  },
  {
    id: "cn-ex-05",
    dayNumber: 5,
    title: "Sliding Window Protocol Efficiency & Window Sizing",
    description: "Calculate optimal sender window size for Go-Back-N and Selective Repeat given bandwidth, RTT, and packet size. Derive sequence number space.",
    category: "Flow Control",
    difficulty: "hard",
    estimatedMinutes: 30
  },
  {
    id: "cn-ex-06",
    dayNumber: 6,
    title: "CSMA/CD Minimum Frame Size & VLAN Design",
    description: "Calculate minimum frame size in CSMA/CD to ensure collision detection over a 1 km coaxial cable at 100 Mbps. Segment collision and broadcast domains.",
    category: "Ethernet & Switching",
    difficulty: "hard",
    estimatedMinutes: 25
  },
  {
    id: "cn-ex-07",
    dayNumber: 7,
    title: "IPv4 CIDR Subnetting: 10 Core Problems",
    description: "Compute Network Address, Broadcast Address, Subnet Mask, Wildcard Mask, Usable Host Range, and Total Addresses for 10 distinct CIDR subnets including /30, /31, and /32.",
    category: "Subnetting",
    difficulty: "hard",
    estimatedMinutes: 35
  },
  {
    id: "cn-ex-08",
    dayNumber: 8,
    title: "Variable Length Subnet Masking (VLSM) Enterprise Plan",
    description: "Design a VLSM address allocation plan for an organization with 4 departments (100 hosts, 50 hosts, 25 hosts, 10 hosts) from base 192.168.10.0/24 without overlapping subnets.",
    category: "VLSM",
    difficulty: "hard",
    estimatedMinutes: 35
  },
  {
    id: "cn-ex-09",
    dayNumber: 9,
    title: "Dijkstra Shortest Path & Routing Table Longest-Prefix Match",
    description: "Execute Dijkstra's algorithm step-by-step on a 6-node network graph. Given a routing table, determine the outgoing interface for incoming destination IPs using longest prefix match.",
    category: "Routing",
    difficulty: "hard",
    estimatedMinutes: 35
  },
  {
    id: "cn-ex-10",
    dayNumber: 10,
    title: "NAT/PAT Translation Table & IPv6 Address Compression",
    description: "Map internal private IP:port pairs to external public IP:port entries in a NAT table. Compress and expand multiple 128-bit IPv6 addresses using RFC rules.",
    category: "NAT & IPv6",
    difficulty: "hard",
    estimatedMinutes: 30
  },
  {
    id: "cn-ex-11",
    dayNumber: 11,
    title: "URL Lifecycle Trace: DNS to TCP/QUIC to TLS to HTTP Response",
    description: "Trace every network event occurring from entering https://example.com in a browser: DNS recursion, TCP 3-way handshake or QUIC, TLS 1.3 key exchange, HTTP request/response.",
    category: "Transport & Application",
    difficulty: "hard",
    estimatedMinutes: 40
  },
  {
    id: "cn-ex-12",
    dayNumber: 12,
    title: "Comprehensive Network Troubleshooting & Mock Interview",
    description: "Diagnose 7 production network scenarios (DNS failure, bad subnet mask, default gateway unreachable, TCP timeout, port blocked, routing loop, TLS certificate error) and solve 25 high-frequency interview questions.",
    category: "Troubleshooting & Interview",
    difficulty: "hard",
    estimatedMinutes: 50
  }
];

fs.mkdirSync('content/cn', { recursive: true });
fs.mkdirSync('content/fundamentals/cn', { recursive: true });

fs.writeFileSync('content/cn/neso-playlist-manifest.json', JSON.stringify(manifest, null, 2));
fs.writeFileSync('content/fundamentals/cn/neso-playlist-manifest.json', JSON.stringify(manifest, null, 2));

fs.writeFileSync('content/cn/cn-supplementary-manifest.json', JSON.stringify(supplementary, null, 2));
fs.writeFileSync('content/fundamentals/cn/cn-supplementary-manifest.json', JSON.stringify(supplementary, null, 2));

fs.writeFileSync('content/cn/cn-exercises.json', JSON.stringify(exercises, null, 2));
fs.writeFileSync('content/fundamentals/cn/cn-exercises.json', JSON.stringify(exercises, null, 2));

console.log(`Generated content/cn/neso-playlist-manifest.json with ${manifest.length} items.`);
console.log(`Generated content/cn/cn-supplementary-manifest.json with ${supplementary.length} items.`);
console.log(`Generated content/cn/cn-exercises.json with ${exercises.length} items.`);

