# Sample App Fail Fixture

Self-contained test fixture for evaluator CLI smoke testing with a failing scenario.

## Purpose

Provides deterministic test data for verifying the evaluator pipeline fails correctly with the sample-app (Docker verification harness). This is **pipeline verification**, not experiment data.

## Structure

```
fixtures-sample-fail/
├── run.config.json              - Fixture run configuration (runId: sample-app-fail, purpose: pipeline-verification)
├── config/
│   └── scorecard-rules.json     - Copy of scoring rules
├── results/
│   ├── raw/
│   │   └── iteration-01.json    - Pre-computed raw input (FAIL scenario)
│   ├── scored/                  - Output directory for CLI
│   └── prompts/
│       └── sample.jsonl         - Sample prompt log (8 lines, over budget)
└── logs/
    └── timing.json              - Fixture timing data
```

## Usage

### CLI Smoke Test (FAIL scenario)

```bash
npx tsx src/cli.ts --run-dir ./fixtures-sample-fail --config-dir ./fixtures-sample-fail/config
```

Expected output:
```
Run: sample-app-fail
Purpose: pipeline-verification
Mode: prompt-only
...
✗ completionSuccess: 2 (min: 4)
✗ architecture: 1 (min: 4)
STATUS: FAIL
```

Exit code: 1

This validates:
- File I/O operations
- Scoring calculations
- Gate evaluation failures
- CLI output formatting
- Exit code behavior (non-zero on fail)

## Fixture Data

**iteration-01.json** contains:
- completionSuccess: 2/5 checks passed (40%) - **FAILS gate**
- buildAndTests: Build passes, tests fail
- coverage: 35% (below 80% threshold)
- architecture: 5 violations - **FAILS gate**
- timing: 50 minutes
- prompts: 8 prompts (over budget)

**Expected scores:** Low scores across board, FAIL gate fails.
