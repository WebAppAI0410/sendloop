/**
 * OnBoardingFlow - Main coordinator for the 3-step onboarding process
 * Manages navigation between TaskSetup -> NotificationSetup -> VisualSetup
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TaskSetup } from './TaskSetup';
import { NotificationSetup } from './NotificationSetup';
import { VisualSetup } from './VisualSetup';
import { TaskCreateInput, VisualType } from '../../types/database';

interface OnBoardingFlowProps {
  onComplete: (onboardingData: OnBoardingData) => void;
}

export interface OnBoardingData {
  task: Partial<TaskCreateInput>;
  notifications: {
    enabled: boolean;
    time: string | null;
  };
  visualType: VisualType;
}

enum OnBoardingStep {
  TASK_SETUP = 0,
  NOTIFICATION_SETUP = 1,
  VISUAL_SETUP = 2,
}

export function OnBoardingFlow({ onComplete }: OnBoardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnBoardingStep>(OnBoardingStep.TASK_SETUP);
  const [onboardingData, setOnboardingData] = useState<Partial<OnBoardingData>>({});

  const handleTaskSetupNext = (taskData: Partial<TaskCreateInput>) => {
    setOnboardingData(prev => ({
      ...prev,
      task: taskData,
    }));
    setCurrentStep(OnBoardingStep.NOTIFICATION_SETUP);
  };

  const handleNotificationSetupNext = (notificationData: { enabled: boolean; time: string | null }) => {
    setOnboardingData(prev => ({
      ...prev,
      notifications: notificationData,
    }));
    setCurrentStep(OnBoardingStep.VISUAL_SETUP);
  };

  const handleNotificationSetupBack = () => {
    setCurrentStep(OnBoardingStep.TASK_SETUP);
  };

  const handleVisualSetupNext = (visualData: { visualType: VisualType }) => {
    const completeData: OnBoardingData = {
      task: onboardingData.task!,
      notifications: onboardingData.notifications!,
      visualType: visualData.visualType,
    };
    onComplete(completeData);
  };

  const handleVisualSetupBack = () => {
    setCurrentStep(OnBoardingStep.NOTIFICATION_SETUP);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case OnBoardingStep.TASK_SETUP:
        return (
          <TaskSetup onNext={handleTaskSetupNext} />
        );
      case OnBoardingStep.NOTIFICATION_SETUP:
        return (
          <NotificationSetup 
            onNext={handleNotificationSetupNext}
            onBack={handleNotificationSetupBack}
          />
        );
      case OnBoardingStep.VISUAL_SETUP:
        return (
          <VisualSetup 
            onNext={handleVisualSetupNext}
            onBack={handleVisualSetupBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderCurrentStep()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});