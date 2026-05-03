import React from 'react';
import { DayColumn } from './DayColumn';
import { NextActivity } from './NextActivity';
import { useCourseData } from '../hooks/useCourseData';
import { DAYS_OF_WEEK } from '../types';

export const WeeklyBoard: React.FC = () => {
  const { courses } = useCourseData();

  const getActivitiesForDay = (dayName: string) => {
    const activities: any[] = [];
    
    courses.forEach(course => {
      course.schedules.forEach(schedule => {
        if (schedule.dayOfWeek === dayName) {
          activities.push({
            id: schedule.id,
            courseId: course.id,
            title: course.title,
            resources: course.resources,
            time: schedule.startTime,
            color: course.color || '#3b82f6'
          });
        }
      });
    });

    // Sort by time
    return activities.sort((a, b) => a.time.localeCompare(b.time));
  };

  return (
    <div className="weekly-view">
      <header className="view-header">
        <h1>Mi Semana</h1>
        <p>Tu cronograma automático con acceso a todos tus recursos.</p>
      </header>

      <NextActivity />

      <div className="weekly-board-container">
        <div className="weekly-board">
          {DAYS_OF_WEEK.map((day) => (
            <DayColumn
              key={day}
              dayName={day}
              activities={getActivitiesForDay(day)}
            />
          ))}
        </div>
      </div>

      <style>{`
        .view-header {
          margin-bottom: 2rem;
        }

        .view-header h1 {
          font-size: 1.875rem;
          font-weight: 700;
        }

        .view-header p {
          color: var(--text-muted);
        }

        .weekly-board-container {
          overflow-x: auto;
          background: var(--bg-card);
          border-radius: 12px;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-md);
        }

        .weekly-board {
          display: flex;
          min-height: 70vh;
        }
      `}</style>
    </div>
  );
};
