import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { BookOpen, Calendar, Layout as LayoutIcon } from 'lucide-react';

export const Layout: React.FC = () => {
  return (
    <div className="app-layout">
      <nav className="sidebar">
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
          background: #1e293b;
          color: white;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
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
          color: #94a3b8;
          transition: all 0.2s;
          text-decoration: none;
        }

        .nav-links a:hover {
          background: #334155;
          color: white;
        }

        .main-content {
          flex: 1;
          margin-left: 240px;
          padding: 2rem;
          background: var(--bg-main);
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
          .nav-links {
            flex-direction: row;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};
