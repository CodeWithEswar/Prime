export const fundamentalsCourses = {
  dbms: {
    label: "DBMS",
    title: "Database Management Systems",
    description: "Relational databases, SQL, normalization, and transactions.",
    difficulty: "Medium",
  },
  os: {
    label: "OS",
    title: "Operating Systems",
    description: "Processes, scheduling, synchronization, memory, and storage.",
    difficulty: "Hard",
  },
  cn: {
    label: "CN",
    title: "Computer Networks",
    description:
      "Network layers, routing, transport protocols, and application protocols.",
    difficulty: "Hard",
  },
  oop: {
    label: "OOP",
    title: "Object-Oriented Programming with Java",
    description: "Object-oriented design, Java language concepts, and design practice.",
    difficulty: "Hard",
  },
} as const;

export type FundamentalsCourse = keyof typeof fundamentalsCourses;

export function isFundamentalsCourse(value: unknown): value is FundamentalsCourse {
  return typeof value === "string" && Object.hasOwn(fundamentalsCourses, value);
}
