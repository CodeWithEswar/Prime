export const BASIC_MANUSCRIPT = `# Technical reading, without the noise

A short explanation should stay simple. **Strong claims** deserve clear language; *uncertainty* should stay visible. Use \`Map<String, List<Map.Entry<Integer, String>>>\` for identifiers, without losing mobile width.

## The invariant

> After every iteration, the active range contains every remaining candidate.

1. Establish the invariant.
2. Preserve it during each update.
3. Use it to explain termination.

### Check your reasoning

- Recognition
  - Contiguous range
    - Moving boundary
- [x] State the condition
- [ ] Explain the update

Read the [language reference](https://docs.oracle.com/en/java/). Unicode remains readable: సమీక్ష · तैयारी · π.

---

Do not confuse completing a task with reproducing the reasoning independently.`;
export const DSA_MANUSCRIPT = `## Binary search: preserve the candidate range

Every update removes values that cannot be the target. The range shrinks while the invariant stays true.

### Java

\`\`\`java
public final class BinarySearch {
    public static int search(int[] values, int target) {
        int left = 0;
        int right = values.length - 1;
        while (left <= right) {
            int middle = left + (right - left) / 2;
            if (values[middle] == target) return middle;
            if (values[middle] < target) left = middle + 1;
            else right = middle - 1;
        }
        return -1;
    }
}
\`\`\`

### Compare the approaches

| Approach | Time | Space |
| --- | --- | --- |
| Linear scan | \`O(n)\` | \`O(1)\` |
| Binary search | \`O(log n)\` | \`O(1)\` |

**Recall:** Why does the middle element stop being a candidate after a failed comparison?`;
export const TABLE_MANUSCRIPT = `## Choose a collection by its operations

| Structure | Lookup |
| --- | --- |
| HashMap | Expected \`O(1)\` |
| TreeMap | \`O(log n)\` |

| Collection | Indexed access | Insert at known node | Memory | Common interview use |
| --- | --- | --- | --- | --- |
| ArrayList | \`O(1)\` | \`O(n)\` shifting | Contiguous references | Fast indexed reads with a dynamic array |
| LinkedList | \`O(n)\` traversal | \`O(1)\` with a node reference | Additional node links | Queue or deque operations; distinguish traversal cost |
| HashMap | Key lookup | Expected \`O(1)\` | Buckets and entries | Frequency counting and complement lookup |

Long text is contained: \`com.prime.preparation.algorithms.collections.interview.TechnicalPreparationRepository\`.

[A deliberately long link](https://example.com/technical/reference/very/long/path/with/collection/and/algorithm/details/for/a/reading/fixture).`;
export const LANGUAGE_FIXTURES = [
  [
    "java",
    `@Override\npublic Map<String, List<Map.Entry<Integer, String>>> group() {\n    return entries.stream().collect(Collectors.groupingBy(Map.Entry::getKey));\n}\nrecord Result(int index, boolean found) {}`,
  ],
  [
    "tsx",
    `type Result<T> = { value: T } | { error: string };\nexport function Answer({ value }: { value: Result<string> }) {\n  return <pre>{"value" in value ? value.value : value.error}</pre>;\n}`,
  ],
  [
    "sql",
    `SELECT topic_id, COUNT(*) AS solved\nFROM user_problem_progress\nWHERE status = 'solved'\nGROUP BY topic_id;`,
  ],
  [
    "python",
    `def find(values, target):\n    for index, value in enumerate(values):\n        if value == target:\n            return index\n    return -1`,
  ],
  ["bash", `pnpm lint\npnpm typecheck\npnpm test\npnpm build`],
  [
    "json",
    `{\n  "stage": "Arrays",\n  "tasks": ["Review the invariant", "Explain complexity"],\n  "scheduledByAI": false\n}`,
  ],
  [
    "cpp",
    `template <typename T>\nstd::optional<T> first(const std::vector<T>& values) {\n    if (values.empty()) return std::nullopt;\n    return values.front();\n}`,
  ],
  ["c", `int maximum(int a, int b) {\n    return a > b ? a : b;\n}`],
  [
    "html",
    `<article class="note">\n  <h2>Recall</h2>\n  <p>Explain the invariant.</p>\n</article>`,
  ],
  ["css", `.note {\n  color: #fff;\n  background: #000;\n}`],
  ["yaml", `revision:\n  source: deterministic-engine\n  enabled: true`],
  ["markdown", `## Recall\n\n- Explain the invariant.\n- Compare the trade-offs.`],
  [
    "diff",
    `- int middle = (left + right) / 2;\n+ int middle = left + (right - left) / 2;`,
  ],
  ["unknown-language", `This stays safe plain text.\n<script>neverExecute()</script>`],
  ["text", `USER\n  |\nPRIME gateway\n  |\nAuthorized domain reads`],
] as const;
export const LANGUAGE_MANUSCRIPT = LANGUAGE_FIXTURES.map(
  ([language, source]) => `### ${language}\n\n\`\`\`${language}\n${source}\n\`\`\``
).join("\n\n");
export const BROKEN_MANUSCRIPT = `## Partial content stays readable

An **unfinished emphasis marker

| Column | Incomplete

\`\`\`java
public static int search(int[] values, int target) {
    int left = 0;
    // The next streamed chunk has not arrived yet.`;
export const LONG_MANUSCRIPT =
  DSA_MANUSCRIPT +
  "\n\n" +
  Array.from(
    { length: 16 },
    (_, i) =>
      `### Trade-off ${i + 1}\n\nA useful explanation connects a concrete operation to its cost. Preserve the invariant, identify the removed candidates, and explain why the update cannot discard the answer. Keep the claim distinct from the implementation detail.`
  ).join("\n\n");
