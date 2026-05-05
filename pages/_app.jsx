// pages/_app.jsx
import '../styles/globals.css';
import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext(null);
export function useAuth() { return useContext(AuthContext); }

export default function App({ Component, pageProps }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // restore session from localstorage on page load
    try {
      const stored = localStorage.getItem('ft_user');
      if (stored) setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem('ft_user');
    }
    setLoading(false);
  }, []);

  function login(userData) {
    setUser(userData);
    localStorage.setItem('ft_user', JSON.stringify(userData));
  }

  function logout() {
    fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    localStorage.removeItem('ft_user');
    router.push('/');
  }

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Component {...pageProps} />
    </AuthContext.Provider>
  );
}
