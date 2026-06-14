# Data File Schema

Each topic has a JSON file in `data/<topic>.json` with this structure:

```json
[
  {
    "verb": "einziehen",
    "prompt": "Wir ______ letzte Woche in unsere neue Wohnung.",
    "translation": "We moved into our new apartment last week.",
    "answer": "sind eingezogen",
    "full_sentence": "Wir sind letzte Woche in unsere neue Wohnung eingezogen."
  }
]
```

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `verb` | string | The base verb (e.g., `einziehen`) |
| `prompt` | string | The sentence with `______` blank. Can include multi-line verb header on first sentence. |
| `translation` | string | English translation |
| `answer` | string | The verb phrase that fills the blank (checked for typed answers) |
| `full_sentence` | string | The complete correct sentence (checked for voice answers) |

## Rules

- `answer` should be **just the verb conjugation** when possible (e.g., `ist abgebogen`, `aufgefallen`)
- `full_sentence` should be a **clean, grammatically correct** full sentence
- No duplicated words (prefix/suffix should not appear twice)
- Punctuation (`.` `?` `!`) should be included in `full_sentence`
- One entry per sentence, 3 per verb is typical

## Adding a New Topic

1. Create `data/<topic>.json` with the schema above
2. Add an entry to `js/topics.js`:
   ```js
   {
       id: '<topic>',
       name: 'Display Name',
       dataFile: 'data/<topic>.json'
   }
   ```
3. Optionally add a parser in `source/<topic>/parse.py`
