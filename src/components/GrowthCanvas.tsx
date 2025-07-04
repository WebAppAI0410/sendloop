/**
 * GrowthCanvas Component
 * Core visual component that displays growing visuals based on habit progress
 * Supports Tree, Garden, Pet, and Progress Bar visualizations
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { VisualType } from '../types/database';
import { Colors, Typography, Spacing } from '../utils/theme';

interface GrowthCanvasProps {
  visualType: VisualType;
  achievedDays: number;
  cycleLength: number;
  showGrowthAnimation?: boolean;
  testID?: string;
}

interface VisualStage {
  emoji: string;
  stageName: string;
  testID: string;
}

const { width: screenWidth } = Dimensions.get('window');

export function GrowthCanvas({
  visualType,
  achievedDays,
  cycleLength,
  showGrowthAnimation = false,
  testID = 'growth-canvas',
}: GrowthCanvasProps) {
  const [scaleAnim] = useState(new Animated.Value(1));

  // Calculate progress percentage (0-100)
  const calculateProgress = (): number => {
    if (cycleLength <= 0) return 0;
    const progress = Math.max(0, achievedDays) / cycleLength;
    return Math.min(100, Math.round(progress * 100));
  };

  const progressPercentage = calculateProgress();

  // Determine visual stage based on progress
  const getTreeStage = (progress: number): VisualStage => {
    if (progress <= 10) {
      return { emoji: '🌱', stageName: 'Seed', testID: 'tree-stage-seed' };
    } else if (progress <= 30) {
      return { emoji: '🌿', stageName: 'Sprout', testID: 'tree-stage-sprout' };
    } else if (progress <= 60) {
      return { emoji: '🌲', stageName: 'Young tree', testID: 'tree-stage-young' };
    } else if (progress <= 90) {
      return { emoji: '🌳', stageName: 'Mature tree', testID: 'tree-stage-mature' };
    } else {
      return { emoji: '🌸', stageName: 'Blooming tree', testID: 'tree-stage-blooming' };
    }
  };

  const getGardenStage = (progress: number): VisualStage => {
    if (progress <= 30) {
      return { emoji: '🪴', stageName: 'Soil', testID: 'garden-stage-soil' };
    } else if (progress <= 70) {
      return { emoji: '🌷', stageName: 'Single flower', testID: 'garden-stage-single' };
    } else {
      return { emoji: '🌻🌺', stageName: 'Full garden', testID: 'garden-stage-full' };
    }
  };

  const getPetStage = (progress: number): VisualStage => {
    if (progress <= 30) {
      return { emoji: '🥚', stageName: 'Egg', testID: 'pet-stage-egg' };
    } else if (progress <= 70) {
      return { emoji: '🐣', stageName: 'Hatching', testID: 'pet-stage-hatching' };
    } else {
      return { emoji: '🐱', stageName: 'Adult pet', testID: 'pet-stage-adult' };
    }
  };

  const getCurrentStage = (): VisualStage => {
    const safeVisualType = visualType ?? VisualType.TREE;
    
    switch (safeVisualType) {
      case VisualType.GARDEN:
        return getGardenStage(progressPercentage);
      case VisualType.PET:
        return getPetStage(progressPercentage);
      case VisualType.PROGRESS_BAR:
        return { emoji: '', stageName: 'Progress bar', testID: 'progress-bar-stage' };
      case VisualType.TREE:
      default:
        return getTreeStage(progressPercentage);
    }
  };

  const currentStage = getCurrentStage();

  // Growth animation effect
  useEffect(() => {
    if (showGrowthAnimation) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showGrowthAnimation, scaleAnim]);

  const renderTreeVisual = () => (
    <View style={styles.treeContainer} testID={currentStage.testID}>
      <Text style={styles.mainEmoji}>{currentStage.emoji}</Text>
      <View style={styles.ground} />
    </View>
  );

  const renderGardenVisual = () => (
    <View style={styles.gardenContainer} testID={currentStage.testID}>
      <View style={styles.gardenRow}>
        {currentStage.emoji.split('').map((emoji, index) => (
          <Text key={index} style={styles.gardenEmoji}>{emoji}</Text>
        ))}
      </View>
      <View style={styles.ground} />
    </View>
  );

  const renderPetVisual = () => (
    <View style={styles.petContainer} testID={currentStage.testID}>
      <Text style={styles.mainEmoji}>{currentStage.emoji}</Text>
      <View style={styles.petBase} />
    </View>
  );

  const renderProgressBarVisual = () => (
    <View style={styles.progressBarContainer}>
      <Text style={styles.progressTitle}>Progress</Text>
      <View style={styles.progressBarTrack}>
        <View
          testID="progress-bar-fill"
          style={[
            styles.progressBarFill,
            { width: `${progressPercentage}%` }
          ]}
        />
      </View>
      <Text style={styles.progressText}>{progressPercentage}%</Text>
      <Text style={styles.daysText}>{achievedDays} / {cycleLength} days</Text>
    </View>
  );

  const renderVisual = () => {
    const safeVisualType = visualType ?? VisualType.TREE;
    
    switch (safeVisualType) {
      case VisualType.GARDEN:
        return renderGardenVisual();
      case VisualType.PET:
        return renderPetVisual();
      case VisualType.PROGRESS_BAR:
        return renderProgressBarVisual();
      case VisualType.TREE:
      default:
        return renderTreeVisual();
    }
  };

  const accessibilityValue = `${progressPercentage}% progress, ${currentStage.stageName} stage`;

  return (
    <Animated.View
      style={[
        styles.container,
        showGrowthAnimation && { transform: [{ scale: scaleAnim }] }
      ]}
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel="Growth visualization"
      accessibilityValue={{ text: accessibilityValue }}
    >
      {renderVisual()}
      
      {visualType !== VisualType.PROGRESS_BAR && (
        <View style={styles.stageInfo}>
          <Text style={styles.stageName}>{currentStage.stageName}</Text>
          <Text style={styles.stageProgress}>{progressPercentage}% Complete</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: screenWidth - (Spacing.lg * 2),
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    padding: Spacing.lg,
    marginVertical: Spacing.md,
  },
  
  // Tree visual styles
  treeContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '80%',
  },
  mainEmoji: {
    fontSize: 64,
    marginBottom: Spacing.sm,
  },
  ground: {
    width: '80%',
    height: 8,
    backgroundColor: '#8B4513',
    borderRadius: 4,
  },
  
  // Garden visual styles
  gardenContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '80%',
  },
  gardenRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: Spacing.sm,
  },
  gardenEmoji: {
    fontSize: 48,
    marginHorizontal: Spacing.xs,
  },
  
  // Pet visual styles
  petContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '80%',
  },
  petBase: {
    width: 60,
    height: 4,
    backgroundColor: Colors.light.border,
    borderRadius: 2,
    marginTop: Spacing.sm,
  },
  
  // Progress bar visual styles
  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  progressBarTrack: {
    width: '100%',
    height: 16,
    backgroundColor: Colors.light.border,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  progressText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  daysText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  
  // Common info styles
  stageInfo: {
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  stageName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  stageProgress: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
});