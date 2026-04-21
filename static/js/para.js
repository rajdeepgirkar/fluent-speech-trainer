/*
 * para.js — Paragraph Reading page controller.
 * Handles setup (file upload + typed text), session, and results.
*/
(function () {
  'use strict';

  const speech   = window.SFT.speech;
  const recorder = window.SFT.recorder;

  const WPM_TARGETS = { slow: 50, medium: 100, fast: 150 };

  // ── State ─────────────────────────────────────────────
  const st = {
    difficulty:  'medium',
    speed:       'medium',
    customText:  null,    // null → use API
    uploadedText: null,   // content from uploaded file
    uploadActive: true,   // toggle for uploaded file
    typedText:   null,    // content from textarea
    typedActive: false,
    uploadFilename: '',
    title:       '',
  };

  let ctrl      = null;
  let pacerTimer = null;
  let pacerIndex = 0;

  // ── Sections ──────────────────────────────────────────
  const setupEl   = document.getElementById('para-setup');
  const sessionEl = document.getElementById('para-session');
  const resultsEl = document.getElementById('para-results');

  function showSection(which) {
    [setupEl, sessionEl, resultsEl].forEach(el => {
      if (el) el.classList.toggle('hidden', el !== which);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Setup events ──────────────────────────────────────

  // Difficulty pills
  document.querySelectorAll('.para-diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      st.difficulty = btn.dataset.diff;
      document.querySelectorAll('.para-diff-btn').forEach(b => b.classList.toggle('selected', b === btn));
    });
  });

  // Speed pills
  document.querySelectorAll('.para-speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      st.speed = btn.dataset.speed;
      document.querySelectorAll('.para-speed-btn').forEach(b => b.classList.toggle('selected', b === btn));
    });
  });

  // ── File Upload ───────────────────────────────────────
  const uploadInput    = document.getElementById('para-upload-input');
  const uploadZone     = document.getElementById('para-upload-zone');
  const fileLoadedCard = document.getElementById('file-loaded-card');
  const fileNameEl     = document.getElementById('file-name-display');
  const fileMetaEl     = document.getElementById('file-meta-display');
  const btnToggleFile  = document.getElementById('btn-toggle-file');
  const btnRemoveFile  = document.getElementById('btn-remove-file');

  uploadInput?.addEventListener('change', e => {
    if (e.target.files[0]) handleFileUpload(e.target.files[0]);
  });

  uploadZone?.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
  uploadZone?.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
  uploadZone?.addEventListener('drop', e => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) handleFileUpload(e.dataTransfer.files[0]);
  });

  async function handleFileUpload(file) {
    if (!file.name.endsWith('.txt')) {
      SFT.toast('Only .txt files are supported.', 'error');
      return;
    }

    // Send to backend (strips standalone numbers)
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload-text', { method: 'POST', body: formData });
    const data = await res.json();

    if (!data.success) {
      SFT.toast(data.error || 'Upload failed.', 'error');
      return;
    }

    st.uploadedText  = data.content;
    st.uploadActive  = true;
    st.uploadFilename = file.name;
    st.typedActive   = false;   // deactivate typed text

    // Update UI
    if (fileNameEl) fileNameEl.textContent = file.name;
    if (fileMetaEl) {
      const removed = data.original_word_count - data.word_count;
      fileMetaEl.textContent = `${data.word_count} words` +
        (removed > 0 ? ` · ${removed} number(s) removed` : '');
    }
    if (fileLoadedCard) fileLoadedCard.classList.remove('hidden');
    if (uploadZone)     uploadZone.style.display = 'none';
    if (btnToggleFile)  { btnToggleFile.textContent = '✓ Active'; btnToggleFile.classList.remove('inactive'); }
    clearTypedActive();
    updateActiveTextBanner();
    SFT.toast(`"${file.name}" loaded & numbers cleaned!`, 'success');
  }

  // Toggle file active/inactive
  btnToggleFile?.addEventListener('click', () => {
    if (!st.uploadedText) return;
    st.uploadActive = !st.uploadActive;
    btnToggleFile.textContent = st.uploadActive ? '✓ Active' : '○ Inactive';
    btnToggleFile.classList.toggle('inactive', !st.uploadActive);
    if (st.uploadActive) { st.typedActive = false; clearTypedActive(); }
    updateActiveTextBanner();
    SFT.toast(st.uploadActive ? 'File text activated.' : 'File text deactivated.', 'info', 2000);
  });

  // Remove file
  btnRemoveFile?.addEventListener('click', () => {
    st.uploadedText  = null;
    st.uploadFilename = '';
    st.uploadActive  = false;
    if (fileLoadedCard) fileLoadedCard.classList.add('hidden');
    if (uploadZone) { uploadZone.style.display = ''; if (uploadInput) uploadInput.value = ''; }
    updateActiveTextBanner();
    SFT.toast('File removed.', 'info', 2000);
  });

  // ── Typed Text ────────────────────────────────────────
  const typeInput      = document.getElementById('para-type-input');
  const typeWordCount  = document.getElementById('type-word-count');
  const btnUseTyped    = document.getElementById('btn-use-typed');
  const btnClearTyped  = document.getElementById('btn-clear-typed');
  const typedStatus    = document.getElementById('typed-status');
  const btnDeactivateTyped = document.getElementById('btn-deactivate-typed');

  typeInput?.addEventListener('input', () => {
    const words = typeInput.value.trim().split(/\s+/).filter(Boolean).length;
    if (typeWordCount) typeWordCount.textContent = words + ' word' + (words !== 1 ? 's' : '');
  });

  btnClearTyped?.addEventListener('click', () => {
    if (typeInput) typeInput.value = '';
    if (typeWordCount) typeWordCount.textContent = '0 words';
    clearTypedActive();
    updateActiveTextBanner();
  });

  btnUseTyped?.addEventListener('click', () => {
    const text = typeInput?.value.trim();
    if (!text || text.length < 10) {
      SFT.toast('Please type at least a few words.', 'warning');
      return;
    }
    st.typedText   = text;
    st.typedActive = true;
    st.uploadActive = false; // deactivate file
    if (btnToggleFile) { btnToggleFile.textContent = '○ Inactive'; btnToggleFile.classList.add('inactive'); }
    if (typedStatus) typedStatus.classList.remove('hidden');
    updateActiveTextBanner();
    SFT.toast('Typed text activated!', 'success', 2000);
  });

  btnDeactivateTyped?.addEventListener('click', clearTypedActive);

  function clearTypedActive() {
    st.typedActive = false;
    if (typedStatus) typedStatus.classList.add('hidden');
    updateActiveTextBanner();
  }

  function updateActiveTextBanner() {
    const banner    = document.getElementById('active-text-banner');
    const labelEl   = document.getElementById('active-text-label');
    const wordsEl   = document.getElementById('active-text-words');

    if (!banner) return;
    const active = resolveCustomText();
    if (active) {
      banner.classList.remove('hidden');
      const words = active.text.split(/\s+/).length;
      if (labelEl) labelEl.textContent = active.source + ' active';
      if (wordsEl) wordsEl.textContent = `${words} words`;
    } else {
      banner.classList.add('hidden');
    }
  }

  document.getElementById('btn-clear-custom')?.addEventListener('click', () => {
    st.uploadActive = false;
    clearTypedActive();
    if (btnToggleFile) { btnToggleFile.textContent = '○ Inactive'; btnToggleFile.classList.add('inactive'); }
    updateActiveTextBanner();
    SFT.toast('Using built-in paragraph.', 'info', 2000);
  });

  /** Returns { text, source } or null. */
  function resolveCustomText() {
    if (st.uploadActive && st.uploadedText) return { text: st.uploadedText, source: 'File' };
    if (st.typedActive  && st.typedText)   return { text: st.typedText,    source: 'Typed text' };
    return null;
  }

  // ── Start Session ─────────────────────────────────────
  document.getElementById('btn-start-para')?.addEventListener('click', startSession);

  async function startSession() {
    let text, title;
    const custom = resolveCustomText();

    if (custom) {
      text  = custom.text;
      title = custom.source === 'File' ? st.uploadFilename : 'Custom Text';
    } else {
      const data = await SFT.api(`/paragraphs/random?difficulty=${st.difficulty}`);
      if (!data || !data.text) {
        SFT.toast('Could not load paragraph. Check backend.', 'error');
        return;
      }
      text  = data.text;
      title = data.title || 'Paragraph';
    }

    st.title = title;
    showSection(sessionEl);
    loadParagraph(text, title);
  }

  function loadParagraph(text, title) {
    const readingEl = document.getElementById('para-reading-text');
    const titleEl   = document.getElementById('para-title-display');

    if (titleEl) titleEl.textContent = title;

    speech.buildWordSpans(readingEl, text);
    speech.resetHighlights();

    const totalWords = speech.getCurrentWords().length;
    document.getElementById('para-progress-fill').style.width = '0%';
    document.getElementById('para-progress-label').textContent = `0 / ${totalWords} words`;
    document.getElementById('para-correct-count').textContent   = '0';
    document.getElementById('para-incorrect-count').textContent = '0';
    document.getElementById('para-wpm-chip').textContent        = '— WPM';

    const target = WPM_TARGETS[st.speed];
    document.getElementById('para-speed-label').textContent = `${capitalize(st.speed)} · ${target} WPM`;

    const transcript = document.getElementById('para-transcript');
    transcript.textContent = 'Enable microphone and start reading the paragraph aloud…';
    transcript.classList.remove('active');

    document.getElementById('btn-download-para').classList.add('hidden');
    document.getElementById('btn-playback-para').classList.add('hidden');

    // Stop previous
    if (ctrl) ctrl.stopListening();
    stopPacer();

    ctrl = SFT.makeSessionController({
      micBtn:       document.getElementById('mic-btn-para'),
      recIndicator: document.getElementById('rec-indicator-para'),
      transcriptEl: document.getElementById('para-transcript'),
      correctEl:    document.getElementById('para-correct-count'),
      incorrectEl:  document.getElementById('para-incorrect-count'),
      wpmChip:      document.getElementById('para-wpm-chip'),
      timerChip:    document.getElementById('para-timer-chip'),
      downloadBtn:  document.getElementById('btn-download-para'),
      playbackBtn:  document.getElementById('btn-playback-para'),
      audioEl:      document.getElementById('audio-playback-para'),
      onProgress: (stats) => {
        const pct = Math.min(Math.round((stats.wordsSpoken / totalWords) * 100), 100);
        document.getElementById('para-progress-fill').style.width = pct + '%';
        document.getElementById('para-progress-label').textContent = `${stats.wordsSpoken} / ${totalWords} words`;
      }
    });

    // Patch mic button click to also start/stop pacer
    const micBtn = document.getElementById('mic-btn-para');
    micBtn.onclick = async () => {
      if (speech.isListening()) {
        ctrl.stopListening();
        stopPacer();
      } else {
        const ok = await ctrl.startListening();
        if (ok) startPacer();
      }
    };

    ctrl.timer.start();

    // Sync pacer buttons to current speed
    document.querySelectorAll('.pacer-btn').forEach(b => {
      b.classList.toggle('selected', b.dataset.speed === st.speed);
    });
  }

  // ── Pacer ─────────────────────────────────────────────
  function startPacer() {
    stopPacer();
    const total    = speech.getWordSpans().length;
    const msPerWord = (60 / WPM_TARGETS[st.speed]) * 1000;
    pacerIndex = 0;
    pacerTimer = setInterval(() => {
      if (pacerIndex >= total) { stopPacer(); return; }
      speech.setPacerPosition(pacerIndex++);
    }, msPerWord);
  }

  function stopPacer() {
    if (pacerTimer) { clearInterval(pacerTimer); pacerTimer = null; }
  }

  // Live speed change
  document.querySelectorAll('.pacer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      st.speed = btn.dataset.speed;
      document.querySelectorAll('.pacer-btn').forEach(b => b.classList.toggle('selected', b === btn));
      const target = WPM_TARGETS[st.speed];
      document.getElementById('para-speed-label').textContent = `${capitalize(st.speed)} · ${target} WPM`;
      if (speech.isListening()) { stopPacer(); startPacer(); }
      SFT.toast(`Speed: ${capitalize(st.speed)} (${target} WPM)`, 'info', 2000);
    });
  });

  document.getElementById('btn-end-para-session')?.addEventListener('click', showParaResults);

  document.getElementById('btn-exit-para')?.addEventListener('click', () => {
    if (confirm('Exit session? Progress will be lost.')) {
      ctrl && ctrl.stopListening();
      ctrl && ctrl.timer.stop();
      stopPacer();
      showSection(setupEl);
    }
  });

  document.getElementById('btn-download-para')?.addEventListener('click', () => {
    recorder.download(`sft_para_${st.difficulty}`);
  });
  document.getElementById('btn-playback-para')?.addEventListener('click', () => {
    document.getElementById('audio-playback-para')?.play();
  });

  // ── Results ───────────────────────────────────────────
  function showParaResults() {
    ctrl && ctrl.stopListening();
    ctrl && ctrl.timer.stop();
    stopPacer();

    const stats    = speech.getStats();
    const feedback = speech.getSpeedFeedback(stats.wpm, WPM_TARGETS[st.speed]);

    let trophy = '📣';
    if (stats.accuracy >= 90) trophy = '🏆';
    else if (stats.accuracy >= 75) trophy = '🥈';
    else if (stats.accuracy >= 55) trophy = '🥉';
    document.getElementById('para-trophy').textContent = trophy;

    const titleMap = { '🏆': 'Excellent Reading!', '🥈': 'Great Job!', '🥉': 'Nice Effort!', '📣': 'Keep Practising!' };
    document.getElementById('para-result-title').textContent    = titleMap[trophy];
    document.getElementById('para-result-subtitle').textContent = `"${st.title}"`;

    SFT.animateRing(
      document.getElementById('para-score-ring'),
      document.getElementById('para-score-number'),
      stats.accuracy
    );

    document.getElementById('para-res-accuracy').textContent = stats.accuracy + '%';
    document.getElementById('para-res-wpm').textContent      = stats.wpm > 0 ? stats.wpm : '—';
    const fbEl = document.getElementById('para-res-feedback');
    fbEl.textContent = feedback;
    fbEl.style.color = feedback === 'Optimal' ? 'var(--mint)' : feedback === 'Too Fast' ? 'var(--coral)' : 'var(--blue-accent)';
    document.getElementById('para-feedback-text').textContent = SFT.feedbackText(stats.accuracy, feedback);
    document.getElementById('btn-para-download-result').classList.toggle('hidden', !recorder.hasRecording());

    window._paraLastResult = {
      username:      localStorage.getItem('sft_username') || 'Anonymous',
      module:        'paragraph',
      accuracy:      stats.accuracy,
      wpm:           stats.wpm,
      speed_setting: st.speed,
      speed_feedback:feedback,
      details:       { difficulty: st.difficulty, word_count: speech.getCurrentWords().length }
    };

    showSection(resultsEl);
  }

  document.getElementById('btn-para-save')?.addEventListener('click', function () {
    if (window._paraLastResult) SFT.saveScore(window._paraLastResult, this);
  });

  document.getElementById('btn-para-retry')?.addEventListener('click', () => {
    speech.resetHighlights();
    showSection(setupEl);
  });

  document.getElementById('btn-para-download-result')?.addEventListener('click', () => {
    recorder.download('sft_para_session');
  });

  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

})();
