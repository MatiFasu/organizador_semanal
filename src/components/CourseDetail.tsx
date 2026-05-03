import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourseData } from '../hooks/useCourseData';
import { DAYS_OF_WEEK, COURSE_COLORS } from '../types';
import { ArrowLeft, Trash2, Plus, Clock, Link as LinkIcon } from 'lucide-react';

export const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { courses, updateCourse, deleteCourse, addSchedule, removeSchedule, addResource, removeResource } = useCourseData();

  const course = courses.find((c) => c.id === id);

  const [newSchedule, setNewSchedule] = useState({
    dayOfWeek: DAYS_OF_WEEK[0],
    startTime: '09:00',
  });

  const [newResource, setNewResource] = useState({
    name: '',
    url: '',
  });

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
        <section className="settings-section">
          <h2>Configuración General</h2>
          <div className="card">
            <div className="form-group">
              <label>Nombre del Curso</label>
              <input
                type="text"
                value={course.title}
                onChange={(e) => updateCourse(course.id, { title: e.target.value })}
              />
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

          <h2 style={{ marginTop: '2rem' }}>Recursos y Enlaces</h2>
          <div className="card">
            <form onSubmit={handleAddResource} className="add-resource-form">
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Nombre (ej: Zoom, Drive...)"
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
                <p className="no-data">No hay enlaces configurados.</p>
              ) : (
                course.resources.map((r) => (
                  <div key={r.id} className="resource-item">
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

        <section className="schedules-section">
          <h2>Horarios Semanales</h2>
          <div className="card">
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
                <span>Añadir</span>
              </button>
            </form>

            <div className="schedules-list">
              {course.schedules.length === 0 ? (
                <p className="no-data">No hay horarios definidos.</p>
              ) : (
                course.schedules.map((s) => (
                  <div key={s.id} className="schedule-item">
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

      <style>{`
        .detail-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
        }

        .btn-back, .btn-danger {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
        }

        .btn-back {
          background: #e2e8f0;
          color: var(--text-main);
        }

        .btn-danger {
          background: #fee2e2;
          color: #ef4444;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 2rem;
        }

        @media (max-width: 1100px) {
          .detail-grid {
            grid-template-columns: 1fr;
          }
        }

        .card {
          background: var(--bg-card);
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: var(--shadow);
          margin-top: 1rem;
        }

        h2 {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 6px;
        }

        .form-group input {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--border);
          border-radius: 8px;
          outline: none;
        }

        .color-picker {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .color-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid transparent;
          transition: transform 0.2s;
        }

        .color-circle.active {
          border-color: #1e293b;
          transform: scale(1.1);
        }

        /* Resources Styles */
        .add-resource-form {
          margin-bottom: 1.5rem;
        }

        .form-row {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .form-row input {
          flex: 1;
          padding: 10px;
          border: 1px solid var(--border);
          border-radius: 8px;
        }

        .btn-add-resource {
          width: 100%;
          background: #f1f5f9;
          color: var(--primary);
          padding: 10px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 600;
          border: 1px dashed var(--primary);
        }

        .resource-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f8fafc;
          border-radius: 8px;
          margin-bottom: 10px;
        }

        .resource-info {
          display: flex;
          align-items: center;
          gap: 12px;
          overflow: hidden;
        }

        .resource-icon {
          color: var(--primary);
          flex-shrink: 0;
        }

        .resource-text {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .resource-name {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .resource-url {
          font-size: 0.75rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Schedule Styles */
        .add-schedule-form {
          display: flex;
          gap: 8px;
          margin-bottom: 1.5rem;
        }

        .add-schedule-form select, .add-schedule-form input {
          padding: 8px;
          border: 1px solid var(--border);
          border-radius: 6px;
        }

        .btn-add {
          background: var(--primary);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .schedule-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f8fafc;
          border-radius: 8px;
          margin-bottom: 10px;
        }

        .schedule-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }

        .btn-delete-small {
          color: #ef4444;
          padding: 4px;
          flex-shrink: 0;
        }

        .no-data {
          text-align: center;
          color: var(--text-muted);
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
};
