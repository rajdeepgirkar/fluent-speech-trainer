import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('sft_user');
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default API;
