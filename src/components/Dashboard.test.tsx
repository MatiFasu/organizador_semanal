import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CourseProvider } from '../context/CourseContext';
import { Dashboard } from './Dashboard';
import type { Course } from '../types';

const mockCourses: Course[] = [
  {
    id: 'c1',
    title: 'Álgebra Lineal',
    category: 'Facultad',
    description: 'Espacios vectoriales',
    color: '#3b82f6',
    schedules: [{ id: 's1', dayOfWeek: 'Lunes', startTime: '10:00' }],
    resources: [{ id: 'r1', name: 'Campus', url: 'https://campus.edu' }],
    tasks: [{ id: 't1', title: 'Guía 1', completed: false }],
  },
  {
    id: 'c2',
    title: 'Curso de Inglés',
    category: 'Extras',
    description: 'Grammar and speaking',
    color: '#10b981',
    schedules: [],
    resources: [],
    tasks: [],
  },
];

describe('Dashboard component', () => {
  it('renders all courses and header actions', () => {
    render(
      <CourseProvider initialCourses={mockCourses}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </CourseProvider>
    );

    expect(screen.getByText('Mis Cursos')).toBeInTheDocument();
    expect(screen.getByText('Álgebra Lineal')).toBeInTheDocument();
    expect(screen.getByText('Curso de Inglés')).toBeInTheDocument();
    expect(screen.getByText('Nuevo Curso')).toBeInTheDocument();
  });

  it('filters courses by category tabs', async () => {
    const user = userEvent.setup();

    render(
      <CourseProvider initialCourses={mockCourses}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </CourseProvider>
    );

    // Click on "Extras" tab
    const extrasTab = screen.getByRole('button', { name: 'Extras' });
    await user.click(extrasTab);

    expect(screen.getByText('Curso de Inglés')).toBeInTheDocument();
    expect(screen.queryByText('Álgebra Lineal')).not.toBeInTheDocument();

    // Click on "Todas" tab
    const allTab = screen.getByRole('button', { name: 'Todas' });
    await user.click(allTab);

    expect(screen.getByText('Álgebra Lineal')).toBeInTheDocument();
    expect(screen.getByText('Curso de Inglés')).toBeInTheDocument();
  });

  it('filters courses by search input', async () => {
    const user = userEvent.setup();

    render(
      <CourseProvider initialCourses={mockCourses}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </CourseProvider>
    );

    const searchInput = screen.getByPlaceholderText(/Buscar materia/i);
    await user.type(searchInput, 'Álgebra');

    expect(screen.getByText('Álgebra Lineal')).toBeInTheDocument();
    expect(screen.queryByText('Curso de Inglés')).not.toBeInTheDocument();

    await user.clear(searchInput);
    expect(screen.getByText('Curso de Inglés')).toBeInTheDocument();
  });

  it('opens and closes the CreateCourseModal', async () => {
    const user = userEvent.setup();

    render(
      <CourseProvider initialCourses={mockCourses}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </CourseProvider>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const newCourseButton = screen.getByRole('button', { name: /Nuevo Curso/i });
    await user.click(newCourseButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre del curso/i)).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
    await user.click(cancelButton);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
