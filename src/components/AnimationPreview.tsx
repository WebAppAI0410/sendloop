/**
 * AnimationPreview - Development tool to preview the full growth animation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { LottieGrowthAnimation } from './animations/LottieGrowthAnimation';
import plantGrowthAnimation from '../assets/animations/plant-growth-high-quality.json';
import { Colors, Typography, Spacing } from '../utils/theme';

const { width } = Dimensions.get('window');

interface AnimationPreviewProps {
  onClose?: () => void;
}

export const AnimationPreview: React.FC<AnimationPreviewProps> = ({ onClose }) => {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStage, setCurrentStage] = useState('seed');

  // Auto-play animation
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 1;
        });
      }, 50); // 5 seconds total (100 steps * 50ms)

      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (progress >= 100) {
      setProgress(0);
    }
    setIsPlaying(!isPlaying);
  };

  const getDayFromProgress = (prog: number) => Math.round((prog / 100) * 60);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {onClose && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>Animation Preview</Text>
        <Text style={styles.subtitle}>
          Day {getDayFromProgress(progress)} of 60 - {currentStage.toUpperCase()}
        </Text>
      </View>

      <View style={styles.animationContainer}>
        <LottieGrowthAnimation
          progress={progress}
          size={width - (Spacing.lg * 4)}
          animationSource={plantGrowthAnimation}
          onStageChange={setCurrentStage}
        />
      </View>

      <View style={styles.controls}>
        <Text style={styles.progressLabel}>Progress: {Math.round(progress)}%</Text>
        
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          value={progress}
          onValueChange={setProgress}
          minimumTrackTintColor={Colors.primary}
          maximumTrackTintColor="#E0E0E0"
          thumbTintColor={Colors.primary}
        />

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.playButton]}
            onPress={handlePlayPause}
          >
            <Text style={styles.buttonText}>
              {isPlaying ? 'PAUSE' : progress >= 100 ? 'REPLAY' : 'PLAY'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={() => {
              setProgress(0);
              setIsPlaying(false);
            }}
          >
            <Text style={styles.buttonText}>RESET</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickButtons}>
          <Text style={styles.quickLabel}>Quick Jump:</Text>
          <View style={styles.quickButtonRow}>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => setProgress(0)}
            >
              <Text style={styles.quickButtonText}>Day 1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => setProgress(25)}
            >
              <Text style={styles.quickButtonText}>Day 15</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => setProgress(50)}
            >
              <Text style={styles.quickButtonText}>Day 30</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => setProgress(75)}
            >
              <Text style={styles.quickButtonText}>Day 45</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => setProgress(100)}
            >
              <Text style={styles.quickButtonText}>Day 60</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
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
  },
  animationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    padding: Spacing.lg,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  progressLabel: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: Spacing.md,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  button: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 25,
    minWidth: 100,
  },
  playButton: {
    backgroundColor: Colors.primary,
  },
  resetButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
  },
  quickButtons: {
    marginTop: Spacing.md,
  },
  quickLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.sm,
  },
  quickButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: '#E0E0E0',
    borderRadius: 15,
  },
  quickButtonText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.text,
  },
  closeButton: {
    position: 'absolute',
    left: Spacing.lg,
    top: 0,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
});