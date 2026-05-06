// Speech utility functions — word comparison, normalization, WPM, feedback

// ── Number → Words (0–999,999,999) ────────────────
const ONES = [
  'zero','one','two','three','four','five','six','seven','eight','nine',
  'ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen',
  'seventeen','eighteen','nineteen',
];
const TENS = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];

export function numToWords(n) {
  n = Math.abs(Math.floor(n));
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '');
  if (n < 1000) {
    const r = n % 100;
    return ONES[Math.floor(n / 100)] + ' hundred' + (r ? ' ' + numToWords(r) : '');
  }
  if (n < 1_000_000) {
    const k = Math.floor(n / 1000);
    const r = n % 1000;
    return numToWords(k) + ' thousand' + (r ? ' ' + numToWords(r) : '');
  }
  if (n < 1_000_000_000) {
    const m = Math.floor(n / 1_000_000);
    const r = n % 1_000_000;
    return numToWords(m) + ' million' + (r ? ' ' + numToWords(r) : '');
  }
  return String(n);
}

// Normalize a word token: lowercase, strip punctuation, convert digits
export function normalizeToken(w) {
  w = w.toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '');
  w = w.replace(/\d+/g, (m) => numToWords(parseInt(m, 10)));
  return w.trim();
}

// Levenshtein distance
export function levenshtein(a, b) {
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[a.length][b.length];
}

// Fuzzy match — threshold: edit distance / maxLen < 0.30
export function isSimilar(spoken, expected) {
  if (spoken === expected) return true;
  if (!spoken || !expected) return false;
  const maxLen = Math.max(spoken.length, expected.length);
  if (maxLen <= 2) return spoken === expected;
  return levenshtein(spoken, expected) / maxLen < 0.3;
}

// Compare spoken text against expected words array
export function evaluateWords(spokenText, expectedWords) {
  const spokenWords = spokenText
    .toLowerCase()
    .split(/\s+/)
    .map(normalizeToken)
    .filter(Boolean);

  let correctCount = 0;
  let incorrectCount = 0;
  const results = expectedWords.map((expected, i) => {
    if (i < spokenWords.length) {
      const match = isSimilar(spokenWords[i], expected);
      if (match) correctCount++;
      else incorrectCount++;
      return match ? 'correct' : 'incorrect';
    }
    return 'pending';
  });

  const accuracy = expectedWords.length
    ? Math.round((correctCount / expectedWords.length) * 100)
    : 0;

  return { results, correctCount, incorrectCount, accuracy, wordsSpoken: spokenWords.length };
}

// Speed feedback
export function getSpeedFeedback(actualWpm, targetWpm) {
  if (actualWpm === 0) return 'No speech detected';
  const ratio = actualWpm / targetWpm;
  if (ratio < 0.7) return 'Too Slow';
  if (ratio > 1.35) return 'Too Fast';
  return 'Optimal';
}

// Coach feedback text
export function getFeedbackText(accuracy, speedFeedback) {
  const speedMap = {
    Optimal: 'Great pace! Your speed matches the target.',
    'Too Fast': 'You spoke too fast. Slow down for better clarity.',
    'Too Slow': 'You spoke slower than the target. Try increasing pace.',
    'No speech detected': 'No speech was detected. Ensure microphone access is granted.',
  };
  const accTip =
    accuracy >= 85
      ? 'Excellent accuracy — keep it up!'
      : accuracy >= 65
        ? 'Good effort. Practice the mismatched words again.'
        : 'Focus on each word clearly. Retry at a slower speed first.';
  return (speedMap[speedFeedback] || '') + '\n\n' + accTip;
}

// WPM targets
export const WPM_TARGETS = { slow: 50, medium: 100, fast: 150 };
