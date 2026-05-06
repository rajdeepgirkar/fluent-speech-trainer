import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link to="/" className="nav-brand" onClick={() => setMenuOpen(false)}>
          <span className="nav-logo">🎤</span>
          <span className="nav-title">Speech Trainer</span>
        </Link>

        <button
          className={`nav-hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/tongue-twister" className="nav-link" onClick={() => setMenuOpen(false)}>👅 Twisters</Link>
          <Link to="/paragraph" className="nav-link" onClick={() => setMenuOpen(false)}>📖 Paragraph</Link>
          <Link to="/leaderboard" className="nav-link" onClick={() => setMenuOpen(false)}>🏆 Rank</Link>
          {user && (
            <Link to="/dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>📊 Dashboard</Link>
          )}

          <div className="nav-auth">
            {user ? (
              <>
                <span className="nav-user-chip">👤 {user.name}</span>
                <button className="btn btn-sm btn-secondary" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-sm btn-secondary" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/signup" className="btn btn-sm btn-primary" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
