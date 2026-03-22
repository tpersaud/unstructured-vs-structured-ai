// --- Raw Result (pre-computed signals from build/test) ---

export interface RawCompletion {
  acceptanceChecksPassed: number;
  acceptanceChecksTotal: number;
}

export interface RawBuild {
  passed: boolean;
}

export interface RawTests {
  overallPassed: boolean;
}

export interface RawCoverage {
  linePercent: number;
}

export interface RawArchitecture {
  violations: number;
}

export interface RawTiming {
  durationMinutes: number;
}

export interface RawResult {
  scenario?: string;
  completion: RawCompletion;
  build: RawBuild;
  tests: RawTests;
  coverage: RawCoverage;
  architecture: RawArchitecture;
  timing: RawTiming;
}

// --- Scored Result (integer 1–5 per category) ---

export interface ScoredResult {
  runId: string;
  mode: string;
  purpose?: string;
  scores: {
    completionSuccess: number;
    buildAndTests: number;
    coverage: number;
    architecture: number;
    promptEfficiency: number;
    timeEfficiency: number;
  };
  total: number;
  maxTotal: number;
  percentage: number;
  passed: boolean;
  gateResults: PassGateResult;
}

// --- Run Config (run.config.json schema) ---

export interface RunConfig {
  runId: string;
  mode: string;
  purpose?: 'pipeline-verification' | 'experiment';

  models: {
    plan: string;
    ask: string;
    code: string;
    validate: string;
    refactorMechanical: string;
    refactorStructural: string;
  };

  paths: {
    appRoot: string;
    solutionFile: string;
    rawResults: string;
    scoredResults: string;
    promptLogs: string;
    timingFile: string;
  };

  evaluation: {
    coverageThreshold: number;
    maxPrompts: number;
    scorecardRulesFile: string;
  };

  passGate: {
    completionSuccessMin: number;
    buildAndTestsMin: number;
    architectureMin: number;
  };

  task: {
    name: string;
    specFile: string;
  };

  sampleMode?: boolean;
}

// --- Scorecard Rules (config/scorecard-rules.json schema) ---

export interface ScorecardRule {
  type: 'ratio' | 'boolean' | 'threshold' | 'penalty' | 'inverse';
  maxScore: number;
  threshold?: number;
}

export interface ScorecardRules {
  completionSuccess: ScorecardRule;
  buildAndTests: ScorecardRule;
  coverage: ScorecardRule;
  architecture: ScorecardRule;
  promptEfficiency: ScorecardRule;
  timeEfficiency: ScorecardRule;
}

// --- Pass Gate Result ---

export interface PassGateCheck {
  category: string;
  score: number;
  minimum: number;
  passed: boolean;
}

export interface PassGateResult {
  passed: boolean;
  checks: PassGateCheck[];
}
