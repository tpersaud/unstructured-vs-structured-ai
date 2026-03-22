# Templates

Run templates for creating new experiment runs.

## Overview

Templates provide the canonical folder structure and seed files for new experiment runs. Each template corresponds to one experimental mode.

## Templates

### `prompt-only/`

Template for **unstructured** prompt-only runs.

**Characteristics:**
- No lattice structure
- No pre-defined context organization
- AI works from raw prompts only

### `lattice/`

Template for **structured** lattice-based runs.

**Characteristics:**
- Includes `lattice/` subfolder for structured context
- Pre-organized context files
- AI works with structured knowledge base

## Common Structure

Both templates contain:

```
<template>/
├── run.config.json       - Run configuration (models, paths, gates)
├── logs/
│   ├── timing.json       - Timing data seed
│   └── notes.md          - Notes seed
├── prompts/
│   └── README.md         - Prompt logging instructions
├── results/              - Empty result directories
├── media/                - Screenshots and media
└── lattice/              - (lattice mode only)
```

## Usage

Use `scripts/new-run.sh` to create a new run from a template:

```bash
./scripts/new-run.sh prompt-only 01
./scripts/new-run.sh lattice 02
```

This copies the template to `experiments/<mode>/<mode>-run-<number>/` with updated configuration.

## Important

- **Do not modify templates directly** - they are the source of truth
- Templates are copied, not symlinked
- Each run gets its own independent copy
- `runId` is automatically updated during copy

See `docs/06-run-template-specs.md` for complete template specifications.
