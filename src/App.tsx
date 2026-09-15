import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { CourseDetail } from './components/CourseDetail';
import { WeeklyBoard } from './components/WeeklyBoard';
import { CourseProvider } from './context/CourseContext';
import { api } from './services/api';
import { Lock, ArrowRight } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('app_authenticated') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const ok = await api.login(passwordInput);

      if (ok) {
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
      <div className="login-screen">
        <form onSubmit={handleLogin} className="login-card">
          <div className="login-icon-wrap">
            <Lock size={28} />
          </div>
          <h2>Weekly Flow</h2>
          <p>Ingresa la contraseña para acceder a tus cursos y cronograma.</p>

          <div className="login-input-group">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                if (error) setError(false);
              }}
              placeholder="Contraseña de acceso"
              disabled={loading}
              className={error ? 'error' : ''}
              autoFocus
            />
            {error && <span className="error-message">Contraseña incorrecta. Reintenta.</span>}
          </div>

          <button
            type="submit"
            disabled={loading || !passwordInput.trim()}
            className="btn-login"
          >
            <span>{loading ? 'Verificando...' : 'Acceder'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <style>{`
          .login-screen {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            padding: 1.5rem;
            font-family: inherit;
          }

          .login-card {
            background: rgba(30, 41, 59, 0.7);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 2.5rem 2rem;
            border-radius: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            width: 100%;
            maxWidth: 400px;
            text-align: center;
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .login-icon-wrap {
            width: 56px;
            height: 56px;
            border-radius: 16px;
            background: var(--primary, #3b82f6);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            margin-bottom: 1.25rem;
            box-shadow: 0 8px 16px rgba(59, 130, 246, 0.4);
          }

          .login-card h2 {
            font-size: 1.75rem;
            font-weight: 800;
            margin-bottom: 0.5rem;
            letter-spacing: -0.02em;
          }

          .login-card p {
            color: #94a3b8;
            font-size: 0.95rem;
            margin-bottom: 1.75rem;
            line-height: 1.4;
          }

          .login-input-group {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 1.5rem;
            text-align: left;
          }

          .login-input-group input {
            width: 100%;
            padding: 12px 16px;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.15);
            background: rgba(15, 23, 42, 0.6);
            color: white;
            font-size: 1rem;
            outline: none;
            transition: all 0.2s;
            box-sizing: border-box;
          }

          .login-input-group input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
          }

          .login-input-group input.error {
            border-color: #ef4444;
          }

          .error-message {
            color: #f87171;
            font-size: 0.85rem;
            font-weight: 600;
          }

          .btn-login {
            width: 100%;
            padding: 12px;
            border-radius: 12px;
            background: #3b82f6;
            color: white;
            font-weight: 700;
            font-size: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
          }

          .btn-login:hover:not(:disabled) {
            background: #2563eb;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
          }

          .btn-login:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    );
  }

  return (
    <CourseProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="course/:id" element={<CourseDetail />} />
            <Route path="schedule" element={<WeeklyBoard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CourseProvider>
  );
}

export default App;
