/**
 * PRIME — Memory & Page Replacement Studio Engine
 *
 * Deterministic Address Translation, TLB simulation, and Page Replacement:
 * - First-In First-Out (FIFO)
 * - Least Recently Used (LRU)
 * - Bélády's Optimal (MIN)
 * - Bélády's Anomaly detection & evaluation
 */

import type {
  AddressTranslationResult,
  PageReplacementAlgorithm,
  PageReplacementResult,
  PageReplacementStep,
} from "../types";

export function translateAddress(
  logicalAddress: number,
  pageSize = 4096,
  pageTable: Record<number, number> = {},
  tlb: Record<number, number> = {}
): AddressTranslationResult {
  const pageNumber = Math.floor(logicalAddress / pageSize);
  const offset = logicalAddress % pageSize;

  const tlbHit = pageNumber in tlb;
  const frameNumber = tlbHit ? tlb[pageNumber] : pageTable[pageNumber] ?? null;
  const valid = frameNumber !== null;
  const physicalAddress = valid ? frameNumber * pageSize + offset : null;

  return {
    logicalAddress,
    pageSize,
    pageNumber,
    offset,
    frameNumber,
    physicalAddress,
    tlbHit,
    valid,
  };
}

export function simulatePageReplacement(
  referenceString: number[],
  numFrames: number,
  algorithm: PageReplacementAlgorithm
): PageReplacementResult {
  if (referenceString.length === 0 || numFrames <= 0) {
    return {
      algorithm,
      numFrames,
      referenceString,
      steps: [],
      totalPageFaults: 0,
      totalPageHits: 0,
      faultRatio: 0,
      hitRatio: 0,
    };
  }

  switch (algorithm) {
    case "FIFO":
      return runFIFO(referenceString, numFrames);
    case "LRU":
      return runLRU(referenceString, numFrames);
    case "OPTIMAL":
      return runOptimal(referenceString, numFrames);
    default:
      return runFIFO(referenceString, numFrames);
  }
}

function runFIFO(referenceString: number[], numFrames: number): PageReplacementResult {
  const frames: (number | null)[] = new Array(numFrames).fill(null);
  const fifoQueue: number[] = [];
  const steps: PageReplacementStep[] = [];
  let totalFaults = 0;
  let totalHits = 0;

  for (let i = 0; i < referenceString.length; i++) {
    const page = referenceString[i];
    const isHit = frames.includes(page);

    let evictedPage: number | null = null;

    if (isHit) {
      totalHits++;
    } else {
      totalFaults++;
      const emptyIndex = frames.indexOf(null);

      if (emptyIndex !== -1) {
        frames[emptyIndex] = page;
        fifoQueue.push(page);
      } else {
        // Evict oldest page from fifoQueue
        evictedPage = fifoQueue.shift()!;
        const replaceIndex = frames.indexOf(evictedPage);
        frames[replaceIndex] = page;
        fifoQueue.push(page);
      }
    }

    steps.push({
      step: i + 1,
      page,
      frames: [...frames],
      isFault: !isHit,
      evictedPage,
    });
  }

  return {
    algorithm: "FIFO",
    numFrames,
    referenceString,
    steps,
    totalPageFaults: totalFaults,
    totalPageHits: totalHits,
    faultRatio: Math.round((totalFaults / referenceString.length) * 1000) / 10,
    hitRatio: Math.round((totalHits / referenceString.length) * 1000) / 10,
  };
}

function runLRU(referenceString: number[], numFrames: number): PageReplacementResult {
  const frames: (number | null)[] = new Array(numFrames).fill(null);
  // Track last used step for each page
  const lastUsed = new Map<number, number>();
  const steps: PageReplacementStep[] = [];
  let totalFaults = 0;
  let totalHits = 0;

  for (let i = 0; i < referenceString.length; i++) {
    const page = referenceString[i];
    const isHit = frames.includes(page);
    let evictedPage: number | null = null;

    if (isHit) {
      totalHits++;
      lastUsed.set(page, i);
    } else {
      totalFaults++;
      const emptyIndex = frames.indexOf(null);

      if (emptyIndex !== -1) {
        frames[emptyIndex] = page;
        lastUsed.set(page, i);
      } else {
        // Find page in frames with minimum lastUsed index
        let lruPage = frames[0]!;
        let minTime = lastUsed.get(lruPage) ?? -1;

        for (const f of frames) {
          if (f !== null) {
            const t = lastUsed.get(f) ?? -1;
            if (t < minTime) {
              minTime = t;
              lruPage = f;
            }
          }
        }

        evictedPage = lruPage;
        const replaceIndex = frames.indexOf(evictedPage);
        frames[replaceIndex] = page;
        lastUsed.set(page, i);
      }
    }

    steps.push({
      step: i + 1,
      page,
      frames: [...frames],
      isFault: !isHit,
      evictedPage,
    });
  }

  return {
    algorithm: "LRU",
    numFrames,
    referenceString,
    steps,
    totalPageFaults: totalFaults,
    totalPageHits: totalHits,
    faultRatio: Math.round((totalFaults / referenceString.length) * 1000) / 10,
    hitRatio: Math.round((totalHits / referenceString.length) * 1000) / 10,
  };
}

function runOptimal(referenceString: number[], numFrames: number): PageReplacementResult {
  const frames: (number | null)[] = new Array(numFrames).fill(null);
  const steps: PageReplacementStep[] = [];
  let totalFaults = 0;
  let totalHits = 0;

  for (let i = 0; i < referenceString.length; i++) {
    const page = referenceString[i];
    const isHit = frames.includes(page);
    let evictedPage: number | null = null;

    if (isHit) {
      totalHits++;
    } else {
      totalFaults++;
      const emptyIndex = frames.indexOf(null);

      if (emptyIndex !== -1) {
        frames[emptyIndex] = page;
      } else {
        // Find page in frames that is used furthest in the future (or never)
        let victimPage = frames[0]!;
        let maxFutureIndex = -1;

        for (const f of frames) {
          if (f === null) continue;
          let nextUse = -1;
          for (let j = i + 1; j < referenceString.length; j++) {
            if (referenceString[j] === f) {
              nextUse = j;
              break;
            }
          }

          if (nextUse === -1) {
            // Never used again in future! Optimal choice.
            victimPage = f;
            break;
          }

          if (nextUse > maxFutureIndex) {
            maxFutureIndex = nextUse;
            victimPage = f;
          }
        }

        evictedPage = victimPage;
        const replaceIndex = frames.indexOf(evictedPage);
        frames[replaceIndex] = page;
      }
    }

    steps.push({
      step: i + 1,
      page,
      frames: [...frames],
      isFault: !isHit,
      evictedPage,
    });
  }

  return {
    algorithm: "OPTIMAL",
    numFrames,
    referenceString,
    steps,
    totalPageFaults: totalFaults,
    totalPageHits: totalHits,
    faultRatio: Math.round((totalFaults / referenceString.length) * 1000) / 10,
    hitRatio: Math.round((totalHits / referenceString.length) * 1000) / 10,
  };
}

// Belady's Anomaly Test
export function checkBeladysAnomaly(
  referenceString: number[],
  smallerFrames: number,
  largerFrames: number
): {
  isAnomaly: boolean;
  smallerFaults: number;
  largerFaults: number;
  explanation: string;
} {
  const smaller = runFIFO(referenceString, smallerFrames);
  const larger = runFIFO(referenceString, largerFrames);

  const isAnomaly = larger.totalPageFaults > smaller.totalPageFaults;
  return {
    isAnomaly,
    smallerFaults: smaller.totalPageFaults,
    largerFaults: larger.totalPageFaults,
    explanation: isAnomaly
      ? `Bélády's Anomaly Confirmed: Increasing frame capacity from ${smallerFrames} to ${largerFrames} increased total page faults from ${smaller.totalPageFaults} to ${larger.totalPageFaults}!`
      : `No anomaly detected: Frame size ${largerFrames} yielded ${larger.totalPageFaults} faults (<= ${smaller.totalPageFaults} faults with ${smallerFrames} frames).`,
  };
}

