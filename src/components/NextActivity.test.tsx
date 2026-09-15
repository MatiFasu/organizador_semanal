import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CourseProvider } from '../context/CourseContext';
import { NextActivity } from './NextActivity';
import { DAYS_OF_WEEK } from '../types';
import type { Course } from '../types';

describe('NextActivity component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders upcoming activity banner if a course is scheduled for today after current time', () => {
    // Fix system time to Monday at 10:00 AM
    const monday = new Date(2026, 8, 14, 10, 0, 0); // Monday Sept 14, 2026
    vi.setSystemTime(monday);

    const todayDayName = DAYS_OF_WEEK[0]; // "Lunes"

    const courses: Course[] = [
      {
        id: 'c1',
        title: 'Sistemas Operativos',
        category: 'Facultad',
        color: '#3b82f6',
        schedules: [
          {
            id: 's1',
            dayOfWeek: todayDayName,
            startTime: '11:00',
          },
        ],
        resources: [
          {
            id: 'r1',
            name: 'Zoom Aula 3',
            url: 'https://zoom.us/j/123456',
          },
        ],
        tasks: [
          { id: 't1', title: 'Leer capítulo 2', completed: false },
        ],
      },
    ];

    render(
      <CourseProvider initialCourses={courses}>
        <NextActivity />
      </CourseProvider>
    );

    expect(screen.getByText('PRÓXIMA ACTIVIDAD')).toBeInTheDocument();
    expect(screen.getByText('Sistemas Operativos')).toBeInTheDocument();
    expect(screen.getByText(/Hoy a las 11:00 hs/)).toBeInTheDocument();
    expect(screen.getByText('Zoom Aula 3')).toBeInTheDocument();
    expect(screen.getByText(/1 pendientes/)).toBeInTheDocument();
  });

  it('renders nothing when no upcoming activities remain today', () => {
    const monday = new Date(2026, 8, 14, 20, 0, 0); // Monday Sept 14, 2026 at 20:00
    vi.setSystemTime(monday);

    const courses: Course[] = [
      {
        id: 'c1',
        title: 'Clase Pasada',
        category: 'Facultad',
        schedules: [
          {
            id: 's1',
            dayOfWeek: 'Lunes',
            startTime: '09:00',
          },
        ],
        resources: [],
        tasks: [],
      },
    ];

    const { container } = render(
      <CourseProvider initialCourses={courses}>
        <NextActivity />
      </CourseProvider>
    );

    expect(container.firstChild).toBeNull();
  });
});
