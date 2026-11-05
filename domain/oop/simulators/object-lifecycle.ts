/**
 * Laboratory 2: Object Lifecycle & Reference Explorer
 * Invariant: Reference aliasing, pass-by-value, reachability and non-deterministic GC eligibility.
 */

export interface HeapObject {
  id: string;
  label: string;
  memoryAddress: string;
  data: Record<string, string | number>;
  gcEligible: boolean;
}

export interface StackVariable {
  name: string;
  pointsToHeapId: string | null;
}

export interface LifecycleState {
  stack: StackVariable[];
  heap: HeapObject[];
  events: string[];
}

export function createInitialLifecycleState(): LifecycleState {
  return {
    stack: [
      { name: "refA", pointsToHeapId: "obj-1" },
      { name: "refB", pointsToHeapId: null },
      { name: "refC", pointsToHeapId: null },
    ],
    heap: [
      {
        id: "obj-1",
        label: "BankAccount",
        memoryAddress: "0x7f01a4",
        data: { accountNumber: "ACC-101", balance: 500 },
        gcEligible: false,
      },
    ],
    events: ["Initial state: refA points to BankAccount@0x7f01a4 on heap."],
  };
}

export function evaluateReachability(state: LifecycleState): LifecycleState {
  const referencedHeapIds = new Set(
    state.stack
      .map((s) => s.pointsToHeapId)
      .filter((id): id is string => id !== null)
  );

  const updatedHeap = state.heap.map((obj) => ({
    ...obj,
    gcEligible: !referencedHeapIds.has(obj.id),
  }));

  return { ...state, heap: updatedHeap };
}

export function allocateNewHeapObject(
  state: LifecycleState,
  varName: string,
  label: string,
  data: Record<string, string | number>
): LifecycleState {
  const newId = `obj-${Date.now()}-${Math.floor(Math.random() * 100)}`;
  const hex = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");
  const newObj: HeapObject = {
    id: newId,
    label,
    memoryAddress: `0x7f${hex}`,
    data,
    gcEligible: false,
  };

  const updatedStack = state.stack.map((v) =>
    v.name === varName ? { ...v, pointsToHeapId: newId } : v
  );

  const nextState: LifecycleState = {
    stack: updatedStack,
    heap: [...state.heap, newObj],
    events: [
      ...state.events,
      `Allocated new ${label}@${newObj.memoryAddress} on heap; ${varName} assigned to it.`,
    ],
  };

  return evaluateReachability(nextState);
}

export function aliasReference(
  state: LifecycleState,
  sourceVar: string,
  targetVar: string
): LifecycleState {
  const src = state.stack.find((s) => s.name === sourceVar);
  if (!src) return state;

  const updatedStack = state.stack.map((v) =>
    v.name === targetVar ? { ...v, pointsToHeapId: src.pointsToHeapId } : v
  );

  const targetObj = state.heap.find((h) => h.id === src.pointsToHeapId);
  const eventMsg = src.pointsToHeapId
    ? `Aliased: ${targetVar} = ${sourceVar}; both now reference ${targetObj?.memoryAddress || src.pointsToHeapId}.`
    : `${targetVar} = ${sourceVar} (both null).`;

  const nextState: LifecycleState = {
    stack: updatedStack,
    heap: state.heap,
    events: [...state.events, eventMsg],
  };

  return evaluateReachability(nextState);
}

export function nullifyReference(
  state: LifecycleState,
  varName: string
): LifecycleState {
  const prev = state.stack.find((s) => s.name === varName);
  const updatedStack = state.stack.map((v) =>
    v.name === varName ? { ...v, pointsToHeapId: null } : v
  );

  const nextState: LifecycleState = {
    stack: updatedStack,
    heap: state.heap,
    events: [
      ...state.events,
      `${varName} set to null; broke reference to heap object ${prev?.pointsToHeapId || "none"}.`,
    ],
  };

  return evaluateReachability(nextState);
}

