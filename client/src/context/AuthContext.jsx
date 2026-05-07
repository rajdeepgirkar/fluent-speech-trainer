import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount check localStorage for existing session
  useEffect(() => {
    const stored = localStorage.getItem('sft_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('sft_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post('/api/auth/login', { email, password });
    localStorage.setItem('sft_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const signup = async (name, email, password) => {
    const { data } = await API.post('/api/auth/signup', { name, email, password });
    localStorage.setItem('sft_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('sft_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
