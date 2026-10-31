/**
 * Domain Revision & Spaced Repetition Types
 */

export interface RevisionItem {
  id: string;
  userId: string;
  problemId: string;
  intervalDays: number;
  easeFactor: number;
  repetitionCount: number;
  nextDueDate: string; // YYYY-MM-DD
}

export type ReviewGrade = 0 | 1 | 2 | 3 | 4 | 5; // Standard 0-5 response rating
