/**
 * TaskSetup OnBoarding Component
 * First step: Task basic information (title, cycle length)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { SimpleSlider } from '../ui/SimpleSlider';
import { TaskCreateInput, VisualType } from '../../types/database';
import { Colors, Typography, Spacing } from '../../utils/theme';

interface TaskSetupProps {
  onNext: (taskData: Partial<TaskCreateInput>) => void;
}

export function TaskSetup({ onNext }: TaskSetupProps) {
  const [title, setTitle] = useState('');
  const [cycleLength, setCycleLength] = useState(30);
  const [titleError, setTitleError] = useState('');

  const validateTitle = (text: string): boolean => {
    const trimmedText = text.trim();
    
    if (trimmedText.length === 0) {
      setTitleError('');
      return false;
    }
    
    if (trimmedText.length > 100) {
      setTitleError('Title must be less than 100 characters');
      return false;
    }
    
    setTitleError('');
    return true;
  };

  const handleTitleChange = (text: string) => {
    setTitle(text);
    validateTitle(text);
  };

  const handleNext = () => {
    const trimmedTitle = title.trim();
    if (validateTitle(trimmedTitle)) {
      onNext({
        title: trimmedTitle,
        cycle_length: cycleLength,
        visual_type: VisualType.TREE, // Default visual type
      });
    }
  };

  const isFormValid = title.trim().length > 0 && titleError === '';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Your First Habit</Text>
          <Text style={styles.subtitle}>
            Start your journey with a simple daily habit
          </Text>
        </View>

        {/* Habit Name Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Habit Name</Text>
          <TextInput
            style={[styles.input, titleError ? styles.inputError : null]}
            placeholder="Enter habit name"
            placeholderTextColor={Colors.light.textSecondary}
            value={title}
            onChangeText={handleTitleChange}
            maxLength={100}
            accessibilityLabel="Habit name input"
            accessibilityHint="Enter the name of your daily habit"
          />
          {titleError ? (
            <Text style={styles.errorText}>{titleError}</Text>
          ) : null}
        </View>

        {/* Cycle Length Slider */}
        <View style={styles.section}>
          <Text style={styles.label}>Cycle Length</Text>
          <Text style={styles.cycleLengthDisplay}>{cycleLength} days</Text>
          
          <SimpleSlider
            style={styles.slider}
            minimumValue={3}
            maximumValue={180}
            value={cycleLength}
            onValueChange={(value) => setCycleLength(Math.round(value))}
            minimumTrackTintColor={Colors.primary}
            maximumTrackTintColor={Colors.light.border}
            testID="cycle-length-slider"
            accessibilityLabel="Cycle length slider"
            accessibilityHint={`Set cycle length from 3 to 180 days. Currently ${cycleLength} days`}
            accessibilityValue={{
              min: 3,
              max: 180,
              now: cycleLength,
            }}
          />
          
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>3 days</Text>
            <Text style={styles.sliderLabel}>180 days</Text>
          </View>
        </View>

        {/* Cycle Length Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 We recommend starting with 21-30 days for building new habits effectively.
          </Text>
        </View>
      </View>

      {/* Next Button */}
      <TouchableOpacity
        style={[styles.nextButton, !isFormValid && styles.nextButtonDisabled]}
        onPress={handleNext}
        disabled={!isFormValid}
        role="button"
        accessibilityLabel="Next"
        accessibilityHint="Proceed to next onboarding step"
        accessibilityState={{ disabled: !isFormValid }}
      >
        <Text style={[styles.nextButtonText, !isFormValid && styles.nextButtonTextDisabled]}>
          Next
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  cycleLengthDisplay: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderThumb: {
    backgroundColor: Colors.primary,
    width: 20,
    height: 20,
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  sliderLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  infoBox: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: Colors.light.border,
  },
  nextButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.background,
  },
  nextButtonTextDisabled: {
    color: Colors.light.textSecondary,
  },
});