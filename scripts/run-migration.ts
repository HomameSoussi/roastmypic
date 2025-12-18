import { sql } from '@vercel/postgres';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const migrationsDir = path.join(__dirname, '../migrations');
  const migrationFiles = fs.readdirSync(migrationsDir).sort();

  for (const file of migrationFiles) {
    if (file.endsWith('.sql')) {
      console.log(`Running migration: ${file}`);
      const sqlScript = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      try {
        await sql.query(sqlScript);
        console.log(`Migration ${file} applied successfully.`);
      } catch (error) {
        console.error(`Error applying migration ${file}:`, error);
        // Exit the process with an error code if a migration fails
        process.exit(1);
      }
    }
  }

  console.log('All migrations applied successfully.');
  // Exit the process with a success code
  process.exit(0);
}

main();
