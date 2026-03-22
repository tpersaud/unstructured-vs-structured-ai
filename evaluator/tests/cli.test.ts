import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { RunConfig, RawResult, ScorecardRules, ScoredResult } from '../src/types.js';
import {
  readRunConfig,
  readRawResults,
  readScorecardRules,
  writeScoredResult,
  countPrompts,
  readTimingMinutes,
} from '../src/io.js';
import { scoreRun, totalScore, MAX_TOTAL } from '../src/scoring.js';
import { evaluateGate } from '../src/gate.js';

const TEST_DIR = join(process.cwd(), 'test-cli-integration');

describe('CLI integration', () => {
  beforeEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  const setupTestRun = (scenario: 'pass' | 'fail'): string => {
    const config: RunConfig = {
      runId: 'cli-test-run',
      mode: 'prompt-only',
      purpose: 'pipeline-verification',
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
        scorecardRulesFile: 'scorecard-rules.json',
      },
      passGate: {
        completionSuccessMin: 4,
        buildAndTestsMin: 4,
        architectureMin: 4,
      },
      task: {
        name: 'Test Task',
        specFile: 'docs/spec.md',
      },
    };

    const rawPass: RawResult = {
      completion: { acceptanceChecksPassed: 4, acceptanceChecksTotal: 5 },
      build: { passed: true },
      tests: { overallPassed: true },
      coverage: { linePercent: 82 },
      architecture: { violations: 1 },
      timing: { durationMinutes: 21 },
    };

    const rawFail: RawResult = {
      completion: { acceptanceChecksPassed: 2, acceptanceChecksTotal: 5 },
      build: { passed: true },
      tests: { overallPassed: false },
      coverage: { linePercent: 35 },
      architecture: { violations: 5 },
      timing: { durationMinutes: 50 },
    };

    const rules: ScorecardRules = {
      completionSuccess: { type: 'ratio', maxScore: 5 },
      buildAndTests: { type: 'boolean', maxScore: 5 },
      coverage: { type: 'threshold', threshold: 80, maxScore: 5 },
      architecture: { type: 'penalty', maxScore: 5 },
      promptEfficiency: { type: 'inverse', maxScore: 5 },
      timeEfficiency: { type: 'inverse', maxScore: 5 },
    };

    writeFileSync(join(TEST_DIR, 'run.config.json'), JSON.stringify(config));
    writeFileSync(join(TEST_DIR, 'scorecard-rules.json'), JSON.stringify(rules));

    const rawDir = join(TEST_DIR, 'results', 'raw');
    mkdirSync(rawDir, { recursive: true });
    writeFileSync(
      join(rawDir, 'iteration-01.json'),
      JSON.stringify(scenario === 'pass' ? rawPass : rawFail)
    );

    const promptsDir = join(TEST_DIR, 'results', 'prompts');
    mkdirSync(promptsDir, { recursive: true });
    writeFileSync(join(promptsDir, 'session.jsonl'), '{"prompt": "test1"}\n{"prompt": "test2"}');

    const logsDir = join(TEST_DIR, 'logs');
    mkdirSync(logsDir, { recursive: true });
    writeFileSync(join(logsDir, 'timing.json'), JSON.stringify({ durationMinutes: 21 }));

    return TEST_DIR;
  };

  it('evaluates PASS scenario correctly', () => {
    const configDir = setupTestRun('pass');

    const config = readRunConfig(configDir);
    const rawResults = readRawResults(configDir, config.paths.rawResults);
    const rules = readScorecardRules(configDir);
    const raw = rawResults[0];

    const promptCount = countPrompts(
      configDir,
      config.paths.promptLogs,
      config.evaluation.maxPrompts
    );
    const durationMinutes = readTimingMinutes(
      configDir,
      config.paths.timingFile,
      raw.timing.durationMinutes
    );

    const scores = scoreRun({ raw, rules, promptCount, durationMinutes });
    const total = totalScore(scores);
    const percentage = Math.round((total / MAX_TOTAL) * 100);
    const gateResults = evaluateGate(scores, config);

    const scoredResult: ScoredResult = {
      runId: config.runId,
      mode: config.mode,
      ...(config.purpose && { purpose: config.purpose }),
      scores,
      total,
      maxTotal: MAX_TOTAL,
      percentage,
      passed: gateResults.passed,
      gateResults,
    };

    const outputPath = writeScoredResult(configDir, config.paths.scoredResults, scoredResult);

    expect(gateResults.passed).toBe(true);
    expect(existsSync(outputPath)).toBe(true);

    const savedResult = JSON.parse(readFileSync(outputPath, 'utf-8')) as ScoredResult;
    expect(savedResult.passed).toBe(true);
    expect(savedResult.purpose).toBe('pipeline-verification');
  });

  it('evaluates FAIL scenario correctly', () => {
    const configDir = setupTestRun('fail');

    const config = readRunConfig(configDir);
    const rawResults = readRawResults(configDir, config.paths.rawResults);
    const rules = readScorecardRules(configDir);
    const raw = rawResults[0];

    const promptCount = countPrompts(
      configDir,
      config.paths.promptLogs,
      config.evaluation.maxPrompts
    );
    const durationMinutes = readTimingMinutes(
      configDir,
      config.paths.timingFile,
      raw.timing.durationMinutes
    );

    const scores = scoreRun({ raw, rules, promptCount, durationMinutes });
    const total = totalScore(scores);
    const percentage = Math.round((total / MAX_TOTAL) * 100);
    const gateResults = evaluateGate(scores, config);

    const scoredResult: ScoredResult = {
      runId: config.runId,
      mode: config.mode,
      ...(config.purpose && { purpose: config.purpose }),
      scores,
      total,
      maxTotal: MAX_TOTAL,
      percentage,
      passed: gateResults.passed,
      gateResults,
    };

    const outputPath = writeScoredResult(configDir, config.paths.scoredResults, scoredResult);

    expect(gateResults.passed).toBe(false);
    expect(existsSync(outputPath)).toBe(true);

    const savedResult = JSON.parse(readFileSync(outputPath, 'utf-8')) as ScoredResult;
    expect(savedResult.passed).toBe(false);
    expect(savedResult.purpose).toBe('pipeline-verification');
  });

  it('produces correct scores for PASS scenario', () => {
    const configDir = setupTestRun('pass');
    const config = readRunConfig(configDir);
    const rawResults = readRawResults(configDir, config.paths.rawResults);
    const rules = readScorecardRules(configDir);
    const raw = rawResults[0];

    const scores = scoreRun({
      raw,
      rules,
      promptCount: 2,
      durationMinutes: 21,
    });

    expect(scores.completionSuccess).toBe(4);
    expect(scores.buildAndTests).toBe(5);
    expect(scores.coverage).toBe(5);
    expect(scores.architecture).toBe(4);
    expect(scores.promptEfficiency).toBe(5);
    expect(scores.timeEfficiency).toBe(3);
  });
});
