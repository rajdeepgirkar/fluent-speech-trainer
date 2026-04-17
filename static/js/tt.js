/*
 * tt.js — Tongue Twister page controller.
 * Manages setup, session, and results sections.
*/
(function () {
  'use strict';

  const speech   = window.SFT.speech;
  const recorder = window.SFT.recorder;

  const WPM_TARGETS   = { slow: 50, medium: 100, fast: 150 };
  const SESSION_COUNT = 5;

  // ── State ─────────────────────────────────────────────
  const st = {
    category: 'communication',
    speed:    'medium',
    session:  [],
    index:    0,
    scores:   [],   // accuracy per twister
  };

  // ── DOM ───────────────────────────────────────────────
  const setup   = document.getElementById('tt-setup');
  const session = document.getElementById('tt-session');
  const results = document.getElementById('tt-results');

  function showSection(which) {
    [setup, session, results].forEach(el => {
      if (el) el.classList.toggle('hidden', el !== which);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Setup ─────────────────────────────────────────────
  let previewTimeout = null;

  document.querySelectorAll('.tt-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      st.category = btn.dataset.cat;
      document.querySelectorAll('.tt-cat-btn').forEach(b => b.classList.toggle('selected', b === btn));
      schedulePreview();
    });
  });

  document.querySelectorAll('.tt-speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      st.speed = btn.dataset.speed;
      document.querySelectorAll('.tt-speed-btn').forEach(b => b.classList.toggle('selected', b === btn));
    });
  });

  function schedulePreview() {
    clearTimeout(previewTimeout);
    previewTimeout = setTimeout(loadPreview, 300);
  }

  async function loadPreview() {
    const data = await SFT.api(`/tongue-twisters/session?category=${st.category}&count=1`);
    if (data && data.session && data.session.length) {
      const t = data.session[0];
      const el = document.getElementById('tt-preview-text');
      if (el) el.textContent = t.text;
      const catEl = document.getElementById('tt-preview-cat');
      if (catEl) catEl.textContent = st.category === 'all' ? 'Mixed' : st.category.replace('_', ' ');
      const diffEl = document.getElementById('tt-preview-diff');
      if (diffEl) { diffEl.textContent = t.difficulty || ''; }
    }
  }

  loadPreview();

  document.getElementById('btn-start-tt')?.addEventListener('click', startSession);

  // ── Session ───────────────────────────────────────────
  let timer = null;
  let ctrl  = null;

  async function startSession() {
    const data = await SFT.api(`/tongue-twisters/session?category=${st.category}&count=${SESSION_COUNT}`);
    if (!data || !data.session || !data.session.length) {
      SFT.toast('Could not load tongue twisters. Check backend.', 'error');
      return;
    }
    st.session = data.session;
    st.index   = 0;
    st.scores  = [];
    showSection(session);
    loadTwister(0);
  }

  function loadTwister(index) {
    const twister = st.session[index];
    if (!twister) return;

    // Progress
    const pct = (index / st.session.length) * 100;
    document.getElementById('tt-progress-fill').style.width = `${pct}%`;
    document.getElementById('tt-progress-label').textContent = `${index + 1} / ${st.session.length}`;
    document.getElementById('tt-counter').textContent = `${index + 1} of ${st.session.length}`;

    const diffBadge = document.getElementById('tt-diff-badge');
    if (diffBadge) diffBadge.textContent = twister.difficulty || '';

    // Speed label
    const target = WPM_TARGETS[st.speed];
    document.getElementById('tt-speed-label').textContent = `${capitalize(st.speed)} · ${target} WPM`;

    // Build words
    speech.buildWordSpans(document.getElementById('tt-reading-text'), twister.text);
    speech.resetHighlights();

    // Reset counters
    document.getElementById('tt-correct-count').textContent   = '0';
    document.getElementById('tt-incorrect-count').textContent = '0';
    document.getElementById('tt-wpm-chip').textContent        = '— WPM';

    const transcript = document.getElementById('tt-transcript');
    transcript.textContent = 'Enable microphone and start reading aloud…';
    transcript.classList.remove('active');

    // Reset recording UI
    document.getElementById('btn-download-tt').classList.add('hidden');
    document.getElementById('btn-playback-tt').classList.add('hidden');

    // Next button label
    const nextBtn = document.getElementById('btn-next-twister');
    nextBtn.textContent = index < st.session.length - 1 ? 'Next →' : 'Finish Session';

    // Stop previous session controller if any
    if (ctrl) ctrl.stopListening();

    // Build controller
    ctrl = SFT.makeSessionController({
      micBtn:       document.getElementById('mic-btn-tt'),
      recIndicator: document.getElementById('rec-indicator-tt'),
      transcriptEl: document.getElementById('tt-transcript'),
      correctEl:    document.getElementById('tt-correct-count'),
      incorrectEl:  document.getElementById('tt-incorrect-count'),
      wpmChip:      document.getElementById('tt-wpm-chip'),
      timerChip:    document.getElementById('tt-timer-chip'),
      downloadBtn:  document.getElementById('btn-download-tt'),
      playbackBtn:  document.getElementById('btn-playback-tt'),
      audioEl:      document.getElementById('audio-playback-tt'),
    });

    // Re-init mic button
    document.getElementById('mic-btn-tt').onclick = () => ctrl.toggleMic();

    // Start timer
    ctrl.timer.start();
  }

  document.getElementById('btn-next-twister')?.addEventListener('click', () => {
    const stats = speech.getStats();
    st.scores.push(stats.accuracy);
    ctrl && ctrl.stopListening();
    ctrl.timer.stop();

    if (st.index < st.session.length - 1) {
      st.index++;
      loadTwister(st.index);
    } else {
      showTTResults();
    }
  });

  document.getElementById('btn-end-tt-session')?.addEventListener('click', () => {
    if (st.scores.length === 0) {
      const stats = speech.getStats();
      st.scores.push(stats.accuracy);
    }
    ctrl && ctrl.stopListening();
    ctrl && ctrl.timer.stop();
    showTTResults();
  });

  document.getElementById('btn-exit-tt')?.addEventListener('click', () => {
    if (confirm('Exit session? Progress will be lost.')) {
      ctrl && ctrl.stopListening();
      ctrl && ctrl.timer.stop();
      showSection(setup);
    }
  });

  document.getElementById('btn-download-tt')?.addEventListener('click', () => {
    recorder.download(`sft_twister_${st.category}`);
  });
  document.getElementById('btn-playback-tt')?.addEventListener('click', () => {
    document.getElementById('audio-playback-tt')?.play();
  });

  // ── Results ───────────────────────────────────────────
  function showTTResults() {
    const avgAcc = st.scores.length
      ? Math.round(st.scores.reduce((a, b) => a + b, 0) / st.scores.length)
      : 0;
    const wpm      = speech.getStats().wpm;
    const target   = WPM_TARGETS[st.speed];
    const feedback = speech.getSpeedFeedback(wpm, target);

    // Trophy
    let trophy = '📣';
    if (avgAcc >= 90) trophy = '🏆';
    else if (avgAcc >= 75) trophy = '🥈';
    else if (avgAcc >= 55) trophy = '🥉';
    document.getElementById('tt-trophy').textContent = trophy;

    const titleMap = { '🏆': 'Outstanding!', '🥈': 'Great Work!', '🥉': 'Keep Practising!', '📣': 'Keep Going!' };
    document.getElementById('tt-result-title').textContent    = titleMap[trophy];
    document.getElementById('tt-result-subtitle').textContent = `Average across ${st.scores.length} twisters`;

    // Ring
    SFT.animateRing(
      document.getElementById('tt-score-ring'),
      document.getElementById('tt-score-number'),
      avgAcc
    );

    // Metrics
    document.getElementById('tt-res-accuracy').textContent = avgAcc + '%';
    document.getElementById('tt-res-wpm').textContent      = wpm > 0 ? wpm : '—';
    const fbEl = document.getElementById('tt-res-feedback');
    fbEl.textContent  = feedback;
    fbEl.style.color  = feedback === 'Optimal' ? 'var(--mint)' : feedback === 'Too Fast' ? 'var(--coral)' : 'var(--blue-accent)';

    document.getElementById('tt-feedback-text').textContent = SFT.feedbackText(avgAcc, feedback);
    document.getElementById('btn-tt-download-result').classList.toggle('hidden', !recorder.hasRecording());

    // Store for save
    window._ttLastResult = {
      username:      localStorage.getItem('sft_username') || 'Anonymous',
      module:        'tongue_twister',
      accuracy:      avgAcc,
      wpm:           wpm,
      speed_setting: st.speed,
      speed_feedback:feedback,
      details:       { category: st.category, twisters_completed: st.session.length }
    };

    showSection(results);
  }

  document.getElementById('btn-tt-save')?.addEventListener('click', function () {
    if (window._ttLastResult) SFT.saveScore(window._ttLastResult, this);
  });

  document.getElementById('btn-tt-retry')?.addEventListener('click', () => {
    showSection(setup);
    speech.resetHighlights();
  });

  document.getElementById('btn-tt-download-result')?.addEventListener('click', () => {
    recorder.download('sft_tt_session');
  });

  // ── Util ──────────────────────────────────────────────
  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

})();
