/**
 * PRIME — IPv4 Subnet Calculator Engine
 *
 * Exact 32-bit network address calculation, binary representations,
 * RFC 1918 classification, and RFC 3021 /31 & /32 handling.
 */

import type { SubnetCalculationResult } from "../types";

export function ipToNumber(ip: string): number {
  const octets = ip.trim().split(".").map((o) => parseInt(o, 10));
  if (octets.length !== 4 || octets.some((o) => isNaN(o) || o < 0 || o > 255)) {
    throw new Error(`Invalid IPv4 address: ${ip}`);
  }
  return (((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0);
}

export function numberToIp(num: number): string {
  const unsigned = num >>> 0;
  return [
    (unsigned >>> 24) & 255,
    (unsigned >>> 16) & 255,
    (unsigned >>> 8) & 255,
    unsigned & 255,
  ].join(".");
}

export function prefixToMaskNumber(prefix: number): number {
  if (prefix === 0) return 0;
  return ((0xffffffff << (32 - prefix)) >>> 0);
}

export function maskToPrefix(mask: string): number {
  const num = ipToNumber(mask);
  let count = 0;
  for (let i = 31; i >= 0; i--) {
    if ((num & (1 << i)) !== 0) count++;
    else break;
  }
  return count;
}

export function toBinaryString(num: number): string {
  const unsigned = num >>> 0;
  const octets = [
    ((unsigned >>> 24) & 255).toString(2).padStart(8, "0"),
    ((unsigned >>> 16) & 255).toString(2).padStart(8, "0"),
    ((unsigned >>> 8) & 255).toString(2).padStart(8, "0"),
    (unsigned & 255).toString(2).padStart(8, "0"),
  ];
  return octets.join(".");
}

export function isPrivateIp(ipNum: number): boolean {
  const unsigned = ipNum >>> 0;
  // 10.0.0.0/8: 10.0.0.0 to 10.255.255.255
  if ((unsigned >>> 24) === 10) return true;
  // 172.16.0.0/12: 172.16.0.0 to 172.31.255.255
  const first16 = (unsigned >>> 16) & 0xffff;
  if (first16 >= 0xac10 && first16 <= 0xac1f) return true;
  // 192.168.0.0/16: 192.168.0.0 to 192.168.255.255
  if ((unsigned >>> 16) === 0xc0a8) return true;
  return false;
}

export function getIpClass(ipNum: number): "A" | "B" | "C" | "D" | "E" {
  const firstOctet = (ipNum >>> 24) & 255;
  if (firstOctet <= 127) return "A";
  if (firstOctet <= 191) return "B";
  if (firstOctet <= 223) return "C";
  if (firstOctet <= 239) return "D";
  return "E";
}

export function calculateIPv4Subnet(ipInput: string, prefixInput: number | string): SubnetCalculationResult {
  const cleanIp = ipInput.trim();
  const ipNum = ipToNumber(cleanIp);

  let prefix: number;
  if (typeof prefixInput === "number") {
    prefix = Math.max(0, Math.min(32, prefixInput));
  } else if (prefixInput.includes(".")) {
    prefix = maskToPrefix(prefixInput);
  } else {
    prefix = Math.max(0, Math.min(32, parseInt(prefixInput.replace("/", ""), 10) || 24));
  }

  const maskNum = prefixToMaskNumber(prefix);
  const wildcardNum = (~maskNum) >>> 0;

  const networkNum = (ipNum & maskNum) >>> 0;
  const broadcastNum = (networkNum | wildcardNum) >>> 0;

  const totalAddresses = Math.pow(2, 32 - prefix);
  let usableHosts = 0;
  let firstUsableNum = networkNum;
  let lastUsableNum = broadcastNum;

  if (prefix === 31) {
    // RFC 3021 Point-to-Point link
    usableHosts = 2;
    firstUsableNum = networkNum;
    lastUsableNum = broadcastNum;
  } else if (prefix === 32) {
    // Single host route
    usableHosts = 1;
    firstUsableNum = networkNum;
    lastUsableNum = networkNum;
  } else {
    // Standard subnet
    usableHosts = Math.max(0, totalAddresses - 2);
    firstUsableNum = (networkNum + 1) >>> 0;
    lastUsableNum = (broadcastNum - 1) >>> 0;
  }

  return {
    ipAddress: numberToIp(ipNum),
    cidrPrefix: prefix,
    subnetMask: numberToIp(maskNum),
    wildcardMask: numberToIp(wildcardNum),
    networkAddress: numberToIp(networkNum),
    broadcastAddress: numberToIp(broadcastNum),
    firstUsableIp: numberToIp(firstUsableNum),
    lastUsableIp: numberToIp(lastUsableNum),
    totalAddresses,
    usableHosts,
    ipClass: getIpClass(ipNum),
    isPrivate: isPrivateIp(ipNum),
    isSpecialRoute: prefix >= 31,
    binarySubnetMask: toBinaryString(maskNum),
    binaryIpAddress: toBinaryString(ipNum),
  };
}
