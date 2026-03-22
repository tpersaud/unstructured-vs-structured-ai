# Evaluator

TypeScript-based deterministic scoring engine for the code kata experiment.

## Overview

The evaluator reads pre-computed raw results, applies scoring rules, evaluates pass/fail gates, and outputs scored results with a CLI summary.

**Scoring:** Integer 1-5 scale across 6 categories  
**Mode:** Fixture-driven (v1) - reads pre-computed JSON, not live build outputs  
**Testing:** Vitest with comprehensive unit tests

## Installation

```bash
npm install
```

## Running Tests

```bash
npm test              # Run all tests once
npm run test:watch    # Watch mode
```

## CLI Usage

### Development mode (tsx) - PASS scenario

```bash
npm run evaluate -- --run-dir ./fixtures-sample-pass --config-dir ./fixtures-sample-pass/config
```

### Development mode (tsx) - FAIL scenario

```bash
npm run evaluate -- --run-dir ./fixtures-sample-fail --config-dir ./fixtures-sample-fail/config
```

### Production mode (compiled)

```bash
npm run build
npm run evaluate:dist -- --run-dir <path> --config-dir <path>
```

### Arguments

- `--run-dir` (required) - Path to run directory containing results/
- `--config-dir` (optional) - Path to config directory (defaults to ../../config)

## Project Structure

```
evaluator/
├── src/
│   ├── types.ts      - TypeScript interfaces
│   ├── io.ts         - File I/O operations
│   ├── scoring.ts    - Scoring logic (6 categories)
│   ├── gate.ts       - Pass/fail gate evaluation
│   └── cli.ts        - CLI entry point
├── tests/
│   ├── scoring.test.ts - Scoring unit tests
│   └── gate.test.ts    - Gate logic tests
├── fixtures-sample-pass/  - Pipeline verification (PASS scenario)
├── fixtures-sample-fail/  - Pipeline verification (FAIL scenario)
└── package.json
```

## Scoring Categories

1. **completionSuccess** - Acceptance checks passed ratio
2. **buildAndTests** - Build and test execution success
3. **coverage** - Code coverage percentage
4. **architecture** - Architecture violations penalty
5. **promptEfficiency** - Prompt count efficiency
6. **timeEfficiency** - Time duration efficiency

## Purpose Field

The `run.config.json` can include an optional `purpose` field:

- `"purpose": "pipeline-verification"` — Sample-app verification runs (fixtures)
- `"purpose": "experiment"` — Real experiment runs (templates)

This field flows through to the scored output and CLI summary for clarity.

## Output

- Scored JSON written to `results/scored/`
- CLI summary with run info, scores, and PASS/FAIL status
- Exit code: 0 for PASS, 1 for FAIL

Example CLI output:

```
Run: sample-app-pass
Purpose: pipeline-verification
Mode: prompt-only

Scores:
  - Completion:        4
  - Build & Tests:     5
  - Coverage:          5
  - Architecture:      4
  - Prompt Efficiency: 5
  - Time Efficiency:   3

TOTAL: 26 / 30 (87%)

  ✓ completionSuccess: 4 (min: 4)
  ✓ buildAndTests: 5 (min: 4)
  ✓ architecture: 4 (min: 4)

STATUS: PASS
```

## References

- `docs/04-evaluator-spec.md` - Complete evaluator specification
- `config/scorecard-rules.json` - Scoring rules configuration
