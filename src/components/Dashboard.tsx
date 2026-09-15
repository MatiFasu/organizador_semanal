import React, { useRef, useState, useMemo } from 'react';
import { useCourseData } from '../hooks/useCourseData';
import { Link } from 'react-router-dom';
import { Plus, Settings, CheckCircle2, Download, Upload, AlertCircle, X, Search, BookOpen } from 'lucide-react';
import { validateCoursesJson } from '../utils/courseValidation';
import { CreateCourseModal } from './CreateCourseModal';
import { NextActivity } from './NextActivity';

export const Dashboard: React.FC = () => {
  const {
    courses,
    addCourse,
    importCourses,
    exportCourses,
    loading,
    notification,
    showNotification,
    clearNotification,
  } = useCourseData();

  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamically extract all unique categories from user's active courses
  const existingCategories = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => {
      const cat = c.category?.trim();
      if (cat) set.add(cat);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [courses]);

  const categories = useMemo(() => {
    return ['Todas', ...existingCategories];
  }, [existingCategories]);

  // Derived active category: if selectedCategory is not in the list, fall back to 'Todas'
  const activeCategory = categories.includes(selectedCategory) ? selectedCategory : 'Todas';

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesCategory = activeCategory === 'Todas' || c.category === activeCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [courses, activeCategory, searchQuery]);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Cargando tus cursos...</p>
        <style>{`
          .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 50vh;
            gap: 1rem;
            color: var(--text-muted);
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid var(--border);
            border-top-color: var(--primary);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const handleExport = () => {
    const coursesToExport = activeCategory === 'Todas' && !searchQuery.trim() ? courses : filteredCourses;
    if (coursesToExport.length === 0) {
      showNotification('error', 'No hay cursos para exportar en esta vista.');
      return;
    }
    exportCourses(coursesToExport);
    showNotification('success', `Se exportaron ${coursesToExport.length} curso(s) correctamente.`);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result;
      if (typeof content !== 'string') {
        showNotification('error', 'Error al leer el archivo seleccionado.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      const validation = validateCoursesJson(content);
      if (!validation.valid || !validation.courses) {
        showNotification('error', validation.error || 'Estructura de JSON inválida.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      await importCourses(validation.courses);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
      showNotification('error', 'Error al leer el archivo.');
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsText(file);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Mis Cursos</h1>
          <p>Gestiona tus materias y plataformas de estudio.</p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleExport}
            title="Descargar cursos actuales en formato JSON"
          >
            <Download size={18} />
            <span>Exportar</span>
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleImportClick}
            title="Importar cursos desde un archivo JSON"
          >
            <Upload size={18} />
            <span>Importar</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={20} />
            <span>Nuevo Curso</span>
          </button>
        </div>
      </header>

      {/* Global Notification Toast */}
      {notification && (
        <div className={`toast-banner ${notification.type}`}>
          <div className="toast-content">
            {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            className="toast-close"
            onClick={clearNotification}
            title="Cerrar"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Next Upcoming Activity Widget */}
      <NextActivity />

      {/* Controls: Search and Filter Tabs */}
      <div className="dashboard-controls">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar materia o palabra clave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Limpiar búsqueda"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-wrap">
            <BookOpen size={48} />
          </div>
          <h3>
            {courses.length === 0
              ? 'Aún no tienes cursos registrados'
              : 'No se encontraron cursos con estos filtros'}
          </h3>
          <p>
            {courses.length === 0
              ? 'Comienza creando tu primera materia o importando un archivo de cursos.'
              : 'Prueba cambiando la categoría o borrando el texto de búsqueda.'}
          </p>
          {courses.length === 0 && (
            <button
              type="button"
              className="btn-primary"
              onClick={() => setIsCreateModalOpen(true)}
              style={{ marginTop: '1rem' }}
            >
              <Plus size={20} />
              <span>Crear mi primer curso</span>
            </button>
          )}
        </div>
      ) : (
        <div className="course-grid">
          {filteredCourses.map((course) => {
            const completedTasks = (course.tasks || []).filter((t) => t.completed).length;
            const totalTasks = (course.tasks || []).length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return (
              <div
                key={course.id}
                className="course-card"
                style={{ borderTop: `4px solid ${course.color || '#3b82f6'}` }}
              >
                <div className="course-main">
                  <div className="course-info">
                    <h3>{course.title}</h3>
                    {course.description && (
                      <p className="course-description">{course.description}</p>
                    )}
                    <div className="course-stats">
                      <span className="stat-badge">
                        {(course.schedules || []).length} horario(s)
                      </span>
                      <span className="stat-badge">
                        {(course.resources || []).length} enlace(s)
                      </span>
                      <span className="stat-badge category-badge">
                        {course.category}
                      </span>
                    </div>
                  </div>

                  <div className="course-actions">
                    <Link
                      to={`/course/${course.id}`}
                      className="btn-icon"
                      title="Configurar Curso"
                    >
                      <Settings size={20} />
                    </Link>
                  </div>
                </div>

                <div className="course-progress-section">
                  <div className="progress-label">
                    <div className="label-text">
                      <CheckCircle2 size={14} />
                      <span>
                        Tareas: {completedTasks}/{totalTasks}
                      </span>
                    </div>
                    <span className="progress-percent">{progress}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${progress}%`, backgroundColor: course.color || '#3b82f6' }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for creating a new course */}
      <CreateCourseModal
        isOpen={isCreateModalOpen}
        existingCategories={existingCategories}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (courseData) => {
          await addCourse(courseData);
        }}
      />

      <style>{`
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          gap: 1.5rem;
          flex-wrap: wrap;
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

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn-secondary {
          background: rgba(var(--card-rgb, 255, 255, 255), 0.6);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          color: var(--text-main);
          padding: 12px 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 0.95rem;
          transition: all 0.2s;
          box-shadow: var(--shadow);
          cursor: pointer;
        }

        [data-theme='dark'] .btn-secondary {
          background: rgba(30, 41, 59, 0.5);
        }

        .btn-secondary:hover {
          background: var(--border);
          transform: translateY(-2px);
          color: var(--primary);
          box-shadow: var(--shadow-md);
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
          cursor: pointer;
        }

        .btn-primary:hover {
          background: var(--primary-hover);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
        }

        .toast-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          border-radius: 14px;
          margin-bottom: 2rem;
          font-weight: 600;
          font-size: 0.95rem;
          box-shadow: var(--shadow);
          animation: toastSlideDown 0.3s ease-out;
        }

        @keyframes toastSlideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .toast-banner.success {
          background: rgba(16, 185, 129, 0.12);
          color: #059669;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        [data-theme='dark'] .toast-banner.success {
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
        }

        .toast-banner.error {
          background: rgba(239, 68, 68, 0.12);
          color: #dc2626;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        [data-theme='dark'] .toast-banner.error {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
        }

        .toast-content {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .toast-close {
          display: flex;
          align-items: center;
          color: currentColor;
          opacity: 0.7;
          padding: 4px;
          border-radius: 6px;
          transition: opacity 0.2s;
          cursor: pointer;
        }

        .toast-close:hover {
          opacity: 1;
        }

        .dashboard-controls {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .search-bar {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          max-width: 450px;
        }

        .search-bar input {
          width: 100%;
          padding: 12px 38px 12px 42px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          color: var(--text-main);
          font-size: 0.95rem;
          box-shadow: var(--shadow);
          transition: all 0.2s;
        }

        .search-bar input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }

        .search-icon {
          position: absolute;
          left: 14px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .search-clear {
          position: absolute;
          right: 12px;
          color: var(--text-muted);
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          cursor: pointer;
        }

        .category-tabs {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 6px;
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
          cursor: pointer;
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
          transform: translateY(-6px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          background: rgba(var(--card-rgb, 255, 255, 255), 0.8);
        }

        .course-main {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .course-info h3 {
          margin-bottom: 6px;
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .course-description {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 12px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .course-stats {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
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

        .category-badge {
          color: var(--primary);
          background: rgba(59, 130, 246, 0.1);
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
          padding: 4rem 2rem;
          background: var(--bg-card);
          border-radius: 24px;
          border: 2px dashed var(--border);
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .empty-icon-wrap {
          color: var(--text-muted);
          margin-bottom: 0.5rem;
          opacity: 0.6;
        }

        .empty-state h3 {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-main);
        }

        .empty-state p {
          max-width: 400px;
          font-size: 0.95rem;
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-actions {
            width: 100%;
          }

          .btn-secondary,
          .btn-primary {
            flex: 1;
            justify-content: center;
          }

          .search-bar {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
