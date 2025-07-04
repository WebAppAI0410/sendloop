/**
 * sendloop Home Screen
 * Main habit tracking interface with growth visual and seed button
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SeedButton } from './SeedButton';
import { GrowthCanvas } from './GrowthCanvas';
import { AnimatedSeedGrowth } from './animations/AnimatedSeedGrowth';
import { LottieGrowthAnimation } from './animations/LottieGrowthAnimation';
import plantGrowthAnimation from '../assets/animations/plant-growth-high-quality.json';
import { useTasks, useTask, useTodayProgress } from '../services/hooks';
import { useSubscription } from '../services/useSubscription';
import { VisualType } from '../types/database';
import { Colors, Typography, Spacing } from '../utils/theme';
import { useDatabase } from '../database/provider';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { tasks, loading: tasksLoading } = useTasks();
  const { isPro } = useSubscription();
  const db = useDatabase();
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  
  // Get current active task (Free version supports only 1 task)
  const currentTask = tasks.length > 0 ? tasks[0] : null;
  
  // Use task-specific hooks
  const { task: taskWithProgress, loading: taskLoading } = useTask(currentTask?.id || '');
  const { hasProgressToday, recordTodayProgress } = useTodayProgress(currentTask?.id || '');

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

  // Development only - Reset function
  const handleResetData = async () => {
    if (!currentTask) return;
    
    Alert.alert(
      'Reset App Data',
      'This will delete all tasks and progress. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await db.archiveTask(currentTask.id);
              // In React Native, we can't reload the window
              // The UI will update automatically via the hooks
              Alert.alert('Success', 'App data has been reset. The app will now show the onboarding screen.');
            } catch (error) {
              console.error('Failed to reset data:', error);
              Alert.alert('Error', 'Failed to reset app data');
            }
          }
        }
      ]
    );
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
  
  // Calculate animation progress for daily growth (0-100% over cycle)
  const animationProgress = Math.min(100, Math.max(0, (achievedDays / cycleLength) * 100));
  
  // Feature flag to switch between animation implementations
  const useLottieAnimation = true; // Set to true to use Lottie, false for SVG

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{currentTask?.title || 'sendloop'}</Text>
        <Text style={styles.subtitle}>
          Day {achievedDays} of {cycleLength}
        </Text>
        
        {/* Development Reset Button */}
        {__DEV__ && (
          <TouchableOpacity 
            style={styles.resetButton} 
            onPress={handleResetData}
          >
            <Text style={styles.resetButtonText}>Reset App</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Growth Visualization */}
      <View style={styles.growthCanvas}>
        {(currentTask?.visual_type || VisualType.TREE) === VisualType.TREE ? (
          useLottieAnimation ? (
            <LottieGrowthAnimation
              progress={animationProgress}
              size={width - (Spacing.lg * 4)}
              animationSource={plantGrowthAnimation}
              onStageChange={(stage) => {
                console.log('Growth stage changed:', stage);
              }}
            />
          ) : (
            <AnimatedSeedGrowth
              progress={animationProgress}
              size={width - (Spacing.lg * 4)}
              showParticles={achievedDays > 0}
            />
          )
        ) : (
          <GrowthCanvas
            visualType={currentTask?.visual_type || VisualType.TREE}
            achievedDays={achievedDays}
            cycleLength={cycleLength}
            showGrowthAnimation={false}
          />
        )}
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

      {/* Simple Progress Indicator */}
      <View style={styles.progressSection}>
        <Text style={styles.progressText}>
          {Math.round(progress)}% Complete
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
    paddingBottom: Spacing.xl,
  },
  progressText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
  },
  resetButton: {
    position: 'absolute',
    top: 0,
    right: 20,
    backgroundColor: '#FF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
});