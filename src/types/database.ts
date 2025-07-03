/**
 * sendloop Database Types
 * Data models based on requirements specification
 */

export interface Task {
  id: string;
  title: string;
  cycle_length: number; // 3-180 days
  visual_type: VisualType;
  start_date: string; // ISO8601 date
  archived: boolean;
  created_at: string; // ISO8601 timestamp
  updated_at: string; // ISO8601 timestamp
}

export interface Progress {
  id: string;
  task_id: string; // FK to tasks.id
  date: string; // ISO8601 date (YYYY-MM-DD)
  created_at: string; // ISO8601 timestamp
}

export interface TaskWithProgress extends Task {
  progress_entries: Progress[];
  achieved_days: number;
  current_streak: number;
  completion_percentage: number;
}

export enum VisualType {
  TREE = 0,
  FLOWER = 1,
  FISH = 2,
  STARS = 3
}

export interface TaskCreateInput {
  title: string;
  cycle_length: number;
  visual_type: VisualType;
  start_date?: string; // Defaults to today
}

export interface ProgressCreateInput {
  task_id: string;
  date?: string; // Defaults to today
}

// Database operations result types
export interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Migration version tracking
export interface MigrationInfo {
  version: number;
  applied_at: string;
}