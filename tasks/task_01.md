# Task 01 – Project Setup & Restructure

## Goal
Set up a new multi-topic German practice project with shared app logic and per-topic data files.

## Changes
- Created project structure: `css/`, `js/`, `data/`, `source/`, `tasks/`, `upload/`
- Extracted `css/style.css` from inline styles
- Extracted `js/app.js` (core logic: TTS, STT, checking, navigation)
- Extracted `js/topics.js` (topic metadata + loader)
- Created `data/_schema.md` (JSON file specification)
- Created `upload/upload_server.py` (file upload helper)
- Migrated `verben-mit-sein` as the first topic:
  - `data/verben-mit-sein.json` – 176 sentences
  - `source/verben-mit-sein/` – original markdown, parser, PDF

## Architecture
```
german-practice/
├── index.html                # entry point + topic selector
├── css/style.css             # shared styles
├── js/topics.js              # topic definitions
├── js/app.js                 # core app logic (TTS, STT, checking)
├── data/
│   ├── _schema.md            # JSON schema reference
│   └── verben-mit-sein.json  # topic 1
├── source/
│   └── verben-mit-sein/      # raw materials + parser
├── upload/
│   └── upload_server.py      # file upload helper
├── tasks/                    # conversation logs
└── README.md
```

## How to Add a New Topic
1. Create `data/<topic>.json` following `_schema.md`
2. Add entry in `js/topics.js`
3. (Optional) Add parser in `source/<topic>/parse.py`
