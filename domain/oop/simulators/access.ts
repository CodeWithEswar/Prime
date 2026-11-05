/**
 * Laboratory 7: Access Modifier Matrix
 * Invariants: Exact Java Language Specification access rules, including protected receiver nuance (JLS §6.6.2).
 */

export type AccessModifier = "public" | "protected" | "default" | "private";

export type AccessScope =
  | "same_class"
  | "same_package"
  | "diff_package_subclass"
  | "diff_package_unrelated";

export interface AccessCheckResult {
  allowed: boolean;
  explanation: string;
  jlsReference: string;
}

export function evaluateAccess(
  modifier: AccessModifier,
  scope: AccessScope,
  receiverIsSubtype = true
): AccessCheckResult {
  // 1. Same Class
  if (scope === "same_class") {
    return {
      allowed: true,
      explanation: `All access levels (public, protected, package-private, and private) are accessible within the declaring class body.`,
      jlsReference: "JLS §6.6.1",
    };
  }

  // 2. Private member in any other scope
  if (modifier === "private") {
    return {
      allowed: false,
      explanation: `Private members have class-private visibility. They are strictly inaccessible outside the enclosing top-level class.`,
      jlsReference: "JLS §6.6.1",
    };
  }

  // 3. Same Package (Non-subclass or subclass)
  if (scope === "same_package") {
    return {
      allowed: true,
      explanation: `Package-private (default), protected, and public members are accessible to all types within the same package.`,
      jlsReference: "JLS §6.6.1",
    };
  }

  // 4. Different Package - Unrelated Class
  if (scope === "diff_package_unrelated") {
    if (modifier === "public") {
      return {
        allowed: true,
        explanation: `Public members are universally accessible across all packages.`,
        jlsReference: "JLS §6.6.1",
      };
    }
    return {
      allowed: false,
      explanation: `${modifier === "protected" ? "Protected" : "Package-private"} members are inaccessible to unrelated classes residing in different packages.`,
      jlsReference: "JLS §6.6.1",
    };
  }

  // 5. Different Package - Subclass (Protected Receiver Nuance)
  if (scope === "diff_package_subclass") {
    if (modifier === "public") {
      return {
        allowed: true,
        explanation: `Public members are accessible from subclasses in any package.`,
        jlsReference: "JLS §6.6.1",
      };
    }
    if (modifier === "default") {
      return {
        allowed: false,
        explanation: `Package-private members are NOT inherited or accessible by subclasses in different packages.`,
        jlsReference: "JLS §6.6.1",
      };
    }
    if (modifier === "protected") {
      // JLS §6.6.2 Protected Receiver Rule
      if (!receiverIsSubtype) {
        return {
          allowed: false,
          explanation: `Protected Receiver Rule (JLS §6.6.2): A subclass in another package can access a protected member of its superclass ONLY through an expression of its own subtype (or a sub-subtype), NEVER through an arbitrary superclass reference.`,
          jlsReference: "JLS §6.6.2",
        };
      }
      return {
        allowed: true,
        explanation: `Protected members are accessible to subclasses in foreign packages when accessed via 'this', 'super', or references of the subclass's own type.`,
        jlsReference: "JLS §6.6.2",
      };
    }
  }

  return { allowed: false, explanation: "Access denied.", jlsReference: "JLS §6.6.1" };
}

