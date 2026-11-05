import fs from "fs";
import path from "path";

const PRIMARY_PLAYLIST_ID = "PL9gnSGHSqcno1G3XjUbwzXHL8_EttOuKk";

// 1. Primary 7 Kunal Kushwaha Lectures
const primaryLectures = [
  {
    order: 1,
    youtubeVideoId: "BSVKUk58K6U",
    title: "Introduction to OOP, Classes, Objects, Constructors, Keywords in Java",
    canonicalWatchUrl: "https://www.youtube.com/watch?v=BSVKUk58K6U",
    playlistContextUrl: `https://www.youtube.com/watch?v=BSVKUk58K6U&list=${PRIMARY_PLAYLIST_ID}&index=1`,
    channelTitle: "Kunal Kushwaha",
    durationSeconds: 7320,
    assignedDays: [1, 2],
    topicIds: ["classes", "objects", "constructors", "this-keyword", "memory-allocation", "garbage-collection"],
    difficulty: "easy",
    interviewImportance: "critical",
    verificationStatus: "verified",
    verifiedAt: "2026-11-04T12:00:00Z",
    sourceProvenance: "instructor_syllabus"
  },
  {
    order: 2,
    youtubeVideoId: "_Ya6CN13t8k",
    title: "Packages, Static, Singleton Class, In-built Methods in Java",
    canonicalWatchUrl: "https://www.youtube.com/watch?v=_Ya6CN13t8k",
    playlistContextUrl: `https://www.youtube.com/watch?v=_Ya6CN13t8k&list=${PRIMARY_PLAYLIST_ID}&index=2`,
    channelTitle: "Kunal Kushwaha",
    durationSeconds: 5240,
    assignedDays: [3],
    topicIds: ["packages", "static-members", "singleton-pattern", "initialization-blocks"],
    difficulty: "medium",
    interviewImportance: "high",
    verificationStatus: "verified",
    verifiedAt: "2026-11-04T12:00:00Z",
    sourceProvenance: "instructor_syllabus"
  },
  {
    order: 3,
    youtubeVideoId: "46T2wD3IuhM",
    title: "Principles of OOP: Inheritance, Polymorphism, Encapsulation, Abstraction",
    canonicalWatchUrl: "https://www.youtube.com/watch?v=46T2wD3IuhM",
    playlistContextUrl: `https://www.youtube.com/watch?v=46T2wD3IuhM&list=${PRIMARY_PLAYLIST_ID}&index=3`,
    channelTitle: "Kunal Kushwaha",
    durationSeconds: 7860,
    assignedDays: [4, 5, 6],
    topicIds: ["inheritance", "polymorphism", "encapsulation", "abstraction", "overloading", "overriding", "super-keyword"],
    difficulty: "hard",
    interviewImportance: "critical",
    verificationStatus: "verified",
    verifiedAt: "2026-11-04T12:00:00Z",
    sourceProvenance: "instructor_syllabus"
  },
  {
    order: 4,
    youtubeVideoId: "W145DXs8fFg",
    title: "Access Control, In-built Packages, Object Class in Java",
    canonicalWatchUrl: "https://www.youtube.com/watch?v=W145DXs8fFg",
    playlistContextUrl: `https://www.youtube.com/watch?v=W145DXs8fFg&list=${PRIMARY_PLAYLIST_ID}&index=4`,
    channelTitle: "Kunal Kushwaha",
    durationSeconds: 3780,
    assignedDays: [7],
    topicIds: ["access-modifiers", "object-class", "equals-hashcode", "tostring", "instanceof"],
    difficulty: "medium",
    interviewImportance: "critical",
    verificationStatus: "verified",
    verifiedAt: "2026-11-04T12:00:00Z",
    sourceProvenance: "instructor_syllabus"
  },
  {
    order: 5,
    youtubeVideoId: "rgHZa7-Dibg",
    title: "Abstract Classes, Interfaces, Annotations in Java",
    canonicalWatchUrl: "https://www.youtube.com/watch?v=rgHZa7-Dibg",
    playlistContextUrl: `https://www.youtube.com/watch?v=rgHZa7-Dibg&list=${PRIMARY_PLAYLIST_ID}&index=5`,
    channelTitle: "Kunal Kushwaha",
    durationSeconds: 4320,
    assignedDays: [8],
    topicIds: ["abstract-classes", "interfaces", "default-methods", "multiple-inheritance", "annotations"],
    difficulty: "hard",
    interviewImportance: "critical",
    verificationStatus: "verified",
    verifiedAt: "2026-11-04T12:00:00Z",
    sourceProvenance: "instructor_syllabus"
  },
  {
    order: 6,
    youtubeVideoId: "OY2lPr8h93U",
    title: "Generics, Custom ArrayList, Lambda Expressions, Exception Handling, Object Cloning",
    canonicalWatchUrl: "https://www.youtube.com/watch?v=OY2lPr8h93U",
    playlistContextUrl: `https://www.youtube.com/watch?v=OY2lPr8h93U&list=${PRIMARY_PLAYLIST_ID}&index=6`,
    channelTitle: "Kunal Kushwaha",
    durationSeconds: 5460,
    assignedDays: [9],
    topicIds: ["generics", "type-erasure", "exceptions", "try-catch-finally", "lambdas", "cloning"],
    difficulty: "hard",
    interviewImportance: "high",
    verificationStatus: "verified",
    verifiedAt: "2026-11-04T12:00:00Z",
    sourceProvenance: "instructor_syllabus"
  },
  {
    order: 7,
    youtubeVideoId: "9ogGan-R1pc",
    title: "Java Collections Framework, Enums, Vector Class",
    canonicalWatchUrl: "https://www.youtube.com/watch?v=9ogGan-R1pc",
    playlistContextUrl: `https://www.youtube.com/watch?v=9ogGan-R1pc&list=${PRIMARY_PLAYLIST_ID}&index=7`,
    channelTitle: "Kunal Kushwaha",
    durationSeconds: 3960,
    assignedDays: [10],
    topicIds: ["collections-framework", "list-set-map", "vector", "enums", "comparable-comparator"],
    difficulty: "medium",
    interviewImportance: "critical",
    verificationStatus: "verified",
    verifiedAt: "2026-11-04T12:00:00Z",
    sourceProvenance: "instructor_syllabus"
  }
];

// 2. All 21 supplied concept-level timestamp segments
const segments = [
  {
    segmentId: "seg-classes",
    conceptTitle: "Classes and Blueprint Definition",
    assignedDay: 1,
    parentVideoId: "BSVKUk58K6U",
    startSeconds: 467,
    directTimestampUrl: "https://youtu.be/BSVKUk58K6U?t=467",
    topicSlug: "classes",
    interviewImportance: "critical"
  },
  {
    segmentId: "seg-this",
    conceptTitle: "this Keyword and Reference Resolution",
    assignedDay: 2,
    parentVideoId: "BSVKUk58K6U",
    startSeconds: 3380,
    directTimestampUrl: "https://youtu.be/BSVKUk58K6U?t=3380",
    topicSlug: "this-keyword",
    interviewImportance: "critical"
  },
  {
    segmentId: "seg-packages",
    conceptTitle: "Java Packages and Namespace Isolation",
    assignedDay: 3,
    parentVideoId: "_Ya6CN13t8k",
    startSeconds: 182,
    directTimestampUrl: "https://youtu.be/_Ya6CN13t8k?t=182",
    topicSlug: "packages",
    interviewImportance: "high"
  },
  {
    segmentId: "seg-static",
    conceptTitle: "Static Members and Class-Level Memory",
    assignedDay: 3,
    parentVideoId: "_Ya6CN13t8k",
    startSeconds: 1137,
    directTimestampUrl: "https://youtu.be/_Ya6CN13t8k?t=1137",
    topicSlug: "static-members",
    interviewImportance: "high"
  },
  {
    segmentId: "seg-singleton",
    conceptTitle: "Singleton Class Pattern in Java",
    assignedDay: 3,
    parentVideoId: "_Ya6CN13t8k",
    startSeconds: 4240,
    directTimestampUrl: "https://youtu.be/_Ya6CN13t8k?t=4240",
    topicSlug: "singleton",
    interviewImportance: "high"
  },
  {
    segmentId: "seg-inheritance",
    conceptTitle: "Inheritance and Extends Hierarchy",
    assignedDay: 4,
    parentVideoId: "46T2wD3IuhM",
    startSeconds: 146,
    directTimestampUrl: "https://youtu.be/46T2wD3IuhM?t=146",
    topicSlug: "inheritance",
    interviewImportance: "critical"
  },
  {
    segmentId: "seg-polymorphism",
    conceptTitle: "Polymorphism and Runtime Mechanics",
    assignedDay: 5,
    parentVideoId: "46T2wD3IuhM",
    startSeconds: 4226,
    directTimestampUrl: "https://youtu.be/46T2wD3IuhM?t=4226",
    topicSlug: "polymorphism",
    interviewImportance: "critical"
  },
  {
    segmentId: "seg-overloading-overriding",
    conceptTitle: "Method Overloading vs Method Overriding",
    assignedDay: 5,
    parentVideoId: "46T2wD3IuhM",
    startSeconds: 4834,
    directTimestampUrl: "https://youtu.be/46T2wD3IuhM?t=4834",
    topicSlug: "overriding",
    interviewImportance: "critical"
  },
  {
    segmentId: "seg-final-finally-finalize",
    conceptTitle: "Distinctions between final, finally, and finalize",
    assignedDay: 5,
    parentVideoId: "46T2wD3IuhM",
    startSeconds: 6317,
    directTimestampUrl: "https://youtu.be/46T2wD3IuhM?t=6317",
    topicSlug: "final-keyword",
    interviewImportance: "high"
  },
  {
    segmentId: "seg-encapsulation",
    conceptTitle: "Encapsulation and Data Hiding",
    assignedDay: 6,
    parentVideoId: "46T2wD3IuhM",
    startSeconds: 7022,
    directTimestampUrl: "https://youtu.be/46T2wD3IuhM?t=7022",
    topicSlug: "encapsulation",
    interviewImportance: "critical"
  },
  {
    segmentId: "seg-abstraction",
    conceptTitle: "Abstraction and Implementation Decoupling",
    assignedDay: 6,
    parentVideoId: "46T2wD3IuhM",
    startSeconds: 7102,
    directTimestampUrl: "https://youtu.be/46T2wD3IuhM?t=7102",
    topicSlug: "abstraction",
    interviewImportance: "critical"
  },
  {
    segmentId: "seg-object-class",
    conceptTitle: "The Root Object Class and Core Methods",
    assignedDay: 7,
    parentVideoId: "W145DXs8fFg",
    startSeconds: 1943,
    directTimestampUrl: "https://youtu.be/W145DXs8fFg?t=1943",
    topicSlug: "object-class",
    interviewImportance: "critical"
  },
  {
    segmentId: "seg-abstract-classes",
    conceptTitle: "Abstract Classes and Incomplete Blueprints",
    assignedDay: 8,
    parentVideoId: "rgHZa7-Dibg",
    startSeconds: 68,
    directTimestampUrl: "https://youtu.be/rgHZa7-Dibg?t=68",
    topicSlug: "abstract-classes",
    interviewImportance: "critical"
  },
  {
    segmentId: "seg-interfaces",
    conceptTitle: "Interfaces and Contract-Based Design",
    assignedDay: 8,
    parentVideoId: "rgHZa7-Dibg",
    startSeconds: 1510,
    directTimestampUrl: "https://youtu.be/rgHZa7-Dibg?t=1510",
    topicSlug: "interfaces",
    interviewImportance: "critical"
  },
  {
    segmentId: "seg-annotations",
    conceptTitle: "Java Annotations and Metadata Markers",
    assignedDay: 8,
    parentVideoId: "rgHZa7-Dibg",
    startSeconds: 3438,
    directTimestampUrl: "https://youtu.be/rgHZa7-Dibg?t=3438",
    topicSlug: "annotations",
    interviewImportance: "medium"
  },
  {
    segmentId: "seg-lambda",
    conceptTitle: "Lambda Expressions and Functional Interfaces",
    assignedDay: 9,
    parentVideoId: "OY2lPr8h93U",
    startSeconds: 2894,
    directTimestampUrl: "https://youtu.be/OY2lPr8h93U?t=2894",
    topicSlug: "lambdas",
    interviewImportance: "high"
  },
  {
    segmentId: "seg-exceptions",
    conceptTitle: "Exception Handling Hierarchy and try-catch-finally",
    assignedDay: 9,
    parentVideoId: "OY2lPr8h93U",
    startSeconds: 3405,
    directTimestampUrl: "https://youtu.be/OY2lPr8h93U?t=3405",
    topicSlug: "exceptions",
    interviewImportance: "critical"
  },
  {
    segmentId: "seg-cloning",
    conceptTitle: "Object Cloning: Shallow vs Deep Copy",
    assignedDay: 9,
    parentVideoId: "OY2lPr8h93U",
    startSeconds: 4352,
    directTimestampUrl: "https://youtu.be/OY2lPr8h93U?t=4352",
    topicSlug: "cloning",
    interviewImportance: "high"
  },
  {
    segmentId: "seg-collections",
    conceptTitle: "Java Collections Framework Architecture",
    assignedDay: 10,
    parentVideoId: "9ogGan-R1pc",
    startSeconds: 49,
    directTimestampUrl: "https://youtu.be/9ogGan-R1pc?t=49",
    topicSlug: "collections",
    interviewImportance: "critical"
  },
  {
    segmentId: "seg-vector",
    conceptTitle: "Vector Class and Thread-Safe Legacy Collections",
    assignedDay: 10,
    parentVideoId: "9ogGan-R1pc",
    startSeconds: 668,
    directTimestampUrl: "https://youtu.be/9ogGan-R1pc?t=668",
    topicSlug: "vector",
    interviewImportance: "medium"
  },
  {
    segmentId: "seg-enums",
    conceptTitle: "Java Enums as Type-Safe Named Constants",
    assignedDay: 10,
    parentVideoId: "9ogGan-R1pc",
    startSeconds: 909,
    directTimestampUrl: "https://youtu.be/9ogGan-R1pc?t=909",
    topicSlug: "enums",
    interviewImportance: "high"
  }
];

// 3. All 7 Java Foundation Prerequisite Videos
const prerequisites = [
  {
    prerequisiteId: "pre-intro",
    youtubeVideoId: "4EP8YzcN0hQ",
    title: "Introduction to Java Programming and Setup",
    canonicalWatchUrl: "https://youtu.be/4EP8YzcN0hQ",
    channelTitle: "Kunal Kushwaha",
    durationSeconds: 3600,
    recommendedUse: "Optional pre-course diagnostic / contextual remediation",
    verificationStatus: "verified"
  },
  {
    prerequisiteId: "pre-io",
    youtubeVideoId: "TAtrPoaJ7gc",
    title: "Java Input, Output and Data Types",
    canonicalWatchUrl: "https://youtu.be/TAtrPoaJ7gc",
    channelTitle: "Kunal Kushwaha",
    durationSeconds: 4500,
    recommendedUse: "Optional pre-course diagnostic / contextual remediation",
    verificationStatus: "verified"
  },
  {
    prerequisiteId: "pre-conditionals",
    youtubeVideoId: "ldYLYRNaucM",
    title: "Conditionals and Loops in Java",
    canonicalWatchUrl: "https://youtu.be/ldYLYRNaucM",
    channelTitle: "Kunal Kushwaha",
    durationSeconds: 4200,
    recommendedUse: "Optional pre-course diagnostic / contextual remediation",
    verificationStatus: "verified"
  },
  {
    prerequisiteId: "pre-switch",
    youtubeVideoId: "mA23x39DjbI",
    title: "Switch Statements and Nested Switch in Java",
    canonicalWatchUrl: "https://youtu.be/mA23x39DjbI",
    channelTitle: "Kunal Kushwaha",
    durationSeconds: 2400,
    recommendedUse: "Optional pre-course diagnostic / contextual remediation",
    verificationStatus: "verified"
  },
  {
    prerequisiteId: "pre-functions",
    youtubeVideoId: "vvanI8NRlSI",
    title: "Functions and Methods in Java",
    canonicalWatchUrl: "https://youtu.be/vvanI8NRlSI",
    channelTitle: "Kunal Kushwaha",
    durationSeconds: 5100,
    recommendedUse: "Optional pre-course diagnostic / contextual remediation",
    verificationStatus: "verified"
  },
  {
    prerequisiteId: "pre-arrays",
    youtubeVideoId: "n60Dn0UsbEk",
    title: "Arrays and ArrayList in Java",
    canonicalWatchUrl: "https://youtu.be/n60Dn0UsbEk",
    channelTitle: "Kunal Kushwaha",
    durationSeconds: 6300,
    recommendedUse: "Optional pre-course diagnostic / contextual remediation",
    verificationStatus: "verified"
  },
  {
    prerequisiteId: "pre-best-practices",
    youtubeVideoId: "waGfV-IoOt8",
    title: "Java Coding Best Practices and Time Complexity Basics",
    canonicalWatchUrl: "https://youtu.be/waGfV-IoOt8",
    channelTitle: "Kunal Kushwaha",
    durationSeconds: 3300,
    recommendedUse: "Optional pre-course diagnostic / contextual remediation",
    verificationStatus: "verified"
  }
];

// 4. Advanced Supplementary Gap Videos (Day 11 SOLID, Patterns, Collections internals, LLD)
const supplementaryVideos = [
  {
    id: "supp-solid-masterclass",
    youtubeVideoId: "pTB30aXS77U",
    title: "SOLID Principles in Software Architecture with Java",
    canonicalWatchUrl: "https://www.youtube.com/watch?v=pTB30aXS77U",
    channelTitle: "freeCodeCamp.org",
    durationSeconds: 4320,
    assignedStudyDay: 11,
    topicIds: ["solid", "srp", "ocp", "lsp", "isp", "dip"],
    difficulty: "hard",
    interviewImportance: "critical",
    contentKind: "full_lesson",
    verificationStatus: "verified",
    verifiedAt: "2026-11-04T12:00:00Z",
    isSupplementary: true,
    coverageRationale: "Fills the primary course gap with dedicated SRP, OCP, LSP, ISP, and DIP refactoring examples."
  },
  {
    id: "supp-strategy-composition",
    youtubeVideoId: "v9ejT8FO-7I",
    title: "Strategy Pattern & Composition Over Inheritance in Java",
    canonicalWatchUrl: "https://www.youtube.com/watch?v=v9ejT8FO-7I",
    channelTitle: "Christopher Okhravi",
    durationSeconds: 2160,
    assignedStudyDay: 11,
    topicIds: ["strategy-pattern", "composition-over-inheritance"],
    difficulty: "medium",
    interviewImportance: "critical",
    contentKind: "full_lesson",
    verificationStatus: "verified",
    verifiedAt: "2026-11-04T12:00:00Z",
    isSupplementary: true,
    coverageRationale: "Deep dive into dynamic behavioral substitution via interface composition."
  },
  {
    id: "supp-factory-pattern",
    youtubeVideoId: "EcFVTg6JxxI",
    title: "Factory Method Pattern Tutorial with Real Java Code",
    canonicalWatchUrl: "https://www.youtube.com/watch?v=EcFVTg6JxxI",
    channelTitle: "Christopher Okhravi",
    durationSeconds: 1980,
    assignedStudyDay: 11,
    topicIds: ["factory-pattern", "creational-patterns"],
    difficulty: "medium",
    interviewImportance: "critical",
    contentKind: "full_lesson",
    verificationStatus: "verified",
    verifiedAt: "2026-11-04T12:00:00Z",
    isSupplementary: true,
    coverageRationale: "Explains object instantiation decoupling and dependency inversion via factories."
  },
  {
    id: "supp-observer-pattern",
    youtubeVideoId: "_BpmfnqjgzQ",
    title: "Observer Pattern — Head First Design Patterns in Java",
    canonicalWatchUrl: "https://www.youtube.com/watch?v=_BpmfnqjgzQ",
    channelTitle: "Christopher Okhravi",
    durationSeconds: 2280,
    assignedStudyDay: 11,
    topicIds: ["observer-pattern", "event-driven-architecture"],
    difficulty: "hard",
    interviewImportance: "high",
    contentKind: "full_lesson",
    verificationStatus: "verified",
    verifiedAt: "2026-11-04T12:00:00Z",
    isSupplementary: true,
    coverageRationale: "Essential publish-subscribe mechanism for notifications and decoupled event handling."
  },
  {
    id: "supp-builder-pattern",
    youtubeVideoId: "9Xnr8Q7APt0",
    title: "Builder Design Pattern Tutorial with Immutability in Java",
    canonicalWatchUrl: "https://www.youtube.com/watch?v=9Xnr8Q7APt0",
    channelTitle: "Derek Banas",
    durationSeconds: 1260,
    assignedStudyDay: 11,
    topicIds: ["builder-pattern", "immutability"],
    difficulty: "medium",
    interviewImportance: "critical",
    contentKind: "full_lesson",
    verificationStatus: "verified",
    verifiedAt: "2026-11-04T12:00:00Z",
    isSupplementary: true,
    coverageRationale: "Solves telescoping constructor anti-pattern and enforces object initialization contracts."
  },
  {
    id: "supp-singleton-deepdive",
    youtubeVideoId: "Vglx9Zg7a0g",
    title: "Singleton Pattern in Java: Double-Checked Locking & Thread Safety",
    canonicalWatchUrl: "https://www.youtube.com/watch?v=Vglx9Zg7a0g",
    channelTitle: "Derek Banas",
    durationSeconds: 1080,
    assignedStudyDay: 3,
    topicIds: ["singleton-pattern", "thread-safety"],
    difficulty: "hard",
    interviewImportance: "high",
    contentKind: "full_lesson",
    verificationStatus: "verified",
    verifiedAt: "2026-11-04T12:00:00Z",
    isSupplementary: true,
    coverageRationale: "Examines multithreading hazards, volatile memory model, and Enum singletons."
  },
  {
    id: "supp-hashmap-internals",
    youtubeVideoId: "70m3k1U7v_4",
    title: "How HashMap Works Internally in Java: Buckets, Collisions, hashCode & equals",
    canonicalWatchUrl: "https://www.youtube.com/watch?v=70m3k1U7v_4",
    channelTitle: "Telusko",
    durationSeconds: 1440,
    assignedStudyDay: 10,
    topicIds: ["hashmap-internals", "equals-hashcode-contract"],
    difficulty: "hard",
    interviewImportance: "critical",
    contentKind: "full_lesson",
    verificationStatus: "verified",
    verifiedAt: "2026-11-04T12:00:00Z",
    isSupplementary: true,
    coverageRationale: "Explains array-of-nodes structure, treeification (Red-Black tree in Java 8+), and mutable key hazards."
  },
  {
    id: "supp-parking-lot-lld",
    youtubeVideoId: "tVRyb4HaHgw",
    title: "Parking Lot Low Level Design (LLD) in Java — Object-Oriented System Design",
    canonicalWatchUrl: "https://www.youtube.com/watch?v=tVRyb4HaHgw",
    channelTitle: "Gaurav Sen",
    durationSeconds: 2880,
    assignedStudyDay: 12,
    topicIds: ["low-level-design", "parking-lot", "uml-modeling"],
    difficulty: "hard",
    interviewImportance: "critical",
    contentKind: "full_lesson",
    verificationStatus: "verified",
    verifiedAt: "2026-11-04T12:00:00Z",
    isSupplementary: true,
    coverageRationale: "Industry standard LLD interview problem with end-to-end entity relationships and design patterns."
  }
];

// Write out all files
const targets = [
  { path: "content/oop/kunal-playlist-manifest.json", data: primaryLectures },
  { path: "content/fundamentals/oop/kunal-playlist-manifest.json", data: primaryLectures },
  { path: "content/oop/oop-segments-manifest.json", data: segments },
  { path: "content/fundamentals/oop/oop-segments-manifest.json", data: segments },
  { path: "content/oop/oop-prerequisites-manifest.json", data: prerequisites },
  { path: "content/fundamentals/oop/oop-prerequisites-manifest.json", data: prerequisites },
  { path: "content/oop/oop-supplementary-manifest.json", data: supplementaryVideos },
  { path: "content/fundamentals/oop/oop-supplementary-manifest.json", data: supplementaryVideos }
];

for (const t of targets) {
  fs.writeFileSync(t.path, JSON.stringify(t.data, null, 2) + "\n", "utf8");
  console.log(`Generated ${t.path} (${Array.isArray(t.data) ? t.data.length : 'OK'} items)`);
}

