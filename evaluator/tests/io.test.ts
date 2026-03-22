import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  countPrompts,
  readRawResults,
  readRunConfig,
  readScorecardRules,
  readTimingMinutes,
  writeScoredResult,
} from '../src/io.js';
import type { RawResult, RunConfig, ScorecardRules, ScoredResult } from '../src/types.js';

const TEST_DIR = join(process.cwd(), 'test-temp');

describe('io functions', () => {
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

  describe('readRunConfig', () => {
    it('reads valid run.config.json successfully', () => {
      // Arrange
      const config: RunConfig = {
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
        },
        task: {
          name: 'Test Task',
          specFile: 'docs/spec.md',
        },
      };
      writeFileSync(join(TEST_DIR, 'run.config.json'), JSON.stringify(config));

      // Act
      const result = readRunConfig(TEST_DIR);

      // Assert
      expect(result).toEqual(config);
    });

    it('throws error when run.config.json is missing', () => {
      // Arrange
      // (TEST_DIR exists but has no run.config.json)

      // Act & Assert
      expect(() => readRunConfig(TEST_DIR)).toThrow('Missing run.config.json at:');
    });
  });

  describe('readRawResults', () => {
    it('reads raw result JSON files successfully', () => {
      // Arrange
      const rawDir = join(TEST_DIR, 'results', 'raw');
      mkdirSync(rawDir, { recursive: true });

      const raw1: RawResult = {
        completion: { acceptanceChecksPassed: 4, acceptanceChecksTotal: 5 },
        build: { passed: true },
        tests: { overallPassed: true },
        coverage: { linePercent: 82 },
        architecture: { violations: 1 },
        timing: { durationMinutes: 21 },
      };
      writeFileSync(join(rawDir, 'iteration-01.json'), JSON.stringify(raw1));

      // Act
      const results = readRawResults(TEST_DIR, 'results/raw');

      // Assert
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(raw1);
    });

    it('throws error when raw results directory is missing', () => {
      // Arrange
      // (results/raw directory does not exist)

      // Act & Assert
      expect(() => readRawResults(TEST_DIR, 'results/raw')).toThrow(
        'Missing raw results directory:'
      );
    });

    it('throws error when no JSON files found', () => {
      // Arrange
      const rawDir = join(TEST_DIR, 'results', 'raw');
      mkdirSync(rawDir, { recursive: true });

      // Act & Assert
      expect(() => readRawResults(TEST_DIR, 'results/raw')).toThrow(
        'No raw result JSON files found in:'
      );
    });
  });

  describe('readScorecardRules', () => {
    it('reads scorecard rules successfully', () => {
      // Arrange
      const configDir = join(TEST_DIR, 'config');
      mkdirSync(configDir, { recursive: true });

      const rules: ScorecardRules = {
        completionSuccess: { type: 'ratio', maxScore: 5 },
        buildAndTests: { type: 'boolean', maxScore: 5 },
        coverage: { type: 'threshold', threshold: 80, maxScore: 5 },
        architecture: { type: 'penalty', maxScore: 5 },
        promptEfficiency: { type: 'inverse', maxScore: 5 },
        timeEfficiency: { type: 'inverse', maxScore: 5 },
      };
      writeFileSync(join(configDir, 'scorecard-rules.json'), JSON.stringify(rules));

      // Act
      const result = readScorecardRules(configDir);

      // Assert
      expect(result).toEqual(rules);
    });

    it('throws error when scorecard-rules.json is missing', () => {
      // Arrange
      const configDir = join(TEST_DIR, 'config');
      mkdirSync(configDir, { recursive: true });

      // Act & Assert
      expect(() => readScorecardRules(configDir)).toThrow('Missing scorecard-rules.json at:');
    });
  });

  describe('countPrompts', () => {
    it('counts prompts from jsonl files', () => {
      // Arrange
      const promptsDir = join(TEST_DIR, 'results', 'prompts');
      mkdirSync(promptsDir, { recursive: true });

      const prompts = '{"prompt": "test1"}\n{"prompt": "test2"}\n{"prompt": "test3"}';
      writeFileSync(join(promptsDir, 'session.jsonl'), prompts);

      // Act
      const count = countPrompts(TEST_DIR, 'results/prompts', 5);

      // Assert
      expect(count).toBe(3);
    });

    it('returns maxPrompts when directory does not exist', () => {
      // Arrange
      const maxPrompts = 5;

      // Act
      const count = countPrompts(TEST_DIR, 'results/prompts', maxPrompts);

      // Assert
      expect(count).toBe(5);
    });

    it('returns maxPrompts when no jsonl files found', () => {
      // Arrange
      const promptsDir = join(TEST_DIR, 'results', 'prompts');
      mkdirSync(promptsDir, { recursive: true });
      const maxPrompts = 5;

      // Act
      const count = countPrompts(TEST_DIR, 'results/prompts', maxPrompts);

      // Assert
      expect(count).toBe(5);
    });

    it('ignores empty lines in jsonl files', () => {
      // Arrange
      const promptsDir = join(TEST_DIR, 'results', 'prompts');
      mkdirSync(promptsDir, { recursive: true });

      const prompts = '{"prompt": "test1"}\n\n{"prompt": "test2"}\n  \n{"prompt": "test3"}\n';
      writeFileSync(join(promptsDir, 'session.jsonl'), prompts);

      // Act
      const count = countPrompts(TEST_DIR, 'results/prompts', 5);

      // Assert
      expect(count).toBe(3);
    });
  });

  describe('readTimingMinutes', () => {
    it('reads timing from timing.json', () => {
      // Arrange
      const logsDir = join(TEST_DIR, 'logs');
      mkdirSync(logsDir, { recursive: true });

      const timing = { durationMinutes: 25 };
      writeFileSync(join(logsDir, 'timing.json'), JSON.stringify(timing));

      // Act
      const result = readTimingMinutes(TEST_DIR, 'logs/timing.json', 30);

      // Assert
      expect(result).toBe(25);
    });

    it('returns fallback when timing file does not exist', () => {
      // Arrange
      const fallback = 30;

      // Act
      const result = readTimingMinutes(TEST_DIR, 'logs/timing.json', fallback);

      // Assert
      expect(result).toBe(30);
    });

    it('returns fallback when durationMinutes is missing', () => {
      // Arrange
      const logsDir = join(TEST_DIR, 'logs');
      mkdirSync(logsDir, { recursive: true });

      writeFileSync(join(logsDir, 'timing.json'), JSON.stringify({}));
      const fallback = 30;

      // Act
      const result = readTimingMinutes(TEST_DIR, 'logs/timing.json', fallback);

      // Assert
      expect(result).toBe(30);
    });
  });

  describe('writeScoredResult', () => {
    it('writes scored result and returns path', () => {
      // Arrange
      const scoredResult: ScoredResult = {
        runId: 'test-run',
        mode: 'prompt-only',
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

      // Act
      const outputPath = writeScoredResult(TEST_DIR, 'results/scored', scoredResult);

      // Assert
      expect(outputPath).toBe(join(TEST_DIR, 'results/scored/iteration-01.scored.json'));
      expect(existsSync(outputPath)).toBe(true);
    });

    it('creates directory if it does not exist', () => {
      // Arrange
      const scoredResult: ScoredResult = {
        runId: 'test-run',
        mode: 'prompt-only',
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
      const scoredDir = join(TEST_DIR, 'results/scored');
      expect(existsSync(scoredDir)).toBe(false);

      // Act
      writeScoredResult(TEST_DIR, 'results/scored', scoredResult);

      // Assert
      expect(existsSync(scoredDir)).toBe(true);
    });
  });
});
