import { pool } from './db.ts';

export const initDb = async () => {
  const client = await pool.connect();
  try {
    console.log('Checking/Initializing database tables...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id UUID PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        color TEXT,
        notifications_enabled BOOLEAN DEFAULT FALSE,
        phone_number TEXT
      );

      CREATE TABLE IF NOT EXISTS schedules (
        id UUID PRIMARY KEY,
        course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
        day_of_week TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT
      );

      CREATE TABLE IF NOT EXISTS resources (
        id UUID PRIMARY KEY,
        course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        url TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY,
        course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE
      );
    `);
    
    console.log('Database tables ready.');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    client.release();
  }
};

// If running directly as a script
if (import.meta.url === `file://${process.argv[1]}`) {
    initDb().then(() => process.exit());
}
