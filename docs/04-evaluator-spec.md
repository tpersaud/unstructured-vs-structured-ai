# Evaluator Spec

## Goal

Build a deterministic evaluator.

## Tech

Node + TypeScript + Vitest

## Responsibilities

- Read run artifacts
- Score results
- Apply pass gate
- Output scored JSON

## Inputs

- run.config.json
- results/raw/\*.json
- logs/timing.json
- results/prompts/\*.jsonl

## Output

- results/scored/\*.json
- CLI summary

## Scoring Categories

- completionSuccess
- buildAndTests
- coverage
- architecture
- promptEfficiency
- timeEfficiency

## Pass Gate

- completionSuccess >= 4
- buildAndTests >= 4
- architecture >= 4

## Structure

src/

- types.ts
- io.ts
- scoring.ts
- gate.ts
- cli.ts

tests/

- scoring.test.ts
- gate.test.ts

fixtures/

- raw/
- scored/

## Constraint

Keep v1 simple:
Use fixture-based raw input.
