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

  // Reemplaza esto con tu contraseña deseada
  const APP_PASSWORD = '123'; 

  useEffect(() => {
    const authStatus = localStorage.getItem('app_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === APP_PASSWORD) {
      setIsAuthenticated(true);
      setError(false);
      localStorage.setItem('app_authenticated', 'true');
    } else {
      setError(true);
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
          maxSize: '400px',
          textAlign: 'center'
        }}>
          <h2 style={{ marginBottom: '1.5rem', color: '#111827' }}>Weekly Flow</h2>
          <p style={{ marginBottom: '1rem', color: '#6b7280' }}>Ingresa la contraseña para acceder</p>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Contraseña"
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
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Entrar
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
