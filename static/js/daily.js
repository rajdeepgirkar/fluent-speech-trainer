/*
 * daily.js — Daily Challenge page controller.
*/
(function () {
  'use strict';

  const speech   = window.SFT.speech;
  const recorder = window.SFT.recorder;

  const WPM_TARGETS = { slow: 50, medium: 100, fast: 150 };
  const SPEED = 'medium';

  let challengeData = null;
  let currentMode   = null; // 'tt' | 'para'
  let ctrl          = null;
  let pacerTimer    = null;

  async function init() {
    const data = await SFT.api('/daily-challenge');
    if (!data) {
      document.getElementById('challenge-loading').innerHTML =
        '<div class="empty-icon">⚠️</div><p>Could not load challenge. Is the backend running?</p>';
      return;
    }

    challengeData = data;
    document.getElementById('challenge-date-display').textContent =
      `${data.day_of_week}, ${data.display_date}`;
    document.getElementById('challenge-loading').style.display = 'none';
    document.getElementById('challenge-content').style.display = 'block';

    // Fill cards
    document.getElementById('tt-challenge-text').textContent   = data.tongue_twister.text;
    document.getElementById('para-challenge-text').textContent = data.paragraph.text;

    // Streak
    const username = localStorage.getItem('sft_username');
    if (username) {
      const dashData = await SFT.api(`/dashboard?username=${encodeURIComponent(username)}`);
      if (dashData && dashData.streak > 0) {
        const sc = document.getElementById('streak-display');
        document.getElementById('streak-count').textContent = dashData.streak;
        if (sc) sc.style.display = 'flex';
      }
    }
  }

  document.getElementById('btn-start-tt-challenge')?.addEventListener('click', () => {
    if (!challengeData) return;
    startPractice('tt', challengeData.tongue_twister.text);
  });

  document.getElementById('btn-start-para-challenge')?.addEventListener('click', () => {
    if (!challengeData) return;
    startPractice('para', challengeData.paragraph.text);
  });

  function startPractice(mode, text) {
    currentMode = mode;
    const practiceEl = document.getElementById('inline-practice');
    if (practiceEl) practiceEl.classList.remove('hidden');
    document.getElementById('dc-inline-results')?.classList.add('hidden');

    const typeLabel = document.getElementById('dc-type-label');
    if (typeLabel) typeLabel.textContent = mode === 'tt' ? 'Tongue Twister' : 'Paragraph';

    speech.buildWordSpans(document.getElementById('dc-reading-text'), text);
    speech.resetHighlights();

    document.getElementById('dc-correct-count').textContent   = '0';
    document.getElementById('dc-incorrect-count').textContent = '0';
    document.getElementById('dc-wpm-chip').textContent        = '— WPM';
    document.getElementById('dc-speed-label').textContent     = 'Medium · 100 WPM';

    const transcript = document.getElementById('dc-transcript');
    transcript.textContent = 'Enable microphone and start reading…';
    transcript.classList.remove('active');

    document.getElementById('btn-download-dc').classList.add('hidden');

    if (ctrl) ctrl.stopListening();
    stopPacer();

    ctrl = SFT.makeSessionController({
      micBtn:       document.getElementById('mic-btn-dc'),
      recIndicator: document.getElementById('rec-indicator-dc'),
      transcriptEl: document.getElementById('dc-transcript'),
      correctEl:    document.getElementById('dc-correct-count'),
      incorrectEl:  document.getElementById('dc-incorrect-count'),
      wpmChip:      document.getElementById('dc-wpm-chip'),
      timerChip:    document.getElementById('dc-timer-chip'),
      downloadBtn:  document.getElementById('btn-download-dc'),
      audioEl:      document.getElementById('audio-playback-dc'),
    });

    document.getElementById('mic-btn-dc').onclick = async () => {
      if (speech.isListening()) { ctrl.stopListening(); stopPacer(); }
      else {
        const ok = await ctrl.startListening();
        if (ok && mode === 'para') startPacer();
      }
    };

    ctrl.timer.start();
    practiceEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function startPacer() {
    stopPacer();
    const total = speech.getWordSpans().length;
    const msPerWord = (60 / WPM_TARGETS[SPEED]) * 1000;
    let idx = 0;
    pacerTimer = setInterval(() => {
      if (idx >= total) { stopPacer(); return; }
      speech.setPacerPosition(idx++);
    }, msPerWord);
  }

  function stopPacer() {
    if (pacerTimer) { clearInterval(pacerTimer); pacerTimer = null; }
  }

  document.getElementById('btn-dc-finish')?.addEventListener('click', finishPractice);

  document.getElementById('btn-dc-exit')?.addEventListener('click', () => {
    ctrl && ctrl.stopListening();
    ctrl && ctrl.timer.stop();
    stopPacer();
    document.getElementById('inline-practice')?.classList.add('hidden');
  });

  function finishPractice() {
    ctrl && ctrl.stopListening();
    ctrl && ctrl.timer.stop();
    stopPacer();

    const stats    = speech.getStats();
    const feedback = speech.getSpeedFeedback(stats.wpm, WPM_TARGETS[SPEED]);

    document.getElementById('dc-res-accuracy').textContent = stats.accuracy + '%';
    document.getElementById('dc-res-wpm').textContent      = stats.wpm > 0 ? stats.wpm : '—';
    const fbEl = document.getElementById('dc-res-feedback');
    fbEl.textContent = feedback;
    fbEl.style.color = feedback === 'Optimal' ? 'var(--mint)' : feedback === 'Too Fast' ? 'var(--coral)' : 'var(--blue-accent)';

    // Update card status
    const statusEl = document.getElementById(currentMode === 'tt' ? 'tt-challenge-status' : 'para-challenge-status');
    if (statusEl) {
      const acc = stats.accuracy;
      const col = acc >= 80 ? 'tag-mint' : acc >= 60 ? 'tag-gold' : 'tag-coral';
      statusEl.innerHTML = `<span class="tag ${col}">${acc}% accuracy</span>`;
    }

    document.getElementById('dc-inline-results')?.classList.remove('hidden');

    window._dcLastResult = {
      username:      localStorage.getItem('sft_username') || 'Anonymous',
      module:        currentMode === 'tt' ? 'tongue_twister' : 'paragraph',
      accuracy:      stats.accuracy,
      wpm:           stats.wpm,
      speed_setting: SPEED,
      speed_feedback:feedback,
      details:       { source: 'daily_challenge', date: challengeData?.date }
    };
  }

  document.getElementById('btn-dc-save')?.addEventListener('click', function () {
    if (window._dcLastResult) SFT.saveScore(window._dcLastResult, this);
  });

  document.getElementById('btn-dc-try-again')?.addEventListener('click', () => {
    if (currentMode && challengeData) {
      const text = currentMode === 'tt' ? challengeData.tongue_twister.text : challengeData.paragraph.text;
      startPractice(currentMode, text);
    }
  });

  document.getElementById('btn-download-dc')?.addEventListener('click', () => {
    recorder.download('sft_daily_challenge');
  });

  init();

})();
