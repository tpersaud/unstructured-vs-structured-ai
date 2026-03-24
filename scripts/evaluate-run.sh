#!/usr/bin/env bash
set -euo pipefail

# evaluate-run.sh
# Orchestration script: dotnet build/test + invoke evaluator CLI
#
# Usage:
#   ./scripts/evaluate-run.sh <run-dir> [pass|fail]
#
# If results/raw/ already contains .json files, the evaluator runs on those directly.
# If results/raw/ is empty, pass a scenario (pass|fail) to inject a fixture template.
# The scenario can be a second argument or the SCENARIO env var.
# SCENARIO is only needed for pipeline verification, not real experiment runs.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# --- Validate args ---

RUN_DIR="${1:-}"
if [[ -z "$RUN_DIR" ]]; then
  echo "ERROR: run directory argument is required"
  echo "Usage: $0 <run-dir> [pass|fail]"
  exit 1
fi

if [[ ! -d "$RUN_DIR" ]]; then
  echo "ERROR: run directory does not exist: $RUN_DIR"
  exit 1
fi

SCENARIO="${2:-${SCENARIO:-}}"

echo "========================================"
echo "Evaluating run: $RUN_DIR"
echo "========================================"

# --- Read run.config.json ---

RUN_CONFIG="$RUN_DIR/run.config.json"
if [[ ! -f "$RUN_CONFIG" ]]; then
  echo "ERROR: run.config.json not found at: $RUN_CONFIG"
  exit 1
fi

# Extract sampleMode from config (if present)
SAMPLE_MODE=$(python3 -c "import json; print(json.load(open('$RUN_CONFIG')).get('sampleMode', False))" 2>/dev/null || echo "False")

# --- Run dotnet build + test (if solution exists) ---

SOLUTION_FILE=$(python3 -c "import json; print(json.load(open('$RUN_CONFIG'))['paths'].get('solutionFile', ''))" 2>/dev/null || echo "")

if [[ -n "$SOLUTION_FILE" && -f "$RUN_DIR/$SOLUTION_FILE" ]]; then
  echo ""
  echo "--- dotnet build ---"
  dotnet build "$RUN_DIR/$SOLUTION_FILE" --configuration Release || true

  echo ""
  echo "--- dotnet test ---"
  dotnet test "$RUN_DIR/$SOLUTION_FILE" --configuration Release --no-build || true
else
  echo "No solution file found at $RUN_DIR/$SOLUTION_FILE — skipping dotnet build/test"
fi

# --- Ensure raw results exist ---

RAW_RESULTS_DIR="$RUN_DIR/results/raw"
mkdir -p "$RAW_RESULTS_DIR"

RAW_COUNT=$(find "$RAW_RESULTS_DIR" -maxdepth 1 -name '*.json' 2>/dev/null | wc -l | tr -d ' ')

if [[ "$RAW_COUNT" -gt 0 ]]; then
  echo ""
  echo "--- Found $RAW_COUNT raw result(s) in $RAW_RESULTS_DIR ---"
elif [[ -n "$SCENARIO" ]]; then
  echo ""
  echo "--- No raw results found. Injecting fixture template (scenario: $SCENARIO) ---"

  if [[ "$SCENARIO" != "pass" && "$SCENARIO" != "fail" ]]; then
    echo "ERROR: Invalid SCENARIO. Must be 'pass' or 'fail'. Got: '$SCENARIO'"
    exit 1
  fi

  if [[ "$SCENARIO" == "pass" ]]; then
    TEMPLATE="$SCRIPT_DIR/raw-pass-template.json"
  else
    TEMPLATE="$SCRIPT_DIR/raw-fail-template.json"
  fi

  if [[ ! -f "$TEMPLATE" ]]; then
    echo "ERROR: Template not found: $TEMPLATE"
    exit 1
  fi

  cp "$TEMPLATE" "$RAW_RESULTS_DIR/iteration-01.json"
  echo "Copied $TEMPLATE -> $RAW_RESULTS_DIR/iteration-01.json"
else
  echo ""
  echo "ERROR: No raw results found in $RAW_RESULTS_DIR"
  echo "Either produce real results (dotnet build/test) or set SCENARIO=pass|fail for fixture testing."
  exit 1
fi

# --- Invoke evaluator CLI ---

echo ""
echo "--- Running evaluator ---"

CONFIG_DIR="${CONFIG_DIR:-$REPO_ROOT/config}"
EVALUATOR_DIR="$REPO_ROOT/evaluator"

if [[ -f "$EVALUATOR_DIR/dist/cli.js" ]]; then
  node "$EVALUATOR_DIR/dist/cli.js" --run-dir "$RUN_DIR" --config-dir "$CONFIG_DIR"
else
  echo "Compiled CLI not found. Trying tsx..."
  npx --prefix "$EVALUATOR_DIR" tsx "$EVALUATOR_DIR/src/cli.ts" --run-dir "$RUN_DIR" --config-dir "$CONFIG_DIR"
fi
