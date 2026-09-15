import { describe, it, expect } from 'vitest';
import { validateCoursesJson } from './courseValidation';
import { DEFAULT_CATEGORIES, DAYS_OF_WEEK } from '../types';

describe('validateCoursesJson', () => {
  it('should return error when JSON string is invalid syntax', () => {
    const result = validateCoursesJson('not a json');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('JSON');
  });

  it('should return error when JSON is neither array nor object with courses property', () => {
    const result = validateCoursesJson('"just a string"');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('array de cursos');
  });

  it('should return error when array is empty', () => {
    const result = validateCoursesJson('[]');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('vacío');
  });

  it('should return error when course has no title', () => {
    const json = JSON.stringify([{ id: '123' }]);
    const result = validateCoursesJson(json);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('título');
  });

  it('should validate a valid array of courses', () => {
    const json = JSON.stringify([
      {
        id: '11111111-1111-1111-1111-111111111111',
        title: 'Matemática Discreta',
        category: 'Facultad',
        color: '#3b82f6',
        schedules: [
          {
            dayOfWeek: 'Lunes',
            startTime: '10:00',
            endTime: '12:00',
          },
        ],
        resources: [
          {
            name: 'Campus Virtual',
            url: 'https://campus.edu.ar',
          },
        ],
        tasks: [
          {
            title: 'Hacer TP 1',
            completed: false,
          },
        ],
      },
    ]);

    const result = validateCoursesJson(json);
    expect(result.valid).toBe(true);
    expect(result.courses).toBeDefined();
    expect(result.courses).toHaveLength(1);
    expect(result.courses![0].title).toBe('Matemática Discreta');
    expect(result.courses![0].schedules).toHaveLength(1);
    expect(result.courses![0].schedules[0].dayOfWeek).toBe('Lunes');
    expect(result.courses![0].resources).toHaveLength(1);
    expect(result.courses![0].tasks).toHaveLength(1);
  });

  it('should validate an object containing a courses property', () => {
    const json = JSON.stringify({
      courses: [
        {
          title: 'Algoritmos',
          category: 'Facultad',
        },
      ],
    });

    const result = validateCoursesJson(json);
    expect(result.valid).toBe(true);
    expect(result.courses).toHaveLength(1);
    expect(result.courses![0].title).toBe('Algoritmos');
    expect(result.courses![0].category).toBe('Facultad');
    // Generates a valid UUID when none is supplied
    expect(result.courses![0].id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it('should assign default category if missing or empty', () => {
    const json = JSON.stringify([{ title: 'Física I' }]);
    const result = validateCoursesJson(json);
    expect(result.valid).toBe(true);
    expect(result.courses![0].category).toBe(DEFAULT_CATEGORIES[0]);
  });

  it('should fail if a schedule has an invalid dayOfWeek', () => {
    const json = JSON.stringify([
      {
        title: 'Química',
        schedules: [
          {
            dayOfWeek: 'Funday',
            startTime: '14:00',
          },
        ],
      },
    ]);
    const result = validateCoursesJson(json);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('inválido');
  });

  it('should handle snake_case properties from backend exports', () => {
    const json = JSON.stringify([
      {
        title: 'Bases de Datos',
        notifications_enabled: true,
        phone_number: '+5491112345678',
        schedules: [
          {
            day_of_week: DAYS_OF_WEEK[2], // Miércoles
            start_time: '18:00',
            end_time: '21:00',
          },
        ],
      },
    ]);
    const result = validateCoursesJson(json);
    expect(result.valid).toBe(true);
    expect(result.courses![0].notificationsEnabled).toBe(true);
    expect(result.courses![0].phoneNumber).toBe('+5491112345678');
    expect(result.courses![0].schedules[0].dayOfWeek).toBe('Miércoles');
    expect(result.courses![0].schedules[0].startTime).toBe('18:00');
    expect(result.courses![0].schedules[0].endTime).toBe('21:00');
  });

  it('should fail if resource is missing url or name', () => {
    const json = JSON.stringify([
      {
        title: 'Redes',
        resources: [{ name: 'Solo nombre' }],
      },
    ]);
    const result = validateCoursesJson(json);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('recurso');
  });

  it('should fail if task is missing title', () => {
    const json = JSON.stringify([
      {
        title: 'Sistemas Operativos',
        tasks: [{ completed: true }],
      },
    ]);
    const result = validateCoursesJson(json);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('tarea');
  });
});
