// German Practice App – Core Logic

let sentences = [];
let currentIndex = 0;
let score = 0;
let recognition = null;
let isListening = false;
let micBlocked = false;
let lastInputMode = null;

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const synth = window.speechSynthesis;

// --- Speech Recognition Setup ---
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'de-DE';
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById('answerInput').value = transcript;
        lastInputMode = 'mic';
        checkAnswer(transcript, 'mic');
    };

    recognition.onerror = (event) => {
        if (event.error === 'not-allowed') {
            micBlocked = true;
            document.getElementById('micWarning').classList.add('show');
            document.getElementById('btnSpeak').disabled = true;
        }
        setStatus('Mic error: ' + event.error + '. Please type instead.');
        isListening = false;
        updateSpeakBtn();
    };

    recognition.onend = () => {
        isListening = false;
        updateSpeakBtn();
    };
} else {
    document.getElementById('btnSpeak').disabled = true;
    document.getElementById('micWarning').classList.add('show');
}

// --- Topic Loading ---
async function loadTopic(topicId) {
    const topic = TOPICS.find(t => t.id === topicId);
    if (!topic) return;

    try {
        const response = await fetch(topic.dataFile);
        sentences = await response.json();
        currentIndex = 0;
        score = 0;
        document.getElementById('score').textContent = score;
        renderSentence();
    } catch (e) {
        document.getElementById('prompt').textContent = `Error loading ${topic.dataFile}`;
        console.error(e);
    }
}

// --- Topic Selector ---
function buildTopicSelector() {
    const select = document.getElementById('topicSelect');
    TOPICS.forEach((topic, i) => {
        const opt = document.createElement('option');
        opt.value = topic.id;
        opt.textContent = topic.name;
        select.appendChild(opt);
    });
    select.addEventListener('change', (e) => loadTopic(e.target.value));
}

// --- Rendering ---
function renderSentence() {
    const s = sentences[currentIndex];
    document.getElementById('verb').textContent = `#${currentIndex + 1} | ${s.verb}`;
    document.getElementById('prompt').textContent = s.prompt;
    document.getElementById('translation').textContent = s.translation;
    document.getElementById('progress').textContent = currentIndex + 1;
    document.getElementById('total').textContent = sentences.length;

    document.getElementById('answerInput').value = '';
    const resultBox = document.getElementById('result');
    resultBox.className = 'result-box';
    resultBox.style.display = 'none';
    document.getElementById('status').textContent = '';
    document.getElementById('inputMode').textContent = '';
    updateInputPlaceholder();

    isListening = false;
    updateSpeakBtn();
}

function updateInputPlaceholder() {
    const input = document.getElementById('answerInput');
    if (lastInputMode === 'mic') {
        input.placeholder = '🎤 Speak the full sentence, or type the verb...';
    } else if (lastInputMode === 'type') {
        input.placeholder = '⌨️ Type only the verb (e.g., ist abgebogen)...';
    } else {
        input.placeholder = '⌨️ Type only the verb, or 🎤 speak the full sentence...';
    }
}

// --- Audio ---
function cleanTextForSpeech(text) {
    return text
        .replace(/[*_`#]/g, '')
        .replace(/_{2,}/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function readAloud() {
    if (synth.speaking) synth.cancel();
    const fullSentence = sentences[currentIndex].full_sentence;
    const cleanText = cleanTextForSpeech(fullSentence);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'de-DE';
    utterance.rate = 0.9;
    synth.speak(utterance);
    setStatus('🔊 Reading full sentence...');
}

function startListening() {
    if (micBlocked) {
        setStatus('⚠️ Mic blocked on this connection. Please type your answer.');
        return;
    }
    if (isListening) {
        recognition.stop();
        return;
    }
    recognition.start();
    isListening = true;
    updateSpeakBtn();
    setStatus('🎤 Listening... Speak now');
}

function updateSpeakBtn() {
    const btn = document.getElementById('btnSpeak');
    if (isListening) {
        btn.textContent = '⏹ Stop';
        btn.className = 'btn-speak listening';
    } else {
        btn.textContent = '🎤 Speak';
        btn.className = 'btn-speak';
    }
}

// --- Answer Checking ---
function checkAnswer(userAnswer, inputMode) {
    if (!userAnswer.trim()) {
        setStatus('Please type or speak an answer first.');
        return;
    }
    inputMode = inputMode || 'type';
    lastInputMode = inputMode;

    const s = sentences[currentIndex];
    const normalizedUser = normalize(userAnswer);

    let isCorrect, correctText, checkingLabel;

    if (inputMode === 'mic') {
        correctText = s.full_sentence;
        checkingLabel = '🎤 Checking full sentence';
        isCorrect = fuzzyMatch(normalizedUser, normalize(correctText));
    } else {
        correctText = s.answer;
        checkingLabel = '⌨️ Checking verb only';
        // Handle "aux | participle" format (two blanks)
        const parts = correctText.split('|').map(p => normalize(p));
        if (parts.length === 2) {
            const normalizedUserLower = normalizedUser;
            isCorrect = parts.every(p => normalizedUserLower.includes(p));
        } else {
            const normalizedCorrect = normalize(correctText);
            isCorrect = normalizedUser === normalizedCorrect ||
                        normalizedUser.includes(normalizedCorrect) ||
                        normalizedCorrect.includes(normalizedUser);
        }
    }

    const resultBox = document.getElementById('result');
    document.getElementById('userAnswer').textContent = userAnswer;
    document.getElementById('correctAnswer').textContent = correctText;
    document.getElementById('inputMode').textContent = checkingLabel;

    resultBox.className = `result-box show ${isCorrect ? 'correct' : 'incorrect'}`;
    resultBox.style.display = 'block';

    if (isCorrect) {
        score++;
        document.getElementById('score').textContent = score;
        setStatus('✅ Correct! Press Next to continue.');
    } else {
        setStatus('❌ Not quite. Check the correct answer above.');
    }
}

function fuzzyMatch(user, expected) {
    const userWords = new Set(user.split(' ').filter(w => w.length > 1));
    const expectedWords = new Set(expected.split(' ').filter(w => w.length > 1));

    let matched = 0;
    expectedWords.forEach(w => { if (userWords.has(w)) matched++; });

    const ratio = matched / expectedWords.size;
    return ratio >= 0.7;
}

function normalize(str) {
    return str.toLowerCase()
              .replace(/[.,!?;:]/g, '')
              .replace(/\s+/g, ' ')
              .trim();
}

function setStatus(msg) {
    document.getElementById('status').textContent = msg;
}

// --- Navigation ---
function next() {
    if (currentIndex < sentences.length - 1) {
        currentIndex++;
        renderSentence();
    } else {
        setStatus('🏁 You reached the end!');
    }
}

function prev() {
    if (currentIndex > 0) {
        currentIndex--;
        renderSentence();
    }
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    buildTopicSelector();
    loadTopic(TOPICS[0].id);

    document.getElementById('btnRead').addEventListener('click', readAloud);
    document.getElementById('btnSpeak').addEventListener('click', startListening);
    document.getElementById('btnNext').addEventListener('click', next);
    document.getElementById('btnPrev').addEventListener('click', prev);

    const inputField = document.getElementById('answerInput');
    document.getElementById('btnCheck').addEventListener('click', () => checkAnswer(inputField.value, 'type'));
    inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') checkAnswer(inputField.value, 'type');
    });

    document.addEventListener('keydown', (e) => {
        if (e.target === inputField) return;
        if (e.key === 'ArrowRight') next();
        if (e.key === 'ArrowLeft') prev();
        if (e.key === ' ') { e.preventDefault(); readAloud(); }
    });
});
