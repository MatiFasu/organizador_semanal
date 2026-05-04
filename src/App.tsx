import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { CourseDetail } from './components/CourseDetail';
import { WeeklyBoard } from './components/WeeklyBoard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('app_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        localStorage.setItem('app_authenticated', 'true');
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6',
        fontFamily: 'sans-serif'
      }}>
        <form onSubmit={handleLogin} style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <h2 style={{ marginBottom: '1.5rem', color: '#111827' }}>Weekly Flow</h2>
          <p style={{ marginBottom: '1rem', color: '#6b7280' }}>Ingresa la contraseña para acceder</p>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Contraseña"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '1rem',
              borderRadius: '0.375rem',
              border: error ? '1px solid #ef4444' : '1px solid #d1d5db',
              boxSizing: 'border-box'
            }}
          />
          {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>Contraseña incorrecta</p>}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: loading ? '#93c5fd' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600'
            }}
          >
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="course/:id" element={<CourseDetail />} />
          <Route path="schedule" element={<WeeklyBoard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
