/**
 * sendloop Custom Hooks
 * Business logic hooks for task and progress management
 */

import { useState, useEffect, useCallback } from 'react';
import { useDatabase } from '../database/provider';
import { 
  Task, 
  Progress, 
  TaskCreateInput, 
  TaskWithProgress, 
  VisualType 
} from '../types/database';

/**
 * Hook for managing tasks
 */
export function useTasks() {
  const database = useDatabase();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await database.getActiveTasks();
      if (result.success && result.data) {
        setTasks(result.data);
      } else {
        setError(result.error || 'Failed to load tasks');
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [database]);

  const createTask = useCallback(async (input: TaskCreateInput, isPro: boolean = false) => {
    // Free version limitation: only 1 active task allowed
    if (!isPro && tasks.length > 0) {
      // Archive existing tasks before creating new one
      for (const task of tasks) {
        await database.archiveTask(task.id);
      }
    }
    
    const result = await database.createTask(input);
    if (result.success) {
      await loadTasks(); // Refresh tasks list
      return result.data!;
    } else {
      throw new Error(result.error);
    }
  }, [database, loadTasks, tasks]);

  const updateTask = useCallback(async (id: string, updates: Partial<TaskCreateInput>) => {
    const result = await database.updateTask(id, updates);
    if (result.success) {
      await loadTasks(); // Refresh tasks list
      return result.data!;
    } else {
      throw new Error(result.error);
    }
  }, [database, loadTasks]);

  const archiveTask = useCallback(async (id: string) => {
    const result = await database.archiveTask(id);
    if (result.success) {
      await loadTasks(); // Refresh tasks list
      return true;
    } else {
      throw new Error(result.error);
    }
  }, [database, loadTasks]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    archiveTask,
    refetch: loadTasks
  };
}

/**
 * Hook for managing a specific task with progress
 */
export function useTask(taskId: string) {
  const database = useDatabase();
  const [task, setTask] = useState<TaskWithProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTask = useCallback(async () => {
    if (!taskId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await database.getTaskWithProgress(taskId);
      if (result.success && result.data) {
        setTask(result.data);
      } else {
        setError(result.error || 'Failed to load task');
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [database, taskId]);

  const recordProgress = useCallback(async (date?: string) => {
    if (!taskId) return;
    
    const result = await database.recordProgress({ task_id: taskId, date });
    if (result.success) {
      await loadTask(); // Refresh task data
      return result.data!;
    } else {
      throw new Error(result.error);
    }
  }, [database, taskId, loadTask]);

  const deleteProgress = useCallback(async (date: string) => {
    if (!taskId) return;
    
    const result = await database.deleteProgress(taskId, date);
    if (result.success) {
      await loadTask(); // Refresh task data
      return true;
    } else {
      throw new Error(result.error);
    }
  }, [database, taskId, loadTask]);

  const getStreakStats = useCallback(async () => {
    if (!taskId) return null;
    
    const result = await database.getStreakStats(taskId);
    return result.success ? result.data! : null;
  }, [database, taskId]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  return {
    task,
    loading,
    error,
    recordProgress,
    deleteProgress,
    getStreakStats,
    refetch: loadTask
  };
}

/**
 * Hook for managing progress entries
 */
export function useProgress(taskId?: string) {
  const database = useDatabase();
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProgress = useCallback(async () => {
    if (!taskId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await database.getProgressForTask(taskId);
      if (result.success && result.data) {
        setProgress(result.data);
      } else {
        setError(result.error || 'Failed to load progress');
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [database, taskId]);

  useEffect(() => {
    if (taskId) {
      loadProgress();
    }
  }, [loadProgress, taskId]);

  return {
    progress,
    loading,
    error,
    refetch: loadProgress
  };
}

/**
 * Hook for today's progress status
 */
export function useTodayProgress(taskId?: string) {
  const database = useDatabase();
  const [hasProgressToday, setHasProgressToday] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkTodayProgress = useCallback(async () => {
    if (!taskId) return;
    
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const result = await database.getProgressForTask(taskId);
      if (result.success && result.data) {
        const todayProgress = result.data.find(p => p.date === today);
        setHasProgressToday(!!todayProgress);
      }
    } catch (err) {
      console.error('Error checking today progress:', err);
    } finally {
      setLoading(false);
    }
  }, [database, taskId]);

  const recordTodayProgress = useCallback(async () => {
    if (!taskId) return;
    
    const today = new Date().toISOString().split('T')[0];
    const result = await database.recordProgress({ task_id: taskId, date: today });
    
    if (result.success) {
      setHasProgressToday(true);
      return result.data!;
    } else {
      throw new Error(result.error);
    }
  }, [database, taskId]);

  useEffect(() => {
    checkTodayProgress();
  }, [checkTodayProgress]);

  return {
    hasProgressToday,
    loading,
    recordTodayProgress,
    refetch: checkTodayProgress
  };
}