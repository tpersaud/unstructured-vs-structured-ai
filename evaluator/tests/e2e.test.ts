import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { evaluateGate } from '../src/gate.js';
import {
  countPrompts,
  readRawResults,
  readRunConfig,
  readScorecardRules,
  readTimingMinutes,
  writeScoredResult,
} from '../src/io.js';
import { MAX_TOTAL, scoreRun, totalScore } from '../src/scoring.js';
import type { RawResult, RunConfig, ScorecardRules, ScoredResult } from '../src/types.js';

const E2E_TEST_DIR = join(process.cwd(), 'test-e2e-temp');

/**
 * BDD-style End-to-End Tests
 * These tests verify complete evaluation workflows from start to finish
 */

describe('Feature: CLI Evaluation Workflow', () => {
  beforeEach(() => {
    if (existsSync(E2E_TEST_DIR)) {
      rmSync(E2E_TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(E2E_TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(E2E_TEST_DIR)) {
      rmSync(E2E_TEST_DIR, { recursive: true, force: true });
    }
  });

  describe('Scenario: Evaluate passing fixture via CLI', () => {
    it('should complete full evaluation and produce passing result', () => {
      // Given a valid run configuration for a passing scenario
      const config: RunConfig = {
        runId: 'e2e-pass-test',
        mode: 'unstructured-context',
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
          name: 'E2E Test Task',
          specFile: 'docs/spec.md',
        },
      };

      const rawResult: RawResult = {
        completion: { acceptanceChecksPassed: 5, acceptanceChecksTotal: 5 },
        build: { passed: true },
        tests: { overallPassed: true },
        coverage: { linePercent: 95 },
        architecture: { violations: 0 },
        timing: { durationMinutes: 15 },
      };

      const rules: ScorecardRules = {
        completionSuccess: { type: 'ratio', maxScore: 5 },
        buildAndTests: { type: 'boolean', maxScore: 5 },
        coverage: { type: 'threshold', threshold: 80, maxScore: 5 },
        architecture: { type: 'penalty', maxScore: 5 },
        promptEfficiency: { type: 'inverse', maxScore: 5 },
        timeEfficiency: { type: 'inverse', maxScore: 5 },
      };

      writeFileSync(join(E2E_TEST_DIR, 'run.config.json'), JSON.stringify(config));
      writeFileSync(join(E2E_TEST_DIR, 'scorecard-rules.json'), JSON.stringify(rules));

      const rawDir = join(E2E_TEST_DIR, 'results', 'raw');
      mkdirSync(rawDir, { recursive: true });
      writeFileSync(join(rawDir, 'iteration-01.json'), JSON.stringify(rawResult));

      const promptsDir = join(E2E_TEST_DIR, 'results', 'prompts');
      mkdirSync(promptsDir, { recursive: true });
      writeFileSync(join(promptsDir, 'session.jsonl'), '{"prompt": "test1"}\n{"prompt": "test2"}');

      const logsDir = join(E2E_TEST_DIR, 'logs');
      mkdirSync(logsDir, { recursive: true });
      writeFileSync(join(logsDir, 'timing.json'), JSON.stringify({ durationMinutes: 15 }));

      // When the evaluation runs
      const loadedConfig = readRunConfig(E2E_TEST_DIR);
      const rawResults = readRawResults(E2E_TEST_DIR, loadedConfig.paths.rawResults);
      const loadedRules = readScorecardRules(E2E_TEST_DIR);
      const raw = rawResults[0];

      const promptCount = countPrompts(
        E2E_TEST_DIR,
        loadedConfig.paths.promptLogs,
        loadedConfig.evaluation.maxPrompts
      );
      const durationMinutes = readTimingMinutes(
        E2E_TEST_DIR,
        loadedConfig.paths.timingFile,
        raw.timing.durationMinutes
      );

      const scores = scoreRun({ raw, rules: loadedRules, promptCount, durationMinutes });
      const total = totalScore(scores);
      const percentage = Math.round((total / MAX_TOTAL) * 100);
      const gateResults = evaluateGate(scores, loadedConfig);

      const scoredResult: ScoredResult = {
        runId: loadedConfig.runId,
        mode: loadedConfig.mode,
        ...(loadedConfig.purpose && { purpose: loadedConfig.purpose }),
        scores,
        total,
        maxTotal: MAX_TOTAL,
        percentage,
        passed: gateResults.passed,
        gateResults,
      };

      const outputPath = writeScoredResult(
        E2E_TEST_DIR,
        loadedConfig.paths.scoredResults,
        scoredResult
      );

      // Then the evaluation should pass
      expect(gateResults.passed).toBe(true);
      expect(existsSync(outputPath)).toBe(true);
      expect(scores.completionSuccess).toBe(5);
      expect(scores.buildAndTests).toBe(5);
      expect(scores.coverage).toBe(5);
      expect(scores.architecture).toBe(5);
      expect(total).toBe(29);
      expect(percentage).toBe(97);

      // And the output file should contain correct data
      const savedResult = JSON.parse(readFileSync(outputPath, 'utf-8')) as ScoredResult;
      expect(savedResult.runId).toBe('e2e-pass-test');
      expect(savedResult.purpose).toBe('pipeline-verification');
      expect(savedResult.passed).toBe(true);
    });
  });

  describe('Scenario: Evaluate failing fixture via CLI', () => {
    it('should complete full evaluation and produce failing result', () => {
      // Given a valid run configuration for a failing scenario
      const config: RunConfig = {
        runId: 'e2e-fail-test',
        mode: 'structured-context',
        purpose: 'experiment',
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
          name: 'E2E Fail Test',
          specFile: 'docs/spec.md',
        },
      };

      const rawResult: RawResult = {
        completion: { acceptanceChecksPassed: 2, acceptanceChecksTotal: 5 },
        build: { passed: false },
        tests: { overallPassed: false },
        coverage: { linePercent: 35 },
        architecture: { violations: 5 },
        timing: { durationMinutes: 60 },
      };

      const rules: ScorecardRules = {
        completionSuccess: { type: 'ratio', maxScore: 5 },
        buildAndTests: { type: 'boolean', maxScore: 5 },
        coverage: { type: 'threshold', threshold: 80, maxScore: 5 },
        architecture: { type: 'penalty', maxScore: 5 },
        promptEfficiency: { type: 'inverse', maxScore: 5 },
        timeEfficiency: { type: 'inverse', maxScore: 5 },
      };

      writeFileSync(join(E2E_TEST_DIR, 'run.config.json'), JSON.stringify(config));
      writeFileSync(join(E2E_TEST_DIR, 'scorecard-rules.json'), JSON.stringify(rules));

      const rawDir = join(E2E_TEST_DIR, 'results', 'raw');
      mkdirSync(rawDir, { recursive: true });
      writeFileSync(join(rawDir, 'iteration-01.json'), JSON.stringify(rawResult));

      const promptsDir = join(E2E_TEST_DIR, 'results', 'prompts');
      mkdirSync(promptsDir, { recursive: true });
      writeFileSync(
        join(promptsDir, 'session.jsonl'),
        Array(10).fill('{"prompt": "test"}').join('\n')
      );

      const logsDir = join(E2E_TEST_DIR, 'logs');
      mkdirSync(logsDir, { recursive: true });
      writeFileSync(join(logsDir, 'timing.json'), JSON.stringify({ durationMinutes: 60 }));

      // When the evaluation runs
      const loadedConfig = readRunConfig(E2E_TEST_DIR);
      const rawResults = readRawResults(E2E_TEST_DIR, loadedConfig.paths.rawResults);
      const loadedRules = readScorecardRules(E2E_TEST_DIR);
      const raw = rawResults[0];

      const promptCount = countPrompts(
        E2E_TEST_DIR,
        loadedConfig.paths.promptLogs,
        loadedConfig.evaluation.maxPrompts
      );
      const durationMinutes = readTimingMinutes(
        E2E_TEST_DIR,
        loadedConfig.paths.timingFile,
        raw.timing.durationMinutes
      );

      const scores = scoreRun({ raw, rules: loadedRules, promptCount, durationMinutes });
      const total = totalScore(scores);
      const percentage = Math.round((total / MAX_TOTAL) * 100);
      const gateResults = evaluateGate(scores, loadedConfig);

      const scoredResult: ScoredResult = {
        runId: loadedConfig.runId,
        mode: loadedConfig.mode,
        ...(loadedConfig.purpose && { purpose: loadedConfig.purpose }),
        scores,
        total,
        maxTotal: MAX_TOTAL,
        percentage,
        passed: gateResults.passed,
        gateResults,
      };

      const outputPath = writeScoredResult(
        E2E_TEST_DIR,
        loadedConfig.paths.scoredResults,
        scoredResult
      );

      // Then the evaluation should fail
      expect(gateResults.passed).toBe(false);
      expect(existsSync(outputPath)).toBe(true);
      expect(scores.completionSuccess).toBe(2);
      expect(scores.buildAndTests).toBe(1);
      expect(total).toBeLessThan(MAX_TOTAL);

      // And the output file should contain correct data
      const savedResult = JSON.parse(readFileSync(outputPath, 'utf-8')) as ScoredResult;
      expect(savedResult.runId).toBe('e2e-fail-test');
      expect(savedResult.purpose).toBe('experiment');
      expect(savedResult.passed).toBe(false);
      expect(savedResult.mode).toBe('structured-context');
    });
  });

  describe('Scenario: Handle missing run directory', () => {
    it('should throw error when run directory does not exist', () => {
      // Given a non-existent run directory
      const nonExistentDir = join(E2E_TEST_DIR, 'does-not-exist');

      // When trying to read run config
      // Then it should throw an error
      expect(() => readRunConfig(nonExistentDir)).toThrow('Missing run.config.json at:');
    });
  });

  describe('Scenario: Handle invalid run configuration', () => {
    it('should throw error when run.config.json is malformed', () => {
      // Given a malformed run.config.json
      writeFileSync(join(E2E_TEST_DIR, 'run.config.json'), 'invalid json {');

      // When trying to read run config
      // Then it should throw an error
      expect(() => readRunConfig(E2E_TEST_DIR)).toThrow();
    });
  });

  describe('Scenario: Handle missing raw results', () => {
    it('should throw error when raw results directory is missing', () => {
      // Given a config without raw results
      const config: RunConfig = {
        runId: 'test',
        mode: 'unstructured-context',
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
          name: 'Test',
          specFile: 'docs/spec.md',
        },
      };

      writeFileSync(join(E2E_TEST_DIR, 'run.config.json'), JSON.stringify(config));

      // When trying to read raw results
      // Then it should throw an error
      expect(() => readRawResults(E2E_TEST_DIR, 'results/raw')).toThrow(
        'Missing raw results directory:'
      );
    });
  });

  describe('Scenario: Handle corrupted scorecard rules', () => {
    it('should throw error when scorecard-rules.json is malformed', () => {
      // Given a malformed scorecard-rules.json
      mkdirSync(E2E_TEST_DIR, { recursive: true });
      writeFileSync(join(E2E_TEST_DIR, 'scorecard-rules.json'), '{ invalid json');

      // When trying to read scorecard rules
      // Then it should throw an error
      expect(() => readScorecardRules(E2E_TEST_DIR)).toThrow();
    });
  });
});

describe('Feature: Purpose Field Validation', () => {
  beforeEach(() => {
    if (existsSync(E2E_TEST_DIR)) {
      rmSync(E2E_TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(E2E_TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(E2E_TEST_DIR)) {
      rmSync(E2E_TEST_DIR, { recursive: true, force: true });
    }
  });

  describe('Scenario: Pipeline verification run produces correct purpose', () => {
    it('should include purpose field in scored result', () => {
      // Given a config with purpose set to pipeline-verification
      const config: RunConfig = {
        runId: 'pipeline-test',
        mode: 'unstructured-context',
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
          name: 'Test',
          specFile: 'docs/spec.md',
        },
      };

      // When creating a scored result
      const scoredResult: ScoredResult = {
        runId: config.runId,
        mode: config.mode,
        ...(config.purpose && { purpose: config.purpose }),
        scores: {
          completionSuccess: 4,
          buildAndTests: 5,
          coverage: 5,
          architecture: 4,
          promptEfficiency: 5,
          timeEfficiency: 3,
        },
        total: 26,
        maxTotal: 30,
        percentage: 87,
        passed: true,
        gateResults: {
          passed: true,
          checks: [],
        },
      };

      // Then the purpose should be included
      expect(scoredResult.purpose).toBe('pipeline-verification');
    });
  });

  describe('Scenario: Experiment run produces correct purpose', () => {
    it('should include purpose field set to experiment', () => {
      // Given a config with purpose set to experiment
      const config: RunConfig = {
        runId: 'experiment-test',
        mode: 'structured-context',
        purpose: 'experiment',
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
          name: 'Test',
          specFile: 'docs/spec.md',
        },
      };

      // When creating a scored result
      const scoredResult: ScoredResult = {
        runId: config.runId,
        mode: config.mode,
        ...(config.purpose && { purpose: config.purpose }),
        scores: {
          completionSuccess: 4,
          buildAndTests: 5,
          coverage: 5,
          architecture: 4,
          promptEfficiency: 5,
          timeEfficiency: 3,
        },
        total: 26,
        maxTotal: 30,
        percentage: 87,
        passed: true,
        gateResults: {
          passed: true,
          checks: [],
        },
      };

      // Then the purpose should be experiment
      expect(scoredResult.purpose).toBe('experiment');
    });
  });

  describe('Scenario: Missing purpose field defaults correctly', () => {
    it('should handle missing purpose field gracefully', () => {
      // Given a config without purpose field
      const config: RunConfig = {
        runId: 'no-purpose-test',
        mode: 'unstructured-context',
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
          name: 'Test',
          specFile: 'docs/spec.md',
        },
      };

      // When creating a scored result
      const scoredResult: ScoredResult = {
        runId: config.runId,
        mode: config.mode,
        ...(config.purpose && { purpose: config.purpose }),
        scores: {
          completionSuccess: 4,
          buildAndTests: 5,
          coverage: 5,
          architecture: 4,
          promptEfficiency: 5,
          timeEfficiency: 3,
        },
        total: 26,
        maxTotal: 30,
        percentage: 87,
        passed: true,
        gateResults: {
          passed: true,
          checks: [],
        },
      };

      // Then the purpose should be undefined
      expect(scoredResult.purpose).toBeUndefined();
    });
  });
});

describe('Feature: Complete Evaluation Pipeline', () => {
  beforeEach(() => {
    if (existsSync(E2E_TEST_DIR)) {
      rmSync(E2E_TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(E2E_TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(E2E_TEST_DIR)) {
      rmSync(E2E_TEST_DIR, { recursive: true, force: true });
    }
  });

  describe('Scenario: Full pipeline from raw results to scored output', () => {
    it('should process all evaluation steps correctly', () => {
      // Given complete test data
      const config: RunConfig = {
        runId: 'full-pipeline-test',
        mode: 'unstructured-context',
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
          name: 'Full Pipeline Test',
          specFile: 'docs/spec.md',
        },
      };

      const rawResult: RawResult = {
        completion: { acceptanceChecksPassed: 4, acceptanceChecksTotal: 5 },
        build: { passed: true },
        tests: { overallPassed: true },
        coverage: { linePercent: 82 },
        architecture: { violations: 1 },
        timing: { durationMinutes: 21 },
      };

      const rules: ScorecardRules = {
        completionSuccess: { type: 'ratio', maxScore: 5 },
        buildAndTests: { type: 'boolean', maxScore: 5 },
        coverage: { type: 'threshold', threshold: 80, maxScore: 5 },
        architecture: { type: 'penalty', maxScore: 5 },
        promptEfficiency: { type: 'inverse', maxScore: 5 },
        timeEfficiency: { type: 'inverse', maxScore: 5 },
      };

      writeFileSync(join(E2E_TEST_DIR, 'run.config.json'), JSON.stringify(config));
      writeFileSync(join(E2E_TEST_DIR, 'scorecard-rules.json'), JSON.stringify(rules));

      const rawDir = join(E2E_TEST_DIR, 'results', 'raw');
      mkdirSync(rawDir, { recursive: true });
      writeFileSync(join(rawDir, 'iteration-01.json'), JSON.stringify(rawResult));

      const promptsDir = join(E2E_TEST_DIR, 'results', 'prompts');
      mkdirSync(promptsDir, { recursive: true });
      writeFileSync(
        join(promptsDir, 'session.jsonl'),
        '{"prompt": "test1"}\n{"prompt": "test2"}\n{"prompt": "test3"}'
      );

      const logsDir = join(E2E_TEST_DIR, 'logs');
      mkdirSync(logsDir, { recursive: true });
      writeFileSync(join(logsDir, 'timing.json'), JSON.stringify({ durationMinutes: 21 }));

      // When running the full pipeline
      const loadedConfig = readRunConfig(E2E_TEST_DIR);
      const rawResults = readRawResults(E2E_TEST_DIR, loadedConfig.paths.rawResults);
      const loadedRules = readScorecardRules(E2E_TEST_DIR);
      const raw = rawResults[0];

      const promptCount = countPrompts(
        E2E_TEST_DIR,
        loadedConfig.paths.promptLogs,
        loadedConfig.evaluation.maxPrompts
      );
      const durationMinutes = readTimingMinutes(
        E2E_TEST_DIR,
        loadedConfig.paths.timingFile,
        raw.timing.durationMinutes
      );

      const scores = scoreRun({ raw, rules: loadedRules, promptCount, durationMinutes });
      const total = totalScore(scores);
      const percentage = Math.round((total / MAX_TOTAL) * 100);
      const gateResults = evaluateGate(scores, loadedConfig);

      const scoredResult: ScoredResult = {
        runId: loadedConfig.runId,
        mode: loadedConfig.mode,
        ...(loadedConfig.purpose && { purpose: loadedConfig.purpose }),
        scores,
        total,
        maxTotal: MAX_TOTAL,
        percentage,
        passed: gateResults.passed,
        gateResults,
      };

      const outputPath = writeScoredResult(
        E2E_TEST_DIR,
        loadedConfig.paths.scoredResults,
        scoredResult
      );

      // Then all steps should complete successfully
      expect(loadedConfig.runId).toBe('full-pipeline-test');
      expect(rawResults).toHaveLength(1);
      expect(promptCount).toBe(3);
      expect(durationMinutes).toBe(21);
      expect(scores).toHaveProperty('completionSuccess');
      expect(scores).toHaveProperty('buildAndTests');
      expect(scores).toHaveProperty('coverage');
      expect(scores).toHaveProperty('architecture');
      expect(scores).toHaveProperty('promptEfficiency');
      expect(scores).toHaveProperty('timeEfficiency');
      expect(total).toBe(26);
      expect(percentage).toBe(87);
      expect(gateResults.passed).toBe(true);
      expect(existsSync(outputPath)).toBe(true);

      // And the output file should have correct structure
      const savedResult = JSON.parse(readFileSync(outputPath, 'utf-8')) as ScoredResult;
      expect(savedResult).toHaveProperty('runId');
      expect(savedResult).toHaveProperty('mode');
      expect(savedResult).toHaveProperty('purpose');
      expect(savedResult).toHaveProperty('scores');
      expect(savedResult).toHaveProperty('total');
      expect(savedResult).toHaveProperty('maxTotal');
      expect(savedResult).toHaveProperty('percentage');
      expect(savedResult).toHaveProperty('passed');
      expect(savedResult).toHaveProperty('gateResults');
    });
  });
});
