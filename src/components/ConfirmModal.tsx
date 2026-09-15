import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  danger = false,
  onConfirm,
  onClose,
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
      <div className="confirm-modal-content glass" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-title-wrap">
            {danger && <AlertTriangle className="danger-icon" size={22} />}
            <h2>{title}</h2>
          </div>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar modal">
            <X size={20} />
          </button>
        </div>

        <p className="confirm-message">{message}</p>

        <div className="modal-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button
            type="button"
            className={danger ? 'btn-confirm-danger' : 'btn-confirm-primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
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

        .confirm-modal-content {
          width: 100%;
          max-width: 440px;
          border-radius: 20px;
          padding: 2rem;
          background: var(--bg-card);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
          animation: modalAppear 0.2s ease-out;
        }

        .header-title-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .danger-icon {
          color: #ef4444;
        }

        .modal-header h2 {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.02em;
        }

        .confirm-message {
          margin: 1.25rem 0 1.75rem 0;
          color: var(--text-muted);
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .btn-confirm-danger {
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 700;
          color: white;
          background: #ef4444;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
          transition: all 0.2s;
        }

        .btn-confirm-danger:hover {
          background: #dc2626;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(239, 68, 68, 0.5);
        }

        .btn-confirm-primary {
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 700;
          color: white;
          background: var(--primary);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          transition: all 0.2s;
        }

        .btn-confirm-primary:hover {
          background: var(--primary-hover);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};
