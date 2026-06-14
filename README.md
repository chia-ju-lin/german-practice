# German Practice

Browser-based German practice app with Speech-to-Text and Text-to-Speech. One app, multiple topics.

---

## Quick Start

```bash
cd /home/ul5255/sandbox/lulu/german-practice
python3 -m http.server 8000
```

Open **http://localhost:8000** in Chrome/Edge. Allow microphone access.

---

## Features

- **🔊 Read Aloud** – Browser TTS reads the full correct German sentence
- **🎤 Speak Answer** – STT listens and checks the **whole sentence** (fuzzy match, 70% threshold)
- **⌨️ Type Answer** – Keyboard input checks **only the verb** (blank fill-in)
- **Topic selector** – Switch between grammar topics dynamically
- **Score tracking** & progress bar
- **Keyboard shortcuts**: `Space` (read), `Enter` (submit), `←/→` (navigate)

---

## Topics

| Topic | Data File | Sentences |
|-------|-----------|-----------|
| Verben mit SEIN | `data/verben-mit-sein.json` | 176 |

---

## How to Add a New Topic

1. Create `data/<topic>.json` following [`data/_schema.md`](data/_schema.md)
2. Add entry in [`js/topics.js`](js/topics.js):
   ```js
   {
       id: 'my-topic',
       name: 'My Topic',
       dataFile: 'data/my-topic.json'
   }
   ```
3. (Optional) Add source files and parser in `source/my-topic/`

---

## File Transfer (for LLM-enhanced JSON)

### Download (remote → local)
```bash
scp ul5255@192.168.0.226:/home/ul5255/sandbox/lulu/german-practice/data/verben-mit-sein.json ./verben-mit-sein.json
```

### Upload (local → remote)
```bash
scp enhanced.json ul5255@192.168.0.226:/home/ul5255/sandbox/lulu/german-practice/data/verben-mit-sein.json
```

---

## Rollback

```bash
git log --oneline            # list commits
git checkout <commit-hash>   # preview
git checkout -b backup <hash> # save branch before rollback
```

---

## Structure

```
german-practice/
├── index.html                # entry point + topic selector
├── css/style.css             # shared styles
├── js/
│   ├── app.js                # core logic (TTS, STT, checking, nav)
│   └── topics.js             # topic definitions + loader
├── data/
│   ├── _schema.md            # JSON schema reference
│   └── <topic>.json          # topic data files
├── source/
│   └── <topic>/              # raw materials + parsers
├── upload/
│   └── upload_server.py      # temp file upload helper
├── tasks/                    # conversation logs
└── README.md
```

---

## Future: Deploy to Personal Website

The app is 100% static files. To deploy:
- Copy the entire folder to your web server under `/german-practice/`
- Or deploy via GitHub Pages, Netlify, Vercel, etc.
- No build step, no dependencies, no server-side code needed
