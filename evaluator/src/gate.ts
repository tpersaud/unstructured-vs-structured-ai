import type { RunConfig, PassGateResult, PassGateCheck } from './types.js';
import type { Scores } from './scoring.js';

export function evaluateGate(scores: Scores, config: RunConfig): PassGateResult {
  const checks: PassGateCheck[] = [
    {
      category: 'completionSuccess',
      score: scores.completionSuccess,
      minimum: config.passGate.completionSuccessMin,
      passed: scores.completionSuccess >= config.passGate.completionSuccessMin,
    },
    {
      category: 'buildAndTests',
      score: scores.buildAndTests,
      minimum: config.passGate.buildAndTestsMin,
      passed: scores.buildAndTests >= config.passGate.buildAndTestsMin,
    },
    {
      category: 'architecture',
      score: scores.architecture,
      minimum: config.passGate.architectureMin,
      passed: scores.architecture >= config.passGate.architectureMin,
    },
  ];

  const passed = checks.every((c) => c.passed);

  return { passed, checks };
}
