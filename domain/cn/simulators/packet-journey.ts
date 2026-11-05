/**
 * PRIME — Packet Journey Visualizer Simulator
 */

import type { JourneyHop } from "../types";

export function simulatePacketJourney(url = "https://example.com"): JourneyHop[] {
  return [
    {
      id: "hop-1",
      stageName: "1. Browser URL Entry",
      component: "Web Browser (Client Host)",
      protocol: "Application",
      layer: "Layer 7 (Application)",
      description: "User requests destination URL. Browser parses scheme, domain, and checks local HSTS and DNS cache.",
      action: "Parse URL and check internal browser socket cache.",
      sourceAddress: "192.168.1.100 (Host)",
      destAddress: "example.com",
    },
    {
      id: "hop-2",
      stageName: "2. DNS Query & Resolution",
      component: "Local DNS Resolver / ISP Resolver",
      protocol: "DNS (UDP/53)",
      layer: "Layer 4 & Layer 7",
      description: "Host transmits UDP DNS query. Resolver queries Root, TLD (.com), and Authoritative nameservers, resolving domain to destination IP.",
      action: "DNS Query: A record for example.com -> Returned 93.184.216.34.",
      sourceAddress: "192.168.1.100:53211",
      destAddress: "8.8.8.8:53",
    },
    {
      id: "hop-3",
      stageName: "3. Local Network ARP Resolution",
      component: "Host NIC & Local Ethernet Switch",
      protocol: "ARP (Address Resolution Protocol)",
      layer: "Layer 2 (Data Link)",
      description: "Destination IP 93.184.216.34 is outside local subnet 192.168.1.0/24. Host broadcasts ARP request to locate default gateway MAC address.",
      action: "ARP Broadcast: 'Who has 192.168.1.1?' -> Gateway responds with MAC e0:55:3d:12:34:56.",
      sourceAddress: "Host MAC: aa:bb:cc:dd:ee:01",
      destAddress: "Gateway MAC: e0:55:3d:12:34:56",
    },
    {
      id: "hop-4",
      stageName: "4. Gateway Router & NAT",
      component: "Default Gateway Router (Home / Enterprise CPE)",
      protocol: "IPv4 / NAT / PAT",
      layer: "Layer 3 (Network)",
      description: "Router rewrites private source IP 192.168.1.100 to public ISP IP 203.0.113.45 and allocates unique translation port.",
      action: "NAT Translation: [192.168.1.100:54321] -> [203.0.113.45:49152]. Decrement TTL.",
      sourceAddress: "203.0.113.45:49152",
      destAddress: "93.184.216.34:443",
    },
    {
      id: "hop-5",
      stageName: "5. Autonomous System Internet Routing",
      component: "Core Tier-1 ISP Routers (BGP Backbones)",
      protocol: "BGP / OSPF / IP Forwarding",
      layer: "Layer 3 (Network)",
      description: "Packet traverses multiple intermediate autonomous systems using longest-prefix match routing tables across fiber-optic backbones.",
      action: "Forward across 8 ISP router hops. Hop TTL decremented at each router.",
      sourceAddress: "203.0.113.45",
      destAddress: "93.184.216.34",
    },
    {
      id: "hop-6",
      stageName: "6. Destination Ingress & TCP/TLS Handshake",
      component: "Destination Web Server / Reverse Proxy",
      protocol: "TCP (Port 443) & TLS 1.3",
      layer: "Layer 4 & Layer 6",
      description: "Server receives SYN, replies SYN-ACK, completes TCP 3-way handshake, and establishes encrypted TLS 1.3 symmetric cipher session.",
      action: "TCP Connection ESTABLISHED. TLS Handshake complete. Cipher: AES-GCM-256.",
      sourceAddress: "203.0.113.45:49152",
      destAddress: "93.184.216.34:443",
    },
    {
      id: "hop-7",
      stageName: "7. HTTP Request & Web Server Response",
      component: "Nginx / Node.js Server",
      protocol: "HTTP/2 (HTTPS)",
      layer: "Layer 7 (Application)",
      description: "Client sends HTTP GET / request. Server processes request, generates HTML payload, and returns HTTP 200 OK response packet along reverse path.",
      action: "Response: HTTP/2 200 OK (Content-Type: text/html, Content-Length: 1256 bytes).",
      sourceAddress: "93.184.216.34:443",
      destAddress: "203.0.113.45:49152",
    },
  ];
}

