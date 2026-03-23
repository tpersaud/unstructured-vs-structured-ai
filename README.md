# Unstructured vs Structured AI

## Architecture Still Matters

> A code kata experiment comparing implicit prompting vs explicit structured context in AI-assisted development.

---

# 🧠 Why This Exists

AI coding tools are incredibly powerful — but they introduce a new question:

> **Does structure still matter, or can we just “vibe code” with prompts?**

This repository is a controlled experiment designed to answer that question.

---

# 🎯 Experiment Overview

We compare two approaches to AI-assisted development:

## 1. Unstructured Context

- All context lives inside prompts
- No persistent structure
- Behavior is redefined every interaction

## 2. Structured Context

- Context is externalized into reusable artifacts:
  - rules
  - workflows
  - skills
  - triggers

- The system enforces structure across interactions

---

# ⚖️ Controlled Variables

Both approaches use:

- Same task
- Same models (Claude only)
- Same development loop
- Same evaluation system
- Same prompt budget

The **only difference** is:

```text
Unstructured context (prompts) vs Structured context (run-package)
```

---

# 🔒 Prompt Budget Constraint

Each run is limited to:

```text
5 prompts total
```

Where:

> A prompt = one body of text sent to the model in a single interaction

This forces the experiment to measure:

> **How far each approach gets with the same budget**

---

# 🔁 Development Loop

Each run follows:

1. Plan (Opus)
2. Ask (Sonnet)
3. Code (Sonnet)
4. Validate (Sonnet)
5. Refactor / Recovery

---

# 🧪 Task

Build a:

```text
Texas Hold’em ASP.NET Core MVC / Razor Pages application
```

With:

- game flow
- dealing logic
- hand evaluation
- simplified betting
- testable architecture

---

# ✅ Definition of Done

A run passes when:

- Completion ≥ 4
- Build & Tests ≥ 4
- Architecture ≥ 4
- Core gameplay flow works without crashing

---

# 🧱 Repository Structure

```text
docs/         → experiment design and specs
config/       → scoring rules
evaluator/    → deterministic scoring engine
scripts/      → evaluation + utility scripts
templates/    → run-package templates (per mode)
experiments/  → individual kata runs (unstructured-context / structured-context)
docker/       → evaluation environment
```

---

# ⚙️ Evaluation System

All runs are evaluated using a **deterministic evaluator**:

- build validation
- test execution
- coverage checks
- architecture checks
- prompt efficiency
- time efficiency

Evaluation is run inside Docker for consistency.

---

# 🧠 Key Insight

This experiment isolates:

```text
Unstructured cognition vs Structured cognition
```

Using:

```text
The same AI system
```

---

# 📊 What This Measures

- Can structured context reach higher quality with fewer prompts?
- Does structure reduce iteration cost?
- Does it produce more stable outcomes?

---

# 🚀 Current Status

This repository is currently:

```text
Public (in active development)
```

Planned:

- full experiment execution
- result analysis

---

# 📜 License

MIT License

---

# 🧩 Final Thought

> Prompting is powerful.
> But architecture might still matter.
