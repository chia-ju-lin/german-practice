import re
import json

with open('praxis_saetze.md', 'r', encoding='utf-8') as f:
    content = f.read()

sentences = []

def suffix_contained_in_answer(answer, suffix):
    """Check if the suffix content is already in the answer (allowing partial overlap)."""
    if not suffix:
        return True
    ans_lower = answer.lower().strip()
    sfx_lower = suffix.lower().strip()
    # Exact containment
    if sfx_lower in ans_lower:
        return True
    # Check if most meaningful suffix words appear in answer
    STOP = {'der','die','das','ein','eine','den','dem','des','im','am','vom','zum',
            'ans','ins','in','an','auf','von','mit','zu','vor','nach','um','bei',
            'bis','aus','über','unter','ist','sind','war','waren','bin','bist',
            'hat','haben','er','sie','es','wir','ihr','ich','du','als','und','oder'}
    sfx_meaningful = [w for w in sfx_lower.split() if w not in STOP]
    if len(sfx_meaningful) >= 2:
        found = sum(1 for w in sfx_meaningful if w in ans_lower)
        # If most meaningful suffix words are in the answer, consider it contained
        if found >= len(sfx_meaningful) - 1:
            return True
    return False

def prefix_in_answer(prefix, answer):
    """Check if the prefix is already contained at the start of the answer."""
    if not prefix:
        return True
    # Only consider prefix "in answer" if prefix has 2+ meaningful words
    pfx_words = [w.lower() for w in prefix.split() if w.lower() not in {
        'der','die','das','ein','eine','den','dem','des','im','am','vom','zum',
        'ans','ins','in','an','auf','von','mit','zu','vor','nach','um','bei',
        'bis','aus','über','unter','ist','sind','war','waren','bin','bist',
        'hat','haben','er','sie','es','wir','ihr','ich','du','was','wenn'
    }]
    # Need at least 2 meaningful words to claim prefix is in answer
    if len(pfx_words) < 2:
        return False
    ans_words = answer.lower().split()[:8]
    return all(w in ans_words for w in pfx_words)

def clean_answer(raw):
    """Extract the clean answer from the >! !< content."""
    raw = re.sub(r'[!<>]+$', '', raw).strip()
    # Handle "verb (Perfekt: full_answer)" - extract Perfekt part
    perfekt_match = re.search(r'Perfekt:\s*(.+)', raw)
    if perfekt_match:
        return perfekt_match.group(1).strip().rstrip(')')
    # Remove parenthetical alternatives "(oder: ...)"
    raw = re.sub(r'\s*\(oder:.*?\)', '', raw)
    return raw.strip()

# Split by verb headers
blocks = re.split(r'(?=^### \d+\.\s)', content, flags=re.MULTILINE)

for block in blocks:
    if not block.strip():
        continue
    verb_match = re.search(r'### \d+\.\s+(.+?)\s*–', block)
    if not verb_match:
        continue
    
    verb = verb_match.group(1).strip()
    if 'Extra Practice' in block or 'Word Combos' in block:
        continue
    
    perfekt_match = re.search(r'\*\*Perfekt:\*\*\s+(.+)', block)
    perfekt = perfekt_match.group(1).strip() if perfekt_match else ''
    
    lines = block.split('\n')
    i = 0
    sentence_count = 0
    while i < len(lines):
        line = lines[i]
        sent_match = re.match(
            r'^(\d+)\.\s+(.*?)\s*______\s*(.*?)\s*([.?!])\s*\((.+?)\)\s*$',
            line
        )
        if not sent_match:
            i += 1
            continue
        
        prefix = sent_match.group(2).strip()
        suffix = sent_match.group(3).strip()
        punctuation = sent_match.group(4)
        translation = sent_match.group(5).strip()
        
        # Skip sentences with multiple blanks
        if '______' in suffix:
            i += 1
            continue
        
        # Find answer
        answer = None
        j = i + 1
        while j < len(lines) and not lines[j].strip():
            j += 1
        if j < len(lines):
            answer_match = re.match(r'\s*>!(.*?)!<', lines[j])
            if answer_match:
                answer = clean_answer(answer_match.group(1).strip())
        if not answer:
            i += 1
            continue
        
        sentence_count += 1
        
        # Build prompt
        if sentence_count == 1:
            prompt = f"{verb} – {perfekt}\n\n{prefix}______{suffix}{punctuation}"
        else:
            prompt = f"{prefix}______{suffix}{punctuation}"
        
        # Build full correct sentence for voice comparison
        # Handle cases where answer already includes prefix/suffix words
        pfx_in_ans = prefix_in_answer(prefix, answer)
        sfx_in_ans = suffix_contained_in_answer(answer, suffix)
        
        if pfx_in_ans and sfx_in_ans:
            full_sentence = f"{answer}{punctuation}"
        elif pfx_in_ans:
            full_sentence = f"{answer} {suffix}{punctuation}"
        elif sfx_in_ans:
            full_sentence = f"{prefix} {answer}{punctuation}"
        else:
            full_sentence = f"{prefix} {answer} {suffix}{punctuation}"
        
        sentences.append({
            "verb": verb,
            "prompt": prompt,
            "translation": translation,
            "answer": answer,
            "full_sentence": full_sentence
        })
        
        i = j + 1

with open('sentences.json', 'w', encoding='utf-8') as f:
    json.dump(sentences, f, indent=2, ensure_ascii=False)
    
print(f"✅ Extracted {len(sentences)} sentences to sentences.json")
print(f"Sample sentences:")
for i in range(min(10, len(sentences))):
    s = sentences[i]
    print(f"  {i}: {s['full_sentence']}")
    print(f"      answer: {s['answer']}")
