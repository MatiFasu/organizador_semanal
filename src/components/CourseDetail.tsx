import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourseData } from '../hooks/useCourseData';
import { DAYS_OF_WEEK, COURSE_COLORS } from '../types';
import { ArrowLeft, Trash2, Plus, Clock, Link as LinkIcon, CheckCircle2, Circle } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

export const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    courses,
    updateCourse,
    deleteCourse,
    addSchedule,
    removeSchedule,
    addResource,
    removeResource,
    addTask,
    toggleTask,
    removeTask,
  } = useCourseData();

  const course = courses.find((c) => c.id === id);

  const [newSchedule, setNewSchedule] = useState({
    dayOfWeek: DAYS_OF_WEEK[0],
    startTime: '09:00',
    endTime: '11:00',
  });

  const [newResource, setNewResource] = useState({
    name: '',
    url: '',
  });

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const existingCategories = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => {
      const cat = c.category?.trim();
      if (cat) set.add(cat);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [courses]);

  if (!course) {
    return (
      <div className="not-found-container">
        <h2>Curso no encontrado</h2>
        <p>El curso solicitado no existe o fue eliminado.</p>
        <button onClick={() => navigate('/')} className="btn-back">
          <ArrowLeft size={18} />
          <span>Volver a Mis Cursos</span>
        </button>
        <style>{`
          .not-found-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 50vh;
            gap: 1rem;
            color: var(--text-muted);
          }
          .not-found-container h2 {
            color: var(--text-main);
          }
        `}</style>
      </div>
    );
  }

  const handleDeleteCourse = async () => {
    await deleteCourse(course.id);
    navigate('/');
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchedule.startTime) return;
    await addSchedule(course.id, newSchedule);
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResource.name.trim() || !newResource.url.trim()) return;
    await addResource(course.id, newResource);
    setNewResource({ name: '', url: '' });
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await addTask(course.id, newTaskTitle.trim());
    setNewTaskTitle('');
  };

  const completedTasks = (course.tasks || []).filter((t) => t.completed).length;
  const totalTasks = (course.tasks || []).length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="course-detail">
      <header className="detail-header">
        <button onClick={() => navigate('/')} className="btn-back">
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>
        <button onClick={() => setIsDeleteModalOpen(true)} className="btn-danger">
          <Trash2 size={18} />
          <span>Eliminar Curso</span>
        </button>
      </header>

      <div className="detail-grid">
        <div className="detail-column-left">
          <section className="settings-section">
            <h2>Configuración General</h2>
            <div className="card glass">
              <div className="form-group">
                <label htmlFor="edit-title">Nombre del Curso</label>
                <input
                  id="edit-title"
                  type="text"
                  value={course.title}
                  onChange={(e) => updateCourse(course.id, { title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-category">Categoría / Grupo</label>
                <input
                  id="edit-category"
                  type="text"
                  placeholder="Ej: Facultad, Trabajo, Idiomas..."
                  value={course.category}
                  onChange={(e) => updateCourse(course.id, { category: e.target.value })}
                  list="course-detail-categories"
                />
                <datalist id="course-detail-categories">
                  {existingCategories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
                {existingCategories.length > 0 && (
                  <div className="category-chips">
                    <span className="chips-title">Categorías existentes:</span>
                    <div className="chips-list">
                      {existingCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          className={`chip-btn ${course.category === cat ? 'active' : ''}`}
                          onClick={() => updateCourse(course.id, { category: cat })}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="edit-description">Descripción / Notas</label>
                <textarea
                  id="edit-description"
                  rows={2}
                  value={course.description || ''}
                  onChange={(e) => updateCourse(course.id, { description: e.target.value })}
                  placeholder="Información adicional del curso..."
                />
              </div>

              <div className="form-group">
                <label>Color Distintivo</label>
                <div className="color-picker">
                  {COURSE_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`color-circle ${course.color === color ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => updateCourse(course.id, { color })}
                      aria-label={`Color ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="tasks-section" style={{ marginTop: '2rem' }}>
            <div className="section-header">
              <h2>Tareas y Pendientes</h2>
              {totalTasks > 0 && (
                <div className="progress-mini">
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${progress}%`, backgroundColor: course.color || '#3b82f6' }}
                    />
                  </div>
                  <span>{progress}%</span>
                </div>
              )}
            </div>
            <div className="card glass">
              <form onSubmit={handleAddTask} className="add-task-form">
                <input
                  type="text"
                  placeholder="Nueva tarea (ej: Leer capítulo 1...)"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
                <button type="submit" className="btn-add-simple" aria-label="Añadir tarea">
                  <Plus size={18} />
                </button>
              </form>

              <div className="tasks-list">
                {(course.tasks || []).length === 0 ? (
                  <p className="no-data">No hay tareas pendientes.</p>
                ) : (
                  (course.tasks || []).map((t) => (
                    <div key={t.id} className={`task-item ${t.completed ? 'completed' : ''}`}>
                      <button
                        type="button"
                        className="btn-check"
                        onClick={() => toggleTask(course.id, t.id)}
                        aria-label={t.completed ? 'Marcar incompleta' : 'Marcar completa'}
                      >
                        {t.completed ? (
                          <CheckCircle2 size={20} color={course.color || '#3b82f6'} />
                        ) : (
                          <Circle size={20} />
                        )}
                      </button>
                      <span className="task-title">{t.title}</span>
                      <button
                        type="button"
                        className="btn-delete-small"
                        onClick={() => removeTask(course.id, t.id)}
                        aria-label="Eliminar tarea"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="detail-column-right">
          <section className="resources-section">
            <h2>Recursos y Enlaces</h2>
            <div className="card glass">
              <form onSubmit={handleAddResource} className="add-resource-form">
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Nombre (ej: Zoom...)"
                    value={newResource.name}
                    onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="URL (campus.edu.ar o https://...)"
                    value={newResource.url}
                    onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn-add-resource">
                  <Plus size={18} />
                  <span>Añadir Enlace</span>
                </button>
              </form>

              <div className="resources-list">
                {(course.resources || []).length === 0 ? (
                  <p className="no-data">Sin enlaces configurados.</p>
                ) : (
                  (course.resources || []).map((r) => (
                    <div key={r.id} className="resource-item glass">
                      <div className="resource-info">
                        <LinkIcon size={16} className="resource-icon" />
                        <div className="resource-text">
                          <span className="resource-name">{r.name}</span>
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="resource-url"
                          >
                            {r.url}
                          </a>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn-delete-small"
                        onClick={() => removeResource(course.id, r.id)}
                        aria-label="Eliminar enlace"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="schedules-section" style={{ marginTop: '2rem' }}>
            <h2>Horarios Semanales</h2>
            <div className="card glass">
              <form onSubmit={handleAddSchedule} className="add-schedule-form">
                <select
                  value={newSchedule.dayOfWeek}
                  onChange={(e) => setNewSchedule({ ...newSchedule, dayOfWeek: e.target.value })}
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  value={newSchedule.startTime}
                  onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                  title="Hora de inicio"
                />
                <input
                  type="time"
                  value={newSchedule.endTime || ''}
                  onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                  title="Hora de fin (opcional)"
                />
                <button type="submit" className="btn-add" aria-label="Añadir horario">
                  <Plus size={18} />
                </button>
              </form>

              <div className="schedules-list">
                {(course.schedules || []).length === 0 ? (
                  <p className="no-data">No hay horarios definidos.</p>
                ) : (
                  (course.schedules || []).map((s) => (
                    <div key={s.id} className="schedule-item glass">
                      <div className="schedule-info">
                        <Clock size={16} />
                        <span>
                          {s.dayOfWeek} • {s.startTime} hs {s.endTime ? `- ${s.endTime} hs` : ''}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn-delete-small"
                        onClick={() => removeSchedule(course.id, s.id)}
                        aria-label="Eliminar horario"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Eliminar Curso"
        message={`¿Estás seguro de que deseas eliminar permanentemente el curso "${course.title}"? Esta acción eliminará todos sus horarios, recursos y tareas asociadas.`}
        confirmText="Sí, eliminar curso"
        cancelText="Cancelar"
        danger
        onConfirm={handleDeleteCourse}
        onClose={() => setIsDeleteModalOpen(false)}
      />

      <style>{`
        .course-detail {
          max-width: 1200px;
          margin: 0 auto;
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
        }

        .btn-back,
        .btn-danger {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.2s;
          cursor: pointer;
        }

        .btn-back {
          background: var(--bg-secondary);
          color: var(--text-main);
          border: 1px solid var(--border);
        }

        .btn-back:hover {
          background: var(--border);
        }

        .btn-danger {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .btn-danger:hover {
          background: #ef4444;
          color: white;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem;
        }

        @media (max-width: 1000px) {
          .detail-grid {
            grid-template-columns: 1fr;
          }
        }

        .card {
          padding: 1.5rem;
          border-radius: 16px;
          margin-top: 1rem;
        }

        .card.glass {
          background: rgba(var(--card-rgb, 255, 255, 255), 0.5);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: var(--shadow);
        }

        [data-theme='dark'] .card.glass {
          background: rgba(30, 41, 59, 0.4);
        }

        h2 {
          font-size: 1.4rem;
          font-weight: 800;
          letter-spacing: -0.025em;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .progress-mini {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .progress-bar-bg {
          width: 100px;
          height: 8px;
          background: var(--bg-secondary);
          border-radius: 10px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-group label {
          display: block;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-group input,
        .form-group select,
        .form-group textarea,
        .category-select {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          font-size: 1rem;
          background: var(--bg-secondary);
          color: var(--text-main);
          border: 1px solid var(--border);
          box-sizing: border-box;
        }

        .category-select {
          cursor: pointer;
        }

        [data-theme='dark'] .form-group input,
        [data-theme='dark'] .form-group select,
        [data-theme='dark'] .form-group textarea,
        [data-theme='dark'] .category-select {
          background: rgba(15, 23, 42, 0.5);
        }

        .color-picker {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .color-circle {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 3px solid transparent;
          transition: all 0.2s;
          cursor: pointer;
        }

        .color-circle.active {
          border-color: var(--text-main);
          transform: scale(1.15) rotate(5deg);
        }

        .category-chips {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          flex-wrap: wrap;
        }

        .chips-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .chips-list {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .chip-btn {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 12px;
          background: var(--bg-secondary);
          color: var(--text-muted);
          border: 1px solid var(--border);
          cursor: pointer;
          transition: all 0.2s;
        }

        .chip-btn:hover {
          color: var(--text-main);
          border-color: var(--primary);
        }

        .chip-btn.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        /* Tasks Styles */
        .add-task-form {
          display: flex;
          gap: 10px;
          margin-bottom: 1.5rem;
        }

        .add-task-form input {
          flex: 1;
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--bg-secondary);
          color: var(--text-main);
        }

        .btn-add-simple {
          background: var(--primary);
          color: white;
          padding: 10px 14px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          cursor: pointer;
        }

        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .task-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(var(--card-rgb, 255, 255, 255), 0.3);
          border-radius: 12px;
          border: 1px solid var(--border);
          transition: all 0.2s;
        }

        .task-item.completed .task-title {
          text-decoration: line-through;
          color: var(--text-muted);
        }

        .task-item:hover {
          background: rgba(var(--card-rgb, 255, 255, 255), 0.5);
        }

        .task-title {
          flex: 1;
          font-weight: 500;
        }

        .btn-check {
          display: flex;
          align-items: center;
          color: var(--text-muted);
          cursor: pointer;
        }

        /* Resources & Schedules common */
        .resource-item,
        .schedule-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: 12px;
          border: 1px solid var(--border);
          margin-bottom: 10px;
        }

        .resource-info,
        .schedule-info {
          display: flex;
          align-items: center;
          gap: 12px;
          overflow: hidden;
        }

        .resource-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow: hidden;
        }

        .resource-name {
          font-weight: 700;
          font-size: 0.9rem;
        }

        .resource-url {
          font-size: 0.75rem;
          color: var(--primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .resource-url:hover {
          text-decoration: underline;
        }

        .add-resource-form .form-row {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .add-resource-form input {
          flex: 1;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--bg-secondary);
          color: var(--text-main);
        }

        .btn-add-resource {
          width: 100%;
          background: var(--bg-secondary);
          color: var(--primary);
          padding: 12px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 700;
          border: 1.5px dashed var(--primary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-add-resource:hover {
          background: rgba(59, 130, 246, 0.1);
        }

        .add-schedule-form {
          display: flex;
          gap: 10px;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .add-schedule-form select,
        .add-schedule-form input {
          padding: 10px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--bg-secondary);
          color: var(--text-main);
        }

        .add-schedule-form select {
          flex: 2;
          min-width: 120px;
        }

        .add-schedule-form input[type='time'] {
          flex: 1;
          min-width: 80px;
        }

        .btn-add {
          background: var(--primary);
          color: white;
          padding: 10px 14px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          cursor: pointer;
        }

        .btn-delete-small {
          color: #ef4444;
          padding: 6px;
          opacity: 0.6;
          transition: opacity 0.2s;
          cursor: pointer;
          border-radius: 6px;
        }

        .btn-delete-small:hover {
          opacity: 1;
          background: rgba(239, 68, 68, 0.1);
        }

        .no-data {
          text-align: center;
          color: var(--text-muted);
          font-size: 0.875rem;
          padding: 1rem 0;
        }
      `}</style>
    </div>
  );
};
