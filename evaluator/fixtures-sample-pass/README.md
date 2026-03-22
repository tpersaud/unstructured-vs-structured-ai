# Sample App Pass Fixture

Self-contained test fixture for evaluator CLI smoke testing with a passing scenario.

## Purpose

Provides deterministic test data for verifying the evaluator pipeline with the sample-app (Docker verification harness). This is **pipeline verification**, not experiment data.

## Structure

```
fixtures-sample-pass/
├── run.config.json              - Fixture run configuration (runId: sample-app-pass, purpose: pipeline-verification)
├── config/
│   └── scorecard-rules.json     - Copy of scoring rules
├── results/
│   ├── raw/
│   │   └── iteration-01.json    - Pre-computed raw input (PASS scenario)
│   ├── scored/                  - Output directory for CLI
│   └── prompts/
│       └── sample.jsonl         - Sample prompt log (5 lines)
├── logs/
│   └── timing.json              - Fixture timing data
└── expected/
    └── sample-scored.json       - Expected scored output
```

## Usage

### CLI Smoke Test (PASS scenario)

```bash
npx tsx src/cli.ts --run-dir ./fixtures-sample-pass --config-dir ./fixtures-sample-pass/config
```

Expected output:

```
Run: sample-app-pass
Purpose: pipeline-verification
Mode: prompt-only
...
STATUS: PASS
```

Exit code: 0

This validates:

- File I/O operations
- Scoring calculations
- Gate evaluation
- CLI output formatting
- Exit code behavior

## Fixture Data

**iteration-01.json** contains:

- completionSuccess: 4/5 checks passed (80%)
- buildAndTests: Both pass
- coverage: 82% (above 80% threshold)
- architecture: 1 violation
- timing: 21 minutes
- prompts: 5 prompts (at budget)

**Expected scores:** All categories score 4-5, PASS gate succeeds.
