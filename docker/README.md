# Docker

Docker-based evaluation harness for running the evaluator system in a controlled environment.

## Files

### `Dockerfile`

Single-stage container based on `mcr.microsoft.com/dotnet/sdk:8.0` with Node.js 20 installed.

**Contains:**
- .NET SDK 8.0
- Node.js 20.x
- Evaluator system
- Scripts and configuration

**Entry point:** `scripts/evaluate-run.sh`

## Usage

### Build the image

```bash
docker build -t kata-evaluator -f docker/Dockerfile .
```

### Run evaluation (PASS scenario)

```bash
SCENARIO=pass docker run -e SCENARIO \
  -v $(pwd)/sample-run:/run \
  -v $(pwd)/config:/config \
  kata-evaluator
```

Expected: Exit code 0, STATUS: PASS

### Run evaluation (FAIL scenario)

```bash
SCENARIO=fail docker run -e SCENARIO \
  -v $(pwd)/sample-run:/run \
  -v $(pwd)/config:/config \
  kata-evaluator
```

Expected: Exit code 1, STATUS: FAIL

## Environment Variables

- **SCENARIO** - Controls which raw template to use (`pass` or `fail`)

## Purpose

This Docker harness validates the complete evaluation pipeline:
1. .NET build and test execution
2. Raw result generation
3. Evaluator scoring
4. Pass/fail gate logic
5. Exit code correctness

See `docs/05-docker-evaluation-spec.md` for complete specification.
