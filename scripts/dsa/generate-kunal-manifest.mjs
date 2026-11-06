import fs from "fs";
import path from "path";

// 1. Read sources
const syllabusRaw = fs.readFileSync("kunal-syllabus-raw.md", "utf8");
const assignmentsRaw = JSON.parse(fs.readFileSync("kunal-assignments-raw.json", "utf8"));
const playlists = JSON.parse(fs.readFileSync("content/dsa/playlists-manifest.json", "utf8"));
const kunalPl = playlists.find((p) => p.slug === "kunal-kushwaha" || p.slug === "kunal-java-dsa");

// 2. Parse syllabus chapters & timestamp links
const lines = syllabusRaw.split("\n");
const chaptersByVideo = new Map();

for (const line of lines) {
  const linkMatch = line.match(/\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/);
  if (!linkMatch) continue;

  const title = linkMatch[1].trim();
  const rawUrl = linkMatch[2].trim();

  let videoId = null;
  let timestampSeconds = 0;

  if (rawUrl.includes("youtu.be/")) {
    const parts = rawUrl.split("youtu.be/")[1].split(/[?&#]/);
    videoId = parts[0];
  } else if (rawUrl.includes("youtube.com/watch")) {
    try {
      const urlObj = new URL(rawUrl);
      videoId = urlObj.searchParams.get("v");
    } catch {
      // ignore
    }
  }

  if (videoId && rawUrl.includes("t=")) {
    const tParam = rawUrl.match(/[?&]t=([0-9]+)s?/);
    if (tParam) {
      timestampSeconds = parseInt(tParam[1], 10);
    }
  }

  if (videoId && videoId.length === 11) {
    if (!chaptersByVideo.has(videoId)) {
      chaptersByVideo.set(videoId, []);
    }
    // Avoid exact duplicate titles with same timestamp
    const existing = chaptersByVideo.get(videoId);
    if (!existing.some((c) => c.title.toLowerCase() === title.toLowerCase() && c.timestampSeconds === timestampSeconds)) {
      existing.push({
        title,
        timestampSeconds,
        timestampFormatted: `${Math.floor(timestampSeconds / 60)}:${String(timestampSeconds % 60).padStart(2, "0")}`,
        sourceUrl: rawUrl,
      });
    }
  }
}

// Ensure each video with chapters has chapters sorted by timestampSeconds
for (const [vid, chs] of chaptersByVideo.entries()) {
  chs.sort((a, b) => a.timestampSeconds - b.timestampSeconds);
  // Add endSeconds
  for (let i = 0; i < chs.length; i++) {
    chs[i].endSeconds = i < chs.length - 1 ? chs[i + 1].timestampSeconds : null;
  }
}

// 3. Parse all 18 assignments & extract problems
const parsedAssignments = [];

for (const [filename, content] of Object.entries(assignmentsRaw)) {
  const assignmentNumber = parseInt(filename.split("-")[0], 10);
  const slug = filename.replace(/\.md$/, "");
  
  // Extract title from first heading or filename
  const headingMatch = content.match(/^#+\s*(.+)$/m);
  const rawTitle = filename.replace(/^[0-9]+-/, "").replace(/\.md$/, "").replace(/-/g, " ");
  const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);

  // Extract problems by section (Easy, Medium, Hard)
  const problems = [];
  const contentLines = content.split("\n");
  let currentDifficulty = "easy";

  for (const line of contentLines) {
    if (/^#+\s*Easy/i.test(line)) currentDifficulty = "easy";
    else if (/^#+\s*Medium/i.test(line)) currentDifficulty = "medium";
    else if (/^#+\s*Hard/i.test(line)) currentDifficulty = "hard";

    const problemMatch = line.match(/\[([^\]]+)\]\((https:\/\/leetcode\.com\/problems\/([a-z0-9\-]+)[^\)]*)\)/);
    if (problemMatch) {
      const pTitle = problemMatch[1].trim();
      const pUrl = problemMatch[2].trim();
      const pSlug = problemMatch[3].trim();

      if (!problems.some((p) => p.slug === pSlug)) {
        problems.push({
          slug: pSlug,
          title: pTitle,
          difficulty: currentDifficulty,
          leetcodeUrl: pUrl,
        });
      }
    }
  }

  // Extract tasks/questions that aren't LeetCode
  const tasks = [];
  for (const line of contentLines) {
    const numMatch = line.match(/^\s*(\d+)\.\s+(.+)$/);
    if (numMatch && !line.includes("leetcode.com")) {
      tasks.push({
        number: parseInt(numMatch[1], 10),
        task: numMatch[2].trim(),
      });
    }
  }

  parsedAssignments.push({
    number: assignmentNumber,
    slug,
    title: `Assignment ${assignmentNumber}: ${title}`,
    filename,
    githubPath: `assignments/${filename}`,
    githubUrl: `https://github.com/kunal-kushwaha/DSA-Bootcamp-Java/tree/main/assignments/${filename}`,
    problemsCount: problems.length,
    tasksCount: tasks.length,
    problems,
    tasks: tasks.slice(0, 15), // top tasks
  });
}

parsedAssignments.sort((a, b) => a.number - b.number);

// 4. Define Syllabus Modules & Map to Videos + Assignments
const SYLLABUS_MODULES = [
  {
    stepNumber: 1,
    title: "Programming Foundations & Tooling",
    slug: "foundations",
    description: "Git and GitHub version control, types of programming languages, execution model, memory management, and flowcharts/pseudocode.",
    videoIds: ["rZ41y93P2Qo", "Nckx9qMy_kw", "waGfV-IoOt8", "apGV9Kg7ics", "wn49bJOYAZM", "lhELGQAV4gg"],
    assignmentSlugs: ["01-flow-of-program"],
    topicTags: ["git", "flowcharts", "pseudocode", "foundations"],
  },
  {
    stepNumber: 2,
    title: "Java Fundamentals & Control Flow",
    slug: "java-basics",
    description: "Java architecture, JDK/JRE/JVM setup, input/output, primitive data types, conditionals, while/for loops, and switch case statements.",
    videoIds: ["4EP8YzcN0hQ", "TAtrPoaJ7gc", "ldYLYRNaucM", "mA23x39DjbI"],
    assignmentSlugs: ["02-first-java", "03-conditionals-loops"],
    topicTags: ["java", "syntax", "control-flow", "conditionals", "loops"],
  },
  {
    stepNumber: 3,
    title: "Functions & Methods in Java",
    slug: "functions",
    description: "Function definitions, call stack, pass by value vs reference in Java, scope rules, variable shadowing, varargs, and method overloading.",
    videoIds: ["vvanI8NRlSI"],
    assignmentSlugs: ["04-functions"],
    topicTags: ["functions", "methods", "scoping", "overloading"],
  },
  {
    stepNumber: 4,
    title: "Arrays & Dynamic ArrayList",
    slug: "arrays",
    description: "1D and multidimensional array layout in memory, stack vs heap allocation, dynamic ArrayList internals, and array problem-solving techniques.",
    videoIds: ["n60Dn0UsbEk"],
    assignmentSlugs: ["05-arrays"],
    topicTags: ["arrays", "arraylist", "memory-layout"],
  },
  {
    stepNumber: 5,
    title: "Searching Algorithms (Linear & Binary Search)",
    slug: "searching",
    description: "Linear search with string and 2D variations, binary search algorithm, order-agnostic BS, infinite arrays, and search in 2D sorted matrices.",
    videoIds: ["_HRA37X8N_Q", "f6UU7V3szVw", "W9QJ8HaRvJQ", "enI_KyGLYPo"],
    assignmentSlugs: ["06-searching"],
    topicTags: ["linear-search", "binary-search", "search-space", "2d-arrays"],
  },
  {
    stepNumber: 6,
    title: "Elementary & Cyclic Sorting",
    slug: "sorting",
    description: "Bubble sort, selection sort, insertion sort, cycle sort for interview duplicate and missing number patterns, and non-comparison sorts.",
    videoIds: ["F5MZyqRp_IM", "Nd4SCCIHFWk", "By_5-RRqVeE", "JfinxytTYFQ", "FOo820lJV1Y", "mLi6VQDqAOs"],
    assignmentSlugs: ["07-sorting"],
    topicTags: ["bubble-sort", "selection-sort", "insertion-sort", "cyclic-sort"],
  },
  {
    stepNumber: 7,
    title: "Pattern Questions & Logic Building",
    slug: "patterns",
    description: "Systematic 4-step framework to solve any geometric and numerical pattern question using nested loops and mathematical formulas.",
    videoIds: ["lsOOs5J8ycw"],
    assignmentSlugs: ["09-patterns"],
    topicTags: ["patterns", "logic-building"],
  },
  {
    stepNumber: 8,
    title: "Strings & Text Processing",
    slug: "strings",
    description: "String immutability, string pool in JVM, concatenation performance, StringBuilder vs StringBuffer, character arrays, and palindromes.",
    videoIds: ["zL1DPZ0Ovlo", "YFZai3fPUQI", "swciWFPq3NE"],
    assignmentSlugs: ["08-strings"],
    topicTags: ["strings", "stringbuilder", "immutability", "string-matching"],
  },
  {
    stepNumber: 9,
    title: "Mathematics for DSA & Bit Manipulation",
    slug: "maths-bitwise",
    description: "Bitwise operators, XOR properties, odd/even, finding unique elements, prime number algorithms, Sieve of Eratosthenes, and Euclidean GCD.",
    videoIds: ["fzip9Aml6og", "lmSpZ0bjCyQ", "lHtoypC-4Ps"],
    assignmentSlugs: ["11-bitwise", "12-math"],
    topicTags: ["bitwise", "math", "primes", "sieve", "gcd"],
  },
  {
    stepNumber: 10,
    title: "Recursion & Divide and Conquer",
    slug: "recursion",
    description: "Space-time recursion trees, call stacks, tail recursion, array recursion, string recursion, subsets, permutations, merge sort, and quick sort.",
    videoIds: [
      "M2uO2nMT0Bk", "JxILxTwHukM", "sTdiMLom00U", "ymgnIIclCF0",
      "iKGAgWdgoRk", "Z8svOqamag8", "gdifkIwCJyg", "gDGw0cvFXPQ", "9ByWqPzfXDU"
    ],
    assignmentSlugs: ["10-recursion"],
    topicTags: ["recursion", "divide-and-conquer", "merge-sort", "quick-sort", "subsets"],
  },
  {
    stepNumber: 11,
    title: "Backtracking & Exhaustive Search",
    slug: "backtracking",
    description: "State restoration, maze pathfinding, 4-direction matrices, N-Queens problem, N-Knights problem, and Sudoku solver.",
    videoIds: ["zg5v2rlV1tM", "nC1rbW2YSz0"],
    assignmentSlugs: [],
    topicTags: ["backtracking", "mazes", "n-queens", "sudoku"],
  },
  {
    stepNumber: 12,
    title: "Time & Space Complexity Analysis",
    slug: "complexity",
    description: "Big-O, Big-Omega, Big-Theta formal definitions, Master theorem, Akra-Bazzi method, solving linear recurrence relations, and space complexity.",
    videoIds: ["mV3wrLBbuuE"],
    assignmentSlugs: ["13-complexities"],
    topicTags: ["big-o", "time-complexity", "space-complexity", "recurrence"],
  },
  {
    stepNumber: 13,
    title: "Object-Oriented Programming (OOP) in Java",
    slug: "oop",
    description: "Classes, objects, constructors, this keyword, static memory, singleton, inheritance, polymorphism, encapsulation, abstraction, interfaces, generics, and collections.",
    videoIds: [
      "BSVKUk58K6U", "_Ya6CN13t8k", "46T2wD3IuhM", "W145DXs8fFg",
      "rgHZa7-Dibg", "OY2lPr8h93U", "9ogGan-R1pc"
    ],
    assignmentSlugs: ["14-oop"],
    topicTags: ["oop", "inheritance", "polymorphism", "encapsulation", "generics"],
  },
  {
    stepNumber: 14,
    title: "Linked Lists (Singly, Doubly, Circular)",
    slug: "linked-lists",
    description: "Pointer-based node chaining, custom linked list implementations, fast & slow pointer cycle detection, in-place reversal, and merging.",
    videoIds: ["58YbpRDc4yw", "70tx7KcMROc"],
    assignmentSlugs: ["15-linkedlist"],
    topicTags: ["linked-lists", "pointers", "fast-slow-pointers", "reversal"],
  },
  {
    stepNumber: 15,
    title: "Stacks & Queues",
    slug: "stacks-queues",
    description: "LIFO and FIFO data structures, array and linked list backings, dynamic circular queues, queue using stacks, parentheses validation, and histogram queries.",
    videoIds: ["rHQI4mrJ3cg", "S9LUYztYLu4"],
    assignmentSlugs: ["16-stack-queue"],
    topicTags: ["stacks", "queues", "monotonic-stack", "circular-queue"],
  },
  {
    stepNumber: 16,
    title: "Trees (Binary Trees, BST, AVL & Segment Trees)",
    slug: "trees",
    description: "Hierarchical trees, recursive traversals (pre, in, post, level-order BFS), binary search trees, self-balancing AVL trees, and range query segment trees.",
    videoIds: ["4s1Tcvm00pA", "CVA85JuJEn0", "ciHThtTVNto", "9D-vP-jcc-Y", "LFGBTFxHJII", "Qdr3ohMSxBo"],
    assignmentSlugs: ["17-trees"],
    topicTags: ["trees", "binary-trees", "bst", "avl-trees", "segment-trees"],
  },
  {
    stepNumber: 17,
    title: "Heaps & Priority Queues",
    slug: "heaps",
    description: "Complete binary trees in arrays, min/max heap properties, heapify algorithm, priority queue implementations, and heapsort.",
    videoIds: ["Qf-TDPr0nYw"],
    assignmentSlugs: ["18-heaps"],
    topicTags: ["heaps", "priority-queue", "heapsort"],
  },
  {
    stepNumber: 18,
    title: "HashMaps & Hash Tables",
    slug: "hashmaps",
    description: "Hash code calculation, compression functions, collisions, separate chaining with linked lists, open addressing with linear probing, and Huffman coding.",
    videoIds: ["XLbvmMz8Fr8", "XLfgeaYHinM"],
    assignmentSlugs: [],
    topicTags: ["hashmaps", "hashing", "chaining", "probing", "huffman"],
  },
  {
    stepNumber: 19,
    title: "Advanced Interview Problems & Algorithms",
    slug: "interview-prep",
    description: "Technical interview walkthroughs: Tic Tac Toe game design, File handling in Java, Square root decomposition, Word ladder BFS, and BST conversions.",
    videoIds: [
      "jlLNXmi4Nmw", "b35mlSPOlJg", "U4YmISZViSs", "2odLxQWYDi0",
      "oB1EIXIDS8s", "guzgnCSafg4", "kNZ5VIkqReU", "CxNRKTp6_9s"
    ],
    assignmentSlugs: [],
    topicTags: ["interview-questions", "faang", "advanced-dsa", "game-design"],
  },
];

// Map all 69 videos with their chapters and assigned module
const videoMap = new Map();
for (const v of kunalPl.videos) {
  videoMap.set(v.youtubeVideoId, {
    ...v,
    chapters: chaptersByVideo.get(v.youtubeVideoId) || [],
  });
}

// Attach videos and assignments to modules
const populatedModules = SYLLABUS_MODULES.map((mod) => {
  const modVideos = mod.videoIds
    .map((vid) => videoMap.get(vid))
    .filter(Boolean);

  const modAssignments = mod.assignmentSlugs
    .map((slug) => parsedAssignments.find((a) => a.slug === slug))
    .filter(Boolean);

  // Collect all problems across module assignments
  const modProblems = [];
  for (const a of modAssignments) {
    for (const p of a.problems) {
      if (!modProblems.some((x) => x.slug === p.slug)) {
        modProblems.push(p);
      }
    }
  }

  const totalDuration = modVideos.reduce((acc, v) => acc + v.durationSeconds, 0);

  return {
    ...mod,
    videosCount: modVideos.length,
    totalDurationSeconds: totalDuration,
    assignmentsCount: modAssignments.length,
    problemsCount: modProblems.length,
    videos: modVideos,
    assignments: modAssignments,
    problems: modProblems,
  };
});

// Final Manifest Object
const manifest = {
  course: {
    id: "kunal-kushwaha-bootcamp",
    slug: "kunal-kushwaha",
    alternateSlug: "kunal-java-dsa",
    youtubePlaylistId: "PL9gnSGHSqcnr_DxHsP7AW9ftq0AtAyYqJ",
    title: "Java + Data Structures & Algorithms Bootcamp",
    instructor: "Kunal Kushwaha",
    channelTitle: "Kunal Kushwaha",
    description: "Complete Java programming, foundational problem-solving, algorithms, data structures, and FAANG interview preparation course.",
    difficulty: "Beginner → Advanced",
    level: "Beginner",
    focus: "Complete Java + DSA Roadmap with verified lectures, timestamp chapters, assignments, and interview prep",
    programmingLanguage: "Java",
    thumbnailUrl: "https://i.ytimg.com/vi/rZ41y93P2Qo/hqdefault.jpg",
    officialPlaylistUrl: "https://www.youtube.com/playlist?list=PL9gnSGHSqcnr_DxHsP7AW9ftq0AtAyYqJ",
    officialGithubUrl: "https://github.com/kunal-kushwaha/DSA-Bootcamp-Java",
    officialSyllabusUrl: "https://github.com/kunal-kushwaha/DSA-Bootcamp-Java/blob/main/SYLLABUS.md",
    modulesCount: populatedModules.length,
    videosCount: kunalPl.videos.length,
    totalDurationSeconds: kunalPl.totalDurationSeconds,
    assignmentsCount: parsedAssignments.length,
    totalProblemsCount: populatedModules.reduce((acc, m) => acc + m.problemsCount, 0),
    topicTags: Array.from(new Set(populatedModules.flatMap((m) => m.topicTags))),
  },
  modules: populatedModules,
  assignments: parsedAssignments,
};

fs.writeFileSync("content/dsa/kunal-bootcamp-manifest.json", JSON.stringify(manifest, null, 2));
console.log("Successfully generated content/dsa/kunal-bootcamp-manifest.json");
console.log(`Summary:`);
console.log(`- Modules: ${manifest.modules.length}`);
console.log(`- Videos: ${manifest.course.videosCount}`);
console.log(`- Assignments: ${manifest.assignments.length}`);
console.log(`- Total Duration: ${Math.round(manifest.course.totalDurationSeconds / 3600)} hours`);
console.log(`- Total Problems: ${manifest.course.totalProblemsCount}`);
