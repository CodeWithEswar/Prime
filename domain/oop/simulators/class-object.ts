/**
 * Laboratory 1: Class & Object Explorer
 * Invariant: Instance state isolation and constructor validation.
 */

export interface StudentInstance {
  id: string;
  name: string;
  rollNumber: number;
  gpa: number;
  memoryAddress: string;
}

export interface ClassBlueprint {
  className: string;
  fields: Array<{ name: string; type: string; access: string }>;
  methods: Array<{ name: string; returnType: string; access: string; parameters: string[] }>;
}

export const STUDENT_BLUEPRINT: ClassBlueprint = {
  className: "Student",
  fields: [
    { name: "name", type: "String", access: "private" },
    { name: "rollNumber", type: "int", access: "private" },
    { name: "gpa", type: "double", access: "private" },
  ],
  methods: [
    { name: "Student", returnType: "void", access: "public", parameters: ["String name", "int roll", "double gpa"] },
    { name: "displayInfo", returnType: "void", access: "public", parameters: [] },
    { name: "updateGpa", returnType: "void", access: "public", parameters: ["double newGpa"] },
  ],
};

export function instantiateStudent(
  name: string,
  rollNumber: number,
  gpa: number
): { success: boolean; instance?: StudentInstance; error?: string } {
  const trimmed = name.trim();
  if (!trimmed) {
    return { success: false, error: "Constructor validation error: Student name cannot be empty." };
  }
  if (!Number.isInteger(rollNumber) || rollNumber <= 0) {
    return { success: false, error: "Constructor validation error: Roll number must be a positive integer." };
  }
  if (isNaN(gpa) || gpa < 0.0 || gpa > 4.0) {
    return { success: false, error: "Constructor validation error: GPA must be between 0.0 and 4.0." };
  }

  const randomHex = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0");
  const instance: StudentInstance = {
    id: `student-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: trimmed,
    rollNumber,
    gpa: Math.round(gpa * 100) / 100,
    memoryAddress: `0x7f${randomHex}`,
  };

  return { success: true, instance };
}

export function updateInstanceGpa(
  instances: StudentInstance[],
  targetId: string,
  newGpa: number
): { instances: StudentInstance[]; success: boolean; error?: string } {
  if (isNaN(newGpa) || newGpa < 0.0 || newGpa > 4.0) {
    return { instances, success: false, error: "Validation error: GPA must be between 0.0 and 4.0." };
  }

  let found = false;
  const updated = instances.map((inst) => {
    if (inst.id === targetId) {
      found = true;
      return { ...inst, gpa: Math.round(newGpa * 100) / 100 };
    }
    return inst;
  });

  if (!found) {
    return { instances, success: false, error: `Instance with ID ${targetId} not found.` };
  }

  return { instances: updated, success: true };
}

