import dotenv from 'dotenv';
import { app } from './app.ts';
import { initDb } from './init.ts';

dotenv.config();

const port = process.env.PORT || 3001;

// Initialize database and start server
initDb()
  .catch((err) => {
    console.warn(
      'Advertencia: No se pudo conectar a la base de datos PostgreSQL:',
      err instanceof Error ? err.message : err
    );
  })
  .finally(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  });
