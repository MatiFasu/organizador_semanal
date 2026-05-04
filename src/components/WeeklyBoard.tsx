import React from 'react';
import { DayColumn } from './DayColumn';
import { useCourseData } from '../hooks/useCourseData';
import { DAYS_OF_WEEK, DEFAULT_CATEGORIES } from '../types';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';

export const WeeklyBoard: React.FC = () => {
  const { courses, moveSchedule, loading } = useCourseData();
  const [selectedCategory, setSelectedCategory] = React.useState<string>('Todas');

  const categories = React.useMemo(() => ['Todas', ...DEFAULT_CATEGORIES], []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  if (loading) {
    return <div className="loading">Cargando cronograma...</div>;
  }

  const getActivitiesForDay = (dayName: string) => {
    const activities: any[] = [];
    
    const filteredCourses = selectedCategory === 'Todas' 
      ? courses 
      : courses.filter(c => c.category === selectedCategory);
    
    filteredCourses.forEach(course => {
      course.schedules.forEach(schedule => {
        if (schedule.dayOfWeek === dayName) {
          activities.push({
            id: schedule.id,
            courseId: course.id,
            title: course.title,
            resources: course.resources,
            tasks: course.tasks,
            time: schedule.startTime,
            color: course.color || '#3b82f6'
          });
        }
      });
    });

    return activities.sort((a, b) => a.time.localeCompare(b.time));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    
    if (over && active.id) {
      const scheduleId = active.id as string;
      const newDay = over.id as string;
      moveSchedule(scheduleId, newDay);
    }
  };

  return (
    <div className="weekly-view">
      <header className="view-header">
        <h1>Mi Semana</h1>
        <p>Tu cronograma automático con acceso a todos tus recursos.</p>
      </header>

      <div className="category-tabs" style={{ marginBottom: '2rem' }}>
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`tab ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
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
      </DndContext>

      <style>{`
        .view-header {
          margin-bottom: 2rem;
        }

        .view-header h1 {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .view-header p {
          color: var(--text-muted);
          font-weight: 500;
        }

        .category-tabs {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 8px;
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

        .weekly-board-container {
          overflow-x: auto;
          background: var(--bg-card);
          border-radius: 20px;
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
