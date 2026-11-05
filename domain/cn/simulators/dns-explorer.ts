/**
 * PRIME — DNS Resolution Hierarchy & Cache Explorer Engine
 */

import type { DNSRecordType, DNSStep } from "../types";

export function simulateDNSResolution(
  domain = "api.example.com",
  recordType: DNSRecordType = "A",
  simulateCached = false
): DNSStep[] {
  const steps: DNSStep[] = [];
  let step = 1;

  if (simulateCached) {
    steps.push({
      step: step++,
      serverName: "Browser / OS Local DNS Cache",
      serverType: "BROWSER_CACHE",
      query: `Look up cached ${recordType} record for ${domain}`,
      response: `CACHE HIT: 93.184.216.34 (TTL remaining: 240s). Resolved in 1ms with 0 external network round-trips!`,
      isCacheHit: true,
      ttlRemainingSeconds: 240,
    });
    return steps;
  }

  // 1. Browser cache miss
  steps.push({
    step: step++,
    serverName: "Browser & OS Resolver Cache",
    serverType: "BROWSER_CACHE",
    query: `Check internal cache for ${domain}`,
    response: `CACHE MISS: Domain not present in local cache. Forwarding recursive query to configured resolver (8.8.8.8).`,
    isCacheHit: false,
    ttlRemainingSeconds: 0,
  });

  // 2. Recursive Resolver
  steps.push({
    step: step++,
    serverName: "Recursive Resolver (8.8.8.8)",
    serverType: "RECURSIVE_RESOLVER",
    query: `Recursive Query: What is the ${recordType} record for ${domain}?`,
    response: `Resolver cache miss. Initiating iterative resolution starting at Root DNS Servers.`,
    isCacheHit: false,
    ttlRemainingSeconds: 0,
  });

  // 3. Root DNS Server
  steps.push({
    step: step++,
    serverName: "Root DNS Server (a.root-servers.net [198.41.0.4])",
    serverType: "ROOT_SERVER",
    query: `Iterative Query: ${domain}`,
    response: `Delegation Referral: I don't know '${domain}', but the '.com' TLD is managed by 'a.gtld-servers.net'.`,
    isCacheHit: false,
    ttlRemainingSeconds: 172800,
  });

  // 4. TLD DNS Server
  steps.push({
    step: step++,
    serverName: "TLD DNS Server (.com [192.5.6.30])",
    serverType: "TLD_SERVER",
    query: `Iterative Query: ${domain}`,
    response: `Delegation Referral: The authoritative nameservers for 'example.com' are 'ns1.example.com' (198.51.100.1).`,
    isCacheHit: false,
    ttlRemainingSeconds: 86400,
  });

  // 5. Authoritative DNS Server
  let finalAnswer = "93.184.216.34";
  if (recordType === "AAAA") finalAnswer = "2606:2800:220:1:248:1893:25c8:1946";
  else if (recordType === "CNAME") finalAnswer = "edge.example-cdn.net";
  else if (recordType === "MX") finalAnswer = "10 mail.example.com";
  else if (recordType === "TXT") finalAnswer = '"v=spf1 include:_spf.google.com ~all"';

  steps.push({
    step: step++,
    serverName: "Authoritative DNS Server (ns1.example.com)",
    serverType: "AUTHORITATIVE",
    query: `Query ${recordType} for ${domain}`,
    response: `AUTHORITATIVE ANSWER: ${domain} IN ${recordType} ${finalAnswer} (TTL: 300s).`,
    isCacheHit: false,
    ttlRemainingSeconds: 300,
  });

  return steps;
}

