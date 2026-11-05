/**
 * Laboratory 3: Inheritance Tree Builder
 * Invariants: Single superclass rule, acyclic hierarchy, constructor chaining to Object, and composition alternative.
 */

export interface HierarchyClass {
  name: string;
  superClass: string | null; // Single superclass only
  fields: string[];
  methods: string[];
  overriddenMethods: string[];
}

export interface InheritanceValidationResult {
  valid: boolean;
  error?: string;
  chain?: string[];
}

export const INITIAL_HIERARCHY: HierarchyClass[] = [
  {
    name: "Object",
    superClass: null,
    fields: [],
    methods: ["equals(Object)", "hashCode()", "toString()", "getClass()"],
    overriddenMethods: [],
  },
  {
    name: "Vehicle",
    superClass: "Object",
    fields: ["brand", "speed"],
    methods: ["start()", "stop()", "getSpeed()"],
    overriddenMethods: ["toString()"],
  },
  {
    name: "Car",
    superClass: "Vehicle",
    fields: ["numDoors"],
    methods: ["openTrunk()", "start()"],
    overriddenMethods: ["start()"],
  },
  {
    name: "ElectricCar",
    superClass: "Car",
    fields: ["batteryLevel"],
    methods: ["charge()", "start()"],
    overriddenMethods: ["start()"],
  },
];

export function validateInheritance(
  classes: HierarchyClass[],
  childClass: string,
  proposedSuperClass: string
): InheritanceValidationResult {
  if (childClass === proposedSuperClass) {
    return { valid: false, error: `Invalid: Class ${childClass} cannot extend itself.` };
  }

  // Check if proposedSuperClass exists
  const superNode = classes.find((c) => c.name === proposedSuperClass);
  if (!superNode) {
    return { valid: false, error: `Superclass ${proposedSuperClass} does not exist.` };
  }

  // Detect Cycle by traversing upward from proposedSuperClass
  let current: string | null = proposedSuperClass;
  const visited = new Set<string>([childClass]);
  const chain: string[] = [childClass];

  while (current) {
    if (visited.has(current)) {
      return {
        valid: false,
        error: `Cycle detected: Extending ${proposedSuperClass} creates an illegal inheritance cycle involving ${current}.`,
      };
    }
    visited.add(current);
    chain.push(current);

    const node = classes.find((c) => c.name === current);
    current = node?.superClass ?? null;
  }

  return { valid: true, chain: chain.reverse() };
}

export function traceConstructorChain(
  classes: HierarchyClass[],
  className: string
): string[] {
  const chain: string[] = [];
  let current: string | null = className;

  while (current) {
    chain.push(`${current}() constructor`);
    const node = classes.find((c) => c.name === current);
    current = node?.superClass ?? null;
  }

  return chain.reverse();
}

export function resolveMemberResolution(
  classes: HierarchyClass[],
  className: string,
  methodName: string
): { resolvedIn: string; isOverridden: boolean } | null {
  let current: string | null = className;

  while (current) {
    const node = classes.find((c) => c.name === current);
    if (!node) break;

    if (node.methods.includes(methodName) || node.overriddenMethods.includes(methodName)) {
      return {
        resolvedIn: current,
        isOverridden: current !== className,
      };
    }
    current = node.superClass;
  }

  return null;
}

