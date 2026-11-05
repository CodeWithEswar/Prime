# Aptitude lesson mapping and layout

## Findings

The supplied JSON is identical to content/aptitude/raw-curriculum.json: 40 days and 132 concepts. Its statuses include 48 topics marked NOT_SEARCHED. The previous manifest had 50 concepts without a primary video, while the interface described missing videos as "No video required."

The former generator used a second hardcoded association table rather than the per-topic candidate data. Known mismatches included:

| Concept                      | Previous association                        | Replacement                                            |
| ---------------------------- | ------------------------------------------- | ------------------------------------------------------ |
| Growth and depreciation      | Height and distance                         | Exponential growth and decay                           |
| Geometry aptitude            | Abstract reasoning test                     | Triangle foundations and circle theorems               |
| Order and sequence           | Generic aptitude test                       | Ranking and ordering                                   |
| Grouping puzzles             | General puzzle video and permutation backup | Grouping-based reasoning puzzles                       |
| Mixed series                 | No video                                    | Alphanumeric series                                    |
| Stacked bars                 | No video                                    | Drawing and interpreting stacked bar charts            |
| Paragraph and sentence order | No videos                                   | Para jumbles, sentence jumbles, and passage completion |

## Source records

- video-curation.json contains explicit topic-to-primary/alternative associations, with coverage notes for narrower lessons.
- video-catalog.json stores 171 unique selected videos with current YouTube oEmbed titles, authors, endpoint URLs, check timestamps, and HTTP 200 status.
- rejected-video-sources.json records the pie-chart candidate that returned HTTP 401. A Corbettmaths lesson replaced it.
- The regenerated manifest contains all 132 original topic IDs, their original day order, a main lesson for every topic, and alternatives where selected.
- No instructor names or 20-minute durations are fabricated when source metadata is absent. The generator refuses to include a selected video without a successful source check.

Public metadata availability does not certify spoken language, complete syllabus coverage, playback in every region, or absence of account restrictions. The independent spoken-language and full-coverage flags remain false. Narrower or broader resources have coverage notes; review videos are described as walkthroughs, not official or scored company assessments.

## Interface

The learning plan now has subject/day selects, a compact day rail, and a desktop side column. Shared cards show each concept, its real lesson title, instructor, duration when available, alternative source, notes, and completion controls. The concept directory uses responsive cards, design-system search/select controls, and a lesson availability filter.

The player uses the shared accessible Dialog with focus containment, Escape/close behavior, main/alternative selection, and a direct YouTube fallback. Watching a video never automatically marks it complete.

Progress is keyed by topic ID and video ID, matching the existing database uniqueness constraint. Reusing a video across two concepts no longer shares the watch checkbox. Manual watch confirmation preserves measured seconds rather than inventing ten minutes watched. Subject completion updates with the learner's saved concept status.

The progress tab shows recorded completion and watch confirmations. Hardcoded accuracy, question counts, solve time, readiness claims, and a pretend timed-test launch were removed from the presentation.

## Regeneration and checks

    npm run aptitude:verify-videos
    npm run aptitude:generate

Generation uses checked-in metadata and makes no network requests. The optional scripts/aptitude/search-videos.mjs records public YouTube search candidates for editorial review; search rank never automatically changes published associations.

    node node_modules/vitest/vitest.mjs run tests/unit/aptitude-curriculum.test.ts tests/unit/aptitude-progress.test.tsx
    node node_modules/@playwright/test/cli.js test --config scripts/planner-qa.config.ts aptitude.spec.ts

The isolated browser backend tests mobile/tablet/desktop widths, missing-concept replacements, exact iframe IDs, alternative selection, directory search, persisted topic-specific watch progress, and review-day navigation. Video embeds are stubbed in browser tests; live public metadata was checked separately.

The application reads lesson metadata from the manifest. No new schema migration or live database content import is required for these mapping changes. Existing user progress IDs and rows are preserved.
