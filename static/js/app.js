/**
 * Speech Fluency Trainer — app.js
 * Main application controller: navigation, session management, scoring.
 */

(function () {
  'use strict';

  const speech   = window.SFT.speech;
  const recorder = window.SFT.recorder;

  // ── Config ────────────────────────────────────────────
  const WPM_TARGETS = { slow: 80, medium: 130, fast: 200 };
  const TT_SESSION_SIZE = 5;
  const API = '/api';

  // ── Application State ─────────────────────────────────
  const state = {
    username:     localStorage.getItem('sft_username') || 'Anonymous',
    currentPage:  'home',

    // Tongue Twister
    tt: {
      category:     'communication',
      speed:        'medium',
      session:      [],
      index:        0,
      scores:       [],  // per-twister accuracy values
    },

    // Paragraph Reading
    para: {
      difficulty:   'medium',
      speed:        'medium',
      text:         null,
      title:        '',
      wordCount:    0,
      pacerTimer:   null,
      pacerIndex:   0,
    },

    // Current session shared
    sessionActive:  false,
    sessionStart:   null,
    micEnabled:     false,
  };

  // ── DOM References (cached on init) ───────────────────
  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);

  let dom = {};

  function cacheDom() {
    dom = {
      // Pages
      pages: $$('.page'),

      // Navbar
      navLeaderboard: $('nav-leaderboard'),
      navHome:        $('nav-home'),
      usernameChip:   $('username-chip'),
      usernameLabel:  $('username-label'),

      // Home
      btnTT:    $('btn-start-tt'),
      btnPara:  $('btn-start-para'),
      btnDaily: $('btn-daily'),
      dailyDate: $('daily-date'),

      // TT Setup
      ttCatBtns: $$('.tt-cat-btn'),
      ttSpeedBtns: $$('.tt-speed-btn'),
      btnStartTTSession: $('btn-start-tt-session'),

      // TT Session
      ttBadge:     $('tt-badge'),
      ttCounter:   $('tt-counter'),
      ttProgress:  $('tt-progress-fill'),
      ttProgressLabel: $('tt-progress-label'),
      ttReadingText: $('tt-reading-text'),
      ttTranscript:  $('tt-transcript'),
      ttWordScore:   $('tt-word-score'),
      ttCorrectCount: $('tt-correct-count'),
      ttIncorrectCount: $('tt-incorrect-count'),
      ttWpmChip:   $('tt-wpm-chip'),
      ttTimerChip: $('tt-timer-chip'),
      micBtnTT:    $('mic-btn-tt'),
      recIndicatorTT: $('rec-indicator-tt'),
      btnDownloadTT:  $('btn-download-tt'),
      btnPlaybackTT:  $('btn-playback-tt'),
      btnNextTwister: $('btn-next-twister'),
      btnEndTTSession: $('btn-end-tt-session'),
      audioPlaybackTT: $('audio-playback-tt'),
      ttSpeedLabel: $('tt-speed-label'),

      // Para Setup
      paraDiffBtns: $$('.para-diff-btn'),
      paraSpeedBtns: $$('.para-speed-btn'),
      paraUploadZone: $('para-upload-zone'),
      paraUploadInput: $('para-upload-input'),
      paraUploadFilename: $('para-upload-filename'),
      paraUseCustom: $('para-use-custom'),
      btnStartParaSession: $('btn-start-para-session'),

      // Para Session
      paraReadingText: $('para-reading-text'),
      paraTranscript:  $('para-transcript'),
      paraProgress:    $('para-progress-fill'),
      paraProgressLabel: $('para-progress-label'),
      paraWpmChip:    $('para-wpm-chip'),
      paraTimerChip:  $('para-timer-chip'),
      paraCorrectCount: $('para-correct-count'),
      paraIncorrectCount: $('para-incorrect-count'),
      micBtnPara:     $('mic-btn-para'),
      recIndicatorPara: $('rec-indicator-para'),
      btnDownloadPara:  $('btn-download-para'),
      btnPlaybackPara:  $('btn-playback-para'),
      btnEndParaSession: $('btn-end-para-session'),
      audioPlaybackPara: $('audio-playback-para'),
      paraPacerBtns:  $$('.para-pacer-btn'),
      paraSpeedLabel: $('para-speed-label'),
      paraTitleDisp:  $('para-title-display'),

      // Results
      resultsTrophy:   $('results-trophy'),
      resultsTitle:    $('results-title'),
      resultsSubtitle: $('results-subtitle'),
      scoreRingFill:   $('score-ring-fill'),
      scoreRingNumber: $('score-ring-number'),
      resultAccuracy:  $('result-accuracy'),
      resultWpm:       $('result-wpm'),
      resultFeedback:  $('result-feedback'),
      feedbackText:    $('feedback-text'),
      btnRetry:        $('btn-retry'),
      btnNewSession:   $('btn-new-session'),
      btnGoHome:       $('btn-go-home'),
      btnSaveScore:    $('btn-save-score'),
      btnDownloadResult: $('btn-download-result'),

      // Leaderboard
      lbBody:    $('lb-body'),
      lbTotal:   $('lb-total'),

      // Username Modal
      usernameModal: $('username-modal'),
      usernameInput: $('username-input'),
      btnSaveUsername: $('btn-save-username'),
      btnCancelUsername: $('btn-cancel-username'),

      // Toast
      toastContainer: $('toast-container'),
    };
  }

  // ── Navigation ────────────────────────────────────────

  function showPage(pageId) {
    dom.pages.forEach(p => p.classList.remove('active'));
    const target = $(`page-${pageId}`);
    if (target) target.classList.add('active');
    state.currentPage = pageId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Toast Notifications ───────────────────────────────

  function toast(message, type = 'info', duration = 3500) {
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = message;
    dom.toastContainer.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 400); }, duration);
  }

  // ── API Helpers ───────────────────────────────────────

  async function apiFetch(path, options = {}) {
    try {
      const res  = await fetch(API + path, options);
      const data = await res.json();
      return data;
    } catch (e) {
      console.error('API error:', e);
      return null;
    }
  }

  // ── Username Management ───────────────────────────────

  function openUsernameModal() {
    dom.usernameInput.value = state.username;
    dom.usernameModal.classList.add('open');
    setTimeout(() => dom.usernameInput.focus(), 200);
  }

  function closeUsernameModal() {
    dom.usernameModal.classList.remove('open');
  }

  function saveUsername() {
    const name = dom.usernameInput.value.trim() || 'Anonymous';
    state.username = name.slice(0, 30);
    localStorage.setItem('sft_username', state.username);
    dom.usernameLabel.textContent = state.username;
    closeUsernameModal();
    toast(`Welcome, ${state.username}! 👋`, 'success');
  }

  // ── Home Page ─────────────────────────────────────────

  async function initHome() {
    dom.usernameLabel.textContent = state.username;

    // Daily challenge date
    const today = new Date();
    if (dom.dailyDate) {
      dom.dailyDate.textContent = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
  }

  // ── TONGUE TWISTER MODULE ─────────────────────────────

  function initTTSetup() {
    // Reflect current selections
    dom.ttCatBtns.forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.cat === state.tt.category);
    });
    dom.ttSpeedBtns.forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.speed === state.tt.speed);
    });
  }

  async function startTTSession() {
    const data = await apiFetch(
      `/tongue-twisters/session?category=${state.tt.category}&count=${TT_SESSION_SIZE}`
    );

    if (!data || !data.session || !data.session.length) {
      toast('Could not load tongue twisters. Retrying with built-in data.', 'warning');
      startTTSessionFallback();
      return;
    }

    state.tt.session = data.session;
    state.tt.index   = 0;
    state.tt.scores  = [];

    showPage('tt-session');
    loadTwister(0);
  }

  /** Fallback: built-in data if backend is unavailable */
  function startTTSessionFallback() {
    const builtIn = [
      { text: "How much wood would a woodchuck chuck if a woodchuck could chuck wood?", difficulty: "medium" },
      { text: "She sells seashells by the seashore and the shells she sells are surely seashells.", difficulty: "hard" },
      { text: "Peter Piper picked a peck of pickled peppers.", difficulty: "easy" },
      { text: "Red lorry, yellow lorry, red lorry, yellow lorry.", difficulty: "hard" },
      { text: "Communicating clearly creates confident and competent conversationalists.", difficulty: "medium" },
    ];
    state.tt.session = builtIn;
    state.tt.index   = 0;
    state.tt.scores  = [];
    showPage('tt-session');
    loadTwister(0);
  }

  function loadTwister(index) {
    const twister = state.tt.session[index];
    if (!twister) return;

    // Update progress
    const pct = ((index) / state.tt.session.length) * 100;
    dom.ttProgress.style.width = `${pct}%`;
    dom.ttProgressLabel.textContent = `${index + 1} / ${state.tt.session.length}`;
    dom.ttCounter.textContent = `Twister ${index + 1} of ${state.tt.session.length}`;

    // Build word spans
    speech.buildWordSpans(dom.ttReadingText, twister.text);
    speech.resetHighlights();
    speech.setCallbacks({
      onTranscript: (interim, final, stats) => {
        dom.ttTranscript.textContent = (final + interim).slice(-120);
        dom.ttTranscript.classList.add('active');
        dom.ttCorrectCount.textContent   = stats.correctCount;
        dom.ttIncorrectCount.textContent = stats.incorrectCount;
        // Update WPM
        const wpm = speech.getStats().wpm;
        if (wpm > 0) dom.ttWpmChip.textContent = `${wpm} WPM`;
      },
      onError: (err) => {
        if (err !== 'no-speech') toast(`Speech error: ${err}`, 'error');
      }
    });

    // Reset mic state
    stopListening('tt');
    dom.ttTranscript.textContent = 'Enable microphone and start reading aloud…';
    dom.ttTranscript.classList.remove('active');
    dom.ttCorrectCount.textContent   = '0';
    dom.ttIncorrectCount.textContent = '0';
    dom.ttWpmChip.textContent        = '— WPM';

    // Update speed label
    const target = WPM_TARGETS[state.tt.speed];
    dom.ttSpeedLabel.textContent = `${capitalize(state.tt.speed)} · Target ${target} WPM`;

    // Reset next button
    dom.btnNextTwister.textContent = index < state.tt.session.length - 1 ? 'Next →' : 'Finish Session';

    // Reset recording UI
    updateRecordingUI('tt', false);

    // Start timer
    startSessionTimer('tt');
  }

  function scoreTwister() {
    const stats = speech.getStats();
    state.tt.scores.push(stats.accuracy);
    return stats;
  }

  function nextTwister() {
    const stats = scoreTwister();
    stopListening('tt');
    recorder.stop();

    if (state.tt.index < state.tt.session.length - 1) {
      state.tt.index++;
      clearSessionTimer('tt');
      loadTwister(state.tt.index);
    } else {
      // End of session
      clearSessionTimer('tt');
      showTTResults(stats);
    }
  }

  function showTTResults(lastStats) {
    const avgAccuracy = state.tt.scores.length
      ? Math.round(state.tt.scores.reduce((a, b) => a + b, 0) / state.tt.scores.length)
      : lastStats.accuracy;
    const wpm = speech.getStats().wpm;
    const feedback = speech.getSpeedFeedback(wpm, WPM_TARGETS[state.tt.speed]);

    showResults({
      module: 'tongue_twister',
      accuracy: avgAccuracy,
      wpm,
      speedSetting: state.tt.speed,
      speedFeedback: feedback,
      details: { category: state.tt.category, twisters_completed: state.tt.session.length }
    });
  }

  // ── PARAGRAPH MODULE ───────────────────────────────────

  function initParaSetup() {
    dom.paraDiffBtns.forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.diff === state.para.difficulty);
    });
    dom.paraSpeedBtns.forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.speed === state.para.speed);
    });
    state.para.text = null;
    if (dom.paraUseCustom) dom.paraUseCustom.classList.add('hidden');
  }

  async function startParaSession() {
    let content, title;

    if (state.para.customText) {
      content = state.para.customText;
      title   = 'Custom Text';
    } else {
      const data = await apiFetch(`/paragraphs/random?difficulty=${state.para.difficulty}`);
      if (!data || !data.text) {
        toast('Could not load paragraph. Using built-in.', 'warning');
        content = "The phenomenon of communication encompasses much more than mere words. " +
          "It is the dynamic interplay of clarity, intention, and empathy that allows people " +
          "to connect meaningfully with one another. Practice makes perfect, and consistent " +
          "effort yields remarkable results over time.";
        title = "Sample Paragraph";
      } else {
        content = data.text;
        title   = data.title || 'Paragraph';
      }
    }

    state.para.text      = content;
    state.para.title     = title;
    state.para.wordCount = content.split(/\s+/).length;
    state.para.pacerIndex = 0;

    showPage('para-session');
    loadParagraph(content, title);
  }

  function loadParagraph(text, title) {
    dom.paraTitleDisp.textContent = title;

    // Build word spans
    speech.buildWordSpans(dom.paraReadingText, text);
    speech.resetHighlights();

    // Update progress display
    dom.paraProgress.style.width = '0%';
    dom.paraProgressLabel.textContent = `0 / ${speech.getCurrentWords().length} words`;

    // Speed label
    const target = WPM_TARGETS[state.para.speed];
    dom.paraSpeedLabel.textContent = `${capitalize(state.para.speed)} · Target ${target} WPM`;

    // Set speech callbacks
    speech.setCallbacks({
      onTranscript: (interim, final, stats) => {
        dom.paraTranscript.textContent = (final + interim).slice(-120);
        dom.paraTranscript.classList.add('active');
        dom.paraCorrectCount.textContent   = stats.correctCount;
        dom.paraIncorrectCount.textContent = stats.incorrectCount;
        // Progress
        const totalWords = speech.getCurrentWords().length;
        const pct = totalWords ? Math.round((stats.wordsSpoken / totalWords) * 100) : 0;
        dom.paraProgress.style.width = `${Math.min(pct, 100)}%`;
        dom.paraProgressLabel.textContent = `${stats.wordsSpoken} / ${totalWords} words`;
        // WPM
        const wpm = speech.getStats().wpm;
        if (wpm > 0) dom.paraWpmChip.textContent = `${wpm} WPM`;
      },
      onError: (err) => {
        if (err !== 'no-speech') toast(`Speech error: ${err}`, 'error');
      }
    });

    dom.paraTranscript.textContent = 'Enable microphone and start reading the paragraph aloud…';
    dom.paraTranscript.classList.remove('active');
    dom.paraCorrectCount.textContent   = '0';
    dom.paraIncorrectCount.textContent = '0';
    dom.paraWpmChip.textContent        = '— WPM';

    updateRecordingUI('para', false);
    startSessionTimer('para');
  }

  /** Pacer: auto-advance word highlight at the target WPM */
  let pacerTimer = null;

  function startPacer() {
    stopPacer();
    const wordsCount  = speech.getCurrentWords().length;
    const target      = WPM_TARGETS[state.para.speed];
    const msPerWord   = (60 / target) * 1000;
    state.para.pacerIndex = 0;

    pacerTimer = setInterval(() => {
      if (state.para.pacerIndex >= wordsCount) {
        stopPacer();
        return;
      }
      speech.setPacerPosition(state.para.pacerIndex);
      state.para.pacerIndex++;
    }, msPerWord);
  }

  function stopPacer() {
    if (pacerTimer) { clearInterval(pacerTimer); pacerTimer = null; }
  }

  function showParaResults() {
    stopListening('para');
    stopPacer();
    recorder.stop();
    clearSessionTimer('para');

    const stats    = speech.getStats();
    const wpm      = stats.wpm;
    const feedback = speech.getSpeedFeedback(wpm, WPM_TARGETS[state.para.speed]);

    showResults({
      module: 'paragraph',
      accuracy: stats.accuracy,
      wpm,
      speedSetting: state.para.speed,
      speedFeedback: feedback,
      details: { difficulty: state.para.difficulty, word_count: state.para.wordCount }
    });
  }

  // ── Microphone / Listening Controls ───────────────────

  async function toggleMic(module) {
    if (speech.isListening()) {
      stopListening(module);
    } else {
      await startListening(module);
    }
  }

  async function startListening(module) {
    // Init recorder (asks for mic permission)
    const ok = await recorder.init();
    if (!ok) {
      toast('Microphone access denied. Please check browser permissions.', 'error');
      return;
    }

    const started = speech.start();
    if (!started) {
      toast('Speech recognition failed to start. Try Chrome or Edge.', 'error');
      return;
    }

    state.micEnabled = true;

    // Update mic button
    const micBtn = module === 'tt' ? dom.micBtnTT : dom.micBtnPara;
    micBtn.classList.add('listening');
    micBtn.title = 'Stop listening';
    micBtn.querySelector('.mic-icon').textContent = '⏹';

    // Start recording
    recorder.start();
    recorder.setCallbacks({
      onStart: () => updateRecordingUI(module, true),
      onStop:  (data) => {
        updateRecordingUI(module, false);
        // Set playback src
        const audio = module === 'tt' ? dom.audioPlaybackTT : dom.audioPlaybackPara;
        if (audio) audio.src = data.url;
        const btnDl = module === 'tt' ? dom.btnDownloadTT : dom.btnDownloadPara;
        const btnPb = module === 'tt' ? dom.btnPlaybackTT : dom.btnPlaybackPara;
        if (btnDl) btnDl.classList.remove('hidden');
        if (btnPb) btnPb.classList.remove('hidden');
      }
    });

    // If paragraph, start pacer
    if (module === 'para') startPacer();

    toast('Listening… Start reading!', 'success', 2000);
  }

  function stopListening(module) {
    speech.stop();
    stopPacer();
    state.micEnabled = false;

    const micBtn = module === 'tt' ? dom.micBtnTT : dom.micBtnPara;
    if (micBtn) {
      micBtn.classList.remove('listening');
      micBtn.title = 'Enable microphone';
      const icon = micBtn.querySelector('.mic-icon');
      if (icon) icon.textContent = '🎤';
    }
  }

  function updateRecordingUI(module, isRecording) {
    const indicator = module === 'tt' ? dom.recIndicatorTT : dom.recIndicatorPara;
    if (!indicator) return;
    if (isRecording) {
      indicator.classList.add('recording');
      indicator.querySelector('.rec-dot').style.background = 'var(--coral)';
      indicator.querySelector('.rec-label').textContent = 'REC';
    } else {
      indicator.classList.remove('recording');
      indicator.querySelector('.rec-dot').style.background = '';
      indicator.querySelector('.rec-label').textContent = 'OFF';
    }
  }

  // ── Session Timer ─────────────────────────────────────

  const sessionTimers = {};
  const sessionSeconds = {};

  function startSessionTimer(module) {
    clearSessionTimer(module);
    sessionSeconds[module] = 0;
    const chip = module === 'tt' ? dom.ttTimerChip : dom.paraTimerChip;
    if (chip) chip.textContent = '0:00';

    sessionTimers[module] = setInterval(() => {
      sessionSeconds[module]++;
      const m = Math.floor(sessionSeconds[module] / 60);
      const s = sessionSeconds[module] % 60;
      if (chip) chip.textContent = `${m}:${s.toString().padStart(2,'0')}`;
    }, 1000);
  }

  function clearSessionTimer(module) {
    if (sessionTimers[module]) {
      clearInterval(sessionTimers[module]);
      delete sessionTimers[module];
    }
  }

  // ── Results Page ──────────────────────────────────────

  let lastResultData = null;

  function showResults(data) {
    lastResultData = data;

    // Determine trophy and title
    let trophy, title, subtitle;
    if (data.accuracy >= 90) {
      trophy = '🏆'; title = 'Outstanding!'; subtitle = 'Excellent fluency and accuracy.';
    } else if (data.accuracy >= 75) {
      trophy = '🥈'; title = 'Great Work!'; subtitle = 'Good performance with room to grow.';
    } else if (data.accuracy >= 55) {
      trophy = '🥉'; title = 'Keep Practicing!'; subtitle = 'Every session makes you better.';
    } else {
      trophy = '📣'; title = 'Keep Going!'; subtitle = 'Consistency is the key to fluency.';
    }

    dom.resultsTrophy.textContent   = trophy;
    dom.resultsTitle.textContent    = title;
    dom.resultsSubtitle.textContent = subtitle;

    // Score ring animation
    const circumference = 502;
    const offset = circumference - (data.accuracy / 100) * circumference;
    dom.scoreRingFill.style.strokeDashoffset = circumference;
    dom.scoreRingNumber.textContent = `${data.accuracy}%`;

    setTimeout(() => {
      dom.scoreRingFill.style.strokeDashoffset = offset;
      // Colour ring by score
      if (data.accuracy >= 90) dom.scoreRingFill.style.stroke = 'var(--mint)';
      else if (data.accuracy >= 70) dom.scoreRingFill.style.stroke = 'var(--gold)';
      else dom.scoreRingFill.style.stroke = 'var(--coral)';
    }, 100);

    // Metrics
    dom.resultAccuracy.textContent  = `${data.accuracy}%`;
    dom.resultWpm.textContent       = data.wpm > 0 ? `${data.wpm}` : '—';
    dom.resultFeedback.textContent  = data.speedFeedback;

    // Colour feedback chip
    const chip = dom.resultFeedback;
    chip.className = 'metric-value';
    if (data.speedFeedback === 'Optimal') chip.style.color = 'var(--mint)';
    else if (data.speedFeedback === 'Too Fast') chip.style.color = 'var(--coral)';
    else chip.style.color = 'var(--blue-accent)';

    // Feedback text
    const feedbackMap = {
      'Optimal':          'Great pace! Your speed matches the target perfectly.',
      'Too Fast':         'You spoke a bit fast. Try slowing down for better clarity.',
      'Too Slow':         'You spoke slower than the target. Aim to increase your pace.',
      'No speech detected': 'No speech was detected. Make sure your microphone is working.'
    };
    dom.feedbackText.textContent = (feedbackMap[data.speedFeedback] || '') +
      (data.accuracy >= 75
        ? '\n\nKeep it up — great session!'
        : '\n\nTry again to improve your score. Practice makes perfect!');

    // Download button
    dom.btnDownloadResult.classList.toggle('hidden', !recorder.hasRecording());

    showPage('results');
  }

  async function saveScore() {
    if (!lastResultData) return;
    const payload = {
      username:       state.username,
      module:         lastResultData.module,
      accuracy:       lastResultData.accuracy,
      wpm:            lastResultData.wpm,
      speed_setting:  lastResultData.speedSetting,
      speed_feedback: lastResultData.speedFeedback,
      details:        lastResultData.details
    };
    const res = await apiFetch('/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res && res.success) {
      toast('Score saved to leaderboard! 🎯', 'success');
      dom.btnSaveScore.disabled = true;
      dom.btnSaveScore.textContent = '✓ Saved';
    } else {
      toast('Could not save score. Check backend connection.', 'error');
    }
  }

  // ── Leaderboard ───────────────────────────────────────

  async function loadLeaderboard() {
    dom.lbBody.innerHTML = '<div class="empty-state"><div class="empty-icon">⏳</div><p>Loading scores…</p></div>';
    const data = await apiFetch('/scores');
    if (!data || !data.leaderboard) {
      dom.lbBody.innerHTML = '<div class="empty-state"><div class="empty-icon">📡</div><p>Could not load leaderboard. Start the Flask backend.</p></div>';
      return;
    }

    dom.lbTotal.textContent = `${data.total} total score${data.total !== 1 ? 's' : ''}`;

    if (!data.leaderboard.length) {
      dom.lbBody.innerHTML = '<div class="empty-state"><div class="empty-icon">🎤</div><p>No scores yet. Complete a session to appear here!</p></div>';
      return;
    }

    const rankEmojis = ['🥇', '🥈', '🥉'];
    const rankClasses = ['gold', 'silver', 'bronze'];

    dom.lbBody.innerHTML = data.leaderboard.map((entry, i) => {
      const rank = i < 3
        ? `<span class="lb-rank ${rankClasses[i]}">${rankEmojis[i]}</span>`
        : `<span class="lb-rank">#${i + 1}</span>`;
      const feedbackClass = entry.speed_feedback === 'Optimal' ? 'optimal'
        : entry.speed_feedback === 'Too Fast' ? 'too-fast' : 'too-slow';
      const moduleLabel = entry.module === 'tongue_twister' ? '👅 Twister' : '📖 Paragraph';
      return `
        <div class="lb-row">
          ${rank}
          <div>
            <div class="lb-user">${escHtml(entry.username)}</div>
            <div class="lb-module">${moduleLabel}</div>
          </div>
          <div class="lb-score">${entry.accuracy}%</div>
          <div class="lb-wpm">${entry.wpm > 0 ? entry.wpm + ' WPM' : '—'}</div>
          <div class="lb-feedback ${feedbackClass}">${entry.speed_feedback || '—'}</div>
        </div>`;
    }).join('');
  }

  // ── Daily Challenge ───────────────────────────────────

  async function startDailyChallenge() {
    const data = await apiFetch('/daily-challenge');
    if (!data) { toast('Could not load daily challenge.', 'error'); return; }

    // For simplicity, run the tongue twister from the daily challenge
    state.tt.session = [data.tongue_twister];
    state.tt.index   = 0;
    state.tt.scores  = [];
    state.tt.category = 'all';
    state.tt.speed    = 'medium';
    showPage('tt-session');
    loadTwister(0);
    toast(`🌟 Daily Challenge: ${data.display_date}`, 'warning', 4000);
  }

  // ── Utilities ─────────────────────────────────────────

  function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── File Upload ───────────────────────────────────────

  async function handleFileUpload(file) {
    if (!file || !file.name.endsWith('.txt')) {
      toast('Please upload a .txt file.', 'error');
      return;
    }
    // Read locally for speed (don't require backend)
    const text = await file.text();
    state.para.customText = text.trim();
    dom.paraUploadFilename.textContent = `✓ ${file.name} (${text.split(/\s+/).length} words)`;
    dom.paraUploadFilename.style.display = 'block';
    if (dom.paraUseCustom) {
      dom.paraUseCustom.textContent = '✓ Custom text loaded';
      dom.paraUseCustom.classList.remove('hidden');
    }
    toast(`File "${file.name}" loaded successfully!`, 'success');
  }

  // ── Event Listeners ───────────────────────────────────

  function bindEvents() {
    // Navbar
    dom.navHome?.addEventListener('click', () => {
      stopListening(state.currentPage === 'tt-session' ? 'tt' : 'para');
      recorder.stop();
      showPage('home');
    });
    dom.navLeaderboard?.addEventListener('click', () => {
      loadLeaderboard();
      showPage('leaderboard');
    });
    dom.usernameChip?.addEventListener('click', openUsernameModal);

    // Home
    dom.btnTT?.addEventListener('click', () => { initTTSetup(); showPage('tt-setup'); });
    dom.btnPara?.addEventListener('click', () => { initParaSetup(); showPage('para-setup'); });
    dom.btnDaily?.addEventListener('click', startDailyChallenge);

    // TT Setup
    dom.ttCatBtns?.forEach(btn => btn.addEventListener('click', () => {
      state.tt.category = btn.dataset.cat;
      dom.ttCatBtns.forEach(b => b.classList.toggle('selected', b === btn));
    }));
    dom.ttSpeedBtns?.forEach(btn => btn.addEventListener('click', () => {
      state.tt.speed = btn.dataset.speed;
      dom.ttSpeedBtns.forEach(b => b.classList.toggle('selected', b === btn));
    }));
    $('btn-back-tt-setup')?.addEventListener('click', () => showPage('home'));
    dom.btnStartTTSession?.addEventListener('click', startTTSession);

    // TT Session
    dom.micBtnTT?.addEventListener('click', () => toggleMic('tt'));
    dom.btnNextTwister?.addEventListener('click', nextTwister);
    dom.btnEndTTSession?.addEventListener('click', () => {
      stopListening('tt');
      clearSessionTimer('tt');
      showTTResults(speech.getStats());
    });
    dom.btnDownloadTT?.addEventListener('click', () => {
      recorder.download(`sft_twister_${state.tt.category}`);
    });
    dom.btnPlaybackTT?.addEventListener('click', () => {
      dom.audioPlaybackTT?.play();
    });

    // Para Setup
    dom.paraDiffBtns?.forEach(btn => btn.addEventListener('click', () => {
      state.para.difficulty = btn.dataset.diff;
      state.para.customText = null;
      if (dom.paraUseCustom) dom.paraUseCustom.classList.add('hidden');
      dom.paraDiffBtns.forEach(b => b.classList.toggle('selected', b === btn));
    }));
    dom.paraSpeedBtns?.forEach(btn => btn.addEventListener('click', () => {
      state.para.speed = btn.dataset.speed;
      dom.paraSpeedBtns.forEach(b => b.classList.toggle('selected', b === btn));
    }));
    $('btn-back-para-setup')?.addEventListener('click', () => showPage('home'));
    dom.btnStartParaSession?.addEventListener('click', startParaSession);

    // Para file upload
    dom.paraUploadInput?.addEventListener('change', (e) => {
      if (e.target.files[0]) handleFileUpload(e.target.files[0]);
    });
    dom.paraUploadZone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      dom.paraUploadZone.classList.add('drag-over');
    });
    dom.paraUploadZone?.addEventListener('dragleave', () => {
      dom.paraUploadZone.classList.remove('drag-over');
    });
    dom.paraUploadZone?.addEventListener('drop', (e) => {
      e.preventDefault();
      dom.paraUploadZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    });

    // Para Session
    dom.micBtnPara?.addEventListener('click', () => toggleMic('para'));
    dom.btnEndParaSession?.addEventListener('click', showParaResults);
    dom.btnDownloadPara?.addEventListener('click', () => {
      recorder.download(`sft_paragraph_${state.para.difficulty}`);
    });
    dom.btnPlaybackPara?.addEventListener('click', () => {
      dom.audioPlaybackPara?.play();
    });

    // Pacer speed override in paragraph session
    dom.paraPacerBtns?.forEach(btn => btn.addEventListener('click', () => {
      state.para.speed = btn.dataset.speed;
      dom.paraPacerBtns.forEach(b => b.classList.toggle('selected', b === btn));
      const target = WPM_TARGETS[state.para.speed];
      dom.paraSpeedLabel.textContent = `${capitalize(state.para.speed)} · Target ${target} WPM`;
      if (speech.isListening()) { stopPacer(); startPacer(); }
      toast(`Speed changed to ${capitalize(state.para.speed)} (${target} WPM)`, 'info', 2000);
    }));

    // Results
    dom.btnRetry?.addEventListener('click', () => {
      if (lastResultData?.module === 'tongue_twister') {
        startTTSession();
      } else {
        startParaSession();
      }
    });
    dom.btnNewSession?.addEventListener('click', () => showPage('home'));
    dom.btnGoHome?.addEventListener('click', () => showPage('home'));
    dom.btnSaveScore?.addEventListener('click', saveScore);
    dom.btnDownloadResult?.addEventListener('click', () => {
      recorder.download('sft_session_recording');
    });

    // Username modal
    dom.btnSaveUsername?.addEventListener('click', saveUsername);
    dom.btnCancelUsername?.addEventListener('click', closeUsernameModal);
    dom.usernameInput?.addEventListener('keydown', e => { if (e.key === 'Enter') saveUsername(); });
    dom.usernameModal?.addEventListener('click', e => {
      if (e.target === dom.usernameModal) closeUsernameModal();
    });

    // Leaderboard back
    $('btn-back-lb')?.addEventListener('click', () => showPage('home'));
  }

  // ── Speech API Check ──────────────────────────────────
  function checkSpeechSupport() {
    if (!speech.isSupported()) {
      toast('⚠️ Web Speech API not supported. Use Chrome or Edge for speech recognition.', 'error', 8000);
    }
  }

  // ── Init ──────────────────────────────────────────────

  function init() {
    cacheDom();
    bindEvents();
    initHome();
    checkSpeechSupport();
    showPage('home');
    console.log('🎤 Speech Fluency Trainer initialized');
  }

  // Boot when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
