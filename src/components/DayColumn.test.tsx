import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DndContext } from '@dnd-kit/core';
import { DayColumn } from './DayColumn';
import type { Activity } from '../types';

describe('DayColumn', () => {
  it('renders day name and "Libre" when empty', () => {
    render(
      <MemoryRouter>
        <DndContext>
          <DayColumn dayName="Lunes" activities={[]} />
        </DndContext>
      </MemoryRouter>
    );

    expect(screen.getByText('Lunes')).toBeInTheDocument();
    expect(screen.getByText('Libre')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders activity cards when activities are present', () => {
    const activities: Activity[] = [
      {
        id: 'act-1',
        courseId: 'c-1',
        title: 'Bases de Datos',
        time: '18:00',
        color: '#10b981',
        resources: [],
        tasks: [],
      },
    ];

    render(
      <MemoryRouter>
        <DndContext>
          <DayColumn dayName="Miércoles" activities={activities} />
        </DndContext>
      </MemoryRouter>
    );

    expect(screen.getByText('Miércoles')).toBeInTheDocument();
    expect(screen.getByText('Bases de Datos')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
