import React from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import type { CourseResource } from '../types';

interface ActivityCardProps {
  activity: {
    id: string;
    courseId: string;
    title: string;
    resources: CourseResource[];
    time: string;
    color: string;
  };
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  const handleResourceClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="activity-card" 
      style={{ borderLeft: `4px solid ${activity.color}` }}
    >
      <div className="activity-header">
        <span className="activity-title">{activity.title}</span>
      </div>
      
      <div className="activity-time">
        <Clock size={12} />
        <span>{activity.time}</span>
      </div>

      <div className="activity-resources">
        {activity.resources.length === 0 ? (
          <span className="no-resources">Sin enlaces</span>
        ) : (
          activity.resources.map((res) => (
            <button 
              key={res.id} 
              className="resource-btn" 
              onClick={() => handleResourceClick(res.url)}
              title={res.name}
            >
              <ExternalLink size={12} />
              <span>{res.name}</span>
            </button>
          ))
        )}
      </div>

      <style>{`
        .activity-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 12px;
          transition: all 0.2s ease;
          box-shadow: var(--shadow);
        }

        .activity-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .activity-header {
          margin-bottom: 4px;
        }

        .activity-title {
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--text-main);
          word-break: break-word;
        }

        .activity-time {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-bottom: 8px;
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
          background: #eff6ff;
          padding: 6px 8px;
          border-radius: 4px;
          font-weight: 600;
          width: 100%;
          text-align: left;
          transition: background 0.2s;
        }

        .resource-btn:hover {
          background: #dbeafe;
        }

        .no-resources {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-style: italic;
        }
      `}</style>
    </div>
  );
};
