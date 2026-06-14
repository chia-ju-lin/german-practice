# Task 02 – Add Irregular Verbs Topic

## Goal
Add a second practice topic for irregular verbs (2 blanks per sentence: auxiliary + participle).

## Changes
- Created `data/irregular-verbs.json` – 28 sentences (14 verbs × 2)
- Enabled irregular verbs in `js/topics.js` topic selector
- Updated `js/app.js` to handle `"aux | participle"` answer format (two blanks)
- Updated `README.md` topics table

## New Answer Format
For verbs with two blanks, the `answer` field uses a pipe separator:
```json
"answer": "sind | aufgestanden"
```
The checker accepts both words typed in any order.

## Data
| Topic | Sentences | Blanks |
|-------|-----------|--------|
| Verben mit SEIN | 176 | 1 |
| Unregelmäßige Verben | 28 | 2 |
