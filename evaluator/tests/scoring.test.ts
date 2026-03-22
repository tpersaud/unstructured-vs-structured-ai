import { describe, it, expect } from 'vitest';
import {
  scoreCompletionSuccess,
  scoreBuildAndTests,
  scoreCoverage,
  scoreArchitecture,
  scorePromptEfficiency,
  scoreTimeEfficiency,
  scoreRun,
  totalScore,
  MAX_TOTAL,
} from '../src/scoring.js';
import type { RawResult, ScorecardRules } from '../src/types.js';

function makeRaw(overrides: Partial<RawResult> = {}): RawResult {
  return {
    completion: { acceptanceChecksPassed: 4, acceptanceChecksTotal: 5 },
    build: { passed: true },
    tests: { overallPassed: true },
    coverage: { linePercent: 82 },
    architecture: { violations: 1 },
    timing: { durationMinutes: 21 },
    ...overrides,
  };
}

const defaultRules: ScorecardRules = {
  completionSuccess: { type: 'ratio', maxScore: 5 },
  buildAndTests: { type: 'boolean', maxScore: 5 },
  coverage: { type: 'threshold', threshold: 80, maxScore: 5 },
  architecture: { type: 'penalty', maxScore: 5 },
  promptEfficiency: { type: 'inverse', maxScore: 5 },
  timeEfficiency: { type: 'inverse', maxScore: 5 },
};

describe('scoreCompletionSuccess', () => {
  it('scores 4/5 as 4', () => {
    expect(scoreCompletionSuccess(makeRaw())).toBe(4);
  });

  it('scores 5/5 as 5', () => {
    const raw = makeRaw({ completion: { acceptanceChecksPassed: 5, acceptanceChecksTotal: 5 } });
    expect(scoreCompletionSuccess(raw)).toBe(5);
  });

  it('scores 0/5 as 1 (floor)', () => {
    const raw = makeRaw({ completion: { acceptanceChecksPassed: 0, acceptanceChecksTotal: 5 } });
    expect(scoreCompletionSuccess(raw)).toBe(1);
  });

  it('scores 1/5 as 1', () => {
    const raw = makeRaw({ completion: { acceptanceChecksPassed: 1, acceptanceChecksTotal: 5 } });
    expect(scoreCompletionSuccess(raw)).toBe(1);
  });

  it('scores 3/5 as 3', () => {
    const raw = makeRaw({ completion: { acceptanceChecksPassed: 3, acceptanceChecksTotal: 5 } });
    expect(scoreCompletionSuccess(raw)).toBe(3);
  });

  it('handles 0 total as 1', () => {
    const raw = makeRaw({ completion: { acceptanceChecksPassed: 0, acceptanceChecksTotal: 0 } });
    expect(scoreCompletionSuccess(raw)).toBe(1);
  });
});

describe('scoreBuildAndTests', () => {
  it('returns 5 when both pass', () => {
    expect(scoreBuildAndTests(makeRaw())).toBe(5);
  });

  it('returns 1 when build fails', () => {
    const raw = makeRaw({ build: { passed: false } });
    expect(scoreBuildAndTests(raw)).toBe(1);
  });

  it('returns 1 when tests fail', () => {
    const raw = makeRaw({ tests: { overallPassed: false } });
    expect(scoreBuildAndTests(raw)).toBe(1);
  });

  it('returns 1 when both fail', () => {
    const raw = makeRaw({ build: { passed: false }, tests: { overallPassed: false } });
    expect(scoreBuildAndTests(raw)).toBe(1);
  });
});

describe('scoreCoverage', () => {
  it('returns 5 at threshold', () => {
    const raw = makeRaw({ coverage: { linePercent: 80 } });
    expect(scoreCoverage(raw, 80)).toBe(5);
  });

  it('returns 5 above threshold', () => {
    const raw = makeRaw({ coverage: { linePercent: 100 } });
    expect(scoreCoverage(raw, 80)).toBe(5);
  });

  it('returns 1 at 0%', () => {
    const raw = makeRaw({ coverage: { linePercent: 0 } });
    expect(scoreCoverage(raw, 80)).toBe(1);
  });

  it('scales linearly below threshold', () => {
    const raw = makeRaw({ coverage: { linePercent: 40 } });
    // 40/80 * 5 = 2.5 → rounds to 3
    expect(scoreCoverage(raw, 80)).toBe(3);
  });
});

describe('scoreArchitecture', () => {
  it('returns 5 with 0 violations', () => {
    const raw = makeRaw({ architecture: { violations: 0 } });
    expect(scoreArchitecture(raw)).toBe(5);
  });

  it('returns 4 with 1 violation', () => {
    const raw = makeRaw({ architecture: { violations: 1 } });
    expect(scoreArchitecture(raw)).toBe(4);
  });

  it('returns 1 with 4 violations (floor)', () => {
    const raw = makeRaw({ architecture: { violations: 4 } });
    expect(scoreArchitecture(raw)).toBe(1);
  });

  it('returns 1 with 10 violations (clamped)', () => {
    const raw = makeRaw({ architecture: { violations: 10 } });
    expect(scoreArchitecture(raw)).toBe(1);
  });
});

describe('scorePromptEfficiency', () => {
  it('returns 5 for <= 5 prompts', () => {
    expect(scorePromptEfficiency(1)).toBe(5);
    expect(scorePromptEfficiency(5)).toBe(5);
  });

  it('returns 4 for 6 prompts', () => {
    expect(scorePromptEfficiency(6)).toBe(4);
  });

  it('returns 3 for 7 prompts', () => {
    expect(scorePromptEfficiency(7)).toBe(3);
  });

  it('returns 2 for 8 prompts', () => {
    expect(scorePromptEfficiency(8)).toBe(2);
  });

  it('returns 1 for 9+ prompts', () => {
    expect(scorePromptEfficiency(9)).toBe(1);
    expect(scorePromptEfficiency(20)).toBe(1);
  });
});

describe('scoreTimeEfficiency', () => {
  it('returns 5 for <= 10 min', () => {
    expect(scoreTimeEfficiency(5)).toBe(5);
    expect(scoreTimeEfficiency(10)).toBe(5);
  });

  it('returns 4 for <= 20 min', () => {
    expect(scoreTimeEfficiency(15)).toBe(4);
    expect(scoreTimeEfficiency(20)).toBe(4);
  });

  it('returns 3 for <= 30 min', () => {
    expect(scoreTimeEfficiency(25)).toBe(3);
    expect(scoreTimeEfficiency(30)).toBe(3);
  });

  it('returns 2 for <= 45 min', () => {
    expect(scoreTimeEfficiency(35)).toBe(2);
    expect(scoreTimeEfficiency(45)).toBe(2);
  });

  it('returns 1 for > 45 min', () => {
    expect(scoreTimeEfficiency(46)).toBe(1);
    expect(scoreTimeEfficiency(120)).toBe(1);
  });
});

describe('scoreRun (integration)', () => {
  it('produces expected scores for fixture data', () => {
    const raw = makeRaw();
    const scores = scoreRun({
      raw,
      rules: defaultRules,
      promptCount: 5,
      durationMinutes: 21,
    });

    expect(scores.completionSuccess).toBe(4);
    expect(scores.buildAndTests).toBe(5);
    expect(scores.coverage).toBe(5);
    expect(scores.architecture).toBe(4);
    expect(scores.promptEfficiency).toBe(5);
    expect(scores.timeEfficiency).toBe(3);
  });

  it('total matches sum of scores', () => {
    const raw = makeRaw();
    const scores = scoreRun({
      raw,
      rules: defaultRules,
      promptCount: 5,
      durationMinutes: 21,
    });
    expect(totalScore(scores)).toBe(26);
  });

  it('MAX_TOTAL is 30', () => {
    expect(MAX_TOTAL).toBe(30);
  });
});
