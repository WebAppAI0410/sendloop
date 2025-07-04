/**
 * sendloop Database Service
 * Main database operations and data access layer
 */

import { SQLiteDatabase } from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { 
  Task, 
  Progress, 
  TaskCreateInput, 
  ProgressCreateInput, 
  TaskWithProgress,
  DatabaseResult,
  VisualType 
} from '../types/database';

export class DatabaseService {
  constructor(private db: SQLiteDatabase) {}

  /**
   * TASK OPERATIONS
   */

  async createTask(input: TaskCreateInput): Promise<DatabaseResult<Task>> {
    try {
      // Validation - TDD Red -> Green implementation
      if (!input.title || input.title.trim() === '') {
        return { success: false, error: 'Task title cannot be empty' };
      }
      
      if (input.cycle_length < 3 || input.cycle_length > 180) {
        return { success: false, error: 'Cycle length must be between 3 and 180 days' };
      }

      const id = Crypto.randomUUID();
      const now = new Date().toISOString();
      const startDate = input.start_date || now.split('T')[0];
      
      console.log('Inserting task into database:', {
        id,
        title: input.title,
        cycle_length: input.cycle_length,
        visual_type: input.visual_type,
        start_date: startDate,
      });
      
      this.db.runSync(
        `INSERT INTO tasks (id, title, cycle_length, visual_type, start_date, archived, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, input.title, input.cycle_length, input.visual_type, startDate, false, now, now]
      );

      const task = this.db.getFirstSync<Task>(
        'SELECT * FROM tasks WHERE id = ?',
        [id]
      );
      
      if (!task) {
        return { success: false, error: 'Failed to create task' };
      }
      
      console.log('Task created successfully in database:', task);
      return { success: true, data: task };
    } catch (error) {
      console.error('Database error creating task:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown database error' 
      };
    }
  }

  async getTaskById(id: string): Promise<DatabaseResult<Task>> {
    try {
      const task = await this.db.getFirstAsync<Task>(
        'SELECT * FROM tasks WHERE id = ?',
        [id]
      );

      if (!task) {
        return { success: false, error: 'Task not found' };
      }

      return { success: true, data: task };
    } catch (error) {
      console.error('Error getting task by ID:', error);
      return { success: false, error: String(error) };
    }
  }

  async getActiveTasks(): Promise<DatabaseResult<Task[]>> {
    try {
      const tasks = await this.db.getAllAsync<Task>(
        'SELECT * FROM tasks WHERE archived = 0 ORDER BY created_at DESC'
      );

      return { success: true, data: tasks };
    } catch (error) {
      console.error('Error getting active tasks:', error);
      return { success: false, error: String(error) };
    }
  }

  async getTaskWithProgress(taskId: string): Promise<DatabaseResult<TaskWithProgress>> {
    try {
      const taskResult = await this.getTaskById(taskId);
      if (!taskResult.success || !taskResult.data) {
        return { success: false, error: 'Task not found' };
      }

      const task = taskResult.data;
      const progressEntries = await this.db.getAllAsync<Progress>(
        'SELECT * FROM progress WHERE task_id = ? ORDER BY date DESC',
        [taskId]
      );

      const achievedDays = progressEntries.length;
      const completionPercentage = Math.round((achievedDays / task.cycle_length) * 100);
      const currentStreak = this.calculateCurrentStreak(progressEntries);

      const taskWithProgress: TaskWithProgress = {
        ...task,
        progress_entries: progressEntries,
        achieved_days: achievedDays,
        current_streak: currentStreak,
        completion_percentage: Math.min(completionPercentage, 100)
      };

      return { success: true, data: taskWithProgress };
    } catch (error) {
      console.error('Error getting task with progress:', error);
      return { success: false, error: String(error) };
    }
  }

  async updateTask(id: string, updates: Partial<TaskCreateInput>): Promise<DatabaseResult<Task>> {
    try {
      const setClauses = [];
      const values = [];

      if (updates.title !== undefined) {
        setClauses.push('title = ?');
        values.push(updates.title);
      }
      if (updates.cycle_length !== undefined) {
        setClauses.push('cycle_length = ?');
        values.push(updates.cycle_length);
      }
      if (updates.visual_type !== undefined) {
        setClauses.push('visual_type = ?');
        values.push(updates.visual_type);
      }

      if (setClauses.length === 0) {
        return this.getTaskById(id);
      }

      values.push(id);

      await this.db.runAsync(
        `UPDATE tasks SET ${setClauses.join(', ')} WHERE id = ?`,
        values
      );

      return this.getTaskById(id);
    } catch (error) {
      console.error('Error updating task:', error);
      return { success: false, error: String(error) };
    }
  }

  async archiveTask(id: string): Promise<DatabaseResult<boolean>> {
    try {
      await this.db.runAsync(
        'UPDATE tasks SET archived = 1 WHERE id = ?',
        [id]
      );

      return { success: true, data: true };
    } catch (error) {
      console.error('Error archiving task:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * PROGRESS OPERATIONS
   */

  async recordProgress(input: ProgressCreateInput): Promise<DatabaseResult<Progress>> {
    try {
      const id = Crypto.randomUUID();
      const date = input.date || new Date().toISOString().split('T')[0];

      // Check if progress already exists for this task and date
      const existing = await this.db.getFirstAsync<Progress>(
        'SELECT * FROM progress WHERE task_id = ? AND date = ?',
        [input.task_id, date]
      );

      if (existing) {
        return { success: true, data: existing };
      }

      await this.db.runAsync(
        'INSERT INTO progress (id, task_id, date) VALUES (?, ?, ?)',
        [id, input.task_id, date]
      );

      const progress = await this.db.getFirstAsync<Progress>(
        'SELECT * FROM progress WHERE id = ?',
        [id]
      );

      return { success: true, data: progress! };
    } catch (error) {
      console.error('Error recording progress:', error);
      return { success: false, error: String(error) };
    }
  }

  async getProgressForTask(taskId: string): Promise<DatabaseResult<Progress[]>> {
    try {
      const progress = await this.db.getAllAsync<Progress>(
        'SELECT * FROM progress WHERE task_id = ? ORDER BY date DESC',
        [taskId]
      );

      return { success: true, data: progress };
    } catch (error) {
      console.error('Error getting progress for task:', error);
      return { success: false, error: String(error) };
    }
  }

  async deleteProgress(taskId: string, date: string): Promise<DatabaseResult<boolean>> {
    try {
      await this.db.runAsync(
        'DELETE FROM progress WHERE task_id = ? AND date = ?',
        [taskId, date]
      );

      return { success: true, data: true };
    } catch (error) {
      console.error('Error deleting progress:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * HELPER METHODS
   */

  private calculateCurrentStreak(progressEntries: Progress[]): number {
    if (progressEntries.length === 0) return 0;

    // Sort by date descending
    const sortedEntries = progressEntries
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let currentDate = new Date(today);

    for (const entry of sortedEntries) {
      const entryDate = entry.date;
      const expectedDate = currentDate.toISOString().split('T')[0];

      if (entryDate === expectedDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  async getStreakStats(taskId: string): Promise<DatabaseResult<{ current: number; longest: number }>> {
    try {
      const progressResult = await this.getProgressForTask(taskId);
      if (!progressResult.success) {
        return { success: false, error: progressResult.error };
      }

      const progressEntries = progressResult.data!;
      const currentStreak = this.calculateCurrentStreak(progressEntries);
      
      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 0;
      
      const sortedDates = progressEntries
        .map(p => p.date)
        .sort();

      for (let i = 0; i < sortedDates.length; i++) {
        if (i === 0) {
          tempStreak = 1;
        } else {
          const prevDate = new Date(sortedDates[i - 1]);
          const currDate = new Date(sortedDates[i]);
          const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

          if (dayDiff === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      return { 
        success: true, 
        data: { 
          current: currentStreak, 
          longest: longestStreak 
        } 
      };
    } catch (error) {
      console.error('Error calculating streak stats:', error);
      return { success: false, error: String(error) };
    }
  }
}