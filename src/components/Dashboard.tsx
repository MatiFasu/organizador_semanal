import React from 'react';
import { useCourseData } from '../hooks/useCourseData';
import { Link } from 'react-router-dom';
import { Plus, Settings } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { courses, addCourse } = useCourseData();

  const handleCreateCourse = () => {
    const title = prompt('Nombre del nuevo curso:');
    if (title) {
      addCourse({
        title,
        color: '#3b82f6',
      });
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Mis Cursos</h1>
          <p>Gestiona tus materias y plataformas de estudio.</p>
        </div>
        <button className="btn-primary" onClick={handleCreateCourse}>
          <Plus size={20} />
          <span>Nuevo Curso</span>
        </button>
      </header>

      {courses.length === 0 ? (
        <div className="empty-state">
          <p>Aún no tienes cursos. ¡Crea el primero para empezar!</p>
        </div>
      ) : (
        <div className="course-grid">
          {courses.map((course) => (
            <div key={course.id} className="course-card" style={{ borderTop: `4px solid ${course.color}` }}>
              <div className="course-info">
                <h3>{course.title}</h3>
                <div className="course-stats">
                  <span className="stat-badge">
                    {course.schedules.length} horario(s)
                  </span>
                  <span className="stat-badge">
                    {course.resources.length} enlace(s)
                  </span>
                </div>
              </div>
              
              <div className="course-actions">
                <Link to={`/course/${course.id}`} className="btn-icon" title="Configurar Curso">
                  <Settings size={20} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2.5rem;
        }

        .dashboard-header h1 {
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .dashboard-header p {
          color: var(--text-muted);
        }

        .btn-primary {
          background: var(--primary);
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          transition: background 0.2s;
        }

        .btn-primary:hover {
          background: var(--primary-hover);
        }

        .course-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .course-card {
          background: var(--bg-card);
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: var(--shadow);
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: transform 0.2s;
        }

        .course-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }

        .course-info h3 {
          margin-bottom: 8px;
          font-size: 1.125rem;
          font-weight: 700;
        }

        .course-stats {
          display: flex;
          gap: 8px;
        }

        .stat-badge {
          font-size: 0.75rem;
          color: var(--text-muted);
          background: #f1f5f9;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 500;
        }

        .course-actions {
          display: flex;
          gap: 8px;
        }

        .btn-icon {
          padding: 10px;
          border-radius: 8px;
          color: var(--text-muted);
          transition: all 0.2s;
          display: flex;
          background: #f8fafc;
        }

        .btn-icon:hover {
          background: #f1f5f9;
          color: var(--primary);
          transform: rotate(45deg);
        }

        .empty-state {
          text-align: center;
          padding: 4rem;
          background: var(--bg-card);
          border-radius: 12px;
          border: 2px dashed var(--border);
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};
