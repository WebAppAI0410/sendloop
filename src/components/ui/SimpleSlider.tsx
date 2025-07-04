/**
 * SimpleSlider Component
 * Custom slider implementation without external dependencies
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../utils/theme';

interface SimpleSliderProps {
  minimumValue: number;
  maximumValue: number;
  value: number;
  onValueChange: (value: number) => void;
  style?: any;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityValue?: {
    min: number;
    max: number;
    now: number;
  };
}

export function SimpleSlider({
  minimumValue,
  maximumValue,
  value,
  onValueChange,
  style,
  minimumTrackTintColor = Colors.primary,
  maximumTrackTintColor = Colors.light.border,
  testID,
  accessibilityLabel,
  accessibilityHint,
  accessibilityValue,
}: SimpleSliderProps) {
  // Calculate percentage for current value
  const percentage = ((value - minimumValue) / (maximumValue - minimumValue)) * 100;

  // Create preset values for easy selection
  const presetValues = [3, 7, 14, 21, 30, 66, 90, 180];
  
  const handlePresetPress = (presetValue: number) => {
    if (presetValue >= minimumValue && presetValue <= maximumValue) {
      onValueChange(presetValue);
    }
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Track */}
      <View style={styles.track}>
        <View
          style={[
            styles.trackFill,
            {
              width: `${percentage}%`,
              backgroundColor: minimumTrackTintColor,
            },
          ]}
        />
        <View
          style={[
            styles.trackEmpty,
            {
              backgroundColor: maximumTrackTintColor,
            },
          ]}
        />
        
        {/* Thumb */}
        <View
          style={[
            styles.thumb,
            {
              left: `${percentage}%`,
              backgroundColor: minimumTrackTintColor,
            },
          ]}
        />
      </View>

      {/* Preset Values */}
      <View style={styles.presetContainer}>
        {presetValues.map((presetValue) => (
          <TouchableOpacity
            key={presetValue}
            style={[
              styles.presetButton,
              value === presetValue && styles.presetButtonActive,
            ]}
            onPress={() => handlePresetPress(presetValue)}
            accessibilityRole="button"
            accessibilityLabel={`Set to ${presetValue} days`}
          >
            <Text
              style={[
                styles.presetText,
                value === presetValue && styles.presetTextActive,
              ]}
            >
              {presetValue}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 80,
  },
  track: {
    height: 4,
    backgroundColor: Colors.light.border,
    borderRadius: 2,
    position: 'relative',
    marginBottom: 20,
  },
  trackFill: {
    height: '100%',
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  trackEmpty: {
    height: '100%',
    borderRadius: 2,
    position: 'absolute',
    right: 0,
    top: 0,
    left: 0,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    top: -8,
    marginLeft: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  presetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  presetButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    minWidth: 35,
    alignItems: 'center',
  },
  presetButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  presetText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  presetTextActive: {
    color: Colors.light.background,
    fontWeight: '600',
  },
});