/**
 * LottieGrowthAnimation - High-quality Lottie-based plant growth animation
 * Replaces AnimatedSeedGrowth with Live2D quality animations
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Text,
} from 'react-native';
import LottieView from 'lottie-react-native';

export enum GrowthStage {
  SEED = 'seed',
  SPROUT = 'sprout',
  PLANT = 'plant',
  BLOOM = 'bloom',
}

interface LottieGrowthAnimationProps {
  progress?: number; // 0-100 representing growth percentage
  size?: number; // Animation size
  animationSource?: any; // Lottie animation JSON source
  onStageChange?: (stage: GrowthStage) => void;
  testID?: string;
}

export const LottieGrowthAnimation: React.FC<LottieGrowthAnimationProps> = ({
  progress = 0,
  size = 300,
  animationSource,
  onStageChange,
  testID = 'lottie-growth-animation',
}) => {
  const animationProgress = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef<LottieView>(null);
  
  // Calculate Lottie progress (0-1) from percentage (0-100)
  const targetProgress = Math.min(100, Math.max(0, progress)) / 100;
  
  // Determine growth stage based on progress
  const getStageFromProgress = (prog: number): GrowthStage => {
    if (prog <= 25) return GrowthStage.SEED;      // Days 1-15 (0-25%)
    if (prog <= 50) return GrowthStage.SPROUT;    // Days 16-30 (26-50%)
    if (prog <= 75) return GrowthStage.PLANT;     // Days 31-45 (51-75%)
    return GrowthStage.BLOOM;                      // Days 46-60 (76-100%)
  };
  
  const currentStage = getStageFromProgress(progress);

  // Animate progress changes smoothly
  useEffect(() => {
    Animated.timing(animationProgress, {
      toValue: targetProgress,
      duration: 1000,
      useNativeDriver: false, // Lottie progress can't use native driver
    }).start();
    
    // Notify stage changes
    onStageChange?.(currentStage);
  }, [targetProgress, currentStage]);

  // Default to sample animation if none provided
  const animationFile = animationSource || require('../../assets/animations/plant-growing-sample.json');

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        {
          width: size,
          height: size,
        },
      ]}
      accessibilityLabel={`Growth visualization: ${currentStage} stage at ${Math.round(progress)}%`}
      accessibilityRole="image"
    >
      <LottieView
        ref={lottieRef}
        source={animationFile}
        progress={animationProgress}
        style={styles.animation}
        resizeMode="contain"
        testID={`${testID}-lottie`}
      />
      
      {/* Stage indicator for development/testing */}
      {__DEV__ && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            Stage: {currentStage} ({Math.round(progress)}%)
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  debugInfo: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  debugText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
});

// Re-export GrowthStage for compatibility
export { GrowthStage as LottieGrowthStage };