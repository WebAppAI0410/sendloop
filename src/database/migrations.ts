/**
 * sendloop Database Migrations
 * Schema management with version control
 */

import { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_VERSION = 1;

export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  const { user_version: currentVersion } = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );

  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  console.log(`Migrating database from version ${currentVersion} to ${DATABASE_VERSION}`);

  if (currentVersion === 0) {
    await applyMigration001(db);
  }

  // Future migrations would go here
  // if (currentVersion <= 1) {
  //   await applyMigration002(db);
  // }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
  console.log(`Database migration completed. Current version: ${DATABASE_VERSION}`);
}

/**
 * Migration 001: Initial schema
 * Creates tasks and progress tables
 */
async function applyMigration001(db: SQLiteDatabase): Promise<void> {
  console.log('Applying migration 001: Initial schema');

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    
    -- Tasks table: Core habit tracking
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      cycle_length INTEGER NOT NULL CHECK (cycle_length BETWEEN 3 AND 180),
      visual_type INTEGER NOT NULL CHECK (visual_type BETWEEN 0 AND 3),
      start_date TEXT NOT NULL, -- ISO8601 date
      archived BOOLEAN NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Progress table: Daily achievements
    CREATE TABLE IF NOT EXISTS progress (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      date TEXT NOT NULL, -- ISO8601 date (YYYY-MM-DD)
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      UNIQUE(task_id, date) -- One entry per task per day
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_tasks_archived ON tasks(archived);
    CREATE INDEX IF NOT EXISTS idx_tasks_start_date ON tasks(start_date);
    CREATE INDEX IF NOT EXISTS idx_progress_task_id ON progress(task_id);
    CREATE INDEX IF NOT EXISTS idx_progress_date ON progress(date);
    CREATE INDEX IF NOT EXISTS idx_progress_task_date ON progress(task_id, date);

    -- Triggers for updated_at
    CREATE TRIGGER IF NOT EXISTS update_tasks_updated_at
      AFTER UPDATE ON tasks
      BEGIN
        UPDATE tasks SET updated_at = datetime('now') WHERE id = NEW.id;
      END;
  `);

  console.log('Migration 001 completed: Initial schema created');
}

/**
 * Validates database schema integrity
 */
export async function validateDatabaseSchema(db: SQLiteDatabase): Promise<boolean> {
  try {
    // Check if required tables exist
    const tables = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('tasks', 'progress')"
    );

    if (tables.length !== 2) {
      console.error('Database schema validation failed: Missing required tables');
      return false;
    }

    // Verify foreign key constraints are enabled
    const fkCheck = await db.getFirstAsync<{ foreign_keys: number }>('PRAGMA foreign_keys');
    if (!fkCheck || fkCheck.foreign_keys !== 1) {
      console.warn('Foreign key constraints are not enabled');
    }

    // Verify WAL mode is enabled
    const journalMode = await db.getFirstAsync<{ journal_mode: string }>('PRAGMA journal_mode');
    if (!journalMode || journalMode.journal_mode.toLowerCase() !== 'wal') {
      console.warn('WAL journal mode is not enabled');
    }

    console.log('Database schema validation passed');
    return true;
  } catch (error) {
    console.error('Database schema validation error:', error);
    return false;
  }
}