import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CourseProvider } from './CourseContext';
import { useCourseContext } from './courseContextDef';
import { api } from '../services/api';
import type { Course } from '../types';

const initialMockCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Matemática',
    category: 'Facultad',
    color: '#3b82f6',
    schedules: [],
    resources: [],
    tasks: [{ id: 'task-1', title: 'Tarea 1', completed: false }],
  },
];

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <CourseProvider initialCourses={initialMockCourses}>{children}</CourseProvider>
);

describe('CourseContext', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('provides initial courses and manages state', () => {
    const { result } = renderHook(() => useCourseContext(), { wrapper });
    expect(result.current.courses).toHaveLength(1);
    expect(result.current.courses[0].title).toBe('Matemática');
  });

  it('adds a course optimistically and persists via API', async () => {
    const createSpy = vi.spyOn(api, 'createCourse').mockResolvedValueOnce({
      id: 'new-id',
      title: 'Física',
      category: 'Facultad',
      schedules: [],
      resources: [],
      tasks: [],
    });

    const { result } = renderHook(() => useCourseContext(), { wrapper });

    await act(async () => {
      await result.current.addCourse({
        title: 'Física',
        category: 'Facultad',
        color: '#10b981',
      });
    });

    expect(result.current.courses).toHaveLength(2);
    expect(result.current.courses.some((c) => c.title === 'Física')).toBe(true);
    expect(createSpy).toHaveBeenCalledTimes(1);
  });

  it('reverts optimistic update and shows notification when API fails', async () => {
    vi.spyOn(api, 'createCourse').mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useCourseContext(), { wrapper });

    await act(async () => {
      try {
        await result.current.addCourse({
          title: 'Curso Fallido',
          category: 'Facultad',
        });
      } catch {
        // Expected error
      }
    });

    // Rolled back
    expect(result.current.courses).toHaveLength(1);
    expect(result.current.courses.some((c) => c.title === 'Curso Fallido')).toBe(false);
    expect(result.current.notification?.type).toBe('error');
  });

  it('toggles task status optimistically', async () => {
    const toggleSpy = vi.spyOn(api, 'toggleTask').mockResolvedValueOnce();

    const { result } = renderHook(() => useCourseContext(), { wrapper });

    await act(async () => {
      await result.current.toggleTask('course-1', 'task-1');
    });

    const task = result.current.courses[0].tasks.find((t) => t.id === 'task-1');
    expect(task?.completed).toBe(true);
    expect(toggleSpy).toHaveBeenCalledWith('task-1', true);
  });

  it('deletes course and rolls back on failure', async () => {
    vi.spyOn(api, 'deleteCourse').mockRejectedValueOnce(new Error('Server error'));

    const { result } = renderHook(() => useCourseContext(), { wrapper });

    await act(async () => {
      try {
        await result.current.deleteCourse('course-1');
      } catch {
        // Expected
      }
    });

    // Should remain in courses array after rollback
    expect(result.current.courses).toHaveLength(1);
    expect(result.current.courses[0].id).toBe('course-1');
  });
});
