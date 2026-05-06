import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import useRecorder from '../hooks/useRecorder';
import { normalizeToken, evaluateWords, getSpeedFeedback, getFeedbackText, WPM_TARGETS } from '../utils/speechUtils';

export default function TongueTwister() {
  const { user } = useAuth();
  const speech = useSpeechRecognition();
  const recorder = useRecorder();

  // Setup state
  const [category, setCategory] = useState('communication');
  const [speedSetting, setSpeedSetting] = useState('medium');
  const [customWpm, setCustomWpm] = useState('');
  const [phase, setPhase] = useState('setup'); // setup | session | results

  // Session state
  const [twisters, setTwisters] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expectedWords, setExpectedWords] = useState([]);
  const [wordResults, setWordResults] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [sessionScores, setSessionScores] = useState([]);
  const timerRef = useRef(null);

  // Results state
  const [finalAccuracy, setFinalAccuracy] = useState(0);
  const [finalWpm, setFinalWpm] = useState(0);
  const [finalFeedback, setFinalFeedback] = useState('');
  const [scoreSaved, setScoreSaved] = useState(false);

  const targetWpm = customWpm ? parseInt(customWpm) : (WPM_TARGETS[speedSetting] || 100);

  // Evaluate transcript in real-time
  useEffect(() => {
    if (phase !== 'session' || !speech.transcript) return;
    const fullText = speech.transcript.final + speech.transcript.interim;
    if (!fullText.trim()) return;
    const result = evaluateWords(fullText, expectedWords);
    setWordResults(result.results);
    setCorrectCount(result.correctCount);
    setIncorrectCount(result.incorrectCount);
  }, [speech.transcript, expectedWords, phase]);

  // Timer
  useEffect(() => {
    if (phase === 'session') {
      setTimer(0);
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase, currentIndex]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const loadTwister = useCallback((twisterList, index) => {
    const tw = twisterList[index];
    if (!tw) return;
    const words = tw.text.split(/\s+/).map(w => normalizeToken(w)).filter(Boolean);
    setExpectedWords(words);
    setWordResults(words.map(() => 'pending'));
    setCorrectCount(0);
    setIncorrectCount(0);
  }, []);

  const handleStart = async () => {
    try {
      const { data } = await API.get(`/api/twisters/session?category=${category}&count=5`);
      setTwisters(data.session);
      setCurrentIndex(0);
      setSessionScores([]);
      loadTwister(data.session, 0);
      speech.reset();
      setPhase('session');
    } catch {
      alert('Failed to load tongue twisters. Is the backend running?');
    }
  };

  const handleNext = () => {
    // Save current score
    const wpm = speech.getWPM();
    const acc = expectedWords.length ? Math.round((correctCount / expectedWords.length) * 100) : 0;
    setSessionScores(prev => [...prev, { accuracy: acc, wpm }]);

    // Stop current recognition
    speech.stop();
    recorder.stopRecording();
    speech.reset();

    if (currentIndex + 1 < twisters.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      loadTwister(twisters, nextIdx);
      setTimer(0);
    } else {
      finishSession();
    }
  };

  const finishSession = () => {
    speech.stop();
    recorder.stopRecording();
    clearInterval(timerRef.current);

    // Calculate final scores from all twisters
    const wpm = speech.getWPM();
    const acc = expectedWords.length ? Math.round((correctCount / expectedWords.length) * 100) : 0;
    const allScores = [...sessionScores, { accuracy: acc, wpm }];

    const avgAcc = Math.round(allScores.reduce((s, x) => s + x.accuracy, 0) / allScores.length);
    const avgWpm = Math.round(allScores.reduce((s, x) => s + x.wpm, 0) / allScores.length);
    const feedback = getSpeedFeedback(avgWpm, targetWpm);

    setFinalAccuracy(avgAcc);
    setFinalWpm(avgWpm);
    setFinalFeedback(feedback);
    setScoreSaved(false);
    setPhase('results');
  };

  const handleMicToggle = async () => {
    if (speech.isListening) {
      speech.stop();
      recorder.stopRecording();
    } else {
      const ok = await recorder.init();
      if (!ok) { alert('Microphone denied. Check browser permissions.'); return; }
      speech.start();
      recorder.startRecording();
    }
  };

  const handleSaveScore = async () => {
    if (!user) { alert('Please log in to save scores.'); return; }
    try {
      await API.post('/api/score', {
        module: 'tongue_twister',
        accuracy: finalAccuracy,
        wpm: finalWpm,
        speedSetting: customWpm ? `custom-${customWpm}` : speedSetting,
        speedFeedback: finalFeedback,
        details: { category, twisterCount: twisters.length },
      });
      setScoreSaved(true);
    } catch {
      alert('Failed to save score.');
    }
  };

  const handleRetry = () => {
    setPhase('setup');
    setTwisters([]);
    setCurrentIndex(0);
    recorder.reset();
    speech.reset();
  };

  const handleExit = () => {
    speech.stop();
    recorder.stopRecording();
    clearInterval(timerRef.current);
    setPhase('setup');
    recorder.reset();
    speech.reset();
  };

  // Score ring animation
  const circumference = 2 * Math.PI * 80;
  const ringOffset = circumference - (finalAccuracy / 100) * circumference;
  const ringColor = finalAccuracy >= 85 ? 'var(--mint)' : finalAccuracy >= 65 ? 'var(--gold)' : 'var(--coral)';

  // ─── RENDER ───────────────────────────────────
  if (phase === 'setup') {
    return (
      <div className="activity-page">
        <section className="activity-section">
          <div className="page-header">
            <div className="page-header-icon">👅</div>
            <div><h1 className="page-title">Tongue Twister Practice</h1><p className="page-subtitle">Train clarity and articulation with curated tongue twisters</p></div>
          </div>

          <div className="setup-grid">
            <div className="setup-config">
              <div className="setup-section">
                <div className="setup-section-label">Category</div>
                <div className="option-group">
                  {[['communication', '💬 Communication'], ['technical', '💻 Technical'], ['tricky_fun', '🎪 Tricky & Fun'], ['all', '🌀 All Mixed']].map(([val, label]) => (
                    <button key={val} className={`option-pill ${category === val ? 'selected' : ''}`} onClick={() => setCategory(val)}>{label}</button>
                  ))}
                </div>
              </div>

              <div className="setup-section">
                <div className="setup-section-label">Target Speed</div>
                <div className="speed-cards">
                  {[['slow', '🐢', 'Slow', '50 WPM · Clarity'], ['medium', '🚶', 'Medium', '100 WPM · Natural'], ['fast', '🚀', 'Fast', '150 WPM · Challenge']].map(([val, emoji, name, desc]) => (
                    <div key={val} className={`speed-card ${speedSetting === val && !customWpm ? 'selected' : ''}`} onClick={() => { setSpeedSetting(val); setCustomWpm(''); }}>
                      <div className="speed-emoji">{emoji}</div>
                      <div className="speed-name">{name}</div>
                      <div className="speed-wpm">{desc}</div>
                    </div>
                  ))}
                </div>
                <div className="custom-wpm-row">
                  <label htmlFor="tt-custom-wpm">Custom WPM:</label>
                  <input id="tt-custom-wpm" type="number" min="20" max="300" placeholder="e.g. 120" value={customWpm} onChange={(e) => setCustomWpm(e.target.value)} className="custom-wpm-input" />
                  {customWpm && <span className="tag tag-gold">Custom: {customWpm} WPM</span>}
                </div>
              </div>

              <div className="info-card">
                <p>📋 <strong>Session:</strong> 5 tongue twisters, one at a time.<br />🎤 <strong>Mic:</strong> Enable microphone, then read each twister aloud.<br />🟢 <strong style={{ color: 'var(--mint)' }}>Green</strong> = correct &nbsp; 🔴 <strong style={{ color: 'var(--coral)' }}>Red</strong> = incorrect</p>
              </div>

              <button className="btn btn-primary btn-lg btn-full" onClick={handleStart}>🎤 Start Session</button>
            </div>

            <div className="setup-preview">
              <div className="preview-card">
                <div className="preview-label">Session Preview</div>
                <div className="preview-text">Select a category and click Start to begin your session.</div>
                <div className="preview-meta">
                  <span className="tag tag-mint">{category}</span>
                  <span className="tag tag-blue">{targetWpm} WPM</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (phase === 'session') {
    const tw = twisters[currentIndex];
    const progress = ((currentIndex) / twisters.length) * 100;
    const liveWpm = speech.getWPM();

    return (
      <div className="activity-page">
        <section className="activity-section">
          <div className="session-topbar">
            <div className="session-progress-wrap">
              <div className="session-progress-label">
                <span>{currentIndex + 1} / {twisters.length}</span>
                <span>{customWpm ? `Custom · ${customWpm} WPM` : `${speedSetting} · ${targetWpm} WPM`}</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
            </div>
            <div className="session-stats">
              <div className="stat-chip">⏱ {formatTime(timer)}</div>
              <div className="stat-chip active">{liveWpm > 0 ? `${liveWpm} WPM` : '— WPM'}</div>
              <button className="btn btn-secondary btn-sm" onClick={handleExit}>✕ Exit</button>
            </div>
          </div>

          <div className="text-display-card">
            <div className="text-meta">
              <div className="text-meta-left">
                <span className="text-badge tt-badge">👅 Twister</span>
                <span className="text-counter">{currentIndex + 1} of {twisters.length}</span>
              </div>
              <span className="text-badge" style={{ background: 'var(--blue-glow)', color: 'var(--blue-accent)' }}>{tw?.difficulty}</span>
            </div>
            <div className="reading-text">
              {tw?.text.split(/\s+/).map((word, i) => {
                const status = wordResults[i] || 'pending';
                return <span key={i} className={`word ${status}`}>{word} </span>;
              })}
            </div>
          </div>

          <div className="word-score-bar">
            <div className="word-score-item"><span className="dot dot-correct" />Correct: <strong>{correctCount}</strong></div>
            <div className="word-score-item"><span className="dot dot-incorrect" />Incorrect: <strong>{incorrectCount}</strong></div>
          </div>

          <div className="transcript-display">
            {speech.transcript.final || speech.transcript.interim || 'Enable microphone and start reading aloud…'}
          </div>

          <div className="controls-area">
            <div className="controls-left">
              <button className={`mic-btn ${speech.isListening ? 'listening' : ''}`} onClick={handleMicToggle} title={speech.isListening ? 'Stop' : 'Start microphone'}>
                <span className="mic-icon">{speech.isListening ? '⏹' : '🎤'}</span>
              </button>
              <div className="rec-controls">
                <div className={`rec-indicator ${recorder.isRecording ? 'recording' : ''}`}>
                  <div className="rec-dot" style={{ background: recorder.isRecording ? 'var(--coral)' : '' }} />
                  <span className="rec-label">{recorder.isRecording ? 'REC' : 'OFF'}</span>
                </div>
                {recorder.audioURL && (
                  <>
                    <button className="btn btn-secondary btn-sm" onClick={recorder.downloadRecording}>⬇ Download</button>
                    <audio controls src={recorder.audioURL} style={{ height: 32 }} />
                  </>
                )}
              </div>
            </div>
            <div className="controls-right">
              <button className="btn btn-secondary" onClick={finishSession}>✓ Finish &amp; Score</button>
              {currentIndex + 1 < twisters.length && (
                <button className="btn btn-primary" onClick={handleNext}>Next →</button>
              )}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Results phase
  return (
    <div className="activity-page">
      <section className="activity-section">
        <div className="results-container">
          <div className="results-trophy">{finalAccuracy >= 85 ? '🏆' : finalAccuracy >= 65 ? '🥈' : '💪'}</div>
          <div className="results-title">Session Complete!</div>
          <div className="results-subtitle">{twisters.length} tongue twisters completed</div>

          <div className="results-score-ring">
            <svg width="180" height="180" viewBox="0 0 180 180">
              <circle className="score-ring-bg" cx="90" cy="90" r="80" />
              <circle className="score-ring-fill" cx="90" cy="90" r="80"
                style={{ strokeDasharray: circumference, strokeDashoffset: ringOffset, stroke: ringColor }} />
            </svg>
            <div className="score-ring-text">
              <div className="score-ring-number">{finalAccuracy}%</div>
              <div className="score-ring-label">Accuracy</div>
            </div>
          </div>

          <div className="results-metrics">
            <div className="metric-card"><div className="metric-value text-mint">{finalAccuracy}%</div><div className="metric-label">Accuracy</div></div>
            <div className="metric-card"><div className="metric-value">{finalWpm > 0 ? finalWpm : '—'}</div><div className="metric-label">Words/Min</div></div>
            <div className="metric-card"><div className="metric-value">{finalFeedback}</div><div className="metric-label">Speed Rating</div></div>
          </div>

          <div className="feedback-card">
            <div className="feedback-heading">💬 Coach Feedback</div>
            <div className="feedback-text">{getFeedbackText(finalAccuracy, finalFeedback)}</div>
          </div>

          <div className="results-actions">
            <button className="btn btn-primary" onClick={handleRetry}>🔁 Try Again</button>
            {user && !scoreSaved && <button className="btn btn-gold" onClick={handleSaveScore}>🎯 Save Score</button>}
            {scoreSaved && <button className="btn btn-gold" disabled>✓ Saved</button>}
            {recorder.audioURL && <button className="btn btn-secondary" onClick={recorder.downloadRecording}>⬇ Download Recording</button>}
          </div>
        </div>
      </section>
    </div>
  );
}
