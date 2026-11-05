/**
 * Laboratory 4: Polymorphism Dispatch Simulator
 * Invariants: Declared reference type vs runtime type, dynamic vtable dispatch, compile-time method existence checks, and static method hiding.
 */

export interface ClassMethodDef {
  name: string;
  isStatic: boolean;
  returnType: string;
  outputMessage: string;
}

export interface PolymorphicType {
  name: string;
  parentName: string | null;
  methods: ClassMethodDef[];
}

export const DISPATCH_TYPES: Record<string, PolymorphicType> = {
  PaymentMethod: {
    name: "PaymentMethod",
    parentName: null,
    methods: [
      { name: "process(amount)", isStatic: false, returnType: "boolean", outputMessage: "PaymentMethod.process() -> Generic baseline processing." },
      { name: "cancelTransaction()", isStatic: false, returnType: "void", outputMessage: "PaymentMethod.cancelTransaction() -> Base transaction aborted." },
      { name: "getGatewayName()", isStatic: true, returnType: "String", outputMessage: "PaymentMethod.getGatewayName() [STATIC] -> PRIME Global Gateway" },
    ],
  },
  CardPayment: {
    name: "CardPayment",
    parentName: "PaymentMethod",
    methods: [
      { name: "process(amount)", isStatic: false, returnType: "boolean", outputMessage: "CardPayment.process() -> Charged credit card via Visa/Mastercard network." },
      { name: "cancelTransaction()", isStatic: false, returnType: "void", outputMessage: "CardPayment.cancelTransaction() -> Card pre-authorization reversed." },
      { name: "verifyCvv()", isStatic: false, returnType: "boolean", outputMessage: "CardPayment.verifyCvv() -> CVV verified with cardholder bank." },
      { name: "getGatewayName()", isStatic: true, returnType: "String", outputMessage: "CardPayment.getGatewayName() [STATIC HIDDEN] -> CardNet-Processor" },
    ],
  },
  UpiPayment: {
    name: "UpiPayment",
    parentName: "PaymentMethod",
    methods: [
      { name: "process(amount)", isStatic: false, returnType: "boolean", outputMessage: "UpiPayment.process() -> Instant VPA debit processed via NPCI switch." },
      { name: "cancelTransaction()", isStatic: false, returnType: "void", outputMessage: "UpiPayment.cancelTransaction() -> UPI mandate cancelled." },
      { name: "generateQrCode()", isStatic: false, returnType: "String", outputMessage: "UpiPayment.generateQrCode() -> Dynamic BharatQR rendered." },
      { name: "getGatewayName()", isStatic: true, returnType: "String", outputMessage: "UpiPayment.getGatewayName() [STATIC HIDDEN] -> UPI-Switch-Gateway" },
    ],
  },
};

export interface DispatchExecutionResult {
  compilationSuccess: boolean;
  compileErrorMessage?: string;
  dispatchType?: "dynamic_virtual" | "static_hidden" | "inherited_base";
  resolvedClass?: string;
  executedOutput?: string;
  explanation: string;
}

export function simulateMethodInvocation(
  referenceType: string,
  runtimeType: string,
  methodCall: string
): DispatchExecutionResult {
  const refDef = DISPATCH_TYPES[referenceType];
  const runDef = DISPATCH_TYPES[runtimeType];

  if (!refDef || !runDef) {
    return {
      compilationSuccess: false,
      compileErrorMessage: `Type resolution error: Unknown type '${!refDef ? referenceType : runtimeType}'.`,
      explanation: "Class types must exist in the class loader namespace.",
    };
  }

  // 1. Compile-Time Check: Method MUST exist in declared reference type (or its superclasses)
  let refMethod = refDef.methods.find((m) => m.name === methodCall);
  if (!refMethod && refDef.parentName) {
    const parentDef = DISPATCH_TYPES[refDef.parentName];
    refMethod = parentDef?.methods.find((m) => m.name === methodCall);
  }

  if (!refMethod) {
    return {
      compilationSuccess: false,
      compileErrorMessage: `Compile-Time Error: cannot find symbol\n  symbol:   method ${methodCall}\n  location: variable of type ${referenceType}`,
      explanation: `The compiler inspects only the declared reference type (${referenceType}). Because '${methodCall}' is not declared in ${referenceType}, compilation fails—even though the runtime object (${runtimeType}) might implement it.`,
    };
  }

  // 2. Static Method Hiding: Static methods bind at compile time to declared reference type!
  if (refMethod.isStatic) {
    return {
      compilationSuccess: true,
      dispatchType: "static_hidden",
      resolvedClass: referenceType,
      executedOutput: refMethod.outputMessage,
      explanation: `Static methods are resolved at compile time based on the declared reference type (${referenceType}). Static method hiding occurs rather than virtual dynamic dispatch.`,
    };
  }

  // 3. Virtual Dynamic Method Dispatch: JVM looks at actual object on heap at runtime
  const overriddenInRuntime = runDef.methods.find((m) => m.name === methodCall);
  if (overriddenInRuntime) {
    return {
      compilationSuccess: true,
      dispatchType: "dynamic_virtual",
      resolvedClass: runtimeType,
      executedOutput: overriddenInRuntime.outputMessage,
      explanation: `Dynamic Method Dispatch: The JVM inspects the vtable of the concrete heap instance (${runtimeType}) at runtime and dispatches to the overridden method.`,
    };
  }

  // Fallback to inherited method if runtime class did not override it
  return {
    compilationSuccess: true,
    dispatchType: "inherited_base",
    resolvedClass: referenceType,
    executedOutput: refMethod.outputMessage,
    explanation: `The runtime class (${runtimeType}) does not override '${methodCall}', so the JVM traverses the inheritance hierarchy and invokes the inherited superclass method.`,
  };
}

