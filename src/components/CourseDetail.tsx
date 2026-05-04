import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourseData } from '../hooks/useCourseData';
import { DAYS_OF_WEEK, COURSE_COLORS, DEFAULT_CATEGORIES } from '../types';
import { ArrowLeft, Trash2, Plus, Clock, Link as LinkIcon, CheckCircle2, Circle } from 'lucide-react';

export const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    courses, updateCourse, deleteCourse, 
    addSchedule, removeSchedule, 
    addResource, removeResource,
    addTask, toggleTask, removeTask 
  } = useCourseData();

  const course = courses.find((c) => c.id === id);

  const [newSchedule, setNewSchedule] = useState({
    dayOfWeek: DAYS_OF_WEEK[0],
    startTime: '09:00',
  });

  const [newResource, setNewResource] = useState({
    name: '',
    url: '',
  });

  const [newTaskTitle, setNewTaskTitle] = useState('');

  if (!course) {
    return <div>Curso no encontrado.</div>;
  }

  const handleDeleteCourse = () => {
    if (confirm('¿Estás seguro de que quieres eliminar todo este curso?')) {
      deleteCourse(course.id);
      navigate('/');
    }
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    addSchedule(course.id, newSchedule);
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResource.name || !newResource.url) return;
    addResource(course.id, newResource);
    setNewResource({ name: '', url: '' });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(course.id, newTaskTitle.trim());
    setNewTaskTitle('');
  };

  const completedTasks = course.tasks.filter(t => t.completed).length;
  const totalTasks = course.tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="course-detail">
      <header className="detail-header">
        <button onClick={() => navigate('/')} className="btn-back">
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>
        <button onClick={handleDeleteCourse} className="btn-danger">
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
                <label>Nombre del Curso</label>
                <input
                  type="text"
                  value={course.title}
                  onChange={(e) => updateCourse(course.id, { title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Categoría / Grupo</label>
                <select
                  value={course.category}
                  onChange={(e) => updateCourse(course.id, { category: e.target.value })}
                  className="category-select"
                >
                  {DEFAULT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Color Distintivo</label>
                <div className="color-picker">
                  {COURSE_COLORS.map((color) => (
                    <button
                      key={color}
                      className={`color-circle ${course.color === color ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => updateCourse(course.id, { color })}
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
                    <div className="progress-bar-fill" style={{ width: `${progress}%`, backgroundColor: course.color }}></div>
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
                <button type="submit" className="btn-add-simple">
                  <Plus size={18} />
                </button>
              </form>

              <div className="tasks-list">
                {course.tasks.length === 0 ? (
                  <p className="no-data">No hay tareas pendientes.</p>
                ) : (
                  course.tasks.map((t) => (
                    <div key={t.id} className={`task-item ${t.completed ? 'completed' : ''}`}>
                      <button className="btn-check" onClick={() => toggleTask(course.id, t.id)}>
                        {t.completed ? <CheckCircle2 size={20} color={course.color} /> : <Circle size={20} />}
                      </button>
                      <span className="task-title">{t.title}</span>
                      <button className="btn-delete-small" onClick={() => removeTask(course.id, t.id)}>
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
                    placeholder="URL (https://...)"
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
                {course.resources.length === 0 ? (
                  <p className="no-data">Sin enlaces configurados.</p>
                ) : (
                  course.resources.map((r) => (
                    <div key={r.id} className="resource-item glass">
                      <div className="resource-info">
                        <LinkIcon size={16} className="resource-icon" />
                        <div className="resource-text">
                          <span className="resource-name">{r.name}</span>
                          <span className="resource-url">{r.url}</span>
                        </div>
                      </div>
                      <button className="btn-delete-small" onClick={() => removeResource(course.id, r.id)}>
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
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <input
                  type="time"
                  value={newSchedule.startTime}
                  onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                />
                <button type="submit" className="btn-add">
                  <Plus size={18} />
                </button>
              </form>

              <div className="schedules-list">
                {course.schedules.length === 0 ? (
                  <p className="no-data">No hay horarios definidos.</p>
                ) : (
                  course.schedules.map((s) => (
                    <div key={s.id} className="schedule-item glass">
                      <div className="schedule-info">
                        <Clock size={16} />
                        <span>{s.dayOfWeek} - {s.startTime} hs</span>
                      </div>
                      <button className="btn-delete-small" onClick={() => removeSchedule(course.id, s.id)}>
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

        .btn-back, .btn-danger {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .btn-back {
          background: var(--bg-secondary);
          color: var(--text-main);
        }

        .btn-danger {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
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
          font-size: 1.5rem;
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
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-muted);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-group input, .category-select {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          font-size: 1rem;
          background: var(--bg-secondary);
          color: var(--text-main);
          border: 1px solid var(--border);
        }

        .category-select {
          cursor: pointer;
        }

        [data-theme='dark'] .form-group input, [data-theme='dark'] .category-select {
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
        }

        .color-circle.active {
          border-color: var(--text-main);
          transform: scale(1.15) rotate(5deg);
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
        }

        .btn-add-simple {
          background: var(--primary);
          color: white;
          padding: 10px;
          border-radius: 10px;
          display: flex;
          align-items: center;
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
        }

        /* Resources & Schedules common */
        .resource-item, .schedule-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: 12px;
          margin-bottom: 10px;
        }

        .resource-info, .schedule-info {
          display: flex;
          align-items: center;
          gap: 12px;
          overflow: hidden;
        }

        .resource-name {
          font-weight: 700;
          font-size: 0.9rem;
        }

        .resource-url {
          font-size: 0.75rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
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
        }

        .add-schedule-form {
          display: flex;
          gap: 10px;
          margin-bottom: 1.5rem;
        }

        .add-schedule-form select, .add-schedule-form input {
          padding: 10px;
          border-radius: 10px;
        }

        .add-schedule-form select {
          flex: 1;
        }

        .btn-add {
          background: var(--primary);
          color: white;
          padding: 10px 14px;
          border-radius: 10px;
          display: flex;
          align-items: center;
        }

        .btn-delete-small {
          color: #ef4444;
          padding: 6px;
          opacity: 0.5;
          transition: opacity 0.2s;
        }

        .task-item:hover .btn-delete-small, 
        .resource-item:hover .btn-delete-small, 
        .schedule-item:hover .btn-delete-small {
          opacity: 1;
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
