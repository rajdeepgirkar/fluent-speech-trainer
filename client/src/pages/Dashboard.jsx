import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/api/score/dashboard');
      setData(res.data);
    } catch (err) {
      setError('Failed to load dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteActivity = async (id, module) => {
    const modLabel = module === 'tongue_twister' ? 'Tongue Twister' : 'Paragraph Reading';
    const confirmed = window.confirm(
      `Delete this ${modLabel} activity?\n\nThis will permanently remove it from your history and the leaderboard.`
    );
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await API.delete(`/api/score/${id}`);
      // Reload dashboard to recalculate all stats
      await loadDashboard();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete activity. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="standard-page">
        <div className="page-header">
          <div className="page-header-icon">📊</div>
          <div><h1 className="page-title">My Dashboard</h1><p className="page-subtitle">Loading your stats...</p></div>
        </div>
        <div className="empty-state"><div className="empty-icon">⏳</div><p>Loading stats…</p></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="standard-page">
        <div className="page-header">
          <div className="page-header-icon">📊</div>
          <div><h1 className="page-title">My Dashboard</h1></div>
        </div>
        <div className="empty-state"><div className="empty-icon">❌</div><p>{error}</p><button className="btn btn-primary" onClick={loadDashboard}>Retry</button></div>
      </div>
    );
  }

  if (!data || data.totalSessions === 0) {
    return (
      <div className="standard-page">
        <div className="page-header">
          <div className="page-header-icon">📊</div>
          <div><h1 className="page-title">My Dashboard</h1><p className="page-subtitle">Welcome, {user?.name}!</p></div>
        </div>
        <div className="empty-state">
          <div className="empty-icon">🎤</div>
          <p>No sessions found. Complete a practice session and save your score to see stats here.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
            <Link to="/tongue-twister" className="btn btn-primary">👅 Practice Twisters</Link>
            <Link to="/paragraph" className="btn btn-secondary">📖 Read Paragraphs</Link>
          </div>
        </div>
      </div>
    );
  }

  const modules = data.modules || {};
  const fd = data.feedbackDist || {};
  const fdTotal = (fd.Optimal || 0) + (fd['Too Slow'] || 0) + (fd['Too Fast'] || 0) || 1;
  const recent = data.recent || [];

  return (
    <div className="standard-page">
      <div className="page-header">
        <div className="page-header-icon">📊</div>
        <div><h1 className="page-title">My Dashboard</h1><p className="page-subtitle">Welcome back, {data.username}!</p></div>
      </div>

      {/* KPI Strip */}
      <div className="dash-kpi-strip">
        <div className="kpi-card"><div className="kpi-icon">🎯</div><div className="kpi-value">{data.avgAccuracy}%</div><div className="kpi-label">Avg Accuracy</div></div>
        <div className="kpi-card kpi-highlight"><div className="kpi-icon">⭐</div><div className="kpi-value">{data.bestAccuracy}%</div><div className="kpi-label">Best Score</div></div>
        <div className="kpi-card"><div className="kpi-icon">💨</div><div className="kpi-value">{data.avgWpm > 0 ? `${data.avgWpm} WPM` : '—'}</div><div className="kpi-label">Avg WPM</div></div>
        <div className="kpi-card"><div className="kpi-icon">📋</div><div className="kpi-value">{data.totalSessions}</div><div className="kpi-label">Total Sessions</div></div>
        <div className="kpi-card"><div className="kpi-icon">🔥</div><div className="kpi-value">{data.streak} {data.streak === 1 ? 'day' : 'days'}</div><div className="kpi-label">Day Streak</div></div>
        <div className="kpi-card"><div className="kpi-icon">🏆</div><div className="kpi-value">{data.rank ? `#${data.rank} / ${data.totalUsers}` : '—'}</div><div className="kpi-label">Global Rank</div></div>
      </div>

      {/* Mid Row */}
      <div className="dash-mid-row">
        <div className="dash-card" style={{ flex: 1 }}>
          <div className="dash-card-title">📦 Module Breakdown</div>
          {modules.tongue_twister && (
            <div className="module-breakdown-item">
              <div className="mb-icon">👅</div>
              <div className="mb-info">
                <div className="mb-name">Tongue Twister</div>
                <div className="mb-stats"><span>{modules.tongue_twister.count} sessions</span> · <span className="text-mint">{modules.tongue_twister.avgAccuracy}% avg</span></div>
              </div>
              <div className="mb-bar-wrap"><div className="mb-bar"><div className="mb-bar-fill" style={{ width: `${modules.tongue_twister.avgAccuracy}%` }} /></div></div>
            </div>
          )}
          {modules.paragraph && (
            <div className="module-breakdown-item">
              <div className="mb-icon">📖</div>
              <div className="mb-info">
                <div className="mb-name">Paragraph Reading</div>
                <div className="mb-stats"><span>{modules.paragraph.count} sessions</span> · <span className="text-mint">{modules.paragraph.avgAccuracy}% avg</span></div>
              </div>
              <div className="mb-bar-wrap"><div className="mb-bar"><div className="mb-bar-fill" style={{ width: `${modules.paragraph.avgAccuracy}%` }} /></div></div>
            </div>
          )}
          {!modules.tongue_twister && !modules.paragraph && <div className="empty-state" style={{ padding: 24 }}><p>No sessions recorded yet.</p></div>}
        </div>

        <div className="dash-card" style={{ flex: 1 }}>
          <div className="dash-card-title">⚡ Speed Feedback Distribution</div>
          <div className="speed-dist">
            <div className="speed-dist-item">
              <div className="speed-dist-label text-mint">Optimal</div>
              <div className="speed-dist-bar-wrap"><div className="speed-dist-bar mint-bar" style={{ width: `${Math.round(((fd.Optimal || 0) / fdTotal) * 100)}%` }} /></div>
              <div className="speed-dist-count">{fd.Optimal || 0}</div>
            </div>
            <div className="speed-dist-item">
              <div className="speed-dist-label" style={{ color: 'var(--blue-accent)' }}>Too Slow</div>
              <div className="speed-dist-bar-wrap"><div className="speed-dist-bar blue-bar" style={{ width: `${Math.round(((fd['Too Slow'] || 0) / fdTotal) * 100)}%` }} /></div>
              <div className="speed-dist-count">{fd['Too Slow'] || 0}</div>
            </div>
            <div className="speed-dist-item">
              <div className="speed-dist-label text-coral">Too Fast</div>
              <div className="speed-dist-bar-wrap"><div className="speed-dist-bar coral-bar" style={{ width: `${Math.round(((fd['Too Fast'] || 0) / fdTotal) * 100)}%` }} /></div>
              <div className="speed-dist-count">{fd['Too Fast'] || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="dash-card" style={{ marginTop: 20 }}>
        <div className="dash-card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>📅 Recent Activity</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Last 10 sessions</span>
        </div>
        <div className="history-table">
          <div className="history-row history-header has-actions">
            <div>Date</div><div>Module</div><div>Accuracy</div><div>WPM</div><div>Speed</div><div>Feedback</div><div></div>
          </div>
          {recent.length === 0 ? (
            <div className="empty-state"><p>No history yet.</p></div>
          ) : (
            recent.map((s, i) => {
              const mod = s.module === 'tongue_twister' ? '👅 Twister' : '📖 Paragraph';
              const fb = s.speedFeedback || '—';
              const fbClass = fb === 'Optimal' ? 'optimal' : fb === 'Too Fast' ? 'too-fast' : 'too-slow';
              const accClass = s.accuracy >= 85 ? 'text-mint' : s.accuracy >= 65 ? 'text-gold' : 'text-coral';
              return (
                <div key={s._id || i} className="history-row has-actions">
                  <div className="history-date">{s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-GB') : '—'}</div>
                  <div>{mod}</div>
                  <div className={`${accClass} fw-bold`}>{s.accuracy}%</div>
                  <div>{s.wpm > 0 ? `${s.wpm} WPM` : '—'}</div>
                  <div style={{ textTransform: 'capitalize' }}>{s.speedSetting || '—'}</div>
                  <div><span className={`lb-feedback ${fbClass}`}>{fb}</span></div>
                  <div>
                    <button
                      className="btn-delete-activity"
                      title="Delete this activity"
                      disabled={deletingId === s._id}
                      onClick={() => deleteActivity(s._id, s.module)}
                    >
                      {deletingId === s._id ? '⏳' : '🗑️'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dash-quick-actions">
        <Link to="/tongue-twister" className="btn btn-primary">👅 Practice Tongue Twisters</Link>
        <Link to="/paragraph" className="btn btn-secondary">📖 Read a Paragraph</Link>
      </div>
    </div>
  );
}
