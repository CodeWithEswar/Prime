/**
 * PRIME — Network Troubleshooting Guided Scenario Engine
 */

import type { TroubleshootingScenario } from "../types";

export const TROUBLESHOOTING_SCENARIOS: TroubleshootingScenario[] = [
  {
    id: "scen-01",
    title: "Scenario 1: Web Browsing Fails by Domain Name",
    symptoms: "Host PC cannot load any website in browser (e.g. 'google.com'). However, pinging IP 8.8.8.8 works with 15ms latency.",
    topologyDescription: "Host (192.168.1.50/24) -> Switch -> Router (192.168.1.1) -> ISP",
    availableDiagnostics: {
      "ping 8.8.8.8": {
        command: "ping 8.8.8.8",
        output: "64 bytes from 8.8.8.8: icmp_seq=1 ttl=118 time=14.8 ms\n4 packets transmitted, 4 received, 0% packet loss",
      },
      "nslookup google.com": {
        command: "nslookup google.com",
        output: ";; connection timed out; no servers could be reached\nServer: 192.168.1.250\nAddress: 192.168.1.250#53",
      },
      "cat /etc/resolv.conf": {
        command: "cat /etc/resolv.conf",
        output: "nameserver 192.168.1.250 # Note: IP does not exist on LAN!",
      },
    },
    options: [
      "Default gateway router is down or unreachable",
      "Local DNS nameserver IP is misconfigured or offline",
      "Network cable is disconnected from the switch",
      "Destination web server port 443 is blocked by cloud firewall",
    ],
    correctCauseIndex: 1,
    explanation:
      "Since pinging external IP 8.8.8.8 succeeds, Layer 1 through Layer 3 connectivity and gateway routing are healthy. The failure of 'nslookup' reveals the host is querying a non-existent nameserver (192.168.1.250). Updating nameserver to 8.8.8.8 or 1.1.1.1 immediately restores domain resolution.",
  },
  {
    id: "scen-02",
    title: "Scenario 2: Host Isolated on Local LAN",
    symptoms: "Host PC A (192.168.1.100) cannot communicate with neighboring Host PC B (192.168.1.200) or Gateway (192.168.1.1).",
    topologyDescription: "LAN with Subnet 192.168.1.0/24. Host A configured manually.",
    availableDiagnostics: {
      "ip addr show": {
        command: "ip addr show eth0",
        output: "inet 192.168.1.100/26 brd 192.168.1.127 scope global eth0",
      },
      "ping 192.168.1.1": {
        command: "ping 192.168.1.1",
        output: "From 192.168.1.100 icmp_seq=1 Destination Host Unreachable",
      },
      "arp -n": {
        command: "arp -n",
        output: "Address                  HWtype  HWaddress           Flags Mask            Iface\n192.168.1.1              (incomplete)                              eth0",
      },
    },
    options: [
      "Host A has a mismatched subnet mask (/26 instead of /24)",
      "Host A network interface card is powered off",
      "The default gateway has crashed",
      "DNS resolution is failing",
    ],
    correctCauseIndex: 0,
    explanation:
      "Host A has mask /26 (255.255.255.192). In /26, IP 192.168.1.100 belongs to subnet 192.168.1.64/26 (range: 64 to 127). The gateway 192.168.1.1 and Host B (192.168.1.200) fall outside Host A's subnet, causing routing failure. Reconfiguring Host A's mask to /24 resolves the issue.",
  },
  {
    id: "scen-03",
    title: "Scenario 3: Gateway ARP Table Failure",
    symptoms: "Host can reach all local LAN computers, but cannot reach any website or internet IP address.",
    topologyDescription: "LAN subnet 10.0.0.0/24. Gateway expected at 10.0.0.1.",
    availableDiagnostics: {
      "ping 10.0.0.25": {
        command: "ping 10.0.0.25",
        output: "64 bytes from 10.0.0.25: icmp_seq=1 ttl=64 time=0.45 ms (Local peer responds)",
      },
      "ping 10.0.0.1": {
        command: "ping 10.0.0.1",
        output: "From 10.0.0.10 icmp_seq=1 Destination Host Unreachable",
      },
      "ip route show": {
        command: "ip route show",
        output: "default via 10.0.0.1 dev eth0\n10.0.0.0/24 dev eth0 proto kernel scope link src 10.0.0.10",
      },
    },
    options: [
      "External DNS root servers are experiencing an outage",
      "Default gateway at 10.0.0.1 is offline, unassigned, or misconfigured",
      "Local Ethernet switch has exhausted its MAC address table",
      "Host has duplicate IP address conflict with 10.0.0.25",
    ],
    correctCauseIndex: 1,
    explanation:
      "The host can ping local peers (10.0.0.25), proving the physical link, switch, and local IP stack are functional. However, pinging the default gateway 10.0.0.1 fails with Host Unreachable, indicating the gateway device is down or unplugged.",
  },
  {
    id: "scen-04",
    title: "Scenario 4: TCP Connection Timeout to Production API",
    symptoms: "Web server reports 'Connection timed out' when querying backend database server at 10.10.5.20:5432.",
    topologyDescription: "Web Tier (10.10.1.0/24) -> Firewall / Security Group -> DB Tier (10.10.5.0/24)",
    availableDiagnostics: {
      "nc -zv 10.10.5.20 5432": {
        command: "nc -z -v -w 3 10.10.5.20 5432",
        output: "nc: connect to 10.10.5.20 port 5432 (tcp) timed out: Operation now in progress",
      },
      "ping 10.10.5.20": {
        command: "ping -c 2 10.10.5.20",
        output: "64 bytes from 10.10.5.20: icmp_seq=1 ttl=63 time=1.2 ms (ICMP allowed!)",
      },
    },
    options: [
      "Physical fiber between web and database racks is severed",
      "Firewall / Security Group rule drops TCP SYN packets on port 5432 without sending RST",
      "PostgreSQL database has crashed and returned TCP RST",
      "DNS resolution for 10.10.5.20 has expired",
    ],
    correctCauseIndex: 1,
    explanation:
      "ICMP ping succeeds, confirming Layer 3 network connectivity. But TCP connection hangs and times out rather than failing immediately. A timeout indicates SYN packets are silently dropped (blackholed) by an intermediate firewall or security group.",
  },
  {
    id: "scen-05",
    title: "Scenario 5: Routing Loop & TTL Exceeded",
    symptoms: "Traffic to remote branch office (172.16.50.0/24) hangs and never reaches destination.",
    topologyDescription: "Router R1 <-> Router R2 link with static route misconfiguration.",
    availableDiagnostics: {
      "traceroute 172.16.50.10": {
        command: "traceroute -n 172.16.50.10",
        output: "1  10.0.0.1  0.8 ms\n2  10.0.1.2  1.4 ms\n3  10.0.1.1  2.1 ms\n4  10.0.1.2  2.8 ms\n5  10.0.1.1  3.5 ms\n6  10.0.1.2  4.2 ms\n... (repeats until TTL=30)\n30  * * * Time to live exceeded",
      },
    },
    options: [
      "Destination host is powered off",
      "Routing loop between 10.0.1.1 and 10.0.1.2 where each forwards packets back to the other",
      "BGP route flap caused by MTU mismatch",
      "Switch port flapping on access VLAN",
    ],
    correctCauseIndex: 1,
    explanation:
      "Traceroute clearly displays packets bouncing back and forth between 10.0.1.1 and 10.0.1.2 until the IP TTL counter decrements to 0, returning ICMP Time Exceeded. A classic routing loop caused by reciprocal static routes.",
  },
  {
    id: "scen-06",
    title: "Scenario 6: TLS Certificate Domain Mismatch",
    symptoms: "Users receive 'Your connection is not private / NET::ERR_CERT_COMMON_NAME_INVALID' when visiting https://billing.company.com.",
    topologyDescription: "Client Browser -> CDN / Reverse Proxy -> Application Server",
    availableDiagnostics: {
      "curl -Iv https://billing.company.com": {
        command: "curl -Iv https://billing.company.com",
        output: "* Connected to billing.company.com (104.21.45.12) port 443\n* Server certificate:\n*  subject: CN=api.company.com\n*  start date: Oct 01 00:00:00 2026 GMT\n*  expire date: Dec 30 23:59:59 2026 GMT\n*  issuer: C=US, O=Let's Encrypt, CN=R3\n* SSL certificate subject[CN=api.company.com] does not match target host name 'billing.company.com'",
      },
    },
    options: [
      "The TLS certificate has expired",
      "TLS certificate Common Name / SAN does not include billing.company.com",
      "Client clock is skewed by several years",
      "Server does not support TLS 1.3 protocol",
    ],
    correctCauseIndex: 1,
    explanation:
      "The certificate is valid in date, but its subject is configured only for 'api.company.com' without a wildcard (*.company.com) or Subject Alternative Name (SAN) matching 'billing.company.com'. Reissuing certificate with SAN resolves the error.",
  },
  {
    id: "scen-07",
    title: "Scenario 7: Port Blocked with TCP RST",
    symptoms: "Curl command to custom service on port 8080 fails immediately with 'Connection refused'.",
    topologyDescription: "Client -> Server (192.168.1.200)",
    availableDiagnostics: {
      "curl -v http://192.168.1.200:8080": {
        command: "curl -v http://192.168.1.200:8080",
        output: "* Trying 192.168.1.200:8080...\n* connect to 192.168.1.200 port 8080 failed: Connection refused\n* Closing connection 0",
      },
      "ssh user@192.168.1.200 'ss -tulpn'": {
        command: "ss -tulpn",
        output: "Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:Port\ntcp   LISTEN 0      128    0.0.0.0:22          0.0.0.0:* (sshd)\ntcp   LISTEN 0      128    0.0.0.0:80          0.0.0.0:* (nginx)\n(Notice: Nothing is listening on port 8080!)",
      },
    },
    options: [
      "No process is listening on port 8080 on the server",
      "DNS resolution failed for 192.168.1.200",
      "MTU size exceeded on the network card",
      "The client network cable has been severed",
    ],
    correctCauseIndex: 0,
    explanation:
      "'Connection refused' means the server received the TCP SYN packet and its kernel responded with an immediate TCP RST packet because no application process was bound/listening on port 8080.",
  },
];

export function gradeTroubleshootingAnswer(scenarioId: string, chosenIndex: number): {
  isCorrect: boolean;
  explanation: string;
} {
  const scen = TROUBLESHOOTING_SCENARIOS.find((s) => s.id === scenarioId);
  if (!scen) {
    return { isCorrect: false, explanation: "Scenario not found." };
  }
  const isCorrect = chosenIndex === scen.correctCauseIndex;
  return {
    isCorrect,
    explanation: scen.explanation,
  };
}

