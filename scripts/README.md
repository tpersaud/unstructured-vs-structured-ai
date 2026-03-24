# Scripts

Bash orchestration scripts for evaluation pipeline and run management.

## Files

### `evaluate-run.sh`

Main evaluation orchestration script.

**Usage:**

```bash
# Real experiment run (auto-detects raw results)
./scripts/evaluate-run.sh experiments/structured-context/run-01

# Pipeline verification (injects fixture template)
./scripts/evaluate-run.sh evaluator/fixtures-sample-pass pass
./scripts/evaluate-run.sh evaluator/fixtures-sample-fail fail
```

**What it does:**

1. Runs `dotnet build` + `dotnet test` on the application (if solution file exists)
2. Checks `results/raw/` for existing `.json` files
   - If found → evaluates them directly (real experiment mode)
   - If empty and `SCENARIO` is set → injects fixture template (pipeline verification mode)
   - If empty and no `SCENARIO` → errors with clear message
3. Invokes evaluator CLI
4. Exits with evaluator's exit code

**SCENARIO** (optional, for pipeline verification only):

- `pass` - Uses `raw-pass-template.json` (all gates pass, exit 0)
- `fail` - Uses `raw-fail-template.json` (gates fail, exit 1)

### `new-run.sh`

Creates a new run directory from a template.

**Usage:**

```bash
./scripts/new-run.sh <mode> <run-number>
```

**Example:**

```bash
./scripts/new-run.sh unstructured-context 01
./scripts/new-run.sh structured-context 02
```

**What it does:**

1. Copies template from `templates/run-package/<mode>/` to `experiments/<mode>/run-<number>/`
2. Sets `runId` to `run-<number>` in `run.config.json`
3. Preserves full stamped skeleton including `app/`, `run-package/`, `results/raw/`, `results/scored/`

### `raw-pass-template.json`

Deterministic raw result that meets all pass gate thresholds.

**Scores:**

- completionSuccess: 4/5 (80%)
- buildAndTests: Both pass
- coverage: 82%
- architecture: 1 violation
- timing: 15 minutes
- prompts: 5 (at budget)

**Expected:** PASS gate succeeds, exit 0

### `raw-fail-template.json`

Deterministic raw result that violates pass gate thresholds.

**Scores:**

- completionSuccess: 2/5 (40%) - **FAILS gate**
- buildAndTests: Both pass
- coverage: 65% - Below threshold
- architecture: 4 violations - **FAILS gate**
- timing: 35 minutes
- prompts: 8 (over budget)

**Expected:** FAIL gate fails, exit 1

## Purpose

These scripts provide:

- Controlled evaluation scenarios for testing
- Consistent run directory creation
- Docker pipeline verification
- Deterministic pass/fail validation

See `docs/05-docker-evaluation-spec.md` for integration details.
