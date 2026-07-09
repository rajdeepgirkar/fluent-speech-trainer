import { useState, useEffect } from 'react';
import API from '../api/axios';

export default function Leaderboard() {
  const [scores, setScores] = useState([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const { data } = await API.get('/api/score/leaderboard');
      setScores(data.leaderboard || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to load leaderboard', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredScores = filter === 'all' 
    ? scores 
    : scores.filter(s => s.module === filter);

  const getRankClass = (index) => {
    if (index === 0) return 'gold';
    if (index === 1) return 'silver';
    if (index === 2) return 'bronze';
    return '';
  };

  const getRankLabel = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const getFeedbackClass = (fb) => {
    if (fb === 'Optimal') return 'optimal';
    if (fb === 'Too Fast') return 'too-fast';
    if (fb === 'Too Slow') return 'too-slow';
    return '';
  };

  return (
    <div className="standard-page">
      <div className="page-header">
        <div className="page-header-icon">🏆</div>
        <div>
          <h1 className="page-title">Leaderboard</h1>
          <p className="page-subtitle">Top performers ranked by accuracy</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span className="tag tag-mint" style={{ fontSize: 13, padding: '6px 14px' }}>
            {loading ? 'Loading…' : `${total} scores`}
          </span>
        </div>
      </div>

      <div className="lb-filters">
        <button 
          className={`option-pill ${filter === 'all' ? 'selected' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Modules
        </button>
        <button 
          className={`option-pill ${filter === 'tongue_twister' ? 'selected' : ''}`}
          onClick={() => setFilter('tongue_twister')}
        >
          👅 Tongue Twister
        </button>
        <button 
          className={`option-pill ${filter === 'paragraph' ? 'selected' : ''}`}
          onClick={() => setFilter('paragraph')}
        >
          📖 Paragraph
        </button>
      </div>

      <div className="lb-table">
        <div className="lb-row lb-header">
          <div>Rank</div>
          <div>Player</div>
          <div>Module</div>
          <div>Accuracy</div>
          <div>WPM</div>
          <div>Speed</div>
          <div>Date</div>
        </div>
        
        {loading ? (
          <div className="empty-state">
            <div className="empty-icon">⏳</div>
            <p>Loading scores…</p>
          </div>
        ) : filteredScores.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎤</div>
            <p>No scores yet for this filter.</p>
          </div>
        ) : (
          filteredScores.map((entry, i) => (
            <div className="lb-row" key={entry._id || i}>
              <div className={`lb-rank ${getRankClass(i)}`}>{getRankLabel(i)}</div>
              <div className="lb-user">{entry.username}</div>
              <div className="lb-module">
                {entry.module === 'tongue_twister' ? '👅 Twister' : '📖 Paragraph'}
              </div>
              <div className={`lb-score fw-bold ${entry.accuracy >= 85 ? 'text-mint' : entry.accuracy >= 65 ? 'text-gold' : 'text-coral'}`}>{entry.accuracy}%</div>
              <div className="lb-wpm">{entry.wpm > 0 ? `${entry.wpm} WPM` : '—'}</div>
              <div>
                <span className={`lb-feedback ${getFeedbackClass(entry.speedFeedback)}`}>
                  {entry.speedFeedback || '—'}
                </span>
              </div>
              <div className="lb-date">
                {new Date(entry.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
