/**
 * PRIME — TCP Handshake & Connection Teardown State Machine Simulator
 */

import type { TCPHandshakeStep } from "../types";

export function simulateTCPHandshake(clientISN = 1000, serverISN = 5000): TCPHandshakeStep[] {
  const steps: TCPHandshakeStep[] = [
    {
      step: 1,
      sender: "client",
      receiver: "server",
      flags: { SYN: true },
      seq: clientISN,
      ack: 0,
      clientState: "SYN_SENT",
      serverState: "LISTEN",
      explanation: `Client initiates connection by sending SYN packet with Initial Sequence Number (ISN) = ${clientISN}. Client enters SYN_SENT state.`,
    },
    {
      step: 2,
      sender: "server",
      receiver: "client",
      flags: { SYN: true, ACK: true },
      seq: serverISN,
      ack: clientISN + 1,
      clientState: "SYN_SENT",
      serverState: "SYN_RECEIVED",
      explanation: `Server responds with SYN-ACK packet, choosing its own ISN = ${serverISN} and acknowledging Client ISN + 1 (${clientISN + 1}). Server enters SYN_RECEIVED state.`,
    },
    {
      step: 3,
      sender: "client",
      receiver: "server",
      flags: { ACK: true },
      seq: clientISN + 1,
      ack: serverISN + 1,
      clientState: "ESTABLISHED",
      serverState: "ESTABLISHED",
      explanation: `Client acknowledges Server SYN with ACK (${serverISN + 1}). Both endpoints enter ESTABLISHED state. Full-duplex data transfer may now begin.`,
    },
  ];

  return steps;
}

export function simulateTCPTeardown(clientSeq = 2000, serverSeq = 7000): TCPHandshakeStep[] {
  return [
    {
      step: 1,
      sender: "client",
      receiver: "server",
      flags: { FIN: true, ACK: true },
      seq: clientSeq,
      ack: serverSeq,
      clientState: "FIN_WAIT_1",
      serverState: "ESTABLISHED",
      explanation: `Active close: Client issues close(), sending FIN packet with Seq=${clientSeq}. Client enters FIN_WAIT_1 state.`,
    },
    {
      step: 2,
      sender: "server",
      receiver: "client",
      flags: { ACK: true },
      seq: serverSeq,
      ack: clientSeq + 1,
      clientState: "FIN_WAIT_2",
      serverState: "CLOSE_WAIT",
      explanation: `Server acknowledges Client FIN with ACK=${clientSeq + 1}. Server enters CLOSE_WAIT state (informs application). Client enters FIN_WAIT_2.`,
    },
    {
      step: 3,
      sender: "server",
      receiver: "client",
      flags: { FIN: true, ACK: true },
      seq: serverSeq,
      ack: clientSeq + 1,
      clientState: "FIN_WAIT_2",
      serverState: "LAST_ACK",
      explanation: `Passive close: Server application finishes flushing remaining buffer and issues close(), sending FIN packet. Server enters LAST_ACK.`,
    },
    {
      step: 4,
      sender: "client",
      receiver: "server",
      flags: { ACK: true },
      seq: clientSeq + 1,
      ack: serverSeq + 1,
      clientState: "TIME_WAIT",
      serverState: "CLOSED",
      explanation: `Client sends final ACK=${serverSeq + 1} and enters TIME_WAIT state for 2*MSL (Maximum Segment Lifetime, ~60-120s) to guarantee server received ACK and absorb delayed stray packets. Server transitions to CLOSED.`,
    },
  ];
}

