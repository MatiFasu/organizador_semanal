import React, { useState, useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';
import { COURSE_COLORS } from '../types';
import type { Course } from '../types';

interface CreateCourseModalProps {
  isOpen: boolean;
  existingCategories?: string[];
  onClose: () => void;
  onSubmit: (course: Omit<Course, 'id' | 'schedules' | 'resources' | 'tasks'>) => void;
}

interface CreateCourseFormProps {
  existingCategories: string[];
  onClose: () => void;
  onSubmit: (course: Omit<Course, 'id' | 'schedules' | 'resources' | 'tasks'>) => void;
}

const CreateCourseForm: React.FC<CreateCourseFormProps> = ({ existingCategories, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(existingCategories[0] || '');
  const [color, setColor] = useState(COURSE_COLORS[0]);
  const [description, setDescription] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('El nombre del curso es obligatorio');
      return;
    }

    const resolvedCategory = category.trim() || 'General';

    onSubmit({
      title: title.trim(),
      category: resolvedCategory,
      color,
      description: description.trim() || undefined,
      notificationsEnabled,
      phoneNumber: phoneNumber.trim() || undefined,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <div className="form-group">
        <label htmlFor="course-title">Nombre del curso *</label>
        <input
          id="course-title"
          ref={inputRef}
          type="text"
          placeholder="Ej: Análisis Matemático II"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError('');
          }}
          className={error ? 'input-error' : ''}
        />
        {error && <span className="field-error">{error}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="course-category">Categoría</label>
        <input
          id="course-category"
          type="text"
          placeholder="Ej: Facultad, Trabajo, Idiomas..."
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          list="create-category-suggestions"
        />
        <datalist id="create-category-suggestions">
          {existingCategories.map((cat) => (
            <option key={cat} value={cat} />
          ))}
        </datalist>

        {existingCategories.length > 0 && (
          <div className="category-chips">
            <span className="chips-title">Sugerencias:</span>
            <div className="chips-list">
              {existingCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`chip-btn ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Color distintivo</label>
        <div className="color-picker-grid">
          {COURSE_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`color-btn ${color === c ? 'active' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
              aria-label={`Color ${c}`}
            >
              {color === c && <Check size={16} color="#ffffff" />}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="course-desc">Descripción (opcional)</label>
        <textarea
          id="course-desc"
          rows={2}
          placeholder="Notas o información adicional..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="form-group notification-toggle-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
          />
          <span>Recordatorios automáticos por WhatsApp</span>
        </label>

        {notificationsEnabled && (
          <input
            type="tel"
            placeholder="Teléfono (ej: 5491112345678)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            style={{ marginTop: '8px' }}
          />
        )}
      </div>

      <div className="modal-actions">
        <button type="button" className="btn-cancel" onClick={onClose}>
          Cancelar
        </button>
        <button type="submit" className="btn-submit">
          Crear Curso
        </button>
      </div>
    </form>
  );
};

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
  isOpen,
  existingCategories = [],
  onClose,
  onSubmit,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nuevo Curso</h2>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar modal">
            <X size={20} />
          </button>
        </div>

        <CreateCourseForm
          existingCategories={existingCategories}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 1rem;
        }

        .modal-content {
          width: 100%;
          max-width: 500px;
          border-radius: 20px;
          padding: 2rem;
          background: var(--bg-card);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
          animation: modalAppear 0.25s ease-out;
        }

        @keyframes modalAppear {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .modal-header h2 {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.02em;
        }

        .btn-close {
          color: var(--text-muted);
          padding: 6px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          cursor: pointer;
        }

        .btn-close:hover {
          background: var(--bg-secondary);
          color: var(--text-main);
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 0.95rem;
          border: 1px solid var(--border);
          background: var(--bg-secondary);
          color: var(--text-main);
          box-sizing: border-box;
        }

        .form-group input.input-error {
          border-color: #ef4444;
        }

        .field-error {
          color: #ef4444;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .category-chips {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
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

        .color-picker-grid {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .color-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s;
          border: none;
        }

        .color-btn:hover {
          transform: scale(1.1);
        }

        .color-btn.active {
          transform: scale(1.15);
          box-shadow: 0 0 0 3px var(--text-main);
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .checkbox-label input[type='checkbox'] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 1rem;
        }

        .btn-cancel {
          padding: 10px 18px;
          border-radius: 10px;
          font-weight: 700;
          color: var(--text-muted);
          background: var(--bg-secondary);
          transition: all 0.2s;
          cursor: pointer;
          border: 1px solid var(--border);
        }

        .btn-cancel:hover {
          color: var(--text-main);
          background: var(--border);
        }

        .btn-submit {
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 700;
          color: white;
          background: var(--primary);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          transition: all 0.2s;
          cursor: pointer;
          border: none;
        }

        .btn-submit:hover {
          background: var(--primary-hover);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  );
};
