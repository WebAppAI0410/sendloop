/**
 * Notification Service
 * Handles local push notifications for habit reminders
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock Notifications for development (replace with expo-notifications in production)
const Notifications = {
  setNotificationHandler: (handler: any) => {},
  getPermissionsAsync: async () => ({ status: 'granted' }),
  requestPermissionsAsync: async () => ({ status: 'granted' }),
  setNotificationChannelAsync: async (id: string, options: any) => {},
  scheduleNotificationAsync: async (options: any) => 'mock-notification-id',
  cancelScheduledNotificationAsync: async (id: string) => {},
  cancelAllScheduledNotificationsAsync: async () => {},
  getAllScheduledNotificationsAsync: async () => [],
  AndroidImportance: { HIGH: 'high' },
};

export interface NotificationSettings {
  enabled: boolean;
  time: string; // HH:MM format (24-hour)
  taskId: string;
}

const NOTIFICATION_SETTINGS_KEY = 'notification_settings';
const NOTIFICATION_PERMISSION_KEY = 'notification_permission_granted';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  
  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Notification permission denied');
        return false;
      }

      // Store permission status
      await AsyncStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'true');
      
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Habit Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#58A16C',
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Check if notification permissions are granted
   */
  async hasPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  }

  /**
   * Schedule daily notification for a task
   */
  async scheduleTaskReminder(settings: NotificationSettings): Promise<string | null> {
    try {
      const hasPermission = await this.hasPermissions();
      if (!hasPermission) {
        console.log('No notification permission, cannot schedule reminder');
        return null;
      }

      // Parse time (HH:MM)
      const [hours, minutes] = settings.time.split(':').map(Number);
      
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        throw new Error('Invalid time format');
      }

      // Cancel existing notifications for this task
      await this.cancelTaskReminder(settings.taskId);

      // Schedule daily notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌱 Time to grow!',
          body: 'Don\'t forget to complete your daily habit.',
          data: { 
            taskId: settings.taskId,
            type: 'habit_reminder'
          },
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });

      // Save notification settings
      await this.saveNotificationSettings(settings);

      console.log(`Scheduled daily reminder at ${hours}:${minutes} for task ${settings.taskId}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  /**
   * Cancel task reminder notification
   */
  async cancelTaskReminder(taskId: string): Promise<void> {
    try {
      // Get all scheduled notifications
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      // Find and cancel notifications for this task
      for (const notification of scheduledNotifications) {
        const data = notification.content.data as any;
        if (data?.taskId === taskId) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
          console.log(`Cancelled notification ${notification.identifier} for task ${taskId}`);
        }
      }

      // Remove from settings
      await this.removeNotificationSettings(taskId);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.removeItem(NOTIFICATION_SETTINGS_KEY);
      console.log('Cancelled all notifications');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  /**
   * Save notification settings to storage
   */
  private async saveNotificationSettings(settings: NotificationSettings): Promise<void> {
    try {
      const existingSettings = await this.getNotificationSettings();
      const updatedSettings = {
        ...existingSettings,
        [settings.taskId]: settings,
      };
      
      await AsyncStorage.setItem(
        NOTIFICATION_SETTINGS_KEY, 
        JSON.stringify(updatedSettings)
      );
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  /**
   * Remove notification settings for a task
   */
  private async removeNotificationSettings(taskId: string): Promise<void> {
    try {
      const existingSettings = await this.getNotificationSettings();
      delete existingSettings[taskId];
      
      await AsyncStorage.setItem(
        NOTIFICATION_SETTINGS_KEY, 
        JSON.stringify(existingSettings)
      );
    } catch (error) {
      console.error('Error removing notification settings:', error);
    }
  }

  /**
   * Get all notification settings
   */
  async getNotificationSettings(): Promise<Record<string, NotificationSettings>> {
    try {
      const settingsJson = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      return settingsJson ? JSON.parse(settingsJson) : {};
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return {};
    }
  }

  /**
   * Get notification settings for a specific task
   */
  async getTaskNotificationSettings(taskId: string): Promise<NotificationSettings | null> {
    try {
      const allSettings = await this.getNotificationSettings();
      return allSettings[taskId] || null;
    } catch (error) {
      console.error('Error getting task notification settings:', error);
      return null;
    }
  }

  /**
   * Update notification settings for a task
   */
  async updateTaskNotification(settings: NotificationSettings): Promise<boolean> {
    try {
      if (settings.enabled) {
        const notificationId = await this.scheduleTaskReminder(settings);
        return notificationId !== null;
      } else {
        await this.cancelTaskReminder(settings.taskId);
        return true;
      }
    } catch (error) {
      console.error('Error updating task notification:', error);
      return false;
    }
  }

  /**
   * Handle notification response (when user taps notification)
   */
  async handleNotificationResponse(response: any): Promise<void> {
    try {
      const data = response.notification?.request?.content?.data as any;
      
      if (data?.type === 'habit_reminder' && data?.taskId) {
        // TODO: Navigate to specific task or mark as completed
        console.log(`User tapped reminder for task: ${data.taskId}`);
      }
    } catch (error) {
      console.error('Error handling notification response:', error);
    }
  }

  /**
   * Get notification schedule info for debugging
   */
  async getScheduledNotificationsInfo(): Promise<any[]> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      return scheduledNotifications.map(notification => ({
        id: notification.identifier,
        title: notification.content.title,
        body: notification.content.body,
        trigger: notification.trigger,
        data: notification.content.data,
      }));
    } catch (error) {
      console.error('Error getting scheduled notifications info:', error);
      return [];
    }
  }
}

// Singleton instance
export const notificationService = new NotificationService();