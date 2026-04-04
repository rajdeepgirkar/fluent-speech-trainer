/**
 * Speech Fluency Trainer — speech.js
 * Handles Web Speech API, real-time word comparison, and accuracy scoring.
 */

window.SFT = window.SFT || {};

window.SFT.speech = (function () {
  'use strict';

  // ── State ─────────────────────────────────────────────
  let recognition   = null;
  let isListening    = false;
  let currentWords   = [];   // normalized expected words
  let wordSpans      = [];   // DOM spans for the reading text
  let finalTranscript = '';
  let interimTranscript = '';
  let correctCount   = 0;
  let incorrectCount = 0;
  let startTime      = null;
  let wordsSpoken    = 0;

  // Callbacks
  let onWord      = null;  // (index, status) called when a word is evaluated
  let onTranscript = null; // (interim, final) called with live transcript
  let onError     = null;  // (error) called on recognition error
  let onEnd       = null;  // () called when recognition stops

  // ── Helpers ──────────────────────────────────────────

  /**
   * Normalize a single word: lowercase, strip punctuation.
   */
  function normalizeWord(w) {
    return w.toLowerCase().replace(/[^a-z']/g, '').trim();
  }

  /**
   * Levenshtein edit distance — used for fuzzy matching.
   */
  function levenshtein(a, b) {
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const dp = [];
    for (let i = 0; i <= a.length; i++) { dp[i] = [i]; }
    for (let j = 0; j <= b.length; j++) { dp[0][j] = j; }
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        dp[i][j] = a[i-1] === b[j-1]
          ? dp[i-1][j-1]
          : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
      }
    }
    return dp[a.length][b.length];
  }

  /**
   * Returns true if two words are similar enough to count as correct.
   * Uses a 30% edit-distance threshold, so "algorithm" matching "algorithmn" is fine.
   */
  function isSimilar(spoken, expected) {
    if (spoken === expected) return true;
    const maxLen = Math.max(spoken.length, expected.length);
    if (maxLen === 0) return true;
    if (maxLen <= 2) return spoken === expected;
    const dist = levenshtein(spoken, expected);
    return dist / maxLen < 0.30;
  }

  /**
   * Parse the display text into word-span elements.
   * Wraps each word in <span class="word" data-word="normalized" data-index="i">.
   */
  function buildWordSpans(container, text) {
    container.innerHTML = '';
    currentWords = [];
    wordSpans    = [];

    const rawWords = text.trim().split(/\s+/);

    rawWords.forEach((raw, i) => {
      const norm = normalizeWord(raw);
      if (!norm) return; // skip empty after normalization

      const span = document.createElement('span');
      span.className    = 'word';
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
   * Compare spoken words array against expected words and update spans.
   * Returns { correctCount, incorrectCount, accuracy }
   */
  function evaluateTranscript(spokenText) {
    const spokenWords = spokenText.toLowerCase()
      .replace(/[^a-z'\s]/g, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    correctCount   = 0;
    incorrectCount = 0;
    wordsSpoken    = spokenWords.length;

    wordSpans.forEach((span, i) => {
      const expected = currentWords[i];
      if (i < spokenWords.length) {
        const spoken = normalizeWord(spokenWords[i]);
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
        span.className = 'word'; // reset unsaid
      }
    });

    const accuracy = currentWords.length > 0
      ? Math.round((correctCount / currentWords.length) * 100)
      : 0;

    return { correctCount, incorrectCount, accuracy, wordsSpoken };
  }

  /**
   * Highlight words from index 0 to maxIndex as "spoken" in a simple pacer mode.
   * Used for paragraph pacing preview.
   */
  function setPacerPosition(index) {
    wordSpans.forEach((span, i) => {
      if (i < index)        span.classList.add('pacer');
      else if (i === index) { span.classList.add('current'); span.classList.remove('pacer'); }
      else                  { span.classList.remove('pacer', 'current'); }
    });
  }

  /**
   * Clear all word highlights.
   */
  function resetHighlights() {
    wordSpans.forEach(span => { span.className = 'word'; });
    correctCount = incorrectCount = 0;
    finalTranscript = interimTranscript = '';
    wordsSpoken = 0;
  }

  // ── Recognition Setup ─────────────────────────────────

  function isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  function init() {
    if (!isSupported()) return false;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.continuous      = true;
    recognition.interimResults  = true;
    recognition.lang             = 'en-US';
    recognition.maxAlternatives  = 1;

    recognition.onresult = function (event) {
      if (!startTime) startTime = Date.now();

      interimTranscript = '';
      let newFinal = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result     = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          newFinal += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (newFinal) finalTranscript += newFinal;

      const combined = (finalTranscript + interimTranscript).trim();
      const stats    = evaluateTranscript(combined);

      if (onTranscript) onTranscript(interimTranscript, finalTranscript, stats);
    };

    recognition.onerror = function (event) {
      // 'no-speech' is common and benign — just restart
      if (event.error === 'no-speech') return;
      if (onError) onError(event.error);
    };

    recognition.onend = function () {
      // Auto-restart while still listening (pauses cause onend)
      if (isListening) {
        try { recognition.start(); } catch (e) { /* already started */ }
      } else {
        if (onEnd) onEnd();
      }
    };

    return true;
  }

  function start() {
    if (!recognition) {
      if (!init()) return false;
    }
    try {
      recognition.start();
      isListening   = true;
      startTime     = null;
      wordsSpoken   = 0;
      return true;
    } catch (e) {
      if (e.name === 'InvalidStateError') return true; // Already running
      return false;
    }
  }

  function stop() {
    isListening = false;
    if (recognition) {
      recognition.stop();
    }
  }

  /**
   * Get WPM of what was spoken so far.
   */
  function getActualWPM() {
    if (!startTime || wordsSpoken === 0) return 0;
    const elapsedMinutes = (Date.now() - startTime) / 60000;
    return Math.round(wordsSpoken / elapsedMinutes);
  }

  /**
   * Get current accuracy stats.
   */
  function getStats() {
    const accuracy = currentWords.length > 0
      ? Math.round((correctCount / currentWords.length) * 100)
      : 0;
    return {
      accuracy,
      correctCount,
      incorrectCount,
      totalWords: currentWords.length,
      wordsSpoken,
      wpm: getActualWPM()
    };
  }

  /**
   * Get speed feedback string.
   */
  function getSpeedFeedback(actualWpm, targetWpm) {
    if (actualWpm === 0) return 'No speech detected';
    const ratio = actualWpm / targetWpm;
    if (ratio < 0.70) return 'Too Slow';
    if (ratio > 1.35) return 'Too Fast';
    return 'Optimal';
  }

  // ── Public API ────────────────────────────────────────
  return {
    isSupported,
    init,
    start,
    stop,
    buildWordSpans,
    resetHighlights,
    setPacerPosition,
    evaluateTranscript,
    getStats,
    getSpeedFeedback,
    isSimilar,

    // Getters / Setters
    isListening: () => isListening,
    getTranscript: () => ({ final: finalTranscript, interim: interimTranscript }),
    getWordSpans: () => wordSpans,
    getCurrentWords: () => currentWords,

    setCallbacks(callbacks) {
      onWord       = callbacks.onWord       || null;
      onTranscript = callbacks.onTranscript || null;
      onError      = callbacks.onError      || null;
      onEnd        = callbacks.onEnd        || null;
    }
  };
})();
