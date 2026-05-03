import React from 'react';
import { ActivityCard } from './ActivityCard';

interface DayColumnProps {
  dayName: string;
  activities: any[];
}

export const DayColumn: React.FC<DayColumnProps> = ({ dayName, activities }) => {
  return (
    <div className="day-column">
      <div className="day-header">
        <h2 className="day-name">{dayName}</h2>
        <span className="activity-count">{activities.length}</span>
      </div>

      <div className="activities-list">
        {activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
          />
        ))}
        {activities.length === 0 && (
          <p className="no-activities">Libre</p>
        )}
      </div>

      <style>{`
        .day-column {
          display: flex;
          flex-direction: column;
          background: #fdfdfd;
          border-right: 1px solid var(--border);
          min-width: 200px;
          flex: 1;
          padding: 16px;
        }

        .day-column:last-child {
          border-right: none;
        }

        .day-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 8px;
          border-bottom: 2px solid var(--bg-main);
        }

        .day-name {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .activity-count {
          background: var(--bg-main);
          color: var(--text-muted);
          font-size: 0.7rem;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 10px;
        }

        .activities-list {
          flex: 1;
        }

        .no-activities {
          text-align: center;
          color: #cbd5e1;
          font-size: 0.875rem;
          margin-top: 1rem;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};
