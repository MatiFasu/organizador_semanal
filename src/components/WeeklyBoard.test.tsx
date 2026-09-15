import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CourseProvider } from '../context/CourseContext';
import { WeeklyBoard } from './WeeklyBoard';
import type { Course } from '../types';

const mockCourses: Course[] = [
  {
    id: 'c1',
    title: 'Física I',
    category: 'Facultad',
    color: '#3b82f6',
    schedules: [
      { id: 's1', dayOfWeek: 'Lunes', startTime: '10:00' },
      { id: 's2', dayOfWeek: 'Miércoles', startTime: '08:00' },
    ],
    resources: [],
    tasks: [],
  },
  {
    id: 'c2',
    title: 'Taller de Guitarra',
    category: 'Extras',
    color: '#10b981',
    schedules: [
      { id: 's3', dayOfWeek: 'Lunes', startTime: '18:00' },
    ],
    resources: [],
    tasks: [],
  },
];

describe('WeeklyBoard component', () => {
  it('renders all 7 days of the week', () => {
    render(
      <CourseProvider initialCourses={mockCourses}>
        <MemoryRouter>
          <WeeklyBoard />
        </MemoryRouter>
      </CourseProvider>
    );

    expect(screen.getByText('Mi Semana')).toBeInTheDocument();
    expect(screen.getByText('Lunes')).toBeInTheDocument();
    expect(screen.getByText('Martes')).toBeInTheDocument();
    expect(screen.getByText('Miércoles')).toBeInTheDocument();
    expect(screen.getByText('Jueves')).toBeInTheDocument();
    expect(screen.getByText('Viernes')).toBeInTheDocument();
    expect(screen.getByText('Sábado')).toBeInTheDocument();
    expect(screen.getByText('Domingo')).toBeInTheDocument();
  });

  it('renders activities on their respective days', () => {
    render(
      <CourseProvider initialCourses={mockCourses}>
        <MemoryRouter>
          <WeeklyBoard />
        </MemoryRouter>
      </CourseProvider>
    );

    expect(screen.getAllByText('Física I')).toHaveLength(2);
    expect(screen.getByText('Taller de Guitarra')).toBeInTheDocument();
  });

  it('filters activities when clicking category tabs', async () => {
    const user = userEvent.setup();

    render(
      <CourseProvider initialCourses={mockCourses}>
        <MemoryRouter>
          <WeeklyBoard />
        </MemoryRouter>
      </CourseProvider>
    );

    const extrasTab = screen.getByRole('button', { name: 'Extras' });
    await user.click(extrasTab);

    expect(screen.getByText('Taller de Guitarra')).toBeInTheDocument();
    expect(screen.queryByText('Física I')).not.toBeInTheDocument();
  });
});
