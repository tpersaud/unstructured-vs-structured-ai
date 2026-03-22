import { describe, it, expect } from 'vitest';
import { evaluateGate } from '../src/gate.js';
import type { RunConfig } from '../src/types.js';
import type { Scores } from '../src/scoring.js';

function makeConfig(overrides: Partial<RunConfig['passGate']> = {}): RunConfig {
  return {
    runId: 'test-run',
    mode: 'prompt-only',
    models: {
      plan: 'claude-opus-4.6',
      ask: 'claude-sonnet-4.5',
      code: 'claude-sonnet-4.5',
      validate: 'claude-sonnet-4.5',
      refactorMechanical: 'claude-sonnet-4.5',
      refactorStructural: 'claude-opus-4.6',
    },
    paths: {
      appRoot: 'app',
      solutionFile: 'app/Holdem.sln',
      rawResults: 'results/raw',
      scoredResults: 'results/scored',
      promptLogs: 'results/prompts',
      timingFile: 'logs/timing.json',
    },
    evaluation: {
      coverageThreshold: 80,
      maxPrompts: 5,
      scorecardRulesFile: 'config/scorecard-rules.json',
    },
    passGate: {
      completionSuccessMin: 4,
      buildAndTestsMin: 4,
      architectureMin: 4,
      ...overrides,
    },
    task: {
      name: 'Texas Holdem MVC Web Application',
      specFile: 'docs/02-task-spec.md',
    },
  };
}

function makeScores(overrides: Partial<Scores> = {}): Scores {
  return {
    completionSuccess: 4,
    buildAndTests: 5,
    coverage: 5,
    architecture: 4,
    promptEfficiency: 5,
    timeEfficiency: 3,
    ...overrides,
  };
}

describe('evaluateGate', () => {
  it('passes when all scores meet minimums', () => {
    const result = evaluateGate(makeScores(), makeConfig());
    expect(result.passed).toBe(true);
    expect(result.checks).toHaveLength(3);
    expect(result.checks.every((c) => c.passed)).toBe(true);
  });

  it('passes when scores exceed minimums', () => {
    const scores = makeScores({
      completionSuccess: 5,
      buildAndTests: 5,
      architecture: 5,
    });
    const result = evaluateGate(scores, makeConfig());
    expect(result.passed).toBe(true);
  });

  it('fails when completionSuccess is below minimum', () => {
    const scores = makeScores({ completionSuccess: 3 });
    const result = evaluateGate(scores, makeConfig());
    expect(result.passed).toBe(false);
    const failedCheck = result.checks.find((c) => c.category === 'completionSuccess');
    expect(failedCheck?.passed).toBe(false);
    expect(failedCheck?.score).toBe(3);
    expect(failedCheck?.minimum).toBe(4);
  });

  it('fails when buildAndTests is below minimum', () => {
    const scores = makeScores({ buildAndTests: 1 });
    const result = evaluateGate(scores, makeConfig());
    expect(result.passed).toBe(false);
  });

  it('fails when architecture is below minimum', () => {
    const scores = makeScores({ architecture: 1 });
    const result = evaluateGate(scores, makeConfig());
    expect(result.passed).toBe(false);
  });

  it('fails when multiple categories are below minimum', () => {
    const scores = makeScores({
      completionSuccess: 2,
      buildAndTests: 1,
      architecture: 1,
    });
    const result = evaluateGate(scores, makeConfig());
    expect(result.passed).toBe(false);
    const failedChecks = result.checks.filter((c) => !c.passed);
    expect(failedChecks).toHaveLength(3);
  });

  it('passes at exact threshold boundary', () => {
    const scores = makeScores({
      completionSuccess: 4,
      buildAndTests: 4,
      architecture: 4,
    });
    const result = evaluateGate(scores, makeConfig());
    expect(result.passed).toBe(true);
  });

  it('does not check non-gated categories', () => {
    const scores = makeScores({
      coverage: 1,
      promptEfficiency: 1,
      timeEfficiency: 1,
    });
    const result = evaluateGate(scores, makeConfig());
    expect(result.passed).toBe(true);
  });
});
