/**
 * PRIME — Variable Length Subnet Masking (VLSM) Allocator Engine
 *
 * Implements deterministic largest-first subnet allocation,
 * prefix derivation, boundary alignment, and capacity verification.
 */

import {
  calculateIPv4Subnet,
  ipToNumber,
  numberToIp,
  prefixToMaskNumber,
} from "./ipv4-subnet";
import type { VLSMDemand, VLSMResult, VLSMSubnetAllocation } from "../types";

export function allocateVLSM(
  baseNetworkIp: string,
  basePrefix: number,
  demands: VLSMDemand[]
): VLSMResult {
  if (demands.length === 0) {
    return {
      baseNetwork: baseNetworkIp,
      basePrefix,
      allocations: [],
      remainingCapacityHosts: Math.pow(2, 32 - basePrefix) - 2,
      overflow: false,
    };
  }

  // Calculate base network boundaries
  const baseSubnet = calculateIPv4Subnet(baseNetworkIp, basePrefix);
  let currentPointer = ipToNumber(baseSubnet.networkAddress);
  const baseEnd = ipToNumber(baseSubnet.broadcastAddress);

  // 1. Sort demands largest to smallest (non-negotiable VLSM invariant)
  const sortedDemands = [...demands].sort((a, b) => b.requiredHosts - a.requiredHosts);

  const allocations: VLSMSubnetAllocation[] = [];
  let overflow = false;
  let errorMessage: string | undefined;

  for (const demand of sortedDemands) {
    if (demand.requiredHosts <= 0) continue;

    // Calculate needed host bits: ceil(log2(hosts + 2))
    // Special case: 2 hosts can use /30 (4 addresses) or /31 (2 addresses)
    let hostBits = Math.ceil(Math.log2(demand.requiredHosts + 2));
    if (hostBits < 2) hostBits = 2; // minimum standard subnet is /30
    const prefixLength = 32 - hostBits;
    const blockSize = Math.pow(2, hostBits);

    // Boundary alignment: current pointer must be multiple of blockSize
    if (currentPointer % blockSize !== 0) {
      currentPointer = Math.ceil(currentPointer / blockSize) * blockSize;
    }

    const subnetEnd = currentPointer + blockSize - 1;

    if (subnetEnd > baseEnd) {
      overflow = true;
      errorMessage = `Insufficient capacity in base network ${baseNetworkIp}/${basePrefix}: Cannot allocate ${demand.requiredHosts} hosts for "${demand.name}" (requires /${prefixLength}).`;
      break;
    }

    const netIp = numberToIp(currentPointer);
    const subCalc = calculateIPv4Subnet(netIp, prefixLength);

    allocations.push({
      name: demand.name,
      requiredHosts: demand.requiredHosts,
      allocatedHosts: subCalc.usableHosts,
      prefixLength,
      networkAddress: subCalc.networkAddress,
      subnetMask: subCalc.subnetMask,
      firstUsableIp: subCalc.firstUsableIp,
      lastUsableIp: subCalc.lastUsableIp,
      broadcastAddress: subCalc.broadcastAddress,
    });

    currentPointer = subnetEnd + 1;
  }

  const remainingAddresses = Math.max(0, baseEnd - currentPointer + 1);

  return {
    baseNetwork: baseSubnet.networkAddress,
    basePrefix,
    allocations,
    remainingCapacityHosts: remainingAddresses,
    overflow,
    errorMessage,
  };
}

