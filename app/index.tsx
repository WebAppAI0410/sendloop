/**
 * sendloop Home Screen
 * Main habit tracking interface with growth visual and seed button
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
} from 'react-native';
import { SeedButton } from '../src/components/SeedButton';
import { ProgressRing } from '../src/components/ProgressRing';
import { useTasks, useTask, useTodayProgress } from '../src/services/hooks';
import { TaskCreateInput, VisualType } from '../src/types/database';
import { Colors, Typography, Spacing } from '../src/utils/theme';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { tasks, createTask, loading: tasksLoading } = useTasks();
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  
  // Get current active task (Free version supports only 1 task)
  const currentTask = tasks.length > 0 ? tasks[0] : null;
  
  // Use task-specific hooks
  const { task: taskWithProgress, loading: taskLoading } = useTask(currentTask?.id || '');
  const { hasProgressToday, recordTodayProgress } = useTodayProgress(currentTask?.id || '');

  // Create initial task if none exists
  useEffect(() => {
    if (!tasksLoading && tasks.length === 0) {
      createInitialTask();
    }
  }, [tasksLoading, tasks.length]);

  const createInitialTask = async () => {
    try {
      const initialTask: TaskCreateInput = {
        title: 'My First Habit',
        cycle_length: 30,
        visual_type: VisualType.TREE,
      };
      
      await createTask(initialTask);
    } catch (error) {
      console.error('Failed to create initial task:', error);
    }
  };

  const handleSeedButtonPress = async () => {
    if (!currentTask || hasProgressToday) return;

    try {
      await recordTodayProgress();
      Alert.alert(
        '🌱 Great Job!',
        'Your progress has been recorded for today.',
        [{ text: 'Continue', style: 'default' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to record progress. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const getMotivationalQuote = (progress: number): string => {
    if (progress >= 90) return 'Almost there! You\'re doing amazing! 🎉';
    if (progress >= 60) return 'Great progress! Keep it up! 💪';
    if (progress >= 30) return 'You\'re building momentum! 🚀';
    return 'Every journey begins with a single step. 🌱';
  };

  if (tasksLoading || taskLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const progress = taskWithProgress?.completion_percentage || 0;
  const achievedDays = taskWithProgress?.achieved_days || 0;
  const cycleLength = currentTask?.cycle_length || 30;
  const currentStreak = taskWithProgress?.current_streak || 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{currentTask?.title || 'sendloop'}</Text>
        <Text style={styles.subtitle}>
          Day {achievedDays} of {cycleLength}
        </Text>
      </View>

      {/* Growth Canvas Placeholder */}
      <View style={styles.growthCanvas}>
        <View style={styles.visualPlaceholder}>
          <Text style={styles.visualText}>🌳</Text>
          <Text style={styles.visualSubtext}>Growth Visual</Text>
          <Text style={styles.visualDescription}>
            Frame {Math.min(achievedDays, 180)} of 180
          </Text>
        </View>
      </View>

      {/* Seed Button */}
      <View style={styles.buttonSection}>
        <SeedButton
          onPress={handleSeedButtonPress}
          completed={hasProgressToday}
          disabled={hasProgressToday}
          size={140}
        />
        
        <Text style={styles.buttonLabel}>
          {hasProgressToday ? 'Completed Today!' : 'TAP TO GROW'}
        </Text>
      </View>

      {/* Progress Ring */}
      <View style={styles.progressSection}>
        <ProgressRing
          progress={progress}
          size={120}
          strokeWidth={10}
          color={Colors.primary}
        />
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentStreak}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{achievedDays}</Text>
            <Text style={styles.statLabel}>Days Completed</Text>
          </View>
        </View>
      </View>

      {/* Motivational Quote */}
      <View style={styles.quoteSection}>
        <Text style={styles.quote}>
          {getMotivationalQuote(progress)}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.light.textSecondary,
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  growthCanvas: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  visualPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.7,
    height: width * 0.5,
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
  },
  visualText: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  visualSubtext: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  visualDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  buttonSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  buttonLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.textSecondary,
    marginTop: Spacing.md,
    letterSpacing: 1,
  },
  progressSection: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
    marginTop: Spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
  quoteSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  quote: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },
});
