/**
 * PRIME — 12-Day Computer Networks Learning Curriculum
 */

import type { CNDaySchedule } from "./types";

export const CN_12_DAY_CURRICULUM: CNDaySchedule[] = [
  {
    dayNumber: 1,
    title: "Networking Fundamentals & Topologies",
    subtitle: "LAN/MAN/WAN, Topologies, Addressing & Packet Switching",
    summary:
      "Core networking foundations: device communication, network classification (LAN, MAN, WAN), physical topologies (Mesh, Star, Bus, Ring, Tree), IP vs MAC vs Port addressing, and circuit vs packet switching.",
    focus: "Network Topologies, Addressing & Switching Models",
    level: "Beginner",
    difficulty: "easy",
    importance: "high",
    estimatedMinutes: 130,
    videoPositions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    deliverable: "Draw a home network; differentiate IP, MAC, and Port numbers; compare packet vs circuit switching",
    practicalAssignment: {
      title: "Home Network Architecture & Topology Analysis",
      description:
        "Draw a home network diagram, distinguish Layer 2 MAC addresses from Layer 3 IP addresses and Layer 4 port numbers, and compare circuit switching vs packet switching.",
      problemId: "cn-ex-01",
    },
    learningOutcomes: [
      "Understand why computer networks exist and the role of protocol suites.",
      "Compare network topologies: Mesh (n*(n-1)/2 links), Star, Bus, Ring, and Hybrid.",
      "Differentiate between Circuit Switching (reserved dedicated channel) and Packet Switching (store-and-forward datagrams).",
      "Understand the tri-level addressing hierarchy: MAC address (Layer 2), IP address (Layer 3), and Port number (Layer 4).",
    ],
    interviewQuestions: [
      {
        id: "cn-q-01",
        question: "What is the difference between Packet Switching and Circuit Switching?",
        answer:
          "Circuit switching reserves a dedicated end-to-end physical communication path between sender and receiver for the entire call duration (e.g., traditional telephone networks), ensuring predictable latency but wasting idle bandwidth. Packet switching breaks messages into small datagrams forwarded hop-by-hop over shared lines (e.g., the Internet), maximizing resource utilization via statistical multiplexing.",
        importance: "critical",
        category: "Fundamentals",
      },
      {
        id: "cn-q-02",
        question: "Why do we need both a MAC address and an IP address?",
        answer:
          "MAC addresses (48-bit physical addresses) are immutable hardware identifiers used for local hop-to-hop frame delivery on the same physical link (Layer 2). IP addresses (32-bit or 128-bit logical addresses) provide a structured, hierarchical routing scheme that allows packets to traverse different autonomous systems across the global Internet (Layer 3).",
        importance: "critical",
        category: "Addressing",
      },
    ],
    labSlug: "packet-journey",
  },
  {
    dayNumber: 2,
    title: "OSI Reference Model, TCP/IP & Network Devices",
    subtitle: "7 Layers, Encapsulation, Hubs, Switches & Routers",
    summary:
      "The 7-layer OSI model, 4-layer TCP/IP suite, protocol data units (PDUs), packet encapsulation/decapsulation, network devices (Hub, Switch, Router), and diagnostic terminal commands.",
    focus: "Layering, Encapsulation & Device Forwarding Rules",
    level: "Beginner",
    difficulty: "medium",
    importance: "critical",
    estimatedMinutes: 215,
    videoPositions: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
    deliverable: "Trace encapsulation through all 7 layers; execute ping, traceroute, and nslookup diagnostics",
    practicalAssignment: {
      title: "OSI Encapsulation Trace & Terminal Command Diagnostics",
      description:
        "Trace encapsulation of an HTTP GET request through all 7 OSI layers. Run ping, traceroute, and nslookup, documenting TTL and latency.",
      problemId: "cn-ex-02",
    },
    learningOutcomes: [
      "Master the 7 OSI layers: Physical, Data Link, Network, Transport, Session, Presentation, Application.",
      "Understand PDU transitions: Data -> Segment -> Packet -> Frame -> Bits.",
      "Compare network devices: Hub (Layer 1 repeater, single collision domain), Switch (Layer 2 learning bridge, separate collision domains), Router (Layer 3 packet forwarder, separate broadcast domains).",
      "Perform diagnostic commands: ping (ICMP echo), traceroute (TTL expiry), and nslookup (DNS lookup).",
    ],
    interviewQuestions: [
      {
        id: "cn-q-03",
        question: "Explain what happens during packet encapsulation and decapsulation.",
        answer:
          "During encapsulation, data moves down the stack: Application layer generates data; Transport layer adds a TCP header (creating a Segment); Network layer adds an IP header with source/dest IPs (creating a Packet); Data Link layer adds an Ethernet header and CRC trailer (creating a Frame); Physical layer converts the frame into raw bits. Decapsulation is the inverse process on the receiving host, stripping each header sequentially.",
        importance: "critical",
        category: "OSI / TCP-IP",
      },
      {
        id: "cn-q-04",
        question: "What is the difference between a Hub, a Switch, and a Router?",
        answer:
          "A Hub operates at Layer 1 and blindly broadcasts incoming bits to all ports, sharing a single collision domain. A Switch operates at Layer 2 and uses a MAC address table to forward frames only to the designated port, giving each port its own collision domain. A Router operates at Layer 3, maintains routing tables, and forwards packets between different IP subnets, separating broadcast domains.",
        importance: "critical",
        category: "Network Devices",
      },
    ],
    labSlug: "osi-tcpip",
  },
  {
    dayNumber: 3,
    title: "Physical Layer, Data Link Services & Framing",
    subtitle: "Transmission Media, LLC/MAC, Bit & Byte Stuffing",
    summary:
      "Physical media characteristics (coaxial, twisted pair, fiber optics), data link responsibilities, framing algorithms (Character count, Byte stuffing, Bit stuffing), and HDLC/PPP protocols.",
    focus: "Framing Mechanisms & Data Link Layer Services",
    level: "Intermediate",
    difficulty: "medium",
    importance: "medium",
    estimatedMinutes: 165,
    videoPositions: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43],
    deliverable: "Perform bit stuffing and byte stuffing on bitstreams; explain HDLC and PPP frames",
    practicalAssignment: {
      title: "Bit Stuffing & Byte Stuffing Framing Calculations",
      description:
        "Perform bit stuffing on raw bit sequences using flag 01111110. Show the escaped byte stream during character-oriented byte stuffing.",
      problemId: "cn-ex-03",
    },
    learningOutcomes: [
      "Distinguish between Guided (copper, fiber) and Unguided (radio, microwave) transmission media.",
      "Understand why framing is necessary for receivers to detect frame boundaries.",
      "Implement Bit Stuffing: whenever 5 consecutive 1s appear in data, insert a 0 after them to prevent collision with flag 01111110.",
      "Analyze High-Level Data Link Control (HDLC) and Point-to-Point Protocol (PPP) frame structures.",
    ],
    interviewQuestions: [
      {
        id: "cn-q-05",
        question: "How does Bit Stuffing work in HDLC framing?",
        answer:
          "HDLC frames begin and end with the flag byte 01111110 (0 followed by six 1s and a 0). To ensure this pattern never appears in user data, the sender's hardware monitors the bit stream: whenever five consecutive 1s are transmitted, it automatically stuffs a '0' bit. The receiver reverses this: upon seeing five 1s followed by a 0, it removes the stuffed 0 bit.",
        importance: "high",
        category: "Framing",
      },
      {
        id: "cn-q-06",
        question: "What is the role of the LLC and MAC sublayers in the Data Link layer?",
        answer:
          "The IEEE 802 standard divides Layer 2 into: 1) Logical Link Control (LLC), which handles flow control, error checking, and multiplexes network layer protocols (IPv4, IPv6, ARP); 2) Media Access Control (MAC), which interacts directly with physical hardware, manages framing, MAC addressing, and resolves channel contention via CSMA/CD or CSMA/CA.",
        importance: "medium",
        category: "Data Link",
      },
    ],
  },
  {
    dayNumber: 4,
    title: "Error Detection, CRC & Network Performance",
    subtitle: "Parity, Checksum, CRC Polynomials, Latency & BDP",
    summary:
      "Mathematical error detection mechanisms: Parity (VRC/LRC), Internet Checksum, and Cyclic Redundancy Check (CRC). Network performance formulas: Transmission delay, Propagation delay, Round Trip Time, and Bandwidth-Delay Product.",
    focus: "CRC Binary Division & Delay Calculations",
    level: "Intermediate",
    difficulty: "hard",
    importance: "high",
    estimatedMinutes: 180,
    videoPositions: [44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57],
    deliverable: "Compute transmitted CRC codeword and remainder; solve Transmission vs Propagation delay numericals",
    practicalAssignment: {
      title: "CRC Error Detection & Network Latency Numericals",
      description:
        "Compute the transmitted CRC codeword for a given message bit string and generator polynomial. Calculate Transmission Delay, Propagation Delay, and BDP.",
      problemId: "cn-ex-04",
    },
    learningOutcomes: [
      "Differentiate single-bit errors from burst errors.",
      "Calculate 16-bit Internet Checksum (one's complement sum of 16-bit words).",
      "Execute Cyclic Redundancy Check (CRC) modulo-2 binary division using a generator polynomial G(x).",
      "Calculate network metrics: T_trans = L / B, T_prop = d / v, Total Delay = T_trans + 2*T_prop + T_queue + T_proc.",
      "Understand Bandwidth-Delay Product (BDP = Bandwidth * RTT) as the maximum volume of bits 'in flight' in the network pipe.",
    ],
    interviewQuestions: [
      {
        id: "cn-q-07",
        question: "What is the difference between Transmission Delay and Propagation Delay?",
        answer:
          "Transmission Delay is the time required to push all packet bits onto the physical medium, determined by packet size and link bandwidth (T_trans = Length / Bandwidth). Propagation Delay is the time required for a single bit to travel across the physical medium from sender to receiver, determined by physical distance and the speed of light in the medium (T_prop = Distance / Speed).",
        importance: "critical",
        category: "Performance",
      },
      {
        id: "cn-q-08",
        question: "How does Cyclic Redundancy Check (CRC) detect burst errors?",
        answer:
          "CRC treats bit sequences as polynomials over GF(2). The sender appends r zeros to the message and divides by a predetermined generator polynomial of degree r using modulo-2 arithmetic. The remainder is appended as the CRC trailer. If any transmission errors occur, dividing the received frame by the generator polynomial yields a non-zero remainder, detecting all single errors, double errors, and burst errors of length <= r.",
        importance: "critical",
        category: "Error Control",
      },
    ],
  },
  {
    dayNumber: 5,
    title: "Flow Control & ARQ Sliding Window Protocols",
    subtitle: "Stop-and-Wait, Go-Back-N & Selective Repeat",
    summary:
      "Flow control mechanisms: Stop-and-Wait ARQ, Go-Back-N (GBN) with cumulative acknowledgments, and Selective Repeat (SR) with independent ACKs and receiver buffering. Window size constraints and efficiency formulas.",
    focus: "Sliding Window Protocol Mechanics & Window Sizing",
    level: "Advanced",
    difficulty: "hard",
    importance: "high",
    estimatedMinutes: 245,
    videoPositions: [58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75],
    deliverable: "Calculate window sizes and channel utilization for GBN and Selective Repeat",
    practicalAssignment: {
      title: "Sliding Window Protocol Efficiency & Window Sizing",
      description:
        "Calculate optimal sender window size for Go-Back-N and Selective Repeat given bandwidth, RTT, and packet size. Derive sequence number space.",
      problemId: "cn-ex-05",
    },
    learningOutcomes: [
      "Understand why Stop-and-Wait has poor channel utilization on high-latency links (Efficiency = 1 / (1 + 2a), where a = T_prop / T_trans).",
      "Master Go-Back-N ARQ: Sender window W_s = 2^m - 1, Receiver window W_r = 1. Retransmits all unacknowledged packets upon timeout.",
      "Master Selective Repeat ARQ: Sender window W_s = 2^(m-1), Receiver window W_r = W_s. Buffers out-of-order packets and retransmits ONLY the lost packet.",
      "Analyze sequence number space requirements to prevent overlap between new and retransmitted frames.",
    ],
    interviewQuestions: [
      {
        id: "cn-q-09",
        question: "Why must the sender window size in Go-Back-N be at most 2^m - 1 for an m-bit sequence number?",
        answer:
          "If the window size were equal to 2^m, and the sender transmitted a full window of frames [0..2^m-1] which were all received, but all ACKs were lost in transit, the sender would time out and retransmit frame 0. Because sequence numbers wrap around, the receiver (expecting the new frame 0 of the next cycle) would mistakenly accept the retransmitted duplicate frame 0 as new data. Restricting W_s <= 2^m - 1 guarantees that new and retransmitted windows never overlap.",
        importance: "critical",
        category: "Flow Control",
      },
      {
        id: "cn-q-10",
        question: "Go-Back-N vs. Selective Repeat: What are the key tradeoffs?",
        answer:
          "Go-Back-N requires minimal receiver memory (receiver window is 1, discards all out-of-order packets) and simple cumulative ACKs, but wastes bandwidth by retransmitting all subsequent packets when a single packet drops. Selective Repeat requires significant receiver buffer space and individual ACK tracking, but achieves maximum bandwidth efficiency by retransmitting only lost packets.",
        importance: "critical",
        category: "Flow Control",
      },
    ],
    labSlug: "sliding-window",
  },
  {
    dayNumber: 6,
    title: "Ethernet, CSMA/CD, Wi-Fi & VLANs",
    subtitle: "Media Access, Collision Domains, 802.11 & 802.1Q",
    summary:
      "Multiple access protocols (ALOHA, CSMA, CSMA/CD, CSMA/CA). Standard Ethernet frame format, minimum frame size constraint, collision vs broadcast domains, Wi-Fi 802.11 architecture, and VLAN segmentation.",
    focus: "CSMA/CD Collision Detection & Switched VLANs",
    level: "Intermediate",
    difficulty: "hard",
    importance: "high",
    estimatedMinutes: 290,
    videoPositions: [76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97],
    supplementaryIds: ["supp-cn-01"],
    deliverable: "Calculate minimum frame size in CSMA/CD; design a 2-VLAN switched network",
    practicalAssignment: {
      title: "CSMA/CD Minimum Frame Size & VLAN Design",
      description:
        "Calculate minimum frame size in CSMA/CD to ensure collision detection over a 1 km coaxial cable at 100 Mbps. Segment collision and broadcast domains.",
      problemId: "cn-ex-06",
    },
    learningOutcomes: [
      "Derive CSMA/CD minimum frame size condition: T_trans >= 2 * T_prop (L >= 2 * B * T_prop).",
      "Understand Binary Exponential Backoff algorithm: after collision k, pick random slot in [0..2^k - 1].",
      "Compare CSMA/CD (wired collision detection) vs CSMA/CA (wireless collision avoidance with RTS/CTS).",
      "Segment networks using Virtual LANs (VLANs, IEEE 802.1Q) to divide broadcast domains and enhance security.",
    ],
    interviewQuestions: [
      {
        id: "cn-q-11",
        question: "Why does Ethernet require a minimum frame size (64 bytes in standard Ethernet)?",
        answer:
          "In CSMA/CD, a sender can detect collisions only while it is still actively transmitting. If a frame were too short, the sender would finish transmitting and release the wire before the collision signal from the farthest station traveled back to it, causing undetected data loss. Therefore, T_trans must be >= 2 * T_prop (round-trip propagation time). For standard 10 Mbps Ethernet over maximum cable length, this equates to 64 bytes (512 bits).",
        importance: "critical",
        category: "Ethernet",
      },
      {
        id: "cn-q-12",
        question: "What is the difference between a Collision Domain and a Broadcast Domain?",
        answer:
          "A Collision Domain is a network segment where simultaneous transmissions from two devices will collide. Each port on a switch is its own collision domain. A Broadcast Domain is a network segment where a broadcast frame (sent to FF:FF:FF:FF:FF:FF) will be received by all hosts. Switches forward broadcasts to all ports; only Routers and VLANs break broadcast domains.",
        importance: "critical",
        category: "Switching",
      },
    ],
  },
  {
    dayNumber: 7,
    title: "IPv4 Addressing & Subnetting Fundamentals",
    subtitle: "Classful vs CIDR, Subnet Masks, Network & Broadcast IPs",
    summary:
      "IPv4 addressing architecture: 32-bit dotted-decimal structure, classes A–E, RFC 1918 private address ranges, CIDR notation, subnet mask bitwise logic, network and broadcast addresses, and special routes (/31 and /32).",
    focus: "CIDR Prefix Notation & Subnet Boundaries",
    level: "Intermediate",
    difficulty: "hard",
    importance: "critical",
    estimatedMinutes: 220,
    videoPositions: [98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113],
    deliverable: "Solve 10 subnetting problems, computing network, broadcast, and usable host ranges",
    practicalAssignment: {
      title: "IPv4 CIDR Subnetting: 10 Core Problems",
      description:
        "Compute Network Address, Broadcast Address, Subnet Mask, Wildcard Mask, Usable Host Range, and Total Addresses for 10 distinct CIDR subnets including /30, /31, and /32.",
      problemId: "cn-ex-07",
    },
    learningOutcomes: [
      "Identify Class A (0..127), Class B (128..191), Class C (192..223), Class D (224..239 multicast), and Class E (240..255).",
      "Recognize RFC 1918 Private Ranges: 10.0.0.0/8, 172.16.0.0/12, and 192.168.0.0/16.",
      "Calculate Subnet boundaries: Network Address (host bits = 0) and Broadcast Address (host bits = 1).",
      "Correctly handle special CIDR cases: /31 point-to-point (RFC 3021, 2 usable hosts) and /32 host routes (1 host).",
    ],
    interviewQuestions: [
      {
        id: "cn-q-13",
        question: "What is CIDR and why was it introduced to replace classful addressing?",
        answer:
          "Classless Inter-Domain Routing (CIDR, RFC 1519) replaced rigid Class A/B/C allocations with flexible prefix lengths (/x). In classful networking, an organization needing 300 IP addresses had to receive a Class B network (65,534 addresses), wasting over 65,000 IPs. CIDR allows assigning a /23 (512 addresses), conserving global IPv4 address space and reducing routing table sizes through route summarization.",
        importance: "critical",
        category: "Subnetting",
      },
      {
        id: "cn-q-14",
        question: "How does a /31 subnet work on point-to-point links (RFC 3021)?",
        answer:
          "Standard IPv4 subnets reserve the first address as the Network Address and the last as the Broadcast Address, requiring 4 addresses (/30) to connect 2 router interfaces. RFC 3021 defines /31 subnets for point-to-point links where broadcast is unnecessary, allowing both addresses to be assigned as valid host interfaces, saving 50% of public IP addresses on WAN connections.",
        importance: "critical",
        category: "Subnetting",
      },
    ],
    labSlug: "ipv4-subnet",
  },
  {
    dayNumber: 8,
    title: "Advanced Subnetting, FLSM & VLSM",
    subtitle: "Fixed vs Variable Length Masking & Route Summarization",
    summary:
      "Advanced IP allocation strategies: Fixed Length Subnet Masking (FLSM) vs Variable Length Subnet Masking (VLSM). Largest-first allocation rule, non-overlapping subnet boundary alignment, supernetting, and CIDR route summarization.",
    focus: "VLSM Enterprise Allocation & Overlap Prevention",
    level: "Advanced",
    difficulty: "hard",
    importance: "critical",
    estimatedMinutes: 260,
    videoPositions: [114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130],
    deliverable: "Design a 4-department VLSM address plan without overlap; summarize 4 subnets into a single CIDR route",
    practicalAssignment: {
      title: "Variable Length Subnet Masking (VLSM) Enterprise Plan",
      description:
        "Design a VLSM address allocation plan for an organization with 4 departments (100 hosts, 50 hosts, 25 hosts, 10 hosts) from base 192.168.10.0/24 without overlapping subnets.",
      problemId: "cn-ex-08",
    },
    learningOutcomes: [
      "Understand FLSM vs VLSM: FLSM assigns equal-sized subnets causing massive waste; VLSM tailors prefix size to specific host demand.",
      "Execute VLSM Largest-First rule: always allocate the largest host demand first to prevent fragmentation.",
      "Verify boundary alignment: each subnet starting IP must be an exact multiple of its block size.",
      "Perform Route Summarization (Supernetting) to aggregate contiguous CIDR blocks into a single routing table entry.",
    ],
    interviewQuestions: [
      {
        id: "cn-q-15",
        question: "Why must VLSM subnets always be allocated in descending order of host demand (Largest-First)?",
        answer:
          "In binary subnetting, every subnet must begin at a boundary that is a multiple of its block size (2^h). If small subnets are allocated first, the address pointer advances to an odd offset, making it impossible to place a larger subnet without skipping unallocated addresses and creating fragmented, unusable gaps in the address space.",
        importance: "critical",
        category: "VLSM",
      },
      {
        id: "cn-q-16",
        question: "What is Route Summarization (Supernetting) and what are its requirements?",
        answer:
          "Route summarization combines multiple contiguous routes with identical next hops into a single aggregate CIDR prefix. Requirements: 1) The addresses must be contiguous; 2) The number of subnets must be a power of 2; 3) The starting address must be divisible by the total number of summarized addresses. This significantly shrinks router memory and CPU usage.",
        importance: "critical",
        category: "Routing",
      },
    ],
    labSlug: "vlsm-allocator",
  },
  {
    dayNumber: 9,
    title: "Network Layer Protocols & Routing Algorithms",
    subtitle: "Packet Forwarding, ARP, ICMP, Dijkstra & Bellman-Ford",
    summary:
      "Core Network Layer mechanics: IP packet forwarding, routing table lookups via longest-prefix matching, ARP resolution, ICMP diagnostics (TTL expiry), and shortest path algorithms (Dijkstra's link-state and Bellman-Ford distance-vector).",
    focus: "Longest Prefix Match & Graph Routing Algorithms",
    level: "Intermediate",
    difficulty: "hard",
    importance: "critical",
    estimatedMinutes: 180,
    videoPositions: [131],
    supplementaryIds: ["supp-cn-02", "supp-cn-03"],
    deliverable: "Execute Dijkstra's algorithm on a 6-node graph; evaluate longest prefix match on a routing table",
    practicalAssignment: {
      title: "Dijkstra Shortest Path & Routing Table Longest-Prefix Match",
      description:
        "Execute Dijkstra's algorithm step-by-step on a 6-node network graph. Given a routing table, determine the outgoing interface for incoming destination IPs using longest prefix match.",
      problemId: "cn-ex-09",
    },
    learningOutcomes: [
      "Trace router forwarding: inspect destination IP, match routing table via Longest Prefix Match, decrement TTL, recalculate checksum, resolve next-hop MAC via ARP, and forward.",
      "Execute Dijkstra's Algorithm (non-negative link-state routing, O(V^2) or O(E log V)).",
      "Execute Bellman-Ford Algorithm (distance-vector routing, relaxes edges V-1 times, detects negative cycles).",
      "Analyze ICMP message types: Echo Request/Reply (ping), Destination Unreachable, and Time Exceeded (traceroute).",
    ],
    interviewQuestions: [
      {
        id: "cn-q-17",
        question: "How does Longest Prefix Matching work in router forwarding?",
        answer:
          "When a router receives a packet, it compares the destination IP address against all entries in its routing table. If multiple routes match the destination IP, the router chooses the entry with the longest subnet mask (most specific network prefix). For instance, a destination of 10.1.2.5 matching both 10.0.0.0/8 and 10.1.2.0/24 will be routed via the /24 interface.",
        importance: "critical",
        category: "Routing",
      },
      {
        id: "cn-q-18",
        question: "Compare Link-State Routing (OSPF) vs. Distance-Vector Routing (RIP).",
        answer:
          "Link-State routers broadcast the state of their directly connected links to all routers in the area using Link State Advertisements (LSAs), giving every router a complete map of the topology to independently run Dijkstra's algorithm. Distance-Vector routers know only the distance (hop count) and direction (next hop) to destinations and share their routing tables periodically with immediate neighbors, making them simpler but prone to Count-to-Infinity routing loops.",
        importance: "critical",
        category: "Routing Protocols",
      },
    ],
    labSlug: "routing-algorithms",
  },
  {
    dayNumber: 10,
    title: "Routing Protocols, NAT & IPv6",
    subtitle: "OSPF, BGP, NAT/PAT & 128-Bit IPv6 Addressing",
    summary:
      "Enterprise and internet routing protocols (RIP, OSPF, BGP policy routing between autonomous systems). Network Address Translation (NAT/PAT) table mappings, and IPv6 architecture (128-bit hexadecimal, zero compression, and SLAAC).",
    focus: "NAT Table Mechanics & IPv6 Address Structure",
    level: "Advanced",
    difficulty: "hard",
    importance: "high",
    estimatedMinutes: 195,
    videoPositions: [132, 133],
    supplementaryIds: ["supp-cn-04", "supp-cn-05"],
    deliverable: "Map internal private IP:port pairs in a NAT table; compress and expand multiple IPv6 addresses",
    practicalAssignment: {
      title: "NAT/PAT Translation Table & IPv6 Address Compression",
      description:
        "Map internal private IP:port pairs to external public IP:port entries in a NAT table. Compress and expand multiple 128-bit IPv6 addresses using RFC rules.",
      problemId: "cn-ex-10",
    },
    learningOutcomes: [
      "Understand Border Gateway Protocol (BGP): path-vector protocol used between Autonomous Systems (AS) driven by business policy rather than shortest path.",
      "Model NAT / PAT (Port Address Translation): maps thousands of private internal endpoints to a single public IP using 16-bit source ports.",
      "Master IPv6 architecture: 128 bits, 8 hextets, zero suppression (leading zeros omitted), and double colon (::) compression (used once per address).",
      "Compare IPv4 vs IPv6: no broadcasts (replaced by multicast/anycast), mandatory IPSec support, and no header checksums.",
    ],
    interviewQuestions: [
      {
        id: "cn-q-19",
        question: "How does Port Address Translation (PAT / NAT Overload) allow multiple private devices to share a single public IP?",
        answer:
          "When an internal host (e.g. 192.168.1.10:5000) sends a packet to the Internet, the router replaces the private source IP with its own public IP (e.g. 203.0.113.1) and replaces the source port with a unique temporary port (e.g. 45000). The router records this mapping in its stateful NAT table. When the remote server replies to 203.0.113.1:45000, the router looks up the port in its NAT table, translates the destination back to 192.168.1.10:5000, and forwards it to the private host.",
        importance: "critical",
        category: "NAT",
      },
      {
        id: "cn-q-20",
        question: "How does IPv6 address compression work (rules for omitting zeros)?",
        answer:
          "1. Leading zeros in any 16-bit hextet can be omitted (e.g., :00db: becomes :db:); 2. Consecutive blocks of all-zero hextets can be replaced with a single double colon '::'. This double-colon compression may only be used ONCE in an address to avoid ambiguity when expanding back to 8 hextets.",
        importance: "high",
        category: "IPv6",
      },
    ],
  },
  {
    dayNumber: 11,
    title: "Transport & Application Layers, Web Protocols & Security",
    subtitle: "TCP Handshake, DNS, HTTP/1.1-2-3, TLS 1.3 & QUIC",
    summary:
      "Core software engineering interview topics: TCP 3-way handshake and connection teardown (FIN, TIME_WAIT), TCP reliability and flow control, DNS resolution hierarchy, HTTP/1.1 vs HTTP/2 vs HTTP/3 (QUIC over UDP), and TLS 1.3 cryptographic handshakes.",
    focus: "TCP Handshake, DNS Hierarchy, HTTP Evolution & TLS",
    level: "Intermediate",
    difficulty: "hard",
    importance: "critical",
    estimatedMinutes: 240,
    videoPositions: [134, 135],
    supplementaryIds: ["supp-cn-06", "supp-cn-07", "supp-cn-08", "supp-cn-09"],
    deliverable: "Trace the complete lifecycle from typing a URL in a browser to rendering the web page",
    practicalAssignment: {
      title: "URL Lifecycle Trace: DNS to TCP/QUIC to TLS to HTTP Response",
      description:
        "Trace every network event occurring from entering https://example.com in a browser: DNS recursion, TCP 3-way handshake or QUIC, TLS 1.3 key exchange, HTTP request/response.",
      problemId: "cn-ex-11",
    },
    learningOutcomes: [
      "Trace the TCP 3-way handshake: SYN (seq=X) -> SYN-ACK (seq=Y, ack=X+1) -> ACK (seq=X+1, ack=Y+1).",
      "Analyze TCP teardown: FIN -> ACK -> FIN -> ACK -> TIME_WAIT (2MSL timer).",
      "Trace DNS recursion: Stub -> Local Recursive Resolver -> Root -> TLD -> Authoritative -> Answer.",
      "Compare HTTP versions: HTTP/1.1 (HOL blocking) vs HTTP/2 (binary multiplexing over single TCP socket) vs HTTP/3 (QUIC over UDP, zero transport HOL blocking).",
      "Understand TLS 1.3: Diffie-Hellman asymmetric key exchange, digital certificate authentication, symmetric AES encryption.",
    ],
    interviewQuestions: [
      {
        id: "cn-q-21",
        question: "Explain the TCP Three-Way Handshake step by step.",
        answer:
          "1. Step 1 (SYN): Client sends a TCP segment with SYN flag set and chooses a random Initial Sequence Number (ISN = X). Client enters SYN_SENT.\n2. Step 2 (SYN-ACK): Server receives SYN, allocates socket buffers, and responds with SYN and ACK flags set, picking its own ISN = Y and acknowledging X+1. Server enters SYN_RECEIVED.\n3. Step 3 (ACK): Client receives SYN-ACK and sends an ACK segment with ack=Y+1. Both endpoints enter ESTABLISHED and full-duplex data transfer begins.",
        importance: "critical",
        category: "TCP",
      },
      {
        id: "cn-q-22",
        question: "Why does HTTP/3 use QUIC over UDP instead of TCP?",
        answer:
          "While HTTP/2 multiplexed multiple streams over a single TCP connection, TCP guarantees in-order delivery of the underlying byte stream. If a single TCP packet is dropped, TCP halts delivery of all subsequent packets until the dropped packet is retransmitted—causing Head-of-Line (HOL) blocking across ALL multiplexed streams! HTTP/3 runs over QUIC on top of UDP: each stream has independent loss recovery, so packet loss in one stream never blocks other streams. QUIC also combines connection and encryption handshakes into 1 RTT.",
        importance: "critical",
        category: "HTTP / Web",
      },
    ],
    labSlug: "tcp-handshake",
  },
  {
    dayNumber: 12,
    title: "Network Troubleshooting & Comprehensive Mock Interview",
    subtitle: "Production Diagnostics, 10 Laboratories & Technical Synthesis",
    summary:
      "Comprehensive synthesis across all 11 days: 25 conceptual questions, 10 subnetting numericals, 5 routing problems, 5 TCP/DNS questions, 7 guided production troubleshooting scenarios, and interactive network laboratories.",
    focus: "Interview Readiness & Engineering Troubleshooting",
    level: "All",
    difficulty: "hard",
    importance: "critical",
    estimatedMinutes: 240,
    videoPositions: [],
    deliverable: "Solve 7 production network troubleshooting scenarios and 25 interview questions",
    practicalAssignment: {
      title: "Comprehensive Network Troubleshooting & Mock Interview",
      description:
        "Diagnose 7 production network scenarios (DNS failure, bad subnet mask, default gateway unreachable, TCP timeout, port blocked, routing loop, TLS certificate error) and solve 25 high-frequency interview questions.",
      problemId: "cn-ex-12",
    },
    learningOutcomes: [
      "Diagnose network faults using ping, traceroute, nslookup, netstat, ss, and curl.",
      "Identify DNS resolution failures, subnet mask misconfigurations, and unreachable gateways.",
      "Recognize TCP connection timeouts caused by packet-dropping firewalls vs immediate connection refused (RST).",
      "Demonstrate comprehensive mastery across all 10 Network Laboratories.",
    ],
    interviewQuestions: [
      {
        id: "cn-q-23",
        question: "Explain what happens from typing a URL (e.g. https://google.com) into a browser to rendering.",
        answer:
          "1. Browser parses URL and checks local/OS DNS cache.\n2. Recursive DNS query resolves domain name to IP.\n3. Client determines destination is outside LAN; ARP resolves default gateway MAC.\n4. TCP 3-Way Handshake establishes connection (SYN, SYN-ACK, ACK) or QUIC handshake.\n5. TLS Handshake exchanges cryptographic keys and verifies certificate.\n6. Client transmits HTTP GET request.\n7. Gateway router applies NAT/PAT, core routers forward packet via BGP/OSPF.\n8. Server processes request and responds with HTTP 200 OK HTML payload.\n9. Browser renders HTML, parses CSS/JS, and makes parallel requests for assets.",
        importance: "critical",
        category: "Synthesis",
      },
      {
        id: "cn-q-24",
        question: "What is the difference between TCP and UDP, and when would you choose UDP?",
        answer:
          "TCP is connection-oriented, reliable (guaranteed delivery via sequence numbers and retransmissions), ordered, and implements flow and congestion control at the cost of higher latency. UDP is connectionless, unreliable (best-effort datagrams), unordered, and lightweight with minimal header overhead (8 bytes vs 20 bytes). UDP is preferred for real-time applications where low latency is critical and occasional packet loss is acceptable (e.g., DNS queries, VoIP, live video streaming, multiplayer games, and QUIC/HTTP/3).",
        importance: "critical",
        category: "Transport",
      },
    ],
    labSlug: "troubleshooting",
  },
];

