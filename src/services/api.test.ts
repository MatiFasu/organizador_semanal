import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api, ApiError } from './api';

describe('api service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('login should return true when response is ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }));
    const result = await api.login('123');
    expect(result).toBe(true);
  });

  it('login should return false when response is 401', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({ success: false }), { status: 401 }));
    const result = await api.login('wrong');
    expect(result).toBe(false);
  });

  it('getCourses should format database snake_case columns properly', async () => {
    const mockDbCourses = [
      {
        id: '123',
        title: 'Álgebra',
        category: 'Facultad',
        color: '#3b82f6',
        notifications_enabled: true,
        phone_number: '+1234567890',
        schedules: [
          {
            id: 's1',
            day_of_week: 'Lunes',
            start_time: '08:00',
            end_time: '10:00',
          },
        ],
        resources: [{ id: 'r1', name: 'Drive', url: 'https://drive.google.com' }],
        tasks: [{ id: 't1', title: 'Ejercicios', completed: false }],
      },
    ];

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockDbCourses), { status: 200 })
    );

    const courses = await api.getCourses();
    expect(courses).toHaveLength(1);
    expect(courses[0].notificationsEnabled).toBe(true);
    expect(courses[0].phoneNumber).toBe('+1234567890');
    expect(courses[0].schedules[0].dayOfWeek).toBe('Lunes');
    expect(courses[0].schedules[0].startTime).toBe('08:00');
  });

  it('throws ApiError when endpoint returns non-ok status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Curso no encontrado' }), { status: 404 })
    );

    await expect(api.deleteCourse('non-existent')).rejects.toThrow(ApiError);
  });
});
