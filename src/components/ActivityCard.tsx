import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDraggable } from '@dnd-kit/core';
import { ExternalLink, Clock, CheckCircle2 } from 'lucide-react';
import type { CourseResource, CourseTask } from '../types';

interface ActivityCardProps {
  activity: {
    id: string;
    courseId: string;
    title: string;
    resources: CourseResource[];
    tasks: CourseTask[];
    time: string;
    color: string;
  };
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: activity.id,
    data: activity
  });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0.6 : 1,
    transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.2s ease',
    borderLeft: `4px solid ${activity.color}`,
    pointerEvents: isDragging ? 'none' : 'auto',
  };

  const handleCardClick = (_e: React.MouseEvent) => {
    // Only navigate if we're not dragging
    if (!isDragging) {
      navigate(`/course/${activity.courseId}`);
    }
  };

  const handleResourceClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation(); // Prevent navigating to course detail
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const completedTasks = activity.tasks.filter(t => t.completed).length;
  const totalTasks = activity.tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div 
      ref={setNodeRef}
      className={`activity-card ${isDragging ? 'dragging' : ''}`}
      style={style}
      onClick={handleCardClick}
      {...listeners}
      {...attributes}
    >
      <div className="activity-header">
        <span className="activity-title">{activity.title}</span>
        {totalTasks > 0 && (
          <div className="card-progress-circle" title={`${progress}% completado`}>
            <span className="progress-text">{progress}%</span>
          </div>
        )}
      </div>
      
      <div className="activity-meta">
        <div className="activity-time">
          <Clock size={12} />
          <span>{activity.time}</span>
        </div>
        {totalTasks > 0 && (
          <div className="activity-tasks-count">
            <CheckCircle2 size={12} />
            <span>{completedTasks}/{totalTasks}</span>
          </div>
        )}
      </div>

      <div className="activity-resources">
        {activity.resources.map((res) => (
          <button 
            key={res.id} 
            className="resource-btn" 
            onClick={(e) => handleResourceClick(e, res.url)}
            title={res.name}
            onPointerDown={(e) => e.stopPropagation()} 
          >
            <ExternalLink size={12} />
            <span>{res.name}</span>
          </button>
        ))}
      </div>

      <style>{`
        .activity-card {
          background: rgba(var(--card-rgb, 255, 255, 255), 0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 12px;
          cursor: grab;
          box-shadow: var(--shadow);
          touch-action: none;
          user-select: none;
          position: relative;
          will-change: transform;
        }

        [data-theme='dark'] .activity-card {
          background: rgba(30, 41, 59, 0.5);
          border-color: rgba(255, 255, 255, 0.05);
        }

        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 4px;
        }

        .card-progress-circle {
          background: var(--bg-secondary);
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--primary);
        }

        .activity-title {
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--text-main);
          word-break: break-word;
        }

        .activity-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }

        .activity-time, .activity-tasks-count {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .activity-tasks-count {
          color: #10b981;
        }

        .activity-resources {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .resource-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          color: var(--primary);
          background: var(--bg-secondary);
          padding: 6px 8px;
          border-radius: 4px;
          font-weight: 600;
          width: 100%;
          text-align: left;
          transition: background 0.2s;
          cursor: pointer;
        }

        .resource-btn:hover {
          background: var(--border);
        }

        .activity-card.dragging {
          cursor: grabbing;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
        }

        .activity-card:hover:not(.dragging) {
          transform: translateY(-2px) !important;
          box-shadow: var(--shadow-md);
        }
      `}</style>
    </div>
  );
};
