# Prompt Log

Record each prompt used during this run as a JSONL entry.

Each line should be a JSON object with:
- `prompt`: the prompt text or summary
- `model`: which model was used
- `phase`: plan | ask | code | validate | refactor
