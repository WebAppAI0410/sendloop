/**
 * VisualSetup OnBoarding Component
 * Third step: Visual type selection for progress tracking
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { VisualType } from '../../types/database';
import { useSubscription } from '../../services/useSubscription';
import { Colors, Typography, Spacing } from '../../utils/theme';

interface VisualSetupProps {
  onNext: (visualData: {
    visualType: VisualType;
  }) => void;
  onBack: () => void;
}

interface VisualOption {
  type: VisualType;
  title: string;
  description: string;
  emoji: string;
  stages: string;
}

const visualOptions: VisualOption[] = [
  {
    type: VisualType.TREE,
    title: 'Growing Tree',
    description: 'Watch your tree grow with each completed day',
    emoji: '🌳',
    stages: 'Growth Stages: 🌱 → 🌿 → 🌳',
  },
  {
    type: VisualType.GARDEN,
    title: 'Garden',
    description: 'Cultivate a beautiful garden over time',
    emoji: '🌷',
    stages: 'Flowers bloom: 🌷 → 🌻 → 🌺',
  },
  {
    type: VisualType.PET,
    title: 'Virtual Pet',
    description: 'Care for your virtual pet through consistency',
    emoji: '🐱',
    stages: 'Pet grows: 🥚 → 🐣 → 🐱',
  },
  {
    type: VisualType.PROGRESS_BAR,
    title: 'Progress Bar',
    description: 'Track your progress with a simple bar',
    emoji: '📊',
    stages: 'Bar fills: ▁▁▁ → ▁▃▁ → ▃▅▇',
  },
];

export function VisualSetup({ onNext, onBack }: VisualSetupProps) {
  const [selectedType, setSelectedType] = useState<VisualType>(VisualType.TREE);
  const { isPro, featureFlags } = useSubscription();

  const handleFinish = () => {
    onNext({
      visualType: selectedType,
    });
  };

  const renderVisualPreview = (type: VisualType) => {
    switch (type) {
      case VisualType.TREE:
        return (
          <View testID="visual-preview-tree" style={styles.previewContainer}>
            <View style={styles.stageRow}>
              <Text style={styles.stageEmoji}>🌱</Text>
              <Text style={styles.stageEmoji}>🌿</Text>
              <Text style={styles.stageEmoji}>🌳</Text>
            </View>
          </View>
        );
      case VisualType.GARDEN:
        return (
          <View testID="visual-preview-garden" style={styles.previewContainer}>
            <View style={styles.stageRow}>
              <Text style={styles.stageEmoji}>🌷</Text>
              <Text style={styles.stageEmoji}>🌻</Text>
              <Text style={styles.stageEmoji}>🌺</Text>
            </View>
          </View>
        );
      case VisualType.PET:
        return (
          <View testID="visual-preview-pet" style={styles.previewContainer}>
            <View style={styles.stageRow}>
              <Text style={styles.stageEmoji}>🥚</Text>
              <Text style={styles.stageEmoji}>🐣</Text>
              <Text style={styles.stageEmoji}>🐱</Text>
            </View>
          </View>
        );
      case VisualType.PROGRESS_BAR:
        return (
          <View testID="visual-preview-progress" style={styles.previewContainer}>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarTrack}>
                <View 
                  testID="progress-bar-fill"
                  style={[styles.progressBarFill, { width: '60%' }]} 
                />
              </View>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  // Filter visual options based on subscription
  const availableOptions = isPro ? visualOptions : visualOptions.filter(option => option.type === VisualType.TREE);
  const selectedOption = availableOptions.find(option => option.type === selectedType);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Growth Visual</Text>
          <Text style={styles.subtitle}>
            Select how you want to visualize your progress
          </Text>
        </View>

        {/* Visual Options */}
        <View style={styles.optionsContainer}>
          {availableOptions.map((option) => (
            <TouchableOpacity
              key={option.type}
              testID={`visual-option-${option.type === VisualType.TREE ? 'tree' : 
                option.type === VisualType.GARDEN ? 'garden' :
                option.type === VisualType.PET ? 'pet' : 'progress'}`}
              style={[
                styles.optionCard,
                selectedType === option.type && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedType(option.type)}
              accessibilityRole="radio"
              accessibilityLabel={`Select ${option.type === VisualType.TREE ? 'tree' : 
                option.type === VisualType.GARDEN ? 'garden' :
                option.type === VisualType.PET ? 'pet' : 'progress'} visual`}
              accessibilityHint={`Choose ${option.title.toLowerCase()} as your progress visualization`}
              accessibilityState={{ selected: selectedType === option.type }}
            >
              <Text style={styles.optionEmoji}>{option.emoji}</Text>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Visual Preview */}
        <View style={styles.previewSection}>
          <Text style={styles.previewTitle}>Preview</Text>
          {renderVisualPreview(selectedType)}
          
          {selectedOption && (
            <Text style={styles.stagesInfo}>{selectedOption.stages}</Text>
          )}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Don't worry! You can change your visual type anytime in settings.
          </Text>
        </View>

        {/* Pro Upgrade Prompt for Free Users */}
        {!isPro && (
          <View style={styles.proPrompt}>
            <Text style={styles.proPromptTitle}>🌟 Unlock More Visuals</Text>
            <Text style={styles.proPromptText}>
              Upgrade to sendloop Pro to access Garden, Pet, and Progress Bar visualizations!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          role="button"
          accessibilityLabel="Back"
          accessibilityHint="Go back to previous step"
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.finishButton}
          onPress={handleFinish}
          role="button"
          accessibilityLabel="Finish Setup"
          accessibilityHint="Complete onboarding and create your habit"
        >
          <Text style={styles.finishButtonText}>Finish Setup</Text>
        </TouchableOpacity>
      </View>
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
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.xl,
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
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  optionCard: {
    width: '48%',
    backgroundColor: Colors.light.surface,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
    minHeight: 120,
  },
  optionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10', // 10% opacity
  },
  optionEmoji: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  optionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  optionDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
  previewSection: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  previewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    marginBottom: Spacing.sm,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: 120,
  },
  stageEmoji: {
    fontSize: 24,
  },
  progressBarContainer: {
    width: 120,
    alignItems: 'center',
  },
  progressBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.light.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  stagesInfo: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  infoBox: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
    marginBottom: Spacing.lg,
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
  navigationContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  backButton: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  finishButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  finishButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.background,
  },
  proPrompt: {
    backgroundColor: Colors.primary + '15', // 15% opacity
    borderRadius: 12,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  proPromptTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  proPromptText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.text,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
});