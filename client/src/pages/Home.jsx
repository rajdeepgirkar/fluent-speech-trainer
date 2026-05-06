import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="home-hero">
        <div className="hero-inner">
          <div className="home-badge">🎙 Speech Training</div>
          <h1 className="home-title">
            Master the Art of<br />Fluent Speaking
          </h1>
          <p className="home-subtitle">
            Real-time speech recognition, word-by-word feedback, and performance
            scoring — all running in your browser. No downloads needed.
          </p>
          <div className="hero-cta">
            <Link to="/tongue-twister" className="btn btn-primary btn-lg">👅 Start Tongue Twisters</Link>
            <Link to="/paragraph" className="btn btn-secondary btn-lg">📖 Paragraph Reading</Link>
          </div>
        </div>
        <div className="hero-wave" aria-hidden="true">
          <svg viewBox="0 0 200 60" preserveAspectRatio="none">
            <polyline points="0,30 10,15 20,45 30,10 40,40 50,20 60,35 70,8 80,42 90,18 100,30 110,12 120,48 130,22 140,38 150,14 160,44 170,26 180,36 190,10 200,30" fill="none" stroke="var(--mint)" strokeWidth="2" opacity="0.4" />
            <polyline points="0,30 10,20 20,40 30,15 40,45 50,25 60,38 70,12 80,46 90,22 100,33 110,16 120,44 130,26 140,36 150,18 160,42 170,28 180,34 190,14 200,30" fill="none" stroke="var(--blue-accent)" strokeWidth="1.5" opacity="0.25" />
          </svg>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="stats-strip">
        <div className="stats-inner">
          <div className="stat-item"><div className="stat-value">30+</div><div className="stat-label">Tongue Twisters</div></div>
          <div className="stat-divider" />
          <div className="stat-item"><div className="stat-value">9</div><div className="stat-label">Paragraphs</div></div>
          <div className="stat-divider" />
          <div className="stat-item"><div className="stat-value">3+</div><div className="stat-label">Speed Levels</div></div>
          <div className="stat-divider" />
          <div className="stat-item"><div className="stat-value">Live</div><div className="stat-label">Speech Recognition</div></div>
        </div>
      </section>

      {/* Module Cards */}
      <section className="home-modules-section">
        <div className="section-header">
          <h2 className="section-title">Choose Your Activity</h2>
          <p className="section-sub">Two powerful modules to sharpen your speaking skills</p>
        </div>
        <div className="home-modules">
          <Link to="/tongue-twister" className="module-card tt-card">
            <div className="module-icon">👅</div>
            <div className="module-title">Tongue Twister Practice</div>
            <p className="module-desc">Train clarity and articulation with 5 curated tongue twisters per session. Three categories: communication, technical, and tricky fun.</p>
            <div className="module-tags">
              <span className="tag tag-mint">5 per Session</span>
              <span className="tag tag-blue">Live Highlighting</span>
              <span className="tag tag-mint">Score + Recording</span>
            </div>
            <div className="module-cta">Start Practicing →</div>
          </Link>

          <Link to="/paragraph" className="module-card para-card">
            <div className="module-icon">📖</div>
            <div className="module-title">Paragraph Reading</div>
            <p className="module-desc">Read full paragraphs with WPM pacing. Three difficulty levels plus support for custom text or typed input.</p>
            <div className="module-tags">
              <span className="tag tag-gold">Easy / Medium / Hard</span>
              <span className="tag tag-coral">WPM Pacer</span>
              <span className="tag tag-gold">Custom Text</span>
            </div>
            <div className="module-cta">Start Reading →</div>
          </Link>

          {user ? (
            <Link to="/dashboard" className="module-card dash-card">
              <div className="module-icon">📊</div>
              <div className="module-title">My Dashboard</div>
              <p className="module-desc">Track your progress over time. View accuracy trends, WPM history, streaks, module breakdown, and global rank.</p>
              <div className="module-tags">
                <span className="tag tag-blue">Progress Tracking</span>
                <span className="tag tag-mint">Global Rank</span>
              </div>
              <div className="module-cta">View Dashboard →</div>
            </Link>
          ) : (
            <Link to="/signup" className="module-card dash-card">
              <div className="module-icon">🔐</div>
              <div className="module-title">Join & Track Progress</div>
              <p className="module-desc">Create a free account to save your scores, track improvement over time, and compete on the global leaderboard.</p>
              <div className="module-tags">
                <span className="tag tag-blue">Free Account</span>
                <span className="tag tag-mint">Save Scores</span>
              </div>
              <div className="module-cta">Sign Up Free →</div>
            </Link>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="section-header">
          <h2 className="section-title">How It Works</h2>
        </div>
        <div className="steps-grid">
          <div className="step-card"><div className="step-num">01</div><div className="step-title">Choose an Activity</div><p className="step-desc">Pick tongue twisters or paragraph reading. Set your category, difficulty, and speed.</p></div>
          <div className="step-card"><div className="step-num">02</div><div className="step-title">Enable Microphone</div><p className="step-desc">Allow browser mic access. Your audio is processed locally — nothing leaves your device.</p></div>
          <div className="step-card"><div className="step-num">03</div><div className="step-title">Read Aloud</div><p className="step-desc">Words highlight green (correct) or red (incorrect) in real time as you speak.</p></div>
          <div className="step-card"><div className="step-num">04</div><div className="step-title">Get Your Score</div><p className="step-desc">See your accuracy %, WPM, and speed feedback. Save to leaderboard and download your recording.</p></div>
        </div>
      </section>
    </div>
  );
}
