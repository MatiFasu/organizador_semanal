import React, { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { BookOpen, Calendar, Layout as LayoutIcon, Sun, Moon } from 'lucide-react';

export const Layout: React.FC = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-logo">
            <LayoutIcon className="logo-icon" size={24} />
            <span>Weekly Flow</span>
          </div>
          
          <ul className="nav-links">
            <li>
              <Link to="/">
                <BookOpen size={20} />
                <span>Mis Cursos</span>
              </Link>
            </li>
            <li>
              <Link to="/schedule">
                <Calendar size={20} />
                <span>Mi Semana</span>
              </Link>
            </li>
          </ul>
        </div>

        <button className="theme-toggle" onClick={toggleTheme} title="Cambiar tema">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          <span>{theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}</span>
        </button>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>

      <style>{`
        .app-layout {
          display: flex;
          min-height: 100vh;
        }

        .sidebar {
          width: 240px;
          background: var(--bg-sidebar);
          color: white;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: fixed;
          height: 100vh;
          z-index: 1000;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 2.5rem;
        }

        .logo-icon {
          color: var(--primary);
        }

        .nav-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .nav-links a {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          color: var(--text-on-sidebar);
          transition: all 0.2s;
          text-decoration: none;
        }

        .nav-links a:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .theme-toggle {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          color: var(--text-on-sidebar);
          width: 100%;
          transition: all 0.2s;
          margin-top: auto;
        }

        .theme-toggle:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .main-content {
          flex: 1;
          margin-left: 240px;
          padding: 2rem;
          background: var(--bg-main);
          min-height: 100vh;
        }

        @media (max-width: 768px) {
          .app-layout {
            flex-direction: column;
          }
          .sidebar {
            width: 100%;
            height: auto;
            position: relative;
            padding: 1rem;
          }
          .main-content {
            margin-left: 0;
            padding: 1rem;
          }
          .sidebar-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .nav-links {
            flex-direction: row;
            gap: 1rem;
            margin-bottom: 0;
          }
          .sidebar-logo {
            margin-bottom: 0;
          }
          .theme-toggle span {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
