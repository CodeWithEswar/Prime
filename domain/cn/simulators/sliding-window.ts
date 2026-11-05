/**
 * PRIME — ARQ / Sliding Window Protocol Simulation Engine
 *
 * Models Stop-and-Wait, Go-Back-N, and Selective Repeat
 * with simulated packet loss, ACK loss, and retransmissions.
 */

import type { ARQPacketEvent, ARQProtocolType, ARQSimulationResult } from "../types";

export function simulateSlidingWindow(
  protocol: ARQProtocolType,
  totalPackets = 6,
  windowSize = 4,
  simulatedLostPacketSeq = 2
): ARQSimulationResult {
  const trace: ARQPacketEvent[] = [];
  const effectiveWindowSize = protocol === "STOP_AND_WAIT" ? 1 : Math.max(1, windowSize);

  let currentStep = 1;
  let base = 0;
  let totalTransmissions = 0;

  if (protocol === "STOP_AND_WAIT") {
    for (let seq = 0; seq < totalPackets; seq++) {
      totalTransmissions++;
      trace.push({
        step: currentStep++,
        type: "SEND",
        packetSeq: seq,
        senderWindow: [seq, seq],
        receiverWindow: [seq, seq],
        description: `Sender transmits Packet #${seq}. Timer started.`,
      });

      if (seq === simulatedLostPacketSeq) {
        trace.push({
          step: currentStep++,
          type: "LOST_PACKET",
          packetSeq: seq,
          senderWindow: [seq, seq],
          receiverWindow: [seq, seq],
          description: `Packet #${seq} dropped in transit due to network loss/noise!`,
        });

        trace.push({
          step: currentStep++,
          type: "TIMEOUT_RETRANSMIT",
          packetSeq: seq,
          senderWindow: [seq, seq],
          receiverWindow: [seq, seq],
          description: `Timer expired for Packet #${seq}. Retransmitting Packet #${seq}.`,
        });
        totalTransmissions++;
      }

      trace.push({
        step: currentStep++,
        type: "ACK",
        packetSeq: seq,
        senderWindow: [seq, seq],
        receiverWindow: [seq + 1, seq + 1],
        description: `Receiver receives Packet #${seq} and sends ACK #${seq + 1}. Window slides forward.`,
      });
    }
  } else if (protocol === "GO_BACK_N") {
    // GBN sends burst up to windowSize
    let nextSeqNum = 0;
    let didLose = false;
    let hasDroppedInitial = false;

    while (base < totalPackets) {
      // Send available in window
      while (nextSeqNum < base + effectiveWindowSize && nextSeqNum < totalPackets) {
        totalTransmissions++;
        const isLost = nextSeqNum === simulatedLostPacketSeq && !hasDroppedInitial;

        trace.push({
          step: currentStep++,
          type: isLost ? "LOST_PACKET" : "SEND",
          packetSeq: nextSeqNum,
          senderWindow: [base, Math.min(totalPackets - 1, base + effectiveWindowSize - 1)],
          receiverWindow: [base, base],
          description: isLost
            ? `Packet #${nextSeqNum} is transmitted but DROPPED by switch/router buffer overflow!`
            : `Sender transmits Packet #${nextSeqNum} [Window: ${base}..${Math.min(
                totalPackets - 1,
                base + effectiveWindowSize - 1
              )}].`,
        });

        if (isLost) {
          didLose = true;
          hasDroppedInitial = true;
        }
        nextSeqNum++;
      }

      if (didLose && base === simulatedLostPacketSeq) {
        trace.push({
          step: currentStep++,
          type: "TIMEOUT_RETRANSMIT",
          packetSeq: simulatedLostPacketSeq,
          senderWindow: [base, Math.min(totalPackets - 1, base + effectiveWindowSize - 1)],
          receiverWindow: [base, base],
          description: `Timer expired for unacknowledged Packet #${base}. GBN rule: GO BACK and retransmit ALL in-flight packets [${base}..${nextSeqNum - 1}]!`,
        });
        nextSeqNum = base; // Go back to base!
        didLose = false; // Resolved for retransmission
      } else {
        trace.push({
          step: currentStep++,
          type: "ACK",
          packetSeq: base,
          senderWindow: [base + 1, Math.min(totalPackets - 1, base + effectiveWindowSize)],
          receiverWindow: [base + 1, base + 1],
          description: `Cumulative ACK #${base + 1} received. Sender base advances to ${base + 1}.`,
        });
        base++;
      }
    }
  } else {
    // SELECTIVE REPEAT (SR)
    let nextSeqNum = 0;
    const received = new Set<number>();
    let lostOnce = false;

    while (base < totalPackets) {
      while (nextSeqNum < base + effectiveWindowSize && nextSeqNum < totalPackets) {
        totalTransmissions++;
        const isLost = nextSeqNum === simulatedLostPacketSeq && !lostOnce;

        trace.push({
          step: currentStep++,
          type: isLost ? "LOST_PACKET" : "SEND",
          packetSeq: nextSeqNum,
          senderWindow: [base, Math.min(totalPackets - 1, base + effectiveWindowSize - 1)],
          receiverWindow: [base, Math.min(totalPackets - 1, base + effectiveWindowSize - 1)],
          description: isLost
            ? `Packet #${nextSeqNum} is LOST in transit!`
            : `Sender transmits Packet #${nextSeqNum}.`,
        });

        if (isLost) {
          lostOnce = true;
        } else {
          received.add(nextSeqNum);
          trace.push({
            step: currentStep++,
            type: "ACK",
            packetSeq: nextSeqNum,
            senderWindow: [base, Math.min(totalPackets - 1, base + effectiveWindowSize - 1)],
            receiverWindow: [base, Math.min(totalPackets - 1, base + effectiveWindowSize - 1)],
            description: `Receiver sends INDEPENDENT ACK #${nextSeqNum}. Buffered at receiver.`,
          });
        }
        nextSeqNum++;
      }

      if (lostOnce && !received.has(simulatedLostPacketSeq)) {
        trace.push({
          step: currentStep++,
          type: "TIMEOUT_RETRANSMIT",
          packetSeq: simulatedLostPacketSeq,
          senderWindow: [base, Math.min(totalPackets - 1, base + effectiveWindowSize - 1)],
          receiverWindow: [base, Math.min(totalPackets - 1, base + effectiveWindowSize - 1)],
          description: `Selective Repeat: ONLY lost Packet #${simulatedLostPacketSeq} is retransmitted! Already buffered packets are preserved.`,
        });
        totalTransmissions++;
        received.add(simulatedLostPacketSeq);
      }

      while (received.has(base)) {
        base++;
      }
    }
  }

  const efficiency = Math.round((totalPackets / totalTransmissions) * 100);

  return {
    protocol,
    windowSize: effectiveWindowSize,
    totalPackets,
    trace,
    efficiencyPercentage: efficiency,
  };
}
