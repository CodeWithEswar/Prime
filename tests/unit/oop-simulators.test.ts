import { describe, it, expect } from "vitest";
import {
  instantiateStudent,
  updateInstanceGpa,
  createInitialLifecycleState,
  allocateNewHeapObject,
  aliasReference,
  nullifyReference,
  validateInheritance,
  traceConstructorChain,
  resolveMemberResolution,
  simulateMethodInvocation,
  createEncapsulatedAccount,
  executeDeposit,
  executeWithdraw,
  simulateDirectFieldCorruption,
  evaluateDiamondResolution,
  evaluateAccess,
  compareObjects,
  createInitialHashMapSimulation,
  mutateHashMapKey,
  SOLID_SCENARIOS,
  DESIGN_PATTERNS,
  INITIAL_HIERARCHY,
  type MemoryObject,
} from "@/domain/oop";

describe("OOP Laboratory Simulators — Invariants & Correctness", () => {
  describe("Lab 1: Class & Object Explorer", () => {
    it("enforces constructor validation invariants", () => {
      const invalidName = instantiateStudent("", 101, 3.5);
      expect(invalidName.success).toBe(false);
      expect(invalidName.error).toContain("name cannot be empty");

      const invalidRoll = instantiateStudent("Alice", -5, 3.5);
      expect(invalidRoll.success).toBe(false);
      expect(invalidRoll.error).toContain("positive integer");

      const invalidGpa = instantiateStudent("Alice", 101, 4.5);
      expect(invalidGpa.success).toBe(false);
      expect(invalidGpa.error).toContain("between 0.0 and 4.0");

      const valid = instantiateStudent("Alice", 101, 3.8);
      expect(valid.success).toBe(true);
      expect(valid.instance?.name).toBe("Alice");
      expect(valid.instance?.memoryAddress).toMatch(/^0x7f/);
    });

    it("verifies instance state isolation", () => {
      const instA = instantiateStudent("Alice", 101, 3.5).instance!;
      const instB = instantiateStudent("Bob", 102, 3.2).instance!;

      const updated = updateInstanceGpa([instA, instB], instA.id, 3.9);
      expect(updated.success).toBe(true);

      const targetA = updated.instances.find((i) => i.id === instA.id);
      const targetB = updated.instances.find((i) => i.id === instB.id);

      expect(targetA?.gpa).toBe(3.9);
      expect(targetB?.gpa).toBe(3.2); // Unchanged!
    });
  });

  describe("Lab 2: Object Lifecycle & References", () => {
    it("traces reference aliasing and pointer copying", () => {
      let initial = createInitialLifecycleState();
      initial = allocateNewHeapObject(initial, "refC", "Car", { make: "Tesla" });
      expect(initial.heap.length).toBe(2);

      const aliased = aliasReference(initial, "refA", "refB");

      const varA = aliased.stack.find((s) => s.name === "refA");
      const varB = aliased.stack.find((s) => s.name === "refB");

      expect(varA?.pointsToHeapId).not.toBeNull();
      expect(varB?.pointsToHeapId).toBe(varA?.pointsToHeapId);
    });

    it("marks unreachable heap objects as GC eligible", () => {
      let state = createInitialLifecycleState();
      // Initially, refA points to obj-1; obj-1 is NOT GC eligible
      expect(state.heap[0].gcEligible).toBe(false);

      // Nullify refA
      state = nullifyReference(state, "refA");
      expect(state.heap[0].gcEligible).toBe(true);
    });
  });

  describe("Lab 3: Inheritance Tree Builder", () => {
    it("enforces acyclic directed hierarchy and rejects cycles", () => {
      const valid = validateInheritance(INITIAL_HIERARCHY, "ElectricCar", "Car");
      expect(valid.valid).toBe(true);

      // Attempting to have Vehicle extend ElectricCar creates an illegal cycle!
      const cycle = validateInheritance(INITIAL_HIERARCHY, "Vehicle", "ElectricCar");
      expect(cycle.valid).toBe(false);
      expect(cycle.error).toContain("Cycle detected");
    });

    it("traces constructor chaining to root Object", () => {
      const chain = traceConstructorChain(INITIAL_HIERARCHY, "ElectricCar");
      expect(chain[0]).toBe("Object() constructor");
      expect(chain[chain.length - 1]).toBe("ElectricCar() constructor");
    });

    it("correctly tracks method overriding vs inheritance", () => {
      const startRes = resolveMemberResolution(INITIAL_HIERARCHY, "ElectricCar", "start()");
      expect(startRes?.resolvedIn).toBe("ElectricCar");

      const toStringRes = resolveMemberResolution(INITIAL_HIERARCHY, "ElectricCar", "toString()");
      expect(toStringRes?.resolvedIn).toBe("Vehicle");
    });
  });

  describe("Lab 4: Polymorphism Dispatch Simulator", () => {
    it("dispatches virtual methods dynamically based on runtime heap instance", () => {
      const res = simulateMethodInvocation("PaymentMethod", "UpiPayment", "process(amount)");
      expect(res.compilationSuccess).toBe(true);
      expect(res.dispatchType).toBe("dynamic_virtual");
      expect(res.resolvedClass).toBe("UpiPayment");
      expect(res.executedOutput).toContain("UpiPayment");
    });

    it("fails compilation if method is not declared in reference type", () => {
      const res = simulateMethodInvocation("PaymentMethod", "UpiPayment", "generateQrCode()");
      expect(res.compilationSuccess).toBe(false);
      expect(res.compileErrorMessage).toContain("cannot find symbol");
    });

    it("binds static methods at compile time (Static Method Hiding)", () => {
      const res = simulateMethodInvocation("PaymentMethod", "CardPayment", "getGatewayName()");
      expect(res.compilationSuccess).toBe(true);
      expect(res.dispatchType).toBe("static_hidden");
      expect(res.resolvedClass).toBe("PaymentMethod");
    });
  });

  describe("Lab 5: Encapsulation Boundary", () => {
    it("guards deposits and withdrawals against negative invariants", () => {
      const acc = createEncapsulatedAccount(1000);

      const invalidDeposit = executeDeposit(acc, -100);
      expect(invalidDeposit.success).toBe(false);
      expect(invalidDeposit.errorMessage).toContain("must be positive");

      const validWithdraw = executeWithdraw(acc, 300);
      expect(validWithdraw.success).toBe(true);
      expect(validWithdraw.account.balance).toBe(700);

      const overdraftExceeded = executeWithdraw(acc, 2000, 200);
      expect(overdraftExceeded.success).toBe(false);
      expect(overdraftExceeded.errorMessage).toContain("Overdraft Exceeded");
    });

    it("detects invariant violations upon direct field writes", () => {
      const acc = createEncapsulatedAccount(500);
      const corrupted = simulateDirectFieldCorruption(acc, -1000);
      expect(corrupted.invariantStatus).toBe("violated");
      expect(corrupted.account.balance).toBe(-1000);
    });
  });

  describe("Lab 6: Abstract Class vs Interface", () => {
    it("requires explicit override for clashing default methods", () => {
      const noRes = evaluateDiamondResolution({
        leftInterface: "AudioPlayer",
        rightInterface: "VideoPlayer",
        methodSignature: "play()",
        resolutionChoice: "no_resolution",
      });
      expect(noRes.compiles).toBe(false);
      expect(noRes.explanation).toContain("inherits unrelated defaults");

      const delegateLeft = evaluateDiamondResolution({
        leftInterface: "AudioPlayer",
        rightInterface: "VideoPlayer",
        methodSignature: "play()",
        resolutionChoice: "delegate_left",
      });
      expect(delegateLeft.compiles).toBe(true);
      expect(delegateLeft.generatedCode).toContain("AudioPlayer.super.play()");
    });
  });

  describe("Lab 7: Access Modifier Matrix", () => {
    it("evaluates public, package-private, and private scopes", () => {
      expect(evaluateAccess("public", "diff_package_unrelated").allowed).toBe(true);
      expect(evaluateAccess("default", "diff_package_subclass").allowed).toBe(false);
      expect(evaluateAccess("private", "same_package").allowed).toBe(false);
      expect(evaluateAccess("private", "same_class").allowed).toBe(true);
    });

    it("enforces JLS §6.6.2 Protected Receiver Rule", () => {
      // Accessing protected member via own subtype reference is allowed
      const allowed = evaluateAccess("protected", "diff_package_subclass", true);
      expect(allowed.allowed).toBe(true);

      // Accessing protected member via arbitrary superclass reference is rejected!
      const rejected = evaluateAccess("protected", "diff_package_subclass", false);
      expect(rejected.allowed).toBe(false);
      expect(rejected.explanation).toContain("Protected Receiver Rule");
    });
  });

  describe("Lab 8: Java Memory & Equality", () => {
    it("distinguishes == identity from .equals() value equivalence", () => {
      const obj1: MemoryObject = {
        id: "1",
        className: "Student",
        fields: { id: 10, name: "Sam" },
        memoryAddress: "0x7f01",
      };
      const obj2: MemoryObject = {
        id: "2",
        className: "Student",
        fields: { id: 10, name: "Sam" },
        memoryAddress: "0x7f02",
      };

      const res = compareObjects(obj1, obj2);
      expect(res.doubleEqualsResult).toBe(false); // Distinct memory addresses
      expect(res.equalsMethodResult).toBe(true); // Same content
      expect(res.hashCodeContractSatisfied).toBe(true); // Same hash
    });

    it("simulates the mutable HashMap key trap", () => {
      const initialMap = createInitialHashMapSimulation();
      expect(initialMap.lookupResult).not.toBeNull();

      // Mutate key
      const mutatedMap = mutateHashMapKey(initialMap, 999);
      expect(mutatedMap.isKeyMutated).toBe(true);
      expect(mutatedMap.lookupResult).toBeNull(); // Entry lost!
    });
  });

  describe("Lab 9: SOLID Principles Refactoring", () => {
    it("contains all 5 canonical SOLID scenarios", () => {
      expect(SOLID_SCENARIOS.length).toBe(5);
      const codes = SOLID_SCENARIOS.map((s) => s.shortCode);
      expect(codes).toContain("SRP");
      expect(codes).toContain("OCP");
      expect(codes).toContain("LSP");
      expect(codes).toContain("ISP");
      expect(codes).toContain("DIP");
    });
  });

  describe("Lab 10: Design Pattern Explorer", () => {
    it("contains Factory, Strategy, Observer, Builder, and Singleton patterns", () => {
      expect(DESIGN_PATTERNS["factory"]).toBeDefined();
      expect(DESIGN_PATTERNS["strategy"]).toBeDefined();
      expect(DESIGN_PATTERNS["observer"]).toBeDefined();
      expect(DESIGN_PATTERNS["builder"]).toBeDefined();
      expect(DESIGN_PATTERNS["singleton"]).toBeDefined();
    });
  });
});
