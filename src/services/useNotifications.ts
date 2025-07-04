/**
 * Notifications Hook
 * React hook for managing notification settings and permissions
 */

import { useState, useEffect, useCallback } from 'react';
import { notificationService, NotificationSettings } from './notifications';

export function useNotifications(taskId?: string) {
  const [hasPermissions, setHasPermissions] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Load permissions and settings
  const loadNotificationState = useCallback(async () => {
    setLoading(true);
    
    try {
      const permissions = await notificationService.hasPermissions();
      setHasPermissions(permissions);
      
      if (taskId) {
        const taskSettings = await notificationService.getTaskNotificationSettings(taskId);
        setSettings(taskSettings);
      }
    } catch (error) {
      console.error('Error loading notification state:', error);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  // Request permissions
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    const granted = await notificationService.requestPermissions();
    setHasPermissions(granted);
    return granted;
  }, []);

  // Update task notification settings
  const updateTaskNotification = useCallback(async (
    enabled: boolean, 
    time?: string
  ): Promise<boolean> => {
    if (!taskId) return false;
    
    const newSettings: NotificationSettings = {
      enabled,
      time: time || '09:00',
      taskId,
    };
    
    const success = await notificationService.updateTaskNotification(newSettings);
    if (success) {
      setSettings(newSettings);
    }
    
    return success;
  }, [taskId]);

  // Cancel task notifications
  const cancelTaskNotification = useCallback(async (): Promise<void> => {
    if (!taskId) return;
    
    await notificationService.cancelTaskReminder(taskId);
    setSettings(null);
  }, [taskId]);

  // Schedule task reminder
  const scheduleTaskReminder = useCallback(async (
    time: string
  ): Promise<string | null> => {
    if (!taskId) return null;
    
    const newSettings: NotificationSettings = {
      enabled: true,
      time,
      taskId,
    };
    
    const notificationId = await notificationService.scheduleTaskReminder(newSettings);
    if (notificationId) {
      setSettings(newSettings);
    }
    
    return notificationId;
  }, [taskId]);

  // Initialize on mount
  useEffect(() => {
    loadNotificationState();
  }, [loadNotificationState]);

  return {
    hasPermissions,
    settings,
    loading,
    requestPermissions,
    updateTaskNotification,
    cancelTaskNotification,
    scheduleTaskReminder,
    refresh: loadNotificationState,
  };
}