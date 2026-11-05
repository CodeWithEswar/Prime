# PRIME — Computer Networks Simulation Correctness & Invariants

This document specifies the exact algorithmic rules and invariants enforced across all 10 Network Laboratories in `domain/cn/simulators/`.

---

## 1. OSI & TCP/IP Protocol Stack Visualizer
- **Encapsulation Invariant:** Each layer wraps data in its respective Protocol Data Unit (PDU):
  - Application: Data / Message
  - Transport: Segment (TCP) / Datagram (UDP)
  - Network: Packet
  - Data Link: Frame (Header + Payload + CRC Trailer)
  - Physical: Bit stream
- **Decapsulation Invariant:** The inverse operation strips headers step-by-step; layer mismatch causes packet drop.

---

## 2. Packet Journey Visualizer
- **Stages:** Client Browser → DNS Resolution → Local ARP Resolution → Default Gateway Router (NAT table translation) → Autonomous System Internet Routing → Destination Web Server → Response Reverse Path.
- **Invariants:** Private IP addresses (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) cannot traverse public routing without NAT translation.

---

## 3. IPv4 / CIDR Calculator
- **Binary Conversion:** Exact 32-bit integer arithmetic.
- **Subnet Mask:** $\text{prefix}$ consecutive 1s followed by $32 - \text{prefix}$ 0s.
- **Wildcard Mask:** Bitwise NOT of Subnet Mask ($\sim\text{mask}$).
- **Total Addresses:** $2^{32 - \text{prefix}}$.
- **Usable Hosts:**
  - If $\text{prefix} \le 30$: $2^{32 - \text{prefix}} - 2$ (excluding Network and Broadcast addresses).
  - If $\text{prefix} = 31$ (RFC 3021 Point-to-Point): 2 usable host addresses, no broadcast.
  - If $\text{prefix} = 32$ (Single Host Route): 1 usable host address.
- **First Usable / Last Usable:** Correctly adjusted for standard vs /31 vs /32.

---

## 4. Variable Length Subnet Masking (VLSM) Allocator
- **Allocation Invariant:** Host demands sorted in descending order (Largest-First Allocation).
- **Prefix Size Derivation:**
  $$\text{hostBits} = \lceil\log_2(\text{demand} + 2)\rceil, \quad \text{prefix} = 32 - \text{hostBits}$$
- **Boundary Alignment:** Each allocated subnet must begin on a multiple of its block size $2^{\text{hostBits}}$.
- **Overflow Detection:** Throws or flags error if cumulative block sizes exceed base network capacity.

---

## 5. TCP Three-Way Handshake & Connection Teardown
- **Sequence/ACK Arithmetic:**
  - Client sends SYN: $\text{Seq} = X$
  - Server replies SYN-ACK: $\text{Seq} = Y, \text{Ack} = X + 1$
  - Client sends ACK: $\text{Seq} = X + 1, \text{Ack} = Y + 1$
- **State Machine Transitions:**
  - Client: `CLOSED` → `SYN_SENT` → `ESTABLISHED` → `FIN_WAIT_1` → `FIN_WAIT_2` → `TIME_WAIT` (2MSL timer) → `CLOSED`.
  - Server: `LISTEN` → `SYN_RECEIVED` → `ESTABLISHED` → `CLOSE_WAIT` → `LAST_ACK` → `CLOSED`.

---

## 6. ARQ / Sliding Window Protocols
- **Stop-and-Wait:** Window size = 1.
- **Go-Back-N (GBN):**
  - Sender Window $W_s \le 2^m - 1$ where $m$ is sequence number bits.
  - Receiver Window $W_r = 1$.
  - Lost packet triggers retransmission of all in-flight packets starting from the lost sequence.
- **Selective Repeat (SR):**
  - Sender Window $W_s \le 2^{m-1}$.
  - Receiver Window $W_r = W_s$.
  - Out-of-order packets buffered; only the lost packet is retransmitted.

---

## 7. DNS Resolution Explorer
- **Hierarchy:** Stub Resolver → Recursive Resolver (with cache check) → Root DNS Server (`.`) → TLD Server (`.com`, `.org`) → Authoritative Nameserver.
- **Invariants:**
  - Cache hit answers query immediately with remaining TTL.
  - Iterative queries return referrals (delegation NS records); recursive queries follow delegations to leaf answer.

---

## 8. Routing Algorithms (Dijkstra & Bellman-Ford)
- **Dijkstra:**
  - Requires non-negative edge weights $w(u, v) \ge 0$.
  - Generates shortest path tree from source $s$ to all vertices.
- **Bellman-Ford:**
  - Relaxes all $|E|$ edges $|V| - 1$ times.
  - Runs a $|V|$-th pass to detect negative-weight cycles; flags invalidation if cycle found.

---

## 9. HTTP Request Lifecycle Explorer
- **Protocol Comparison:**
  - HTTP/1.1: Sequential requests over persistent TCP connection; vulnerable to Head-of-Line (HOL) blocking.
  - HTTP/2: Binary framing layer; streams multiplexed over single TCP connection; transport-level TCP packet loss still blocks all streams.
  - HTTP/3: Operates over QUIC (UDP); streams are completely independent at transport layer with zero transport HOL blocking and 0-RTT/1-RTT connection setup.

---

## 10. Network Troubleshooting Workspace
- **Deterministic Diagnostic Scenarios:**
  - DNS Resolution Failure: `ping 8.8.8.8` succeeds, `ping google.com` fails, `nslookup` reports `SERVFAIL` or `NXDOMAIN`. Fix: change nameserver to valid IP.
  - Subnet Mask Mismatch: Host cannot ping default gateway despite being physically linked; IP bitwise AND reveals different network address. Fix: correct subnet mask.
  - Default Gateway Unreachable: ARP table shows `Incomplete` for gateway IP; host traffic cannot leave LAN. Fix: assign correct gateway IP.
  - Port Blocked / Filtered: `curl -Iv` hangs or returns `Connection refused` (RST). Fix: open firewall port.
  - Routing Loop: `traceroute` shows repeating hops until ICMP `Time Exceeded` (TTL = 0). Fix: update static route or convergence protocol.

