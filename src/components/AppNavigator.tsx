/**
 * AppNavigator Component
 * Handles navigation between OnBoarding and Home based on app state
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { OnBoardingFlow, OnBoardingData } from './onboarding/OnBoardingFlow';
import { useTasks } from '../services/hooks';
import { useSubscription } from '../services/useSubscription';
import { notificationService } from '../services/notifications';
import HomeScreen from './HomeScreen';

export function AppNavigator() {
  const { tasks, createTask, loading: tasksLoading } = useTasks();
  const { isPro } = useSubscription();
  const [showOnBoarding, setShowOnBoarding] = useState(false);

  // Show onboarding if no tasks exist
  useEffect(() => {
    if (!tasksLoading) {
      setShowOnBoarding(tasks.length === 0);
    }
  }, [tasksLoading, tasks.length]);

  const handleOnBoardingComplete = async (data: OnBoardingData) => {
    try {
      // Create the task with all onboarding data
      const taskInput = {
        ...data.task,
        visual_type: data.visualType,
      };

      console.log('Creating task with data:', taskInput);
      console.log('isPro status:', isPro);
      
      const createdTask = await createTask(taskInput, isPro);
      console.log('Task created successfully:', createdTask);

      // Set up notifications if enabled
      if (data.notifications.enabled && data.notifications.time && createdTask) {
        console.log('Setting up notifications:', data.notifications);
        try {
          await notificationService.scheduleTaskReminder({
            enabled: true,
            time: data.notifications.time,
            taskId: createdTask.id,
          });
          console.log('Notifications scheduled successfully');
        } catch (notifError) {
          console.error('Notification setup failed:', notifError);
          // Continue even if notification setup fails
        }
      }

      // Hide onboarding and show home
      setShowOnBoarding(false);
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        type: error?.constructor?.name,
      });
      
      // Show user-friendly error message
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to complete onboarding. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  if (tasksLoading) {
    return (
      <View style={styles.loadingContainer}>
        {/* Loading state handled by HomeScreen */}
      </View>
    );
  }

  if (showOnBoarding) {
    return (
      <OnBoardingFlow onComplete={handleOnBoardingComplete} />
    );
  }

  return <HomeScreen />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
  },
});