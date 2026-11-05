/**
 * PRIME — HTTP Request Lifecycle & Protocol Comparison Engine
 */

import type { HTTPLifecycleStage } from "../types";

export function simulateHTTPLifecycle(
  url = "https://api.prime.dev/v1/metrics",
  httpVersion: "HTTP/1.1" | "HTTP/2" | "HTTP/3" = "HTTP/2"
): HTTPLifecycleStage[] {
  const isHttp3 = httpVersion === "HTTP/3";

  return [
    {
      stageNumber: 1,
      name: "URL Parsing & Validation",
      protocol: "Client / Browser API",
      durationMs: 2,
      summary: "Browser validates protocol scheme (https://), resolves host (api.prime.dev), port (443), and resource path.",
      details: {
        Scheme: "https",
        Host: "api.prime.dev",
        Port: "443 (Default HTTPS)",
        Path: "/v1/metrics",
        HSTS: "Preloaded (Enforce TLS)",
      },
    },
    {
      stageNumber: 2,
      name: "DNS Resolution",
      protocol: "DNS (UDP/53 or DoH)",
      durationMs: 18,
      summary: "Recursive lookup resolves api.prime.dev to IP address 76.76.21.21.",
      details: {
        Query: "A api.prime.dev",
        ResolvedIP: "76.76.21.21",
        TTL: "300s",
      },
    },
    {
      stageNumber: 3,
      name: isHttp3 ? "QUIC Connection (UDP)" : "TCP 3-Way Handshake",
      protocol: isHttp3 ? "QUIC (UDP Port 443)" : "TCP (Port 443)",
      durationMs: isHttp3 ? 12 : 28,
      summary: isHttp3
        ? "QUIC combines transport connection and cryptographic handshake into a single 1-RTT exchange over UDP."
        : "Standard TCP 3-way handshake: Client SYN -> Server SYN-ACK -> Client ACK.",
      details: isHttp3
        ? { Transport: "UDP", Handshake: "Combined QUIC + TLS 1.3 in 1 RTT", ConnectionID: "0x8a9b2c3d" }
        : { Flags: "SYN, SYN-ACK, ACK", RTT: "1 Full Round-Trip (28 ms)", Socket: "ESTABLISHED" },
    },
    {
      stageNumber: 4,
      name: "TLS 1.3 Security Handshake",
      protocol: "TLS 1.3",
      durationMs: isHttp3 ? 0 : 25,
      summary: isHttp3
        ? "Handshake already completed within QUIC transport setup."
        : "ClientHello and ServerHello exchange Diffie-Hellman public parameters. Symmetric AES-256-GCM cipher established.",
      details: {
        CipherSuite: "TLS_AES_256_GCM_SHA384",
        KeyExchange: "ECDHE (X25519)",
        Certificate: "Valid (Issued by Let's Encrypt)",
      },
    },
    {
      stageNumber: 5,
      name: "HTTP Request Transmission",
      protocol: httpVersion,
      durationMs: 6,
      summary: `Client transmits HTTP request using ${httpVersion} framing format.`,
      details: {
        Method: "GET",
        Path: "/v1/metrics",
        Headers: "Accept: application/json, User-Agent: PRIME-Engine/2.0",
        Multiplexing: isHttp3 ? "QUIC Independent Streams" : httpVersion === "HTTP/2" ? "Binary Framing Multiplex" : "None (Sequential)",
      },
    },
    {
      stageNumber: 6,
      name: "Server Processing & Response",
      protocol: httpVersion,
      durationMs: 42,
      summary: "Web server executes backend route handler, queries database, and serializes JSON payload.",
      details: {
        Status: "200 OK",
        ContentType: "application/json; charset=utf-8",
        ServerTiming: "db;dur=14, cpu;dur=8",
      },
    },
    {
      stageNumber: 7,
      name: "Client Ingress & Rendering",
      protocol: "Browser Engine",
      durationMs: 8,
      summary: "Browser decodes gzip payload, deserializes JSON data, and updates DOM state.",
      details: {
        DecodedBytes: "4096 bytes",
        DOMUpdate: "Success",
      },
    },
  ];
}

