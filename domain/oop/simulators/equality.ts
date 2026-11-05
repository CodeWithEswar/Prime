/**
 * Laboratory 8: Java Memory & Equality Explorer
 * Invariants: == identity vs .equals() equivalence, hashCode contract, and mutable HashMap key corruption.
 */

export interface MemoryObject {
  id: string;
  className: string;
  fields: { id: number; name: string };
  memoryAddress: string;
}

export interface EqualityComparisonResult {
  doubleEqualsResult: boolean;
  equalsMethodResult: boolean;
  leftHashCode: number;
  rightHashCode: number;
  hashCodeContractSatisfied: boolean;
  explanation: string;
}

export function computeJavaHashCode(id: number, name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (31 * h + name.charCodeAt(i)) | 0;
  }
  return ((h + id * 31) | 0) >>> 0;
}

export function compareObjects(
  objA: MemoryObject,
  objB: MemoryObject
): EqualityComparisonResult {
  const isSameAddress = objA.memoryAddress === objB.memoryAddress;
  const isFieldsEqual = objA.fields.id === objB.fields.id && objA.fields.name === objB.fields.name;

  const hashA = computeJavaHashCode(objA.fields.id, objA.fields.name);
  const hashB = computeJavaHashCode(objB.fields.id, objB.fields.name);

  const hashCodeContractSatisfied = !isFieldsEqual || hashA === hashB;

  return {
    doubleEqualsResult: isSameAddress,
    equalsMethodResult: isFieldsEqual,
    leftHashCode: hashA,
    rightHashCode: hashB,
    hashCodeContractSatisfied,
    explanation: isSameAddress
      ? "Both references point to the exact same memory address (identity equality == is true, and equals() is true)."
      : isFieldsEqual
      ? "Different heap objects with identical field content (== is false, but equals() is true). HashCodes match."
      : "Different heap objects with different field content (both == and equals() are false).",
  };
}

export interface HashMapSimulationBucket {
  bucketIndex: number;
  entries: Array<{ originalHash: number; keyId: number; keyName: string; value: string }>;
}

export interface HashMapSimulationState {
  capacity: number;
  buckets: HashMapSimulationBucket[];
  keyObject: { id: number; name: string };
  isKeyMutated: boolean;
  lookupResult: string | null;
  statusMessage: string;
}

export function createInitialHashMapSimulation(): HashMapSimulationState {
  const capacity = 8;
  const initialKey = { id: 101, name: "StudentA" };
  const originalHash = computeJavaHashCode(initialKey.id, initialKey.name);
  const bucketIndex = originalHash % capacity;

  const buckets: HashMapSimulationBucket[] = Array.from({ length: capacity }, (_, i) => ({
    bucketIndex: i,
    entries: [],
  }));

  buckets[bucketIndex].entries.push({
    originalHash,
    keyId: initialKey.id,
    keyName: initialKey.name,
    value: "GPA: 3.95",
  });

  return {
    capacity,
    buckets,
    keyObject: { ...initialKey },
    isKeyMutated: false,
    lookupResult: "GPA: 3.95",
    statusMessage: `Key placed in bucket ${bucketIndex} based on hash ${originalHash}. Lookup succeeds.`,
  };
}

export function mutateHashMapKey(
  state: HashMapSimulationState,
  newId: number
): HashMapSimulationState {
  const updatedKey = { ...state.keyObject, id: newId };
  const newHash = computeJavaHashCode(updatedKey.id, updatedKey.name);
  const newBucketIndex = newHash % state.capacity;

  // Search in new bucket index
  const foundEntry = state.buckets[newBucketIndex].entries.find(
    (e) => e.keyId === updatedKey.id && e.keyName === updatedKey.name
  );

  return {
    ...state,
    keyObject: updatedKey,
    isKeyMutated: true,
    lookupResult: foundEntry ? foundEntry.value : null,
    statusMessage: foundEntry
      ? "Lucky collision: Entry found in new bucket."
      : `Key mutated: id changed to ${newId}. New hash is ${newHash}, directing map.get() to bucket ${newBucketIndex}. The original entry remains orphaned in bucket ${state.buckets.findIndex((b) => b.entries.length > 0)}. Result is NULL!`,
  };
}

