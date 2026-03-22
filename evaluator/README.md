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

### Development mode (tsx)

```bash
npm run evaluate -- --run-dir ./fixtures --config-dir ./fixtures/config
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
├── fixtures/         - Self-contained test fixtures
└── package.json
```

## Scoring Categories

1. **completionSuccess** - Acceptance checks passed ratio
2. **buildAndTests** - Build and test execution success
3. **coverage** - Code coverage percentage
4. **architecture** - Architecture violations penalty
5. **promptEfficiency** - Prompt count efficiency
6. **timeEfficiency** - Time duration efficiency

## Output

- Scored JSON written to `results/scored/`
- CLI table summary with scores and PASS/FAIL status
- Exit code: 0 for PASS, 1 for FAIL

## References

- `docs/04-evaluator-spec.md` - Complete evaluator specification
- `config/scorecard-rules.json` - Scoring rules configuration
