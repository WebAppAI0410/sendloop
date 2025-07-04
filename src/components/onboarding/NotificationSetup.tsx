/**
 * NotificationSetup OnBoarding Component
 * Second step: Notification preferences (enable/disable, time selection)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
} from 'react-native';
// Using custom time picker to avoid external dependencies
import { Colors, Typography, Spacing } from '../../utils/theme';

interface NotificationSetupProps {
  onNext: (notificationData: {
    enabled: boolean;
    time: string | null;
  }) => void;
  onBack: () => void;
}

export function NotificationSetup({ onNext, onBack }: NotificationSetupProps) {
  const [enabled, setEnabled] = useState(true);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Initialize default time to 9:00 AM
  React.useEffect(() => {
    const defaultTime = new Date();
    defaultTime.setHours(9, 0, 0, 0);
    setSelectedTime(defaultTime);
  }, []);

  const formatTimeDisplay = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const formatTimeStorage = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setSelectedTime(selectedDate);
    }
  };

  const handleTimePickerPress = () => {
    if (!enabled) return;
    setShowTimePicker(true);
  };

  const handleTimePickerConfirm = () => {
    setShowTimePicker(false);
  };

  const handleNext = () => {
    onNext({
      enabled,
      time: enabled ? formatTimeStorage(selectedTime) : null,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Set Daily Reminder</Text>
          <Text style={styles.subtitle}>
            When would you like to be reminded?
          </Text>
        </View>

        {/* Notification Toggle */}
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Enable Daily Reminders</Text>
            <Switch
              testID="notification-enable-switch"
              value={enabled}
              onValueChange={setEnabled}
              trackColor={{ false: Colors.light.border, true: Colors.primary }}
              thumbColor={enabled ? Colors.light.background : Colors.light.textSecondary}
              accessibilityLabel="Enable daily reminders"
              accessibilityValue={{ text: enabled ? 'Notifications enabled' : 'Notifications disabled' }}
            />
          </View>
        </View>

        {/* Time Picker Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Reminder Time</Text>
          
          {enabled ? (
            <TouchableOpacity
              style={styles.timePickerButton}
              onPress={handleTimePickerPress}
              disabled={!enabled}
              testID="time-picker-button"
              accessibilityLabel="Select reminder time"
              accessibilityHint={`Current time is ${formatTimeDisplay(selectedTime)}`}
            >
              <Text style={styles.timeDisplayText}>
                {formatTimeDisplay(selectedTime)}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.timePickerButton, styles.timePickerDisabled]}>
              <Text style={styles.timeDisabledText}>
                Notifications disabled
              </Text>
            </View>
          )}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Daily reminders help maintain consistency. You can change this anytime in settings.
          </Text>
        </View>
      </View>

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
          style={styles.nextButton}
          onPress={handleNext}
          role="button"
          accessibilityLabel="Next"
          accessibilityHint="Proceed to next onboarding step"
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="slide"
        testID="time-picker-modal"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Time</Text>
            
            <View testID="time-picker" style={styles.customTimePicker}>
              {/* Hour Selection */}
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnLabel}>Hour</Text>
                {[...Array(12)].map((_, i) => {
                  const hour = i + 1;
                  const isSelected = (selectedTime.getHours() % 12 || 12) === hour;
                  return (
                    <TouchableOpacity
                      key={hour}
                      style={[styles.timeOption, isSelected && styles.timeOptionSelected]}
                      onPress={() => {
                        const newTime = new Date(selectedTime);
                        const currentHours = selectedTime.getHours();
                        const isPM = currentHours >= 12;
                        newTime.setHours(isPM ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour));
                        setSelectedTime(newTime);
                        handleTimeChange({ nativeEvent: { timestamp: newTime.getTime() } });
                      }}
                    >
                      <Text style={[styles.timeOptionText, isSelected && styles.timeOptionTextSelected]}>
                        {hour}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              
              {/* Minute Selection */}
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnLabel}>Min</Text>
                {['00', '15', '30', '45'].map((minute) => {
                  const isSelected = selectedTime.getMinutes() === parseInt(minute);
                  return (
                    <TouchableOpacity
                      key={minute}
                      style={[styles.timeOption, isSelected && styles.timeOptionSelected]}
                      onPress={() => {
                        const newTime = new Date(selectedTime);
                        newTime.setMinutes(parseInt(minute));
                        setSelectedTime(newTime);
                        handleTimeChange({ nativeEvent: { timestamp: newTime.getTime() } });
                      }}
                    >
                      <Text style={[styles.timeOptionText, isSelected && styles.timeOptionTextSelected]}>
                        {minute}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              
              {/* AM/PM Selection */}
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnLabel}>AM/PM</Text>
                {['AM', 'PM'].map((period) => {
                  const isSelected = (selectedTime.getHours() >= 12) === (period === 'PM');
                  return (
                    <TouchableOpacity
                      key={period}
                      style={[styles.timeOption, isSelected && styles.timeOptionSelected]}
                      onPress={() => {
                        const newTime = new Date(selectedTime);
                        const currentHours = selectedTime.getHours();
                        if (period === 'AM' && currentHours >= 12) {
                          newTime.setHours(currentHours - 12);
                        } else if (period === 'PM' && currentHours < 12) {
                          newTime.setHours(currentHours + 12);
                        }
                        setSelectedTime(newTime);
                        handleTimeChange({ nativeEvent: { timestamp: newTime.getTime() } });
                      }}
                    >
                      <Text style={[styles.timeOptionText, isSelected && styles.timeOptionTextSelected]}>
                        {period}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleTimePickerConfirm}
              testID="time-picker-confirm"
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  label: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  timePickerButton: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  timePickerDisabled: {
    backgroundColor: Colors.light.border,
    opacity: 0.6,
  },
  timeDisplayText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  timeDisabledText: {
    fontSize: Typography.fontSize.base,
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
  nextButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.background,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: Spacing.lg,
    margin: Spacing.lg,
    alignItems: 'center',
    minWidth: 300,
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  customTimePicker: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: 280,
    height: 200,
  },
  timeColumn: {
    flex: 1,
    alignItems: 'center',
  },
  timeColumnLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  timeOption: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    marginVertical: 2,
    borderRadius: 6,
    minWidth: 40,
    alignItems: 'center',
  },
  timeOptionSelected: {
    backgroundColor: Colors.primary,
  },
  timeOptionText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.text,
  },
  timeOptionTextSelected: {
    color: Colors.light.background,
    fontWeight: Typography.fontWeight.semibold,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    marginTop: Spacing.md,
  },
  confirmButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.background,
  },
});