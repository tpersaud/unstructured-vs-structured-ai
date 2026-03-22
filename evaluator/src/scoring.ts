import type { RawResult, ScorecardRules } from './types.js';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function scoreCompletionSuccess(raw: RawResult): number {
  const { acceptanceChecksPassed, acceptanceChecksTotal } = raw.completion;
  if (acceptanceChecksTotal === 0) return 1;
  return clamp(Math.round((acceptanceChecksPassed / acceptanceChecksTotal) * 5), 1, 5);
}

export function scoreBuildAndTests(raw: RawResult): number {
  return raw.build.passed && raw.tests.overallPassed ? 5 : 1;
}

export function scoreCoverage(raw: RawResult, threshold: number): number {
  const percent = raw.coverage.linePercent;
  if (percent >= threshold) return 5;
  // Scale linearly: 0% → 1, threshold → 5
  const scaled = Math.round((percent / threshold) * 5);
  return clamp(scaled, 1, 5);
}

export function scoreArchitecture(raw: RawResult): number {
  return Math.max(1, 5 - raw.architecture.violations);
}

export function scorePromptEfficiency(promptCount: number): number {
  if (promptCount <= 5) return 5;
  if (promptCount === 6) return 4;
  if (promptCount === 7) return 3;
  if (promptCount === 8) return 2;
  return 1;
}

export function scoreTimeEfficiency(durationMinutes: number): number {
  if (durationMinutes <= 10) return 5;
  if (durationMinutes <= 20) return 4;
  if (durationMinutes <= 30) return 3;
  if (durationMinutes <= 45) return 2;
  return 1;
}

export interface ScoreRunInput {
  raw: RawResult;
  rules: ScorecardRules;
  promptCount: number;
  durationMinutes: number;
}

export interface Scores {
  completionSuccess: number;
  buildAndTests: number;
  coverage: number;
  architecture: number;
  promptEfficiency: number;
  timeEfficiency: number;
}

export function scoreRun(input: ScoreRunInput): Scores {
  const { raw, rules, promptCount, durationMinutes } = input;

  return {
    completionSuccess: scoreCompletionSuccess(raw),
    buildAndTests: scoreBuildAndTests(raw),
    coverage: scoreCoverage(raw, rules.coverage.threshold ?? 80),
    architecture: scoreArchitecture(raw),
    promptEfficiency: scorePromptEfficiency(promptCount),
    timeEfficiency: scoreTimeEfficiency(durationMinutes),
  };
}

export function totalScore(scores: Scores): number {
  return (
    scores.completionSuccess +
    scores.buildAndTests +
    scores.coverage +
    scores.architecture +
    scores.promptEfficiency +
    scores.timeEfficiency
  );
}

export const MAX_TOTAL = 30;
