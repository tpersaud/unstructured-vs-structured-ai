import { describe, expect, it } from 'vitest';
import {
  MAX_TOTAL,
  scoreArchitecture,
  scoreBuildAndTests,
  scoreCompletionSuccess,
  scoreCoverage,
  scorePromptEfficiency,
  scoreRun,
  scoreTimeEfficiency,
  totalScore,
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
    // Arrange
    const raw = makeRaw();

    // Act
    const result = scoreCompletionSuccess(raw);

    // Assert
    expect(result).toBe(4);
  });

  it('scores 5/5 as 5', () => {
    // Arrange
    const raw = makeRaw({ completion: { acceptanceChecksPassed: 5, acceptanceChecksTotal: 5 } });

    // Act
    const result = scoreCompletionSuccess(raw);

    // Assert
    expect(result).toBe(5);
  });

  it('scores 0/5 as 1 (floor)', () => {
    // Arrange
    const raw = makeRaw({ completion: { acceptanceChecksPassed: 0, acceptanceChecksTotal: 5 } });

    // Act
    const result = scoreCompletionSuccess(raw);

    // Assert
    expect(result).toBe(1);
  });

  it('scores 1/5 as 1', () => {
    // Arrange
    const raw = makeRaw({ completion: { acceptanceChecksPassed: 1, acceptanceChecksTotal: 5 } });

    // Act
    const result = scoreCompletionSuccess(raw);

    // Assert
    expect(result).toBe(1);
  });

  it('scores 3/5 as 3', () => {
    // Arrange
    const raw = makeRaw({ completion: { acceptanceChecksPassed: 3, acceptanceChecksTotal: 5 } });

    // Act
    const result = scoreCompletionSuccess(raw);

    // Assert
    expect(result).toBe(3);
  });

  it('handles 0 total as 1', () => {
    // Arrange
    const raw = makeRaw({ completion: { acceptanceChecksPassed: 0, acceptanceChecksTotal: 0 } });

    // Act
    const result = scoreCompletionSuccess(raw);

    // Assert
    expect(result).toBe(1);
  });
});

describe('scoreBuildAndTests', () => {
  it('returns 5 when both pass', () => {
    // Arrange
    const raw = makeRaw();

    // Act
    const result = scoreBuildAndTests(raw);

    // Assert
    expect(result).toBe(5);
  });

  it('returns 1 when build fails', () => {
    // Arrange
    const raw = makeRaw({ build: { passed: false } });

    // Act
    const result = scoreBuildAndTests(raw);

    // Assert
    expect(result).toBe(1);
  });

  it('returns 1 when tests fail', () => {
    // Arrange
    const raw = makeRaw({ tests: { overallPassed: false } });

    // Act
    const result = scoreBuildAndTests(raw);

    // Assert
    expect(result).toBe(1);
  });

  it('returns 1 when both fail', () => {
    // Arrange
    const raw = makeRaw({ build: { passed: false }, tests: { overallPassed: false } });

    // Act
    const result = scoreBuildAndTests(raw);

    // Assert
    expect(result).toBe(1);
  });
});

describe('scoreCoverage', () => {
  it('returns 5 at threshold', () => {
    // Arrange
    const raw = makeRaw({ coverage: { linePercent: 80 } });
    const threshold = 80;

    // Act
    const result = scoreCoverage(raw, threshold);

    // Assert
    expect(result).toBe(5);
  });

  it('returns 5 above threshold', () => {
    // Arrange
    const raw = makeRaw({ coverage: { linePercent: 100 } });
    const threshold = 80;

    // Act
    const result = scoreCoverage(raw, threshold);

    // Assert
    expect(result).toBe(5);
  });

  it('returns 1 at 0%', () => {
    // Arrange
    const raw = makeRaw({ coverage: { linePercent: 0 } });
    const threshold = 80;

    // Act
    const result = scoreCoverage(raw, threshold);

    // Assert
    expect(result).toBe(1);
  });

  it('scales linearly below threshold', () => {
    // Arrange
    const raw = makeRaw({ coverage: { linePercent: 40 } });
    const threshold = 80;
    // 40/80 * 5 = 2.5 → rounds to 3

    // Act
    const result = scoreCoverage(raw, threshold);

    // Assert
    expect(result).toBe(3);
  });
});

describe('scoreArchitecture', () => {
  it('returns 5 with 0 violations', () => {
    // Arrange
    const raw = makeRaw({ architecture: { violations: 0 } });

    // Act
    const result = scoreArchitecture(raw);

    // Assert
    expect(result).toBe(5);
  });

  it('returns 4 with 1 violation', () => {
    // Arrange
    const raw = makeRaw({ architecture: { violations: 1 } });

    // Act
    const result = scoreArchitecture(raw);

    // Assert
    expect(result).toBe(4);
  });

  it('returns 1 with 4 violations (floor)', () => {
    // Arrange
    const raw = makeRaw({ architecture: { violations: 4 } });

    // Act
    const result = scoreArchitecture(raw);

    // Assert
    expect(result).toBe(1);
  });

  it('returns 1 with 10 violations (clamped)', () => {
    // Arrange
    const raw = makeRaw({ architecture: { violations: 10 } });

    // Act
    const result = scoreArchitecture(raw);

    // Assert
    expect(result).toBe(1);
  });
});

describe('scorePromptEfficiency', () => {
  it('returns 5 for <= 5 prompts', () => {
    // Arrange
    const promptCount1 = 1;
    const promptCount2 = 5;

    // Act
    const result1 = scorePromptEfficiency(promptCount1);
    const result2 = scorePromptEfficiency(promptCount2);

    // Assert
    expect(result1).toBe(5);
    expect(result2).toBe(5);
  });

  it('returns 4 for 6 prompts', () => {
    // Arrange
    const promptCount = 6;

    // Act
    const result = scorePromptEfficiency(promptCount);

    // Assert
    expect(result).toBe(4);
  });

  it('returns 3 for 7 prompts', () => {
    // Arrange
    const promptCount = 7;

    // Act
    const result = scorePromptEfficiency(promptCount);

    // Assert
    expect(result).toBe(3);
  });

  it('returns 2 for 8 prompts', () => {
    // Arrange
    const promptCount = 8;

    // Act
    const result = scorePromptEfficiency(promptCount);

    // Assert
    expect(result).toBe(2);
  });

  it('returns 1 for 9+ prompts', () => {
    // Arrange
    const promptCount1 = 9;
    const promptCount2 = 20;

    // Act
    const result1 = scorePromptEfficiency(promptCount1);
    const result2 = scorePromptEfficiency(promptCount2);

    // Assert
    expect(result1).toBe(1);
    expect(result2).toBe(1);
  });
});

describe('scoreTimeEfficiency', () => {
  it('returns 5 for <= 10 min', () => {
    // Arrange
    const duration1 = 5;
    const duration2 = 10;

    // Act
    const result1 = scoreTimeEfficiency(duration1);
    const result2 = scoreTimeEfficiency(duration2);

    // Assert
    expect(result1).toBe(5);
    expect(result2).toBe(5);
  });

  it('returns 4 for <= 20 min', () => {
    // Arrange
    const duration1 = 15;
    const duration2 = 20;

    // Act
    const result1 = scoreTimeEfficiency(duration1);
    const result2 = scoreTimeEfficiency(duration2);

    // Assert
    expect(result1).toBe(4);
    expect(result2).toBe(4);
  });

  it('returns 3 for <= 30 min', () => {
    // Arrange
    const duration1 = 25;
    const duration2 = 30;

    // Act
    const result1 = scoreTimeEfficiency(duration1);
    const result2 = scoreTimeEfficiency(duration2);

    // Assert
    expect(result1).toBe(3);
    expect(result2).toBe(3);
  });

  it('returns 2 for <= 45 min', () => {
    // Arrange
    const duration1 = 35;
    const duration2 = 45;

    // Act
    const result1 = scoreTimeEfficiency(duration1);
    const result2 = scoreTimeEfficiency(duration2);

    // Assert
    expect(result1).toBe(2);
    expect(result2).toBe(2);
  });

  it('returns 1 for > 45 min', () => {
    // Arrange
    const duration1 = 46;
    const duration2 = 120;

    // Act
    const result1 = scoreTimeEfficiency(duration1);
    const result2 = scoreTimeEfficiency(duration2);

    // Assert
    expect(result1).toBe(1);
    expect(result2).toBe(1);
  });
});

describe('scoreRun (integration)', () => {
  it('produces expected scores for fixture data', () => {
    // Arrange
    const raw = makeRaw();
    const input = {
      raw,
      rules: defaultRules,
      promptCount: 5,
      durationMinutes: 21,
    };

    // Act
    const scores = scoreRun(input);

    // Assert
    expect(scores.completionSuccess).toBe(4);
    expect(scores.buildAndTests).toBe(5);
    expect(scores.coverage).toBe(5);
    expect(scores.architecture).toBe(4);
    expect(scores.promptEfficiency).toBe(5);
    expect(scores.timeEfficiency).toBe(3);
  });

  it('total matches sum of scores', () => {
    // Arrange
    const raw = makeRaw();
    const input = {
      raw,
      rules: defaultRules,
      promptCount: 5,
      durationMinutes: 21,
    };
    const scores = scoreRun(input);

    // Act
    const total = totalScore(scores);

    // Assert
    expect(total).toBe(26);
  });

  it('MAX_TOTAL is 30', () => {
    // Arrange
    // (no setup needed for constant)

    // Act
    const maxTotal = MAX_TOTAL;

    // Assert
    expect(maxTotal).toBe(30);
  });

  it('uses default threshold when coverage.threshold is undefined', () => {
    // Arrange
    const raw = makeRaw({ coverage: { linePercent: 80 } });
    const rulesWithoutThreshold: ScorecardRules = {
      ...defaultRules,
      coverage: { type: 'threshold', maxScore: 5 },
    };
    const input = {
      raw,
      rules: rulesWithoutThreshold,
      promptCount: 5,
      durationMinutes: 21,
    };

    // Act
    const scores = scoreRun(input);

    // Assert
    expect(scores.coverage).toBe(5);
  });
});

describe('scoreCompletionSuccess - edge cases', () => {
  it('handles very large acceptance check totals', () => {
    // Arrange
    const raw = makeRaw({
      completion: { acceptanceChecksPassed: 999, acceptanceChecksTotal: 1000 },
    });

    // Act
    const result = scoreCompletionSuccess(raw);

    // Assert
    expect(result).toBe(5);
  });

  it('handles fractional scores that round up', () => {
    // Arrange
    const raw = makeRaw({ completion: { acceptanceChecksPassed: 2, acceptanceChecksTotal: 5 } });

    // Act
    const result = scoreCompletionSuccess(raw);

    // Assert
    expect(result).toBe(2);
  });
});

describe('scoreCoverage - edge cases', () => {
  it('handles coverage exactly at 1%', () => {
    // Arrange
    const raw = makeRaw({ coverage: { linePercent: 1 } });
    const threshold = 80;

    // Act
    const result = scoreCoverage(raw, threshold);

    // Assert
    expect(result).toBe(1);
  });

  it('handles coverage at 99%', () => {
    // Arrange
    const raw = makeRaw({ coverage: { linePercent: 99 } });
    const threshold = 80;

    // Act
    const result = scoreCoverage(raw, threshold);

    // Assert
    expect(result).toBe(5);
  });

  it('handles threshold at 100%', () => {
    // Arrange
    const raw = makeRaw({ coverage: { linePercent: 100 } });
    const threshold = 100;

    // Act
    const result = scoreCoverage(raw, threshold);

    // Assert
    expect(result).toBe(5);
  });

  it('handles coverage below threshold with precise rounding', () => {
    // Arrange
    const raw = makeRaw({ coverage: { linePercent: 79 } });
    const threshold = 80;
    // 79/80 * 5 = 4.9375 → rounds to 5

    // Act
    const result = scoreCoverage(raw, threshold);

    // Assert
    expect(result).toBe(5);
  });
});

describe('scoreArchitecture - edge cases', () => {
  it('handles 2 violations', () => {
    // Arrange
    const raw = makeRaw({ architecture: { violations: 2 } });

    // Act
    const result = scoreArchitecture(raw);

    // Assert
    expect(result).toBe(3);
  });

  it('handles 3 violations', () => {
    // Arrange
    const raw = makeRaw({ architecture: { violations: 3 } });

    // Act
    const result = scoreArchitecture(raw);

    // Assert
    expect(result).toBe(2);
  });

  it('handles very large violation counts', () => {
    // Arrange
    const raw = makeRaw({ architecture: { violations: 100 } });

    // Act
    const result = scoreArchitecture(raw);

    // Assert
    expect(result).toBe(1);
  });
});

describe('scorePromptEfficiency - edge cases', () => {
  it('handles 0 prompts', () => {
    // Arrange
    const promptCount = 0;

    // Act
    const result = scorePromptEfficiency(promptCount);

    // Assert
    expect(result).toBe(5);
  });

  it('handles exactly maxPrompts boundary (5)', () => {
    // Arrange
    const promptCount = 5;

    // Act
    const result = scorePromptEfficiency(promptCount);

    // Assert
    expect(result).toBe(5);
  });

  it('handles very large prompt counts', () => {
    // Arrange
    const promptCount = 1000;

    // Act
    const result = scorePromptEfficiency(promptCount);

    // Assert
    expect(result).toBe(1);
  });
});

describe('scoreTimeEfficiency - edge cases', () => {
  it('handles 0 minutes', () => {
    // Arrange
    const duration = 0;

    // Act
    const result = scoreTimeEfficiency(duration);

    // Assert
    expect(result).toBe(5);
  });

  it('handles exactly 10 minute boundary', () => {
    // Arrange
    const duration = 10;

    // Act
    const result = scoreTimeEfficiency(duration);

    // Assert
    expect(result).toBe(5);
  });

  it('handles exactly 20 minute boundary', () => {
    // Arrange
    const duration = 20;

    // Act
    const result = scoreTimeEfficiency(duration);

    // Assert
    expect(result).toBe(4);
  });

  it('handles exactly 30 minute boundary', () => {
    // Arrange
    const duration = 30;

    // Act
    const result = scoreTimeEfficiency(duration);

    // Assert
    expect(result).toBe(3);
  });

  it('handles exactly 45 minute boundary', () => {
    // Arrange
    const duration = 45;

    // Act
    const result = scoreTimeEfficiency(duration);

    // Assert
    expect(result).toBe(2);
  });

  it('handles very large durations', () => {
    // Arrange
    const duration = 500;

    // Act
    const result = scoreTimeEfficiency(duration);

    // Assert
    expect(result).toBe(1);
  });
});

describe('totalScore - edge cases', () => {
  it('calculates total for all minimum scores', () => {
    // Arrange
    const scores = {
      completionSuccess: 1,
      buildAndTests: 1,
      coverage: 1,
      architecture: 1,
      promptEfficiency: 1,
      timeEfficiency: 1,
    };

    // Act
    const total = totalScore(scores);

    // Assert
    expect(total).toBe(6);
  });

  it('calculates total for all maximum scores', () => {
    // Arrange
    const scores = {
      completionSuccess: 5,
      buildAndTests: 5,
      coverage: 5,
      architecture: 5,
      promptEfficiency: 5,
      timeEfficiency: 5,
    };

    // Act
    const total = totalScore(scores);

    // Assert
    expect(total).toBe(30);
  });
});
