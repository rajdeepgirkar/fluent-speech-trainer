/*
  * common.js — Shared utilities for all pages.
  * Username modal, toasts, session timer, API helpers.
*/
(function () {
  'use strict';

  // ── Toast ─────────────────────────────────────────────
  window.SFT = window.SFT || {};
  window.SFT.toast = function (message, type = 'info', duration = 3200) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className   = `toast ${type}`;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 400); }, duration);
  };

  // ── API helpers ───────────────────────────────────────
  window.SFT.api = async function (path, options = {}) {
    try {
      const res  = await fetch('/api' + path, options);
      return await res.json();
    } catch (e) {
      console.error('API error', path, e);
      return null;
    }
  };

  // ── Session Timer ─────────────────────────────────────
  window.SFT.makeTimer = function (chipEl) {
    let interval = null;
    let seconds  = 0;
    return {
      start() {
        seconds = 0;
        clearInterval(interval);
        if (chipEl) chipEl.textContent = '⏱ 0:00';
        interval = setInterval(() => {
          seconds++;
          const m = Math.floor(seconds / 60);
          const s = seconds % 60;
          if (chipEl) chipEl.textContent = `⏱ ${m}:${s.toString().padStart(2,'0')}`;
        }, 1000);
      },
      stop()  { clearInterval(interval); },
      reset() { clearInterval(interval); seconds = 0; }
    };
  };

  // ── Score Ring ────────────────────────────────────────
  window.SFT.animateRing = function (ringEl, numberEl, accuracy) {
    const circumference = 502;
    ringEl.style.strokeDashoffset = circumference;
    numberEl.textContent           = accuracy + '%';
    if      (accuracy >= 85) ringEl.style.stroke = 'var(--mint)';
    else if (accuracy >= 65) ringEl.style.stroke = 'var(--gold)';
    else                     ringEl.style.stroke = 'var(--coral)';
    setTimeout(() => {
      ringEl.style.strokeDashoffset = circumference - (accuracy / 100) * circumference;
    }, 80);
  };

  // ── Feedback text ─────────────────────────────────────
  window.SFT.feedbackText = function (accuracy, speedFeedback) {
    const speedMap = {
      'Optimal':            'Great pace! Your speed matches the target.',
      'Too Fast':           'You spoke too fast. Slow down for better clarity.',
      'Too Slow':           'You spoke slower than the target. Try increasing pace.',
      'No speech detected': 'No speech was detected. Ensure microphone access is granted.'
    };
    const accTip = accuracy >= 85
      ? 'Excellent accuracy — keep it up!'
      : accuracy >= 65
        ? 'Good effort. Practice the mismatched words again.'
        : 'Focus on each word clearly. Retry at a slower speed first.';
    return (speedMap[speedFeedback] || '') + '\n\n' + accTip;
  };

  // ── Save score via API ────────────────────────────────
  window.SFT.saveScore = async function (payload, btnEl) {
    if (btnEl) { btnEl.disabled = true; btnEl.textContent = 'Saving…'; }
    const res = await SFT.api('/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res && res.success) {
      SFT.toast('Score saved to leaderboard! 🎯', 'success');
      if (btnEl) { btnEl.textContent = '✓ Saved'; }
    } else {
      SFT.toast('Could not save score. Is the backend running?', 'error');
      if (btnEl) { btnEl.disabled = false; btnEl.textContent = '🎯 Save Score'; }
    }
    return res;
  };

  // ── Mic + Recording helpers ───────────────────────────
  window.SFT.makeSessionController = function (opts) {
    /**
     * opts: { micBtn, recIndicator, transcriptEl, correctEl, incorrectEl,
     *         wpmChip, timerChip, module, speedSetting, targetWpm,
     *         downloadBtn, playbackBtn, audioEl }
     */
    const speech   = window.SFT.speech;
    const recorder = window.SFT.recorder;
    const timer    = SFT.makeTimer(opts.timerChip);

    function setMicUI(listening) {
      opts.micBtn.classList.toggle('listening', listening);
      const icon = opts.micBtn.querySelector('.mic-icon');
      if (icon) icon.textContent = listening ? '⏹' : '🎤';
    }

    function setRecUI(recording) {
      const ind = opts.recIndicator;
      if (!ind) return;
      ind.classList.toggle('recording', recording);
      ind.querySelector('.rec-dot').style.background = recording ? 'var(--coral)' : '';
      ind.querySelector('.rec-label').textContent    = recording ? 'REC' : 'OFF';
    }

    async function startListening() {
      const ok = await recorder.init();
      if (!ok) { SFT.toast('Microphone denied. Check browser permissions.', 'error'); return false; }

      const started = speech.start();
      if (!started) { SFT.toast('Speech API unavailable. Use Chrome or Edge.', 'error'); return false; }

      setMicUI(true);
      recorder.setCallbacks({
        onStart: () => setRecUI(true),
        onStop:  (data) => {
          setRecUI(false);
          if (opts.audioEl) opts.audioEl.src = data.url;
          if (opts.downloadBtn) opts.downloadBtn.classList.remove('hidden');
          if (opts.playbackBtn) opts.playbackBtn.classList.remove('hidden');
        }
      });
      recorder.start();

      speech.setCallbacks({
        onTranscript: (interim, final, stats) => {
          const combined = (final + interim).slice(-140);
          if (opts.transcriptEl) {
            opts.transcriptEl.textContent = combined;
            opts.transcriptEl.classList.add('active');
          }
          if (opts.correctEl)   opts.correctEl.textContent   = stats.correctCount;
          if (opts.incorrectEl) opts.incorrectEl.textContent = stats.incorrectCount;
          if (opts.wpmChip) {
            const w = speech.getStats().wpm;
            opts.wpmChip.textContent = w > 0 ? w + ' WPM' : '— WPM';
          }
          if (opts.onProgress) opts.onProgress(stats);
        },
        onError: (err) => {
          if (err !== 'no-speech') SFT.toast('Speech error: ' + err, 'error');
        }
      });

      SFT.toast('🎤 Listening… Start reading!', 'success', 2000);
      return true;
    }

    function stopListening() {
      speech.stop();
      recorder.stop();
      setMicUI(false);
    }

    function toggleMic() {
      if (speech.isListening()) stopListening();
      else startListening();
    }

    return { startListening, stopListening, toggleMic, timer, setMicUI, setRecUI };
  };

  // ── Username modal ────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    const chip    = document.getElementById('username-chip');
    const modal   = document.getElementById('username-modal');
    const input   = document.getElementById('username-input');
    const saveBtn = document.getElementById('btn-save-username');
    const cancelBtn = document.getElementById('btn-cancel-username');
    const label   = document.getElementById('username-label');

    const currentName = localStorage.getItem('sft_username') || 'Anonymous';
    if (label) label.textContent = currentName;

    function openModal() {
      if (input)  input.value = localStorage.getItem('sft_username') || '';
      if (modal)  modal.classList.add('open');
      setTimeout(() => input && input.focus(), 200);
    }
    function closeModal() { if (modal) modal.classList.remove('open'); }
    function save() {
      const name = (input.value.trim() || 'Anonymous').slice(0, 30);
      localStorage.setItem('sft_username', name);
      if (label) label.textContent = name;
      closeModal();
      SFT.toast(`Welcome, ${name}! 👋`, 'success');
    }

    chip?.addEventListener('click', openModal);
    saveBtn?.addEventListener('click', save);
    cancelBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    input?.addEventListener('keydown', e => { if (e.key === 'Enter') save(); });

    // Hamburger nav
    const hamburger = document.getElementById('nav-hamburger');
    const navLinks  = document.getElementById('nav-links');
    hamburger?.addEventListener('click', () => navLinks?.classList.toggle('open'));

    // Check speech API
    if (!window.SFT?.speech?.isSupported?.()) {
      SFT.toast('⚠️ Web Speech API not available. Use Chrome or Edge.', 'error', 8000);
    }
  });

})();
