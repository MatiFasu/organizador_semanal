import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import type { Pool } from 'pg';
import { pool as defaultPool } from './db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isValidUuid = (str: unknown): boolean => {
  return typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

export const createApp = (db: Pool = defaultPool) => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Auth endpoint
  app.post('/api/login', (req, res) => {
    const { password } = req.body;
    const inputPassword = typeof password === 'string' ? password : '';
    const hash = crypto.createHash('sha256').update(inputPassword).digest('hex');
    const expectedHash = process.env.APP_PASSWORD_HASH || 'd38b184e7e6cb61f2a43e65c1e534afe565d15763cedf9fdd1088d4a65df9c60';
    const plainPassword = process.env.APP_PASSWORD;

    if ((plainPassword && inputPassword === plainPassword) || hash === expectedHash) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: 'Invalid password' });
    }
  });

  // Get all courses with their relations in a single fast query
  app.get('/api/courses', async (_req, res) => {
    try {
      const query = `
        SELECT 
          c.id,
          c.title,
          c.category,
          c.description,
          c.color,
          c.notifications_enabled,
          c.phone_number,
          COALESCE((
            SELECT json_agg(json_build_object(
              'id', s.id,
              'course_id', s.course_id,
              'day_of_week', s.day_of_week,
              'start_time', s.start_time,
              'end_time', s.end_time
            ) ORDER BY s.start_time ASC)
            FROM schedules s
            WHERE s.course_id = c.id
          ), '[]'::json) AS schedules,
          COALESCE((
            SELECT json_agg(json_build_object(
              'id', r.id,
              'course_id', r.course_id,
              'name', r.name,
              'url', r.url
            ))
            FROM resources r
            WHERE r.course_id = c.id
          ), '[]'::json) AS resources,
          COALESCE((
            SELECT json_agg(json_build_object(
              'id', t.id,
              'course_id', t.course_id,
              'title', t.title,
              'completed', t.completed
            ))
            FROM tasks t
            WHERE t.course_id = c.id
          ), '[]'::json) AS tasks
        FROM courses c
        ORDER BY c.title ASC;
      `;
      const result = await db.query(query);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching courses:', err);
      res.status(500).json({ error: 'Server error al obtener los cursos' });
    }
  });

  // Add a new course
  app.post('/api/courses', async (req, res) => {
    const { id, title, category, description, color, notificationsEnabled, phoneNumber } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'El título del curso es obligatorio' });
    }

    const courseId = isValidUuid(id) ? id : crypto.randomUUID();

    try {
      const result = await db.query(
        `INSERT INTO courses (id, title, category, description, color, notifications_enabled, phone_number)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          courseId,
          title.trim(),
          category || 'Facultad',
          description || null,
          color || '#3b82f6',
          Boolean(notificationsEnabled),
          phoneNumber || null,
        ]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error in POST /api/courses:', err);
      res.status(500).json({
        error: 'Server error',
        details: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  });

  // Import courses in a single transaction
  app.post('/api/courses/import', async (req, res) => {
    const coursesToImport = Array.isArray(req.body) ? req.body : req.body?.courses;

    if (!Array.isArray(coursesToImport) || coursesToImport.length === 0) {
      return res.status(400).json({ error: 'La lista de cursos para importar está vacía o no es válida' });
    }

    let client;
    try {
      client = await db.connect();
      await client.query('BEGIN');

      for (const course of coursesToImport) {
        if (!course.title || typeof course.title !== 'string') {
          throw new Error('Todos los cursos deben tener un título válido.');
        }

        const courseId = isValidUuid(course.id) ? course.id : crypto.randomUUID();
        const title = course.title;
        const category = course.category || 'Facultad';
        const description = course.description || null;
        const color = course.color || '#3b82f6';
        const notificationsEnabled = Boolean(course.notificationsEnabled ?? course.notifications_enabled);
        const phoneNumber = course.phoneNumber ?? course.phone_number ?? null;

        await client.query(
          `INSERT INTO courses (id, title, category, description, color, notifications_enabled, phone_number)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET
             title = EXCLUDED.title,
             category = EXCLUDED.category,
             description = EXCLUDED.description,
             color = EXCLUDED.color,
             notifications_enabled = EXCLUDED.notifications_enabled,
             phone_number = EXCLUDED.phone_number`,
          [courseId, title, category, description, color, notificationsEnabled, phoneNumber]
        );

        // Clean existing child records for this course to ensure clean state
        await client.query('DELETE FROM schedules WHERE course_id = $1', [courseId]);
        await client.query('DELETE FROM resources WHERE course_id = $1', [courseId]);
        await client.query('DELETE FROM tasks WHERE course_id = $1', [courseId]);

        // Insert schedules
        if (Array.isArray(course.schedules)) {
          for (const s of course.schedules) {
            const dayOfWeek = s.dayOfWeek || s.day_of_week;
            if (dayOfWeek) {
              const scheduleId = isValidUuid(s.id) ? s.id : crypto.randomUUID();
              const startTime = s.startTime || s.start_time || '00:00';
              const endTime = s.endTime || s.end_time || null;
              await client.query(
                'INSERT INTO schedules (id, course_id, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4, $5)',
                [scheduleId, courseId, dayOfWeek, startTime, endTime]
              );
            }
          }
        }

        // Insert resources
        if (Array.isArray(course.resources)) {
          for (const r of course.resources) {
            if (r.name && r.url) {
              const resourceId = isValidUuid(r.id) ? r.id : crypto.randomUUID();
              await client.query(
                'INSERT INTO resources (id, course_id, name, url) VALUES ($1, $2, $3, $4)',
                [resourceId, courseId, r.name, r.url]
              );
            }
          }
        }

        // Insert tasks
        if (Array.isArray(course.tasks)) {
          for (const t of course.tasks) {
            if (t.title) {
              const taskId = isValidUuid(t.id) ? t.id : crypto.randomUUID();
              await client.query(
                'INSERT INTO tasks (id, course_id, title, completed) VALUES ($1, $2, $3, $4)',
                [taskId, courseId, t.title, Boolean(t.completed)]
              );
            }
          }
        }
      }

      await client.query('COMMIT');
      res.json({ success: true, count: coursesToImport.length, message: 'Cursos importados correctamente' });
    } catch (err) {
      if (client) {
        try {
          await client.query('ROLLBACK');
        } catch (rollbackErr) {
          console.error('Error during rollback:', rollbackErr);
        }
      }
      const message = err instanceof Error ? err.message : String(err);
      console.error('Error in POST /api/courses/import:', err);
      res.status(500).json({
        error: 'Error al guardar los cursos en la base de datos.',
        details: message,
      });
    } finally {
      if (client) {
        client.release();
      }
    }
  });

  // Update a course
  app.patch('/api/courses/:id', async (req, res) => {
    const { id } = req.params;
    const fields = req.body;

    const columnMapping: Record<string, string> = {
      title: 'title',
      category: 'category',
      description: 'description',
      color: 'color',
      notificationsEnabled: 'notifications_enabled',
      phoneNumber: 'phone_number',
    };

    const updates = Object.entries(fields)
      .filter(([key]) => columnMapping[key])
      .map(([key], index) => `${columnMapping[key]} = $${index + 2}`);

    const values = Object.entries(fields)
      .filter(([key]) => columnMapping[key])
      .map(([, value]) => value);

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided' });
    }

    try {
      const result = await db.query(
        `UPDATE courses SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
        [id, ...values]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Curso no encontrado' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Delete a course
  app.delete('/api/courses/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await db.query('DELETE FROM courses WHERE id = $1', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Curso no encontrado' });
      }
      res.json({ message: 'Course deleted' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Schedules
  app.post('/api/courses/:courseId/schedules', async (req, res) => {
    const { courseId } = req.params;
    const { id, dayOfWeek, startTime, endTime } = req.body;
    const scheduleId = isValidUuid(id) ? id : crypto.randomUUID();

    try {
      const result = await db.query(
        'INSERT INTO schedules (id, course_id, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [scheduleId, courseId, dayOfWeek, startTime, endTime || null]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.delete('/api/schedules/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await db.query('DELETE FROM schedules WHERE id = $1', [id]);
      res.json({ message: 'Schedule deleted' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.patch('/api/schedules/:id', async (req, res) => {
    const { id } = req.params;
    const { dayOfWeek } = req.body;
    try {
      const result = await db.query(
        'UPDATE schedules SET day_of_week = $2 WHERE id = $1 RETURNING *',
        [id, dayOfWeek]
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Resources
  app.post('/api/courses/:courseId/resources', async (req, res) => {
    const { courseId } = req.params;
    const { id, name, url } = req.body;
    const resourceId = isValidUuid(id) ? id : crypto.randomUUID();

    try {
      const result = await db.query(
        'INSERT INTO resources (id, course_id, name, url) VALUES ($1, $2, $3, $4) RETURNING *',
        [resourceId, courseId, name, url]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.delete('/api/resources/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await db.query('DELETE FROM resources WHERE id = $1', [id]);
      res.json({ message: 'Resource deleted' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Tasks
  app.post('/api/courses/:courseId/tasks', async (req, res) => {
    const { courseId } = req.params;
    const { id, title, completed } = req.body;
    const taskId = isValidUuid(id) ? id : crypto.randomUUID();

    try {
      const result = await db.query(
        'INSERT INTO tasks (id, course_id, title, completed) VALUES ($1, $2, $3, $4) RETURNING *',
        [taskId, courseId, title, Boolean(completed)]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.patch('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    try {
      const result = await db.query(
        'UPDATE tasks SET completed = $2 WHERE id = $1 RETURNING *',
        [id, Boolean(completed)]
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.delete('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await db.query('DELETE FROM tasks WHERE id = $1', [id]);
      res.json({ message: 'Task deleted' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Serve static files in production
  app.use(express.static(path.join(__dirname, '../dist')));

  // Frontend catchall
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });

  return app;
};

export const app = createApp();
