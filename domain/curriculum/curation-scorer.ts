/**
 * Explainable Curation Scoring Formula
 *
 * CoreScore =
 *     0.30 × CurriculumImportance
 *   + 0.20 × CollectionConsensus
 *   + 0.15 × CompanyBreadth
 *   + 0.10 × CompanyFrequency
 *   + 0.15 × PatternValue
 *   + 0.10 × PrerequisiteValue
 */

export interface CurationSignals {
  curriculumImportance: number; // 0..1 (e.g. foundational pattern coverage)
  collectionOverlapCount: number; // Striver, Love Babbar, AlgoPrep, etc.
  maxCollections: number; // typically 4-6
  uniqueCompanyCount: number; // breadth across top companies
  maxCompanyBreadth: number; // baseline max (e.g. 50+)
  totalCompanyFrequency: number; // interview occurrences
  maxCompanyFrequency: number; // baseline max (e.g. 500+)
  patternValue: number; // 0..1 (uniqueness of pattern, transferability)
  prerequisiteValue: number; // 0..1 (serves as prerequisite for other problems)
}

export interface CurationScoreBreakdown {
  curriculumImportanceScore: number;
  collectionConsensusScore: number;
  companyBreadthScore: number;
  companyFrequencyScore: number;
  patternValueScore: number;
  prerequisiteValueScore: number;
  totalScore: number;
}

export function calculateCurationScore(
  signals: CurationSignals
): CurationScoreBreakdown {
  const normCollection =
    signals.maxCollections > 0
      ? Math.min(1.0, signals.collectionOverlapCount / signals.maxCollections)
      : 0;

  const normBreadth =
    signals.maxCompanyBreadth > 0
      ? Math.min(1.0, signals.uniqueCompanyCount / signals.maxCompanyBreadth)
      : 0;

  const normFreq =
    signals.maxCompanyFrequency > 0
      ? Math.min(1.0, Math.log10(1 + signals.totalCompanyFrequency) / Math.log10(1 + signals.maxCompanyFrequency))
      : 0;

  const curriculumImportanceScore = 0.30 * Math.min(1.0, Math.max(0, signals.curriculumImportance));
  const collectionConsensusScore = 0.20 * normCollection;
  const companyBreadthScore = 0.15 * normBreadth;
  const companyFrequencyScore = 0.10 * normFreq;
  const patternValueScore = 0.15 * Math.min(1.0, Math.max(0, signals.patternValue));
  const prerequisiteValueScore = 0.10 * Math.min(1.0, Math.max(0, signals.prerequisiteValue));

  const totalScore = Number(
    (
      curriculumImportanceScore +
      collectionConsensusScore +
      companyBreadthScore +
      companyFrequencyScore +
      patternValueScore +
      prerequisiteValueScore
    ).toFixed(4)
  );

  return {
    curriculumImportanceScore,
    collectionConsensusScore,
    companyBreadthScore,
    companyFrequencyScore,
    patternValueScore,
    prerequisiteValueScore,
    totalScore,
  };
}

