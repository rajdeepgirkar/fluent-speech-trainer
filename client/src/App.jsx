import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TongueTwister from './pages/TongueTwister';
import Paragraph from './pages/Paragraph';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/tongue-twister" element={<TongueTwister />} />
            <Route path="/paragraph" element={<Paragraph />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}
