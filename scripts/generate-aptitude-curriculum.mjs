/**
 * Generator script for PRIME Aptitude Curriculum Manifest and Domain Curriculum.
 * Preserves supplied topic IDs and uses explicit, source-checked video associations.
 */
import fs from "node:fs";
import path from "node:path";

// Load raw API export
const rawApiData = JSON.parse(
  fs.readFileSync(path.resolve("content/aptitude/raw-curriculum.json"), "utf-8")
);

const curation = JSON.parse(
  fs.readFileSync("content/aptitude/video-curation.json", "utf8")
);
const videoCatalog = JSON.parse(
  fs.readFileSync("content/aptitude/video-catalog.json", "utf8")
);
const audioAudit = JSON.parse(
  fs.readFileSync("content/aptitude/audio-language-audit.json", "utf8")
);

// Track definitions
const TRACKS = [
  {
    id: "track-qa",
    slug: "quantitative-aptitude",
    title: "Quantitative Aptitude",
    description:
      "Numerical mathematics, percentages, arithmetic, algebra, permutations, probability, and geometry.",
    orderIndex: 1,
    color: "#FF4D4D",
    dayRange: [1, 16],
  },
  {
    id: "track-lr",
    slug: "logical-reasoning",
    title: "Logical Reasoning",
    description:
      "Deductive logic, syllogisms, blood relations, seating arrangements, puzzles, and critical reasoning.",
    orderIndex: 2,
    color: "#F59E0B",
    dayRange: [17, 26],
  },
  {
    id: "track-va",
    slug: "verbal-ability",
    title: "Verbal Ability",
    description:
      "Grammar, sentence correction, reading comprehension, vocabulary, and verbal deduction.",
    orderIndex: 3,
    color: "#3B82F6",
    dayRange: [27, 33],
  },
  {
    id: "track-di",
    slug: "data-interpretation",
    title: "Data Interpretation",
    description:
      "Tables, bar charts, line graphs, pie charts, caselets, and graphical data analysis.",
    orderIndex: 4,
    color: "#00E5FF",
    dayRange: [34, 38],
  },
  {
    id: "track-as",
    slug: "assessments",
    title: "Placement Mocks & Assessments",
    description:
      "Full-length placement aptitude mock tests and company-pattern assessments.",
    orderIndex: 5,
    color: "#A855F7",
    dayRange: [39, 40],
  },
];

// Preserve the user's topic IDs and syllabus order; use the reviewed per-topic associations.
const CURRICULUM_TOPICS = rawApiData.flatMap((day) =>
  day.topics.map((topic) => ({
    day: day.day,
    id: topic.topic_id,
    title: topic.topic,
    ...curation.associations[topic.topic_id],
  }))
);
if (
  CURRICULUM_TOPICS.length !== 132 ||
  new Set(CURRICULUM_TOPICS.map((t) => t.id)).size !== 132
)
  throw new Error("Expected 132 unique syllabus topics.");
if (new Set(CURRICULUM_TOPICS.map((t) => t.day)).size !== 40)
  throw new Error("Expected 40 syllabus days.");

function lesson(videoId, coverageNotes) {
  if (!videoId) return null;
  const meta = videoCatalog[videoId];
  const audioCheck = audioAudit[videoId];
  if (audioCheck?.status !== "english" || !audioCheck.method || !audioCheck.sourceUrl)
    throw new Error("English instruction has not been confirmed for " + videoId);
  if (!meta || meta.sourceCheck?.status !== 200 || !meta.title || !meta.channelTitle)
    throw new Error("Missing successful source verification for " + videoId);
  return {
    videoId,
    canonicalUrl: "https://www.youtube.com/watch?v=" + videoId,
    title: meta.title,
    channelTitle: meta.channelTitle,
    durationSeconds: meta.durationSeconds ?? 0,
    durationFormatted: meta.durationFormatted ?? "",
    defaultAudioLanguage: "en",
    defaultLanguage: meta.defaultLanguage || undefined,
    embeddable: meta.embeddable !== false,
    availability: "available",
    reviewStatus: "candidate_review_required",
    spokenEnglishVerified: false,
    audioLanguage: "en",
    audioLanguageCheck: {
      status: "english",
      method: audioCheck.method,
      sourceUrl: audioCheck.sourceUrl,
      checkedAt: audioCheck.checkedAt,
    },
    topicCoverageVerified: false,
    metadataVerified: true,
    sourceCheckedAt: meta.sourceCheck.checkedAt,
    coverageNotes: coverageNotes || undefined,
    reviewNotes:
      "English instruction supported by original audio/caption metadata or a matching speech transcript. Not a full manual audio or syllabus-coverage certification.",
  };
}

// Generate the curriculum structure
function getTrackSlug(dayNum) {
  if (dayNum <= 16) return "quantitative-aptitude";
  if (dayNum <= 26) return "logical-reasoning";
  if (dayNum <= 33) return "verbal-ability";
  if (dayNum <= 38) return "data-interpretation";
  return "assessments";
}

function getTrackTitle(slug) {
  const t = TRACKS.find((tr) => tr.slug === slug);
  return t ? t.title : "Aptitude Track";
}

// Build 40 days map
const daysMap = new Map();
for (let d = 1; d <= 40; d++) {
  const trackSlug = getTrackSlug(d);
  const isAssessment = [16, 26, 33, 39, 40].includes(d);
  daysMap.set(d, {
    id: `day-${String(d).padStart(2, "0")}`,
    dayNumber: d,
    trackSlug,
    title: isAssessment
      ? d === 40
        ? "Day 40: Grand Final Placement Aptitude Mock"
        : d === 39
          ? "Day 39: 4-Section Comprehensive Pre-Mock Test"
          : `Day ${d}: ${getTrackTitle(trackSlug)} Sectional Assessment & Revision`
      : `Day ${d}: ${getTrackTitle(trackSlug)} Core Concepts`,
    subtitle: isAssessment
      ? "Time-pressured sectional evaluation and high-yield placement review."
      : "Structured concepts, worked examples, formula sheets, and practice sets.",
    description: `Day ${d} of the intensive 40-Day Aptitude, Reasoning, Verbal & DI Curriculum.`,
    isAssessmentDay: isAssessment,
    estimatedMinutes: isAssessment ? 120 : 90,
    topics: [],
  });
}

// Enriched formula sheets and objectives map
const FORMULA_SHEETS = {
  D01_T01:
    "Sum of first n natural numbers = n(n+1)/2. Sum of squares = n(n+1)(2n+1)/6. Sum of cubes = [n(n+1)/2]^2.",
  D01_T02:
    "A prime number has exactly two distinct factors: 1 and itself. 2 is the only even prime.",
  D01_T03:
    "Divisible by 3: sum of digits divisible by 3. Divisible by 4: last 2 digits divisible by 4. Divisible by 8: last 3 digits. Divisible by 11: difference between alternate sum of digits is multiple of 11.",
  D01_T04:
    "Number of factors for N = p^a * q^b * r^c is (a+1)(b+1)(c+1). Sum of factors = (p^(a+1)-1)/(p-1) * (q^(b+1)-1)/(q-1)...",
  D02_T01:
    "Product of two numbers = HCF * LCM. HCF of fractions = HCF(numerators)/LCM(denominators). LCM of fractions = LCM(numerators)/HCF(denominators).",
  D02_T04:
    "Cyclicity: 2, 3, 7, 8 have cyclicity 4. 4 and 9 have cyclicity 2. 0, 1, 5, 6 have cyclicity 1.",
  D04_T01:
    "Percentage change = [(Final - Initial)/Initial] * 100. Fractional equivalents: 1/6 = 16.67%, 1/7 = 14.28%, 1/8 = 12.5%, 1/9 = 11.11%, 1/11 = 9.09%.",
  D04_T02:
    "Net successive change for a% and b%: a + b + (ab/100)%. If a price increases by x%, consumption must decrease by [x/(100+x)]*100% to keep expenditure constant.",
  D05_T01:
    "If a:b = c:d, then a*d = b*c (cross product rule). Mean proportional of a and b is sqrt(ab).",
  D06_T01:
    "Weighted Average = (w1*x1 + w2*x2 + ...)/(w1 + w2 + ...). Deviation method: Average = Assumed Average + (Sum of deviations)/N.",
  D06_T03:
    "Alligation Rule: (Cheaper Qty)/(Dearer Qty) = (Price of Dearer - Mean Price)/(Mean Price - Price of Cheaper).",
  D07_T01: "Profit% = (Profit/CP)*100. Loss% = (Loss/CP)*100. SP = CP * (100 + P%)/100.",
  D07_T02:
    "Marked Price (MP) - Discount = Selling Price (SP). Discount% = (Discount/MP)*100.",
  D07_T03:
    "Two successive discounts d1% and d2% are equivalent to a single discount of: d1 + d2 - (d1*d2/100)%.",
  D08_T01: "SI = (P * R * T)/100. Amount = P + SI.",
  D08_T02:
    "CI Amount = P * (1 + R/100)^T. Difference between CI and SI for 2 years = P * (R/100)^2.",
  D09_T01:
    "If A does work in 'x' days, A's 1-day work = 1/x. Together: 1/x + 1/y = (x+y)/(xy), time taken = xy/(x+y).",
  D10_T01:
    "Distance = Speed * Time. 1 km/h = 5/18 m/s. Average Speed for equal distances = 2xy/(x+y).",
  D10_T02: "Relative Speed: Same direction = |S1 - S2|. Opposite direction = S1 + S2.",
  D10_T03:
    "Time to cross stationary pole/man = Length of Train / Speed. Time to cross platform = (Train Length + Platform Length) / Speed.",
  D10_T04:
    "Downstream speed u = B + S. Upstream speed v = B - S. Boat speed B = (u + v)/2. Stream speed S = (u - v)/2.",
  D13_T01:
    "Permutations nPr = n! / (n - r)!. Linear arrangement of n distinct items = n!.",
  D13_T02:
    "Combinations nCr = n! / [r! * (n - r)!]. nCr = nC(n-r). nC0 + nC1 + ... + nCn = 2^n.",
  D14_T01:
    "Probability P(E) = (Favorable outcomes)/(Total outcomes). P(E) + P(not E) = 1.",
  D15_T04:
    "Angle between hands = |30*H - (11/2)*M|. Hands coincide every 65 5/11 minutes.",
};

for (const item of CURRICULUM_TOPICS) {
  const dayObj = daysMap.get(item.day);
  const orderIdx = dayObj.topics.length + 1;

  const primaryVideo = lesson(item.primaryId, item.primaryCoverage);
  const backupVideo =
    item.backupId === item.primaryId ? null : lesson(item.backupId, item.backupCoverage);

  const topicObj = {
    id: item.id,
    dayNumber: item.day,
    trackSlug: dayObj.trackSlug,
    title: item.title,
    orderIndex: orderIdx,
    difficulty: item.day > 25 ? "Hard" : item.day > 12 ? "Medium" : "Easy",
    priority: [
      1, 2, 4, 7, 9, 10, 16, 19, 21, 22, 26, 30, 33, 34, 35, 37, 39, 40,
    ].includes(item.day)
      ? "Essential"
      : "High",
    estimatedMinutes: Math.max(
      20,
      Math.ceil((primaryVideo?.durationSeconds ?? 0) / 60) + 10
    ),
    objectives: [
      `Understand fundamental principles and patterns of ${item.title}.`,
      `Master high-speed shortcut methods applicable to campus placement tests.`,
      `Solve standardized placement questions under 90-second time constraints.`,
    ],
    prerequisites:
      item.day === 1
        ? ["Basic arithmetic and mental calculations"]
        : [`Concepts from Day ${item.day - 1}`],
    conceptChecklist: [
      "Core definitions and mathematical models",
      "Shortcut calculation techniques",
      "Standard pattern recognition",
      "Common distractors and edge cases",
    ],
    formulaNotes:
      FORMULA_SHEETS[item.id] ||
      "Review core concept notes and worked sample questions before starting practice sets.",
    primaryVideo,
    backupVideo,
    hasVideo: Boolean(primaryVideo || backupVideo),
    videoStatusReason: item.videoStatusReason || undefined,
  };

  dayObj.topics.push(topicObj);
}

const DAY_TITLES = [
  "Number systems",
  "Factors, remainders & unit digits",
  "Simplification & fractions",
  "Percentages",
  "Ratios, variation & partnership",
  "Averages, ages & mixtures",
  "Profit, loss & discounts",
  "Interest, growth & depreciation",
  "Work, efficiency & pipes",
  "Speed, distance & motion",
  "Equations & inequalities",
  "Progressions & number series",
  "Counting & arrangements",
  "Probability",
  "Geometry, clocks & calendars",
  "Quantitative review",
  "Number, alphabet & mixed series",
  "Analogy, classification & coding",
  "Relations & directions",
  "Ranking, order & inequalities",
  "Syllogisms & deductions",
  "Seating arrangements",
  "Reasoning puzzles",
  "Statements & arguments",
  "Visual reasoning",
  "Reasoning review",
  "Grammar foundations",
  "Sentence structure & correction",
  "Vocabulary & expressions",
  "Reading comprehension",
  "Paragraphs & sentence order",
  "Cloze tests & context",
  "Verbal review",
  "Tables & data calculations",
  "Bar charts",
  "Line graphs & growth",
  "Pie charts",
  "Caselets & mixed data",
  "Sectional practice",
  "Final review",
];
for (const day of daysMap.values()) {
  day.title = DAY_TITLES[day.dayNumber - 1];
  day.estimatedMinutes = day.topics.reduce(
    (sum, topic) => sum + topic.estimatedMinutes,
    0
  );
  for (const topic of day.topics) {
    topic.title = topic.title[0].toUpperCase() + topic.title.slice(1);
    topic.conceptChecklist =
      day.trackSlug === "logical-reasoning"
        ? [
            "List the constraints before solving.",
            "Build a diagram or sequence where useful.",
            "Check every condition before choosing an answer.",
          ]
        : day.trackSlug === "verbal-ability"
          ? [
              "Identify the grammar rule or passage evidence.",
              "Explain why the chosen answer fits the context.",
              "Check alternatives for meaning and consistency.",
            ]
          : day.trackSlug === "data-interpretation"
            ? [
                "Read the labels, scale, and units.",
                "Extract the relevant values before calculating.",
                "Check totals, ratios, and percentage changes.",
              ]
            : [
                "Define the quantities and relevant rule.",
                "Work through an example before using shortcuts.",
                "Check units and test the result.",
              ];
  }
}
const finalDays = Array.from(daysMap.values());

// Write the JSON manifest
fs.writeFileSync(
  path.resolve("content/aptitude/aptitude-curriculum-manifest.json"),
  JSON.stringify({ version: 2, tracks: TRACKS, days: finalDays }, null, 2),
  "utf-8"
);

console.log("✅ Generated content/aptitude/aptitude-curriculum-manifest.json with:");
console.log(`- ${TRACKS.length} tracks`);
console.log(`- ${finalDays.length} days`);
const allTopics = finalDays.flatMap((d) => d.topics);
console.log(`- ${allTopics.length} total topics`);
const topicsWithVideos = allTopics.filter((t) => t.hasVideo);
console.log(`- ${topicsWithVideos.length} topics with source-checked video lessons`);
const missingVideoTopics = allTopics.filter((t) => !t.hasVideo);
console.log(`- ${missingVideoTopics.length} topics with MISSING_VIDEO status`);
