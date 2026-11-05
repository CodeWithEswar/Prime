# PRIME — OOP with Java Simulation Correctness & Invariants

This document specifies the exact algorithmic rules and invariants enforced across all 10 OOP Concept Laboratories in `domain/oop/simulators/`.

---

## 1. Class & Object Explorer (`class-object.ts`)
- **Instance State Isolation:** Multiple instances instantiated from the identical class blueprint maintain independent heap state. Mutating `instanceA.field` must not alter `instanceB.field`.
- **Constructor Invariants:** Constructor parameters undergo validation (e.g., non-null name, valid roll number, $0.0 \le \text{gpa} \le 4.0$). Invalid parameters reject object instantiation.

---

## 2. Object Lifecycle & References (`object-lifecycle.ts`)
- **Pointer Aliasing:** Reference assignment (`Student b = a;`) copies the 64-bit reference address, NOT the underlying heap object. Both references point to the exact same heap memory block.
- **Reachability & Non-Deterministic GC:** An object becomes eligible for Garbage Collection when no reference path exists from any active stack frame (GC roots). The laboratory makes it explicit that JVM Garbage Collection is non-deterministic; eligibility does not imply immediate destruction.

---

## 3. Inheritance Tree Builder (`inheritance.ts`)
- **Single Superclass Invariant:** In Java, a class can have at most one direct superclass (`extends Class`). Multiple class inheritance is rejected with a compile error.
- **Cycle Prohibition:** Directed acyclic graph requirement. Any cyclic inheritance (e.g., $A \rightarrow B \rightarrow A$) throws an error.
- **Constructor Chaining:** Every subclass constructor implicitly or explicitly begins with `super()` before instance initialization, terminating at `java.lang.Object`.

---

## 4. Polymorphism Dispatch Simulator (`dispatch.ts`)
- **Virtual Method Dispatch:** When invoking an instance method on a reference `Parent p = new Child()`, the method invoked is determined at runtime by the actual object type on the heap.
- **Compile-Time Legality:** The compiler checks whether the method is declared in the reference type (`Parent`). If the method only exists in `Child`, the call fails compile-time typechecking.
- **Static Method Hiding:** Static methods are resolved at compile time based on the reference type; they are hidden, NOT overridden.

---

## 5. Encapsulation Boundary (`encapsulation.ts`)
- **Private Invariant Defense:** Direct field access is restricted. Public mutators validate business rules (e.g., $\text{deposit} > 0$, $\text{balance} - \text{withdrawal} \ge -\text{overdraftLimit}$).
- **Immutable Variant:** An immutable class guarantees fields are `private final` with no mutators; modifications return a newly allocated instance.

---

## 6. Abstract Class vs Interface (`interface.ts`)
- **State Invariant:** Interfaces cannot declare mutable instance state (only `public static final` constants). Abstract classes may have mutable instance fields and constructors.
- **Implementation Invariant:** A class can implement multiple interfaces (`implements A, B, C`), but can extend only one abstract class.
- **Default Methods:** Interfaces support `default` and `static` methods. Clashing default methods require explicit override in the implementing class.

---

## 7. Access Modifier Matrix (`access.ts`)
- **4 Levels:** `public` (anywhere), `protected` (package + subclasses), `default` (package-private), `private` (same class).
- **Protected Receiver Nuance (JLS §6.6.2):** A subclass in a foreign package can access a protected member of its superclass *only* through an expression of its own class type (or a subtype of it), never through an arbitrary superclass reference.

---

## 8. Java Memory & Equality (`equality.ts`)
- **Identity vs Logical Equality:** `==` tests bitwise equality for primitives and memory address identity for references. `.equals()` tests semantic equivalence.
- **HashCode Contract:** If `a.equals(b)` is true, then `a.hashCode() == b.hashCode()`.
- **Mutable Key Hazard:** Mutating an object's fields after using it as a HashMap key changes its hash code, orphaning the entry in its original hash bucket.

---

## 9. SOLID Refactoring Studio (`solid.ts`)
- **SRP:** Split responsibilities into single-reason-to-change modules.
- **OCP:** Open for extension, closed for modification via polymorphic interfaces.
- **LSP:** Subtypes must be substitutable for base types without breaking caller invariants.
- **ISP:** Clients should not be forced to depend on methods they do not use.
- **DIP:** High-level modules depend on abstractions, not concrete low-level details.

---

## 10. Design Pattern Explorer (`patterns.ts`)
- **Factory Method:** Encapsulates object creation behind an interface.
- **Strategy:** Decouples interchangeable algorithms from the execution context.
- **Observer:** Publisher/Subscriber pattern for event notifications.
- **Builder:** Step-by-step construction of complex immutable objects.
- **Singleton:** Thread-safe instance restriction via double-checked locking or bill pugh holder.

