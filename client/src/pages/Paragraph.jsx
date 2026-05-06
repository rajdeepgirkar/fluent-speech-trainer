import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import useRecorder from '../hooks/useRecorder';
import { normalizeToken, evaluateWords, getSpeedFeedback, getFeedbackText, WPM_TARGETS } from '../utils/speechUtils';

export default function Paragraph() {
  const { user } = useAuth();
  const speech = useSpeechRecognition();
  const recorder = useRecorder();

  // Setup state
  const [difficulty, setDifficulty] = useState('medium');
  const [speedSetting, setSpeedSetting] = useState('medium');
  const [customWpm, setCustomWpm] = useState('');
  const [customText, setCustomText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [phase, setPhase] = useState('setup');

  // Session state
  const [paragraph, setParagraph] = useState(null);
  const [displayText, setDisplayText] = useState('');
  const [expectedWords, setExpectedWords] = useState([]);
  const [wordResults, setWordResults] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [pacerIndex, setPacerIndex] = useState(0);
  const timerRef = useRef(null);
  const pacerRef = useRef(null);

  // Results state
  const [finalAccuracy, setFinalAccuracy] = useState(0);
  const [finalWpm, setFinalWpm] = useState(0);
  const [finalFeedback, setFinalFeedback] = useState('');
  const [scoreSaved, setScoreSaved] = useState(false);

  const targetWpm = customWpm ? parseInt(customWpm) : (WPM_TARGETS[speedSetting] || 100);

  // Evaluate transcript
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
    if (phase === 'session' && speech.isListening) {
      setTimer(0);
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase, speech.isListening]);

  // Pacer
  useEffect(() => {
    if (phase === 'session' && expectedWords.length > 0 && speech.isListening) {
      setPacerIndex(0);
      const msPerWord = 60000 / targetWpm;
      pacerRef.current = setInterval(() => {
        setPacerIndex(prev => {
          if (prev >= expectedWords.length - 1) { clearInterval(pacerRef.current); return prev; }
          return prev + 1;
        });
      }, msPerWord);
    }
    return () => clearInterval(pacerRef.current);
  }, [phase, expectedWords, targetWpm, speech.isListening]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      let content = ev.target.result.replace(/\b\d+\b/g, '').replace(/ +/g, ' ').trim();
      setCustomText(content);
      setUseCustom(true);
    };
    reader.readAsText(file);
  };

  const handleUseTyped = () => {
    if (!typedText.trim()) return;
    setCustomText(typedText.trim());
    setUseCustom(true);
  };

  const handleStart = async () => {
    let text = '';
    let paraData = null;

    if (useCustom && customText) {
      text = customText;
    } else {
      try {
        const { data } = await API.get(`/api/paragraphs/random?difficulty=${difficulty}`);
        paraData = data;
        text = data.text;
      } catch {
        alert('Failed to load paragraph. Is the backend running?');
        return;
      }
    }

    const words = text.split(/\s+/).map(w => normalizeToken(w)).filter(Boolean);
    setParagraph(paraData);
    setDisplayText(text);
    setExpectedWords(words);
    setWordResults(words.map(() => 'pending'));
    setCorrectCount(0);
    setIncorrectCount(0);
    setPacerIndex(0);
    speech.reset();
    setPhase('session');
  };

  const finishSession = () => {
    speech.stop();
    recorder.stopRecording();
    clearInterval(timerRef.current);
    clearInterval(pacerRef.current);

    const wpm = speech.getWPM();
    const acc = expectedWords.length ? Math.round((correctCount / expectedWords.length) * 100) : 0;
    const feedback = getSpeedFeedback(wpm, targetWpm);

    setFinalAccuracy(acc);
    setFinalWpm(wpm);
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
      if (!ok) { alert('Microphone denied.'); return; }
      speech.start();
      recorder.startRecording();
    }
  };

  const handleSaveScore = async () => {
    if (!user) { alert('Please log in to save scores.'); return; }
    try {
      await API.post('/api/score', {
        module: 'paragraph',
        accuracy: finalAccuracy,
        wpm: finalWpm,
        speedSetting: customWpm ? `custom-${customWpm}` : speedSetting,
        speedFeedback: finalFeedback,
        details: { difficulty, title: paragraph?.title || 'Custom Text', wordCount: expectedWords.length },
      });
      setScoreSaved(true);
    } catch {
      alert('Failed to save score.');
    }
  };

  const handleRetry = () => {
    setPacerIndex(0);
    setPhase('setup');
    recorder.reset();
    speech.reset();
  };

  const handleExit = () => {
    speech.stop();
    recorder.stopRecording();
    clearInterval(timerRef.current);
    clearInterval(pacerRef.current);
    setPacerIndex(0);
    setPhase('setup');
    recorder.reset();
    speech.reset();
  };

  const changePace = (newSpeed) => {
    setSpeedSetting(newSpeed);
    setCustomWpm('');
    clearInterval(pacerRef.current);
    const newTarget = WPM_TARGETS[newSpeed] || 100;
    const msPerWord = 60000 / newTarget;
    pacerRef.current = setInterval(() => {
      setPacerIndex(prev => {
        if (prev >= expectedWords.length - 1) { clearInterval(pacerRef.current); return prev; }
        return prev + 1;
      });
    }, msPerWord);
  };

  const circumference = 2 * Math.PI * 80;
  const ringOffset = circumference - (finalAccuracy / 100) * circumference;
  const ringColor = finalAccuracy >= 85 ? 'var(--mint)' : finalAccuracy >= 65 ? 'var(--gold)' : 'var(--coral)';

  // ─── SETUP ───
  if (phase === 'setup') {
    return (
      <div className="activity-page">
        <section className="activity-section">
          <div className="page-header">
            <div className="page-header-icon">📖</div>
            <div><h1 className="page-title">Paragraph Reading</h1><p className="page-subtitle">Read full paragraphs with WPM pacing and real-time word feedback</p></div>
          </div>

          <div className="setup-row">
            <div className="setup-col">
              <div className="setup-section-label">Difficulty</div>
              <div className="option-group">
                {[['easy', '🟢 Easy'], ['medium', '🟡 Medium'], ['hard', '🔴 Hard']].map(([val, label]) => (
                  <button key={val} className={`option-pill ${difficulty === val && !useCustom ? 'selected' : ''}`} onClick={() => { setDifficulty(val); setUseCustom(false); }}>{label}</button>
                ))}
              </div>
            </div>
            <div className="setup-col">
              <div className="setup-section-label">Reading Speed</div>
              <div className="option-group">
                {[['slow', '🐢 Slow (50 WPM)'], ['medium', '🚶 Medium (100 WPM)'], ['fast', '🚀 Fast (150 WPM)']].map(([val, label]) => (
                  <button key={val} className={`option-pill ${speedSetting === val && !customWpm ? 'selected' : ''}`} onClick={() => { setSpeedSetting(val); setCustomWpm(''); }}>{label}</button>
                ))}
              </div>
              <div className="custom-wpm-row">
                <label htmlFor="para-custom-wpm">Custom WPM:</label>
                <input id="para-custom-wpm" type="number" min="20" max="300" placeholder="e.g. 120" value={customWpm} onChange={(e) => setCustomWpm(e.target.value)} className="custom-wpm-input" />
                {customWpm && <span className="tag tag-gold">Custom: {customWpm} WPM</span>}
              </div>
            </div>
          </div>

          <div className="custom-text-header">
            <div className="setup-section-label">Custom Text <span className="optional-badge">Optional</span></div>
            <p className="custom-text-note">Use your own text instead of the built-in paragraphs.</p>
          </div>

          <div className="custom-text-split">
            <div className="custom-text-panel upload-panel">
              <div className="panel-label">📄 Upload a .txt File</div>
              <div className="upload-zone">
                <input type="file" accept=".txt" onChange={handleFileUpload} className="upload-input" />
                <div className="upload-icon">📂</div>
                <div className="upload-text"><strong>Click or drag & drop</strong><br /><span>.txt files only</span></div>
              </div>
              {useCustom && customText && (
                <div className="file-loaded-card">
                  <span className="tag tag-mint">✓ Custom text active ({customText.split(/\s+/).length} words)</span>
                  <button className="btn btn-sm btn-secondary" onClick={() => { setUseCustom(false); setCustomText(''); }}>✕ Remove</button>
                </div>
              )}
            </div>

            <div className="custom-text-panel type-panel">
              <div className="panel-label">⌨️ Type or Paste Text</div>
              <textarea className="type-textarea" value={typedText} onChange={(e) => setTypedText(e.target.value)} placeholder="Type or paste the text you want to practise reading aloud…" rows="6" />
              <div className="type-footer">
                <span className="type-count">{typedText.split(/\s+/).filter(Boolean).length} words</span>
                <button className="btn btn-secondary btn-sm" onClick={() => setTypedText('')}>Clear</button>
                <button className="btn btn-primary btn-sm" onClick={handleUseTyped}>✓ Use This Text</button>
              </div>
            </div>
          </div>

          <button className="btn btn-primary btn-lg btn-full" onClick={handleStart} style={{ marginTop: 24 }}>📖 Start Reading</button>
        </section>
      </div>
    );
  }

  // ─── SESSION ───
  if (phase === 'session') {
    const wordsArr = displayText.split(/\s+/);
    const progressPct = expectedWords.length ? Math.round(((correctCount + incorrectCount) / expectedWords.length) * 100) : 0;
    const liveWpm = speech.getWPM();

    return (
      <div className="activity-page">
        <section className="activity-section">
          <div className="session-topbar">
            <div className="session-progress-wrap">
              <div className="session-progress-label">
                <span>{correctCount + incorrectCount} / {expectedWords.length} words</span>
                <span>{customWpm ? `Custom · ${customWpm} WPM` : `${speedSetting} · ${targetWpm} WPM`}</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${progressPct}%` }} /></div>
            </div>
            <div className="session-stats">
              <div className="stat-chip">⏱ {formatTime(timer)}</div>
              <div className="stat-chip active">{liveWpm > 0 ? `${liveWpm} WPM` : '— WPM'}</div>
              <button className="btn btn-secondary btn-sm" onClick={handleExit}>✕ Exit</button>
            </div>
          </div>

          <div className="pacer-controls">
            <span className="pacer-label">Pace:</span>
            {[['slow', '🐢 50'], ['medium', '🚶 100'], ['fast', '🚀 150']].map(([val, label]) => (
              <button key={val} className={`option-pill pacer-btn ${speedSetting === val && !customWpm ? 'selected' : ''}`} onClick={() => changePace(val)}>{label} WPM</button>
            ))}
            <span className="pacer-legend">💙 pacer &nbsp; 🟢 correct &nbsp; 🔴 incorrect</span>
          </div>

          <div className="text-display-card scrollable-text-card">
            <div className="text-meta">
              <div className="text-meta-left">
                <span className="text-badge para-badge">📖 Paragraph</span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{paragraph?.title || 'Custom Text'}</span>
              </div>
            </div>
            <div className="reading-text">
              {wordsArr.map((word, i) => {
                const status = wordResults[i] || 'pending';
                const isCurrent = i === pacerIndex && status === 'pending';
                const isPaced = i < pacerIndex && status === 'pending';
                return <span key={i} className={`word ${status !== 'pending' ? status : ''} ${isCurrent ? 'current' : ''} ${isPaced ? 'pacer' : ''}`.trim()}>{word} </span>;
              })}
            </div>
          </div>

          <div className="word-score-bar">
            <div className="word-score-item"><span className="dot dot-correct" />Correct: <strong>{correctCount}</strong></div>
            <div className="word-score-item"><span className="dot dot-incorrect" />Incorrect: <strong>{incorrectCount}</strong></div>
          </div>

          <div className="transcript-display">
            {speech.transcript.final || speech.transcript.interim || 'Enable microphone and start reading the paragraph aloud…'}
          </div>

          <div className="controls-area">
            <div className="controls-left">
              <button className={`mic-btn ${speech.isListening ? 'listening' : ''}`} onClick={handleMicToggle}>
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
              <button className="btn btn-primary" onClick={finishSession}>✓ Finish &amp; Score</button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ─── RESULTS ───
  return (
    <div className="activity-page">
      <section className="activity-section">
        <div className="results-container">
          <div className="results-trophy">{finalAccuracy >= 85 ? '🏆' : finalAccuracy >= 65 ? '🥈' : '💪'}</div>
          <div className="results-title">Reading Complete!</div>
          <div className="results-subtitle">{paragraph?.title || 'Custom Text'} — {expectedWords.length} words</div>

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
