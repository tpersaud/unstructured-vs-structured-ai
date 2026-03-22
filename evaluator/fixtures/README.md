# Evaluator Fixtures

Self-contained test fixtures for evaluator unit tests and CLI smoke testing.

## Purpose

Provides deterministic test data that allows the evaluator to run independently without external dependencies.

## Structure

```
fixtures/
├── run.config.json              - Fixture run configuration
├── config/
│   └── scorecard-rules.json     - Copy of scoring rules
├── results/
│   ├── raw/
│   │   └── sample-raw.json      - Pre-computed raw input
│   ├── scored/                  - Output directory for CLI
│   └── prompts/
│       └── sample.jsonl         - Sample prompt log (5 lines)
├── logs/
│   └── timing.json              - Fixture timing data
└── expected/
    └── sample-scored.json       - Expected scored output
```

## Usage

### In Unit Tests

Tests use `expected/sample-scored.json` to verify scoring logic correctness.

### In CLI Smoke Test

```bash
npx tsx src/cli.ts --run-dir ./fixtures --config-dir ./fixtures/config
```

This validates:
- File I/O operations
- Scoring calculations
- Gate evaluation
- CLI output formatting
- Exit code behavior

## Fixture Data

**sample-raw.json** contains:
- completionSuccess: 4/5 checks passed (80%)
- buildAndTests: Both pass
- coverage: 82% (above 80% threshold)
- architecture: 1 violation
- timing: 15 minutes
- prompts: 5 prompts (at budget)

**Expected scores:** All categories score 4-5, PASS gate succeeds.
