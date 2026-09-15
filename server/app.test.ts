import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from './app';
import type { Pool } from 'pg';

describe('Server Express App', () => {
  let mockPool: Partial<Pool>;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    mockPool = {
      query: vi.fn(),
      connect: vi.fn(),
    };
    app = createApp(mockPool as Pool);
  });

  describe('POST /api/login', () => {
    it('returns 200 for correct plain text password (env APP_PASSWORD=123)', async () => {
      process.env.APP_PASSWORD = '123';
      const res = await request(app)
        .post('/api/login')
        .send({ password: '123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 401 for incorrect password', async () => {
      process.env.APP_PASSWORD = '123';
      const res = await request(app)
        .post('/api/login')
        .send({ password: 'wrong-password' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/courses', () => {
    it('returns courses aggregated from database query', async () => {
      const mockRows = [
        {
          id: '123',
          title: 'Algoritmos',
          category: 'Facultad',
          schedules: [],
          resources: [],
          tasks: [],
        },
      ];

      (mockPool.query as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        rows: mockRows,
      });

      const res = await request(app).get('/api/courses');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockRows);
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    it('handles query failure with 500 status', async () => {
      (mockPool.query as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('DB down')
      );

      const res = await request(app).get('/api/courses');
      expect(res.status).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('POST /api/courses', () => {
    it('returns 400 when title is missing or empty', async () => {
      const res = await request(app).post('/api/courses').send({ title: '   ' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('título');
    });

    it('creates a course and returns 201 when input is valid', async () => {
      const createdCourse = {
        id: '11111111-1111-1111-1111-111111111111',
        title: 'Física II',
        category: 'Facultad',
      };

      (mockPool.query as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        rows: [createdCourse],
      });

      const res = await request(app)
        .post('/api/courses')
        .send({
          id: '11111111-1111-1111-1111-111111111111',
          title: 'Física II',
          category: 'Facultad',
        });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Física II');
    });
  });

  describe('PATCH /api/courses/:id', () => {
    it('returns 400 if no valid column fields are provided', async () => {
      const res = await request(app)
        .patch('/api/courses/123')
        .send({ unknownField: 'value' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('No valid fields');
    });
  });

  describe('POST /api/courses/import', () => {
    it('returns 400 if courses list is empty', async () => {
      const res = await request(app)
        .post('/api/courses/import')
        .send({ courses: [] });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('vacía');
    });
  });
});
