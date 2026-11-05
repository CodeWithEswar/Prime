/**
 * Laboratory 6: Abstract Class vs Interface Comparison Lab
 * Invariants: State capabilities, constructors, multiple implementation, default methods, and diamond problem resolution.
 */

export interface CapabilityComparison {
  feature: string;
  abstractClass: { supported: boolean; note: string };
  interfaceType: { supported: boolean; note: string };
}

export const INTERFACE_VS_ABSTRACT_MATRIX: CapabilityComparison[] = [
  {
    feature: "Mutable Instance Fields",
    abstractClass: { supported: true, note: "Can hold mutable instance state (e.g. private int count)." },
    interfaceType: { supported: false, note: "Fields are implicitly public static final constants only." },
  },
  {
    feature: "Constructors",
    abstractClass: { supported: true, note: "Can define constructors invoked via super() by subclasses." },
    interfaceType: { supported: false, note: "Cannot define constructors; interfaces cannot be instantiated." },
  },
  {
    feature: "Multiple Inheritance of Type",
    abstractClass: { supported: false, note: "Single superclass rule: class can extend only one abstract class." },
    interfaceType: { supported: true, note: "A class can implement multiple interfaces (implements A, B, C)." },
  },
  {
    feature: "Default Method Implementation",
    abstractClass: { supported: true, note: "Can provide full concrete method implementations." },
    interfaceType: { supported: true, note: "Supported since Java 8 via 'default' keyword." },
  },
  {
    feature: "Access Modifiers on Methods",
    abstractClass: { supported: true, note: "Methods can be public, protected, package-private, or private." },
    interfaceType: { supported: false, note: "Abstract/default methods are public. Java 9+ allows private helper methods." },
  },
];

export interface DiamondResolutionScenario {
  leftInterface: string;
  rightInterface: string;
  methodSignature: string;
  resolutionChoice: "override_custom" | "delegate_left" | "delegate_right" | "no_resolution";
}

export function evaluateDiamondResolution(scenario: DiamondResolutionScenario): {
  compiles: boolean;
  generatedCode: string;
  explanation: string;
} {
  if (scenario.resolutionChoice === "no_resolution") {
    return {
      compiles: false,
      generatedCode: `class Service implements ${scenario.leftInterface}, ${scenario.rightInterface} {\n  // No override provided\n}`,
      explanation: `Compile-Time Error: class Service inherits unrelated defaults for ${scenario.methodSignature} from types ${scenario.leftInterface} and ${scenario.rightInterface}. You must explicitly override the method.`,
    };
  }

  if (scenario.resolutionChoice === "delegate_left") {
    return {
      compiles: true,
      generatedCode: `class Service implements ${scenario.leftInterface}, ${scenario.rightInterface} {\n  @Override\n  public void ${scenario.methodSignature} {\n    ${scenario.leftInterface}.super.${scenario.methodSignature};\n  }\n}`,
      explanation: `Resolves conflict by delegating explicitly to ${scenario.leftInterface}'s default implementation.`,
    };
  }

  if (scenario.resolutionChoice === "delegate_right") {
    return {
      compiles: true,
      generatedCode: `class Service implements ${scenario.leftInterface}, ${scenario.rightInterface} {\n  @Override\n  public void ${scenario.methodSignature} {\n    ${scenario.rightInterface}.super.${scenario.methodSignature};\n  }\n}`,
      explanation: `Resolves conflict by delegating explicitly to ${scenario.rightInterface}'s default implementation.`,
    };
  }

  return {
    compiles: true,
    generatedCode: `class Service implements ${scenario.leftInterface}, ${scenario.rightInterface} {\n  @Override\n  public void ${scenario.methodSignature} {\n    System.out.println("Custom unified implementation");\n  }\n}`,
    explanation: "Resolves conflict by providing a completely new overriding implementation in the concrete class.",
  };
}

