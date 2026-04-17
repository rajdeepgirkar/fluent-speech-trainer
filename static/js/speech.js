/*
  * speech.js — Speech Recognition Engine
  * Handles Web Speech API, word comparison, number normalization, and highlighting.
*/
window.SFT = window.SFT || {};

window.SFT.speech = (function () {
  'use strict';

  // ── State ─────────────────────────────────────────────
  let recognition       = null;
  let isListening       = false;
  let currentWords      = [];   // normalized expected words
  let wordSpans         = [];
  let finalTranscript   = '';
  let interimTranscript = '';
  let correctCount      = 0;
  let incorrectCount    = 0;
  let startTime         = null;
  let wordsSpoken       = 0;
  let onWord            = null;
  let onTranscript      = null;
  let onError           = null;
  let onEnd             = null;

  // ── Number → Words lookup (0–999 + larger) ────────────
  const ONES = ['zero','one','two','three','four','five','six','seven','eight','nine',
                 'ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen',
                 'seventeen','eighteen','nineteen'];
  const TENS = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];

  function numToWords(n) {
    n = Math.abs(Math.floor(n));
    if (n < 20)  return ONES[n];
    if (n < 100) return TENS[Math.floor(n/10)] + (n%10 ? '-' + ONES[n%10] : '');
    if (n < 1000) {
      const r = n % 100;
      return ONES[Math.floor(n/100)] + ' hundred' + (r ? ' ' + numToWords(r) : '');
    }
    if (n < 1_000_000) {
      const k = Math.floor(n/1000);
      const r = n % 1000;
      return numToWords(k) + ' thousand' + (r ? ' ' + numToWords(r) : '');
    }
    if (n < 1_000_000_000) {
      const m = Math.floor(n/1_000_000);
      const r = n % 1_000_000;
      return numToWords(m) + ' million' + (r ? ' ' + numToWords(r) : '');
    }
    return String(n); // fallback for huge numbers
  }

  /**
   * Normalize a word token:
   * 1. Lowercase
   * 2. Strip leading/trailing punctuation
   * 3. Convert digit sequences → number words
   */
  function normalizeToken(w) {
    // Strip punctuation wrapper
    w = w.toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '');
    // Replace digit sequences with word equivalents
    w = w.replace(/\d+/g, m => numToWords(parseInt(m, 10)));
    return w.trim();
  }

  /**
   * Levenshtein distance for fuzzy matching.
   */
  function levenshtein(a, b) {
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const dp = Array.from({length: a.length + 1}, (_, i) => [i]);
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++)
      for (let j = 1; j <= b.length; j++)
        dp[i][j] = a[i-1] === b[j-1]
          ? dp[i-1][j-1]
          : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    return dp[a.length][b.length];
  }

  /**
   * Returns true if two normalized words are close enough.
   * Threshold: edit distance / maxLen < 0.30
   */
  function isSimilar(spoken, expected) {
    if (spoken === expected) return true;
    if (!spoken || !expected) return false;
    const maxLen = Math.max(spoken.length, expected.length);
    if (maxLen <= 2) return spoken === expected;
    return levenshtein(spoken, expected) / maxLen < 0.30;
  }

  // ── DOM helpers ───────────────────────────────────────

  /**
   * Parse text into word spans inside container.
   * Stores normalizeToken() version in dataset.word.
   */
  function buildWordSpans(container, text) {
    container.innerHTML = '';
    currentWords = [];
    wordSpans    = [];

    text.trim().split(/\s+/).forEach((raw, i) => {
      const norm = normalizeToken(raw);
      if (!norm) return;

      const span = document.createElement('span');
      span.className     = 'word';
      span.dataset.word  = norm;
      span.dataset.index = i;
      span.textContent   = raw;

      container.appendChild(span);
      container.appendChild(document.createTextNode(' '));
      currentWords.push(norm);
      wordSpans.push(span);
    });

    return wordSpans;
  }

  /**
   * Compare the combined spoken transcript against expected words.
   * Numbers spoken as digits (e.g. "3") are converted to words ("three") before comparing.
   */
  function evaluateTranscript(spokenText) {
    // Normalize: lowercase, strip punct, convert digits → words
    const spokenWords = spokenText.toLowerCase()
      .split(/\s+/)
      .map(w => normalizeToken(w))
      .filter(Boolean);

    correctCount   = 0;
    incorrectCount = 0;
    wordsSpoken    = spokenWords.length;

    wordSpans.forEach((span, i) => {
      const expected = currentWords[i];
      if (i < spokenWords.length) {
        const spoken = spokenWords[i];
        if (isSimilar(spoken, expected)) {
          span.className = 'word correct';
          correctCount++;
          if (onWord) onWord(i, 'correct');
        } else {
          span.className = 'word incorrect';
          incorrectCount++;
          if (onWord) onWord(i, 'incorrect');
        }
      } else {
        span.className = 'word';
      }
    });

    const accuracy = currentWords.length
      ? Math.round((correctCount / currentWords.length) * 100)
      : 0;

    return { correctCount, incorrectCount, accuracy, wordsSpoken };
  }

  function setPacerPosition(index) {
    wordSpans.forEach((span, i) => {
      if (i < index) {
        span.classList.add('pacer');
        span.classList.remove('current');
      } else if (i === index) {
        span.classList.add('current');
        span.classList.remove('pacer');
      } else {
        span.classList.remove('pacer', 'current');
      }
    });
    // Auto-scroll into view
    if (wordSpans[index]) {
      wordSpans[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function resetHighlights() {
    wordSpans.forEach(s => { s.className = 'word'; });
    correctCount = incorrectCount = wordsSpoken = 0;
    finalTranscript = interimTranscript = '';
  }

  // ── Recognition ───────────────────────────────────────

  function isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  function initRecognition() {
    if (!isSupported()) return false;
    const SR     = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition  = new SR();
    recognition.continuous     = true;
    recognition.interimResults = true;
    recognition.lang           = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      if (!startTime) startTime = Date.now();
      interimTranscript = '';
      let newFinal = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) newFinal += transcript + ' ';
        else interimTranscript += transcript;
      }

      if (newFinal) finalTranscript += newFinal;
      const stats = evaluateTranscript(finalTranscript + interimTranscript);
      if (onTranscript) onTranscript(interimTranscript, finalTranscript, stats);
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') return; // benign
      if (onError) onError(event.error);
    };

    recognition.onend = () => {
      if (isListening) {
        // Auto-restart after pause
        try { recognition.start(); } catch (e) { /* already running */ }
      } else {
        if (onEnd) onEnd();
      }
    };

    return true;
  }

  function start() {
    if (!recognition && !initRecognition()) return false;
    try {
      recognition.start();
      isListening = true;
      startTime   = null;
      wordsSpoken = 0;
      return true;
    } catch (e) {
      if (e.name === 'InvalidStateError') return true;
      return false;
    }
  }

  function stop() {
    isListening = false;
    if (recognition) recognition.stop();
  }

  function getActualWPM() {
    if (!startTime || wordsSpoken === 0) return 0;
    return Math.round(wordsSpoken / ((Date.now() - startTime) / 60000));
  }

  function getStats() {
    const accuracy = currentWords.length
      ? Math.round((correctCount / currentWords.length) * 100)
      : 0;
    return { accuracy, correctCount, incorrectCount, totalWords: currentWords.length, wordsSpoken, wpm: getActualWPM() };
  }

  function getSpeedFeedback(actualWpm, targetWpm) {
    if (actualWpm === 0) return 'No speech detected';
    const ratio = actualWpm / targetWpm;
    if (ratio < 0.70) return 'Too Slow';
    if (ratio > 1.35) return 'Too Fast';
    return 'Optimal';
  }

  // ── Public API ────────────────────────────────────────
  return {
    isSupported, start, stop, buildWordSpans, resetHighlights,
    setPacerPosition, evaluateTranscript, getStats, getSpeedFeedback,
    numToWords, normalizeToken,
    isListening:       () => isListening,
    getTranscript:     () => ({ final: finalTranscript, interim: interimTranscript }),
    getCurrentWords:   () => currentWords,
    getWordSpans:      () => wordSpans,
    setCallbacks(cb) {
      onWord       = cb.onWord       || null;
      onTranscript = cb.onTranscript || null;
      onError      = cb.onError      || null;
      onEnd        = cb.onEnd        || null;
    }
  };
})();
