import React from 'react';
import { useCourseData } from '../hooks/useCourseData';
import { Link } from 'react-router-dom';
import { Plus, Settings, CheckCircle2 } from 'lucide-react';

import { DEFAULT_CATEGORIES } from '../types';

export const Dashboard: React.FC = () => {
  const { courses, addCourse, loading } = useCourseData();
  const [selectedCategory, setSelectedCategory] = React.useState<string>('Todas');

  if (loading) {
    return <div className="loading">Cargando tus cursos...</div>;
  }

  const categories = ['Todas', ...DEFAULT_CATEGORIES];

  const filteredCourses = selectedCategory === 'Todas' 
    ? courses 
    : courses.filter(c => c.category === selectedCategory);

  const handleCreateCourse = () => {
    const title = prompt('Nombre del nuevo curso:');
    if (title) {
      const category = prompt(`Categoría (${DEFAULT_CATEGORIES.join(', ')}):`, DEFAULT_CATEGORIES[0]);
      addCourse({
        title,
        color: '#3b82f6',
        category: category || DEFAULT_CATEGORIES[0],
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

      <div className="category-tabs">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`tab ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredCourses.length === 0 ? (
        <div className="empty-state">
          <p>{courses.length === 0 ? 'Aún no tienes cursos. ¡Crea el primero para empezar!' : 'No hay cursos en esta categoría.'}</p>
        </div>
      ) : (
        <div className="course-grid">
          {filteredCourses.map((course) => {
            const completedTasks = (course.tasks || []).filter(t => t.completed).length;
            const totalTasks = (course.tasks || []).length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return (
              <div key={course.id} className="course-card" style={{ borderTop: `4px solid ${course.color || '#3b82f6'}` }}>
                <div className="course-main">
                  <div className="course-info">
                    <h3>{course.title}</h3>
                    <div className="course-stats">
                      <span className="stat-badge">
                        {(course.schedules || []).length} horario(s)
                      </span>
                      <span className="stat-badge">
                        {(course.resources || []).length} enlace(s)
                      </span>
                    </div>
                  </div>
                  
                  <div className="course-actions">
                    <Link to={`/course/${course.id}`} className="btn-icon" title="Configurar Curso">
                      <Settings size={20} />
                    </Link>
                  </div>
                </div>

                <div className="course-progress-section">
                  <div className="progress-label">
                    <div className="label-text">
                      <CheckCircle2 size={14} />
                      <span>Tareas: {completedTasks}/{totalTasks}</span>
                    </div>
                    <span className="progress-percent">{progress}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${progress}%`, backgroundColor: course.color }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
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
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.025em;
        }

        .dashboard-header p {
          color: var(--text-muted);
          font-weight: 500;
        }

        .btn-primary {
          background: var(--primary);
          color: white;
          padding: 12px 24px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
        }

        .btn-primary:hover {
          background: var(--primary-hover);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
        }

        .course-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .course-card {
          background: rgba(var(--card-rgb, 255, 255, 255), 0.6);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.5rem;
          border-radius: 20px;
          box-shadow: var(--shadow);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          transition: all 0.3s ease;
        }

        [data-theme='dark'] .course-card {
          background: rgba(30, 41, 59, 0.4);
          border-color: rgba(255, 255, 255, 0.05);
        }

        .course-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          background: rgba(var(--card-rgb, 255, 255, 255), 0.8);
        }

        .course-main {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .course-info h3 {
          margin-bottom: 8px;
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .course-stats {
          display: flex;
          gap: 8px;
        }

        .stat-badge {
          font-size: 0.7rem;
          color: var(--text-muted);
          background: var(--bg-secondary);
          padding: 4px 10px;
          border-radius: 20px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .course-actions {
          display: flex;
          gap: 8px;
        }

        .btn-icon {
          padding: 10px;
          border-radius: 12px;
          color: var(--text-muted);
          transition: all 0.2s;
          display: flex;
          background: var(--bg-secondary);
        }

        .btn-icon:hover {
          background: var(--border);
          color: var(--primary);
          transform: rotate(45deg);
        }

        /* Progress Styles */
        .course-progress-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .progress-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .label-text {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .progress-bar-container {
          width: 100%;
          height: 10px;
          background: var(--bg-secondary);
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid var(--border);
        }

        .progress-bar-fill {
          height: 100%;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .empty-state {
          text-align: center;
          padding: 5rem;
          background: var(--bg-card);
          border-radius: 24px;
          border: 2px dashed var(--border);
          color: var(--text-muted);
        }

        .category-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 2rem;
          overflow-x: auto;
          padding-bottom: 8px;
        }

        .tab {
          padding: 8px 16px;
          border-radius: 10px;
          background: var(--bg-secondary);
          color: var(--text-muted);
          font-weight: 700;
          white-space: nowrap;
          transition: all 0.2s;
          border: 1px solid var(--border);
        }

        .tab:hover {
          background: var(--border);
          color: var(--text-main);
        }

        .tab.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }
      `}</style>
    </div>
  );
};
