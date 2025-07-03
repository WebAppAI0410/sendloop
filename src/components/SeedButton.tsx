/**
 * SeedButton Component
 * Central tap button for daily habit completion
 * Features: Haptic feedback, visual feedback, elegant animations
 */

import React, { useState } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  View,
  Animated,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface SeedButtonProps {
  onPress: () => void;
  disabled?: boolean;
  completed?: boolean;
  size?: number;
  children?: React.ReactNode;
}

export function SeedButton({ 
  onPress, 
  disabled = false, 
  completed = false,
  size = 120,
  children 
}: SeedButtonProps) {
  const [pressAnim] = useState(new Animated.Value(1));
  const [pulseAnim] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    if (disabled) return;
    
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Press animation
    Animated.spring(pressAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    
    // Release animation
    Animated.spring(pressAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePress = () => {
    if (disabled) return;
    
    // Success haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Pulse animation
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
    
    onPress();
  };

  const containerSize = size;
  const innerSize = size * 0.85;

  return (
    <View style={[styles.container, { width: containerSize, height: containerSize }]}>
      {/* Glow effect for completed state */}
      {completed && (
        <View 
          style={[
            styles.glowEffect, 
            { 
              width: containerSize + 20, 
              height: containerSize + 20,
              borderRadius: (containerSize + 20) / 2
            }
          ]} 
        />
      )}
      
      <Animated.View
        style={[
          styles.outerRing,
          {
            width: containerSize,
            height: containerSize,
            borderRadius: containerSize / 2,
            transform: [
              { scale: pressAnim },
              { scale: pulseAnim }
            ],
            borderColor: completed ? '#58A16C' : '#E5E7EB',
          }
        ]}
      >
        <Pressable
          style={[
            styles.button,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              backgroundColor: completed ? '#58A16C' : disabled ? '#F3F4F6' : '#FFFFFF',
            }
          ]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          disabled={disabled}
        >
          <View style={styles.content}>
            {children || (
              <Text style={[
                styles.buttonText,
                { 
                  color: completed ? '#FFFFFF' : disabled ? '#9CA3AF' : '#374151',
                  fontSize: size * 0.12
                }
              ]}>
                {completed ? '✓' : 'TAP'}
              </Text>
            )}
          </View>
          
          {/* Inner shadow for depth */}
          <View 
            style={[
              styles.innerShadow,
              {
                width: innerSize - 4,
                height: innerSize - 4,
                borderRadius: (innerSize - 4) / 2,
              }
            ]} 
          />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    backgroundColor: '#58A16C',
    opacity: 0.1,
    shadowColor: '#58A16C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  outerRing: {
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  buttonText: {
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  innerShadow: {
    position: 'absolute',
    top: 2,
    left: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    zIndex: 1,
  },
});