# Code Kata Experiment Plan

## Objective

Evaluate whether structured context improves AI-assisted development efficiency compared to unstructured context approaches under a strict 5-prompt budget.

## Experiment Arms

### Unstructured Context

- All context lives inside prompts
- No persistent structure
- Behavior is recreated each interaction

### Structured Context

- Context externalized into reusable artifacts:
  - rules
  - workflows
  - skills
  - triggers
  - descriptions

## Controlled Variables

- Same task
- Same Claude models
- Same workflow
- Same evaluator
- Same prompt budget

## Prompt Budget

Max 5 prompts per run.

Definition:

> One prompt = one body of text sent in a single model interaction.

## Development Loop

1. Plan (Opus)
2. Ask (Sonnet)
3. Code (Sonnet)
4. Validate (Sonnet)
5. Refactor / Recovery

## Model Mapping

- Plan → Claude Opus 4.6
- Ask → Claude Sonnet 4.5
- Code → Claude Sonnet 4.5
- Validate → Claude Sonnet 4.5
- Refactor (mechanical) → Claude Sonnet 4.5
- Refactor (structural) → Claude Opus 4.6

## Pass Gate

A run passes when:

- Completion ≥ 4
- Build & Tests ≥ 4
- Architecture ≥ 4
- Core flow runs without crashing

## Execution Strategy (Sunday)

Counterbalanced pairs:

- Run 1: unstructured-context
- Run 2: structured-context
- Run 3: structured-context
- Run 4: unstructured-context

## Key Insight

This experiment compares:
Unstructured cognition vs Structured cognition

Using:
The same AI system
