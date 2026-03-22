import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { RawResult, RunConfig, ScorecardRules, ScoredResult } from './types.js';

export function readRunConfig(runDir: string): RunConfig {
  const configPath = join(runDir, 'run.config.json');
  if (!existsSync(configPath)) {
    throw new Error(`Missing run.config.json at: ${configPath}`);
  }
  const raw = readFileSync(configPath, 'utf-8');
  return JSON.parse(raw) as RunConfig;
}

export function readRawResults(runDir: string, rawResultsPath: string): RawResult[] {
  const dir = join(runDir, rawResultsPath);
  if (!existsSync(dir)) {
    throw new Error(`Missing raw results directory: ${dir}`);
  }

  const files = readdirSync(dir).filter((f: string) => f.endsWith('.json'));
  if (files.length === 0) {
    throw new Error(`No raw result JSON files found in: ${dir}`);
  }

  return files.map((file: string) => {
    const content = readFileSync(join(dir, file), 'utf-8');
    return JSON.parse(content) as RawResult;
  });
}

export function readScorecardRules(configDir: string): ScorecardRules {
  const rulesPath = join(configDir, 'scorecard-rules.json');
  if (!existsSync(rulesPath)) {
    throw new Error(`Missing scorecard-rules.json at: ${rulesPath}`);
  }
  const raw = readFileSync(rulesPath, 'utf-8');
  return JSON.parse(raw) as ScorecardRules;
}

export function countPrompts(runDir: string, promptLogsPath: string, maxPrompts: number): number {
  const dir = join(runDir, promptLogsPath);
  if (!existsSync(dir)) {
    console.warn(
      `Prompt logs directory not found: ${dir}. Defaulting to maxPrompts (${maxPrompts}).`
    );
    return maxPrompts;
  }

  const files = readdirSync(dir).filter((f: string) => f.endsWith('.jsonl'));
  if (files.length === 0) {
    console.warn(`No .jsonl files found in: ${dir}. Defaulting to maxPrompts (${maxPrompts}).`);
    return maxPrompts;
  }

  let count = 0;
  for (const file of files) {
    const content = readFileSync(join(dir, file), 'utf-8');
    const lines = content.split('\n').filter((line: string) => line.trim().length > 0);
    count += lines.length;
  }

  return count;
}

export function readTimingMinutes(
  runDir: string,
  timingFilePath: string,
  fallback: number
): number {
  const timingPath = join(runDir, timingFilePath);
  if (!existsSync(timingPath)) {
    console.warn(`Timing file not found: ${timingPath}. Using raw fallback (${fallback} min).`);
    return fallback;
  }

  const raw = readFileSync(timingPath, 'utf-8');
  const data = JSON.parse(raw) as { durationMinutes?: number };
  return data.durationMinutes ?? fallback;
}

export function writeScoredResult(
  runDir: string,
  scoredResultsPath: string,
  result: ScoredResult
): string {
  const dir = join(runDir, scoredResultsPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const outputPath = join(dir, 'iteration-01.scored.json');
  writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
  return outputPath;
}
