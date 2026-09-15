import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DndContext } from '@dnd-kit/core';
import { ActivityCard } from './ActivityCard';
import type { Activity } from '../types';

const mockActivity: Activity = {
  id: 'sched-1',
  courseId: 'course-1',
  title: 'Programación Web',
  time: '14:00',
  color: '#3b82f6',
  resources: [
    {
      id: 'res-1',
      name: 'Google Meet',
      url: 'https://meet.google.com/abc',
    },
  ],
  tasks: [
    { id: 't1', title: 'Completar lab 1', completed: true },
    { id: 't2', title: 'Completar lab 2', completed: false },
  ],
};

describe('ActivityCard', () => {
  it('renders activity details, time and progress', () => {
    render(
      <MemoryRouter>
        <DndContext>
          <ActivityCard activity={mockActivity} />
        </DndContext>
      </MemoryRouter>
    );

    expect(screen.getByText('Programación Web')).toBeInTheDocument();
    expect(screen.getByText('14:00')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('1/2')).toBeInTheDocument();
    expect(screen.getByText('Google Meet')).toBeInTheDocument();
  });
});
