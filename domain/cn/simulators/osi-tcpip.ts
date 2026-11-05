/**
 * PRIME — OSI & TCP/IP Protocol Stack Simulator
 */

import type { EncapsulationStep, OSILayerInfo, OSILayerNumber } from "../types";

export const OSI_LAYERS_DATA: Record<OSILayerNumber, OSILayerInfo> = {
  7: {
    layer: 7,
    name: "Application Layer",
    tcpipEquivalent: "Application Layer",
    pdu: "Data / Message",
    responsibilities: [
      "User interface & application network services",
      "Resource sharing and remote file access",
      "Directory services and web browsing APIs",
    ],
    protocols: ["HTTP/HTTPS", "DNS", "SSH", "FTP", "SMTP", "WebSocket"],
    devices: ["Host PC", "Mobile Client", "Web Server"],
  },
  6: {
    layer: 6,
    name: "Presentation Layer",
    tcpipEquivalent: "Application Layer",
    pdu: "Data / Formatted Payload",
    responsibilities: [
      "Data representation and character code translation (ASCII, UTF-8)",
      "Data compression and decompression (gzip, brotli)",
      "Encryption and decryption (TLS/SSL records)",
    ],
    protocols: ["TLS/SSL", "JPEG", "MPEG", "JSON", "Protobuf"],
    devices: ["Cryptographic Accelerator", "Host OS"],
  },
  5: {
    layer: 5,
    name: "Session Layer",
    tcpipEquivalent: "Application Layer",
    pdu: "Data / Session Stream",
    responsibilities: [
      "Session checkpointing and synchronization tokens",
      "Authentication and session recovery",
      "Dialog control (half-duplex vs full-duplex)",
    ],
    protocols: ["RPC", "NetBIOS", "PPTP", "NFS"],
    devices: ["Operating System Sockets API"],
  },
  4: {
    layer: 4,
    name: "Transport Layer",
    tcpipEquivalent: "Transport Layer",
    pdu: "Segment (TCP) / Datagram (UDP)",
    responsibilities: [
      "Process-to-process delivery via port numbers",
      "Connection management (TCP 3-way handshake)",
      "Reliability, flow control (Sliding Window), and congestion control",
    ],
    protocols: ["TCP", "UDP", "QUIC", "SCTP"],
    devices: ["Layer 4 Load Balancer", "Stateful Firewall"],
  },
  3: {
    layer: 3,
    name: "Network Layer",
    tcpipEquivalent: "Internet Layer",
    pdu: "Packet",
    responsibilities: [
      "Host-to-host delivery across disparate networks",
      "Logical addressing (IPv4, IPv6)",
      "Packet routing and forwarding via routing tables",
    ],
    protocols: ["IPv4", "IPv6", "ICMP", "ARP", "OSPF", "BGP"],
    devices: ["Router", "Layer 3 Switch"],
  },
  2: {
    layer: 2,
    name: "Data Link Layer",
    tcpipEquivalent: "Network Access / Link Layer",
    pdu: "Frame",
    responsibilities: [
      "Hop-to-hop node transfer over physical media",
      "Physical addressing (48-bit MAC addresses)",
      "Framing, flow control, and error detection (CRC trailer)",
    ],
    protocols: ["Ethernet (802.3)", "Wi-Fi (802.11)", "PPP", "HDLC", "VLAN (802.1Q)"],
    devices: ["Network Switch", "Bridge", "Network Interface Card (NIC)"],
  },
  1: {
    layer: 1,
    name: "Physical Layer",
    tcpipEquivalent: "Network Access / Link Layer",
    pdu: "Bits",
    responsibilities: [
      "Raw bit transmission over physical medium",
      "Signal encoding, voltage levels, and modulation",
      "Physical topologies, connectors (RJ-45), and cable specifications",
    ],
    protocols: ["1000BASE-T", "DSL", "SONET/SDH", "Bluetooth PHY"],
    devices: ["Hub", "Repeater", "Fiber Optic Cable", "Transceiver"],
  },
};

export function simulateEncapsulation(payloadMessage: string): EncapsulationStep[] {
  return [
    {
      layer: 7,
      layerName: "Application",
      pdu: "Data",
      headerAdded: "HTTP Header: GET /index.html HTTP/1.1",
      payloadDescription: payloadMessage,
    },
    {
      layer: 6,
      layerName: "Presentation",
      pdu: "Data",
      headerAdded: "TLS Record Header (Content-Type: 23, Version: TLS 1.3)",
      payloadDescription: "Encrypted & Compressed Payload",
    },
    {
      layer: 5,
      layerName: "Session",
      pdu: "Data",
      headerAdded: "Session Token / Dialog State (Full Duplex)",
      payloadDescription: "Session-managed Stream",
    },
    {
      layer: 4,
      layerName: "Transport",
      pdu: "Segment",
      headerAdded: "TCP Header: SrcPort=54321, DstPort=443, Seq=1001, Window=65535",
      payloadDescription: "Segment Payload (MSS 1460 bytes)",
    },
    {
      layer: 3,
      layerName: "Network",
      pdu: "Packet",
      headerAdded: "IPv4 Header: SrcIP=192.168.1.50, DstIP=93.184.216.34, TTL=64, Proto=6",
      payloadDescription: "IP Packet Payload",
    },
    {
      layer: 2,
      layerName: "Data Link",
      pdu: "Frame",
      headerAdded: "Ethernet Header: SrcMAC=AA:BB:CC:11:22:33, DstMAC=DD:EE:FF:44:55:66, Type=0x0800 + CRC Trailer",
      payloadDescription: "Ethernet Frame Payload",
    },
    {
      layer: 1,
      layerName: "Physical",
      pdu: "Bits",
      headerAdded: "Preamble & Start Frame Delimiter (SFD: 10101011)",
      payloadDescription: "Raw Bit Stream (Manchester / 4B5B Encoded Signals)",
    },
  ];
}

