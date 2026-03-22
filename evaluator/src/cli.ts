import chalk from 'chalk';
import minimist from 'minimist';
import { evaluateGate } from './gate.js';
import {
  countPrompts,
  readRawResults,
  readRunConfig,
  readScorecardRules,
  readTimingMinutes,
  writeScoredResult,
} from './io.js';
import { MAX_TOTAL, scoreRun, totalScore } from './scoring.js';
import type { ScoredResult } from './types.js';

function main(): void {
  const args = minimist(process.argv.slice(2), {
    string: ['run-dir', 'config-dir'],
    default: { 'config-dir': './config' },
  });

  const runDir = args['run-dir'] as string | undefined;
  const configDir = args['config-dir'] as string;

  if (!runDir) {
    console.error(chalk.red('ERROR: --run-dir is required'));
    console.error('Usage: evaluate --run-dir <path> [--config-dir <path>]');
    process.exit(1);
  }

  // Read inputs
  const config = readRunConfig(runDir);
  const rawResults = readRawResults(runDir, config.paths.rawResults);
  const rules = readScorecardRules(configDir);

  // Use first raw result (v1: single iteration)
  const raw = rawResults[0];

  // Gather supplementary signals
  const promptCount = countPrompts(runDir, config.paths.promptLogs, config.evaluation.maxPrompts);
  const durationMinutes = readTimingMinutes(
    runDir,
    config.paths.timingFile,
    raw.timing.durationMinutes
  );

  // Score
  const scores = scoreRun({ raw, rules, promptCount, durationMinutes });
  const total = totalScore(scores);
  const percentage = Math.round((total / MAX_TOTAL) * 100);

  // Gate
  const gateResults = evaluateGate(scores, config);

  // Build scored result
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

  // Write output
  const outputPath = writeScoredResult(runDir, config.paths.scoredResults, scoredResult);

  // Print CLI summary
  console.log('');
  console.log(chalk.bold(`Run: ${config.runId}`));
  if (config.purpose) {
    console.log(`Purpose: ${config.purpose}`);
  }
  console.log(`Mode: ${config.mode}`);
  console.log('');
  console.log(chalk.bold('Scores:'));
  console.log(`  - Completion:        ${scores.completionSuccess}`);
  console.log(`  - Build & Tests:     ${scores.buildAndTests}`);
  console.log(`  - Coverage:          ${scores.coverage}`);
  console.log(`  - Architecture:      ${scores.architecture}`);
  console.log(`  - Prompt Efficiency: ${scores.promptEfficiency}`);
  console.log(`  - Time Efficiency:   ${scores.timeEfficiency}`);
  console.log('');
  console.log(chalk.bold(`TOTAL: ${total} / ${MAX_TOTAL} (${percentage}%)`));
  console.log('');

  // Gate details
  for (const check of gateResults.checks) {
    const icon = check.passed ? chalk.green('✓') : chalk.red('✗');
    console.log(`  ${icon} ${check.category}: ${check.score} (min: ${check.minimum})`);
  }
  console.log('');

  if (gateResults.passed) {
    console.log(chalk.green.bold('STATUS: PASS'));
  } else {
    console.log(chalk.red.bold('STATUS: FAIL'));
  }

  console.log('');
  console.log(`Scored output: ${outputPath}`);

  // Exit code
  process.exit(gateResults.passed ? 0 : 1);
}

main();
