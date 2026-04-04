/**
 * Speech Fluency Trainer — recorder.js
 * Audio capture via MediaRecorder API, playback, and download.
 */

window.SFT = window.SFT || {};

window.SFT.recorder = (function () {
  'use strict';

  let mediaRecorder  = null;
  let audioChunks    = [];
  let audioBlob      = null;
  let audioUrl       = null;
  let stream         = null;
  let isRecording    = false;
  let startTime      = null;
  let durationMs     = 0;

  // Callbacks
  let onStart  = null;
  let onStop   = null;
  let onError  = null;

  /**
   * Request microphone access and initialise the recorder.
   * Returns a promise resolving to true on success.
   */
  async function init() {
    if (stream && stream.active) return true;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      return true;
    } catch (err) {
      const msg = err.name === 'NotAllowedError'
        ? 'Microphone permission denied. Please allow microphone access in your browser.'
        : `Could not access microphone: ${err.message}`;
      if (onError) onError(msg);
      return false;
    }
  }

  /**
   * Start recording.
   * Returns false if not initialised.
   */
  function start() {
    if (!stream || !stream.active) return false;

    audioChunks = [];
    audioBlob   = null;
    if (audioUrl) { URL.revokeObjectURL(audioUrl); audioUrl = null; }

    // Prefer webm/opus for best compatibility; fall back gracefully
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : '';

    const options = mimeType ? { mimeType } : {};
    mediaRecorder = new MediaRecorder(stream, options);

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
      audioUrl  = URL.createObjectURL(audioBlob);
      durationMs = startTime ? Date.now() - startTime : 0;
      isRecording = false;
      if (onStop) onStop({ blob: audioBlob, url: audioUrl, durationMs });
    };

    mediaRecorder.onerror = (e) => {
      isRecording = false;
      if (onError) onError(`Recording error: ${e.error}`);
    };

    mediaRecorder.start(250); // collect data every 250ms
    isRecording = true;
    startTime   = Date.now();
    if (onStart) onStart();
    return true;
  }

  /**
   * Stop recording. Fires onStop callback when done.
   */
  function stop() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    isRecording = false;
  }

  /**
   * Release microphone access.
   */
  function release() {
    stop();
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      stream = null;
    }
  }

  /**
   * Download the last recording as a file.
   * @param {string} [filename] Custom filename without extension.
   */
  function download(filename) {
    if (!audioBlob) return;
    const ext  = audioBlob.type.includes('ogg') ? '.ogg' : '.webm';
    const name = (filename || `sft_recording_${Date.now()}`) + ext;
    const a    = document.createElement('a');
    a.href     = audioUrl;
    a.download = name;
    a.click();
  }

  /**
   * Get a Blob URL for playback with an <audio> element.
   */
  function getPlaybackUrl() { return audioUrl; }

  /**
   * Upload the recorded audio to the backend.
   * @returns {Promise<{success, filename}|null>}
   */
  async function uploadToServer() {
    if (!audioBlob) return null;
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      const res  = await fetch('/api/audio', { method: 'POST', body: formData });
      const data = await res.json();
      return data;
    } catch (e) {
      console.warn('Audio upload failed:', e);
      return null;
    }
  }

  /**
   * Format milliseconds as m:ss.
   */
  function formatDuration(ms) {
    const total = Math.floor(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  // ── Public API ────────────────────────────────────────
  return {
    init,
    start,
    stop,
    release,
    download,
    getPlaybackUrl,
    uploadToServer,
    formatDuration,
    isRecording: () => isRecording,
    hasRecording: () => !!audioBlob,
    getDuration: () => durationMs,

    setCallbacks(callbacks) {
      onStart = callbacks.onStart || null;
      onStop  = callbacks.onStop  || null;
      onError = callbacks.onError || null;
    }
  };
})();
