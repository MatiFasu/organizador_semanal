import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Get all courses with their relations
app.get('/api/courses', async (req, res) => {
  try {
    const coursesRes = await pool.query('SELECT * FROM courses');
    const courses = coursesRes.rows;

    for (const course of courses) {
      const schedulesRes = await pool.query('SELECT * FROM schedules WHERE course_id = $1', [course.id]);
      course.schedules = schedulesRes.rows;

      const resourcesRes = await pool.query('SELECT * FROM resources WHERE course_id = $1', [course.id]);
      course.resources = resourcesRes.rows;

      const tasksRes = await pool.query('SELECT * FROM tasks WHERE course_id = $1', [course.id]);
      course.tasks = tasksRes.rows;
    }

    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a new course
app.post('/api/courses', async (req, res) => {
  const { id, title, category, description, color } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO courses (id, title, category, description, color) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, title, category, description, color]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a course
app.patch('/api/courses/:id', async (req, res) => {
  const { id } = req.params;
  const fields = req.body;
  const setClause = Object.keys(fields)
    .map((key, index) => `${key} = $${index + 2}`)
    .join(', ');
  const values = Object.values(fields);

  try {
    const result = await pool.query(
      `UPDATE courses SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
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
    await pool.query('DELETE FROM courses WHERE id = $1', [id]);
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
  try {
    const result = await pool.query(
      'INSERT INTO schedules (id, course_id, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, courseId, dayOfWeek, startTime, endTime]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/schedules/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM schedules WHERE id = $1', [id]);
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
      const result = await pool.query(
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
  try {
    const result = await pool.query(
      'INSERT INTO resources (id, course_id, name, url) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, courseId, name, url]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/resources/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM resources WHERE id = $1', [id]);
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
  try {
    const result = await pool.query(
      'INSERT INTO tasks (id, course_id, title, completed) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, courseId, title, completed]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.patch('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tasks SET completed = $2 WHERE id = $1 RETURNING *',
      [id, completed]
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
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
