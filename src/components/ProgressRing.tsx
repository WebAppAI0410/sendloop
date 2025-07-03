/**
 * ProgressRing Component
 * Circular progress indicator for habit completion
 * Features: Smooth animations, customizable colors, percentage display
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  animated?: boolean;
  duration?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function ProgressRing({
  progress,
  size = 100,
  strokeWidth = 8,
  color = '#58A16C',
  backgroundColor = '#E5E7EB',
  showPercentage = true,
  animated = true,
  duration = 1000
}: ProgressRingProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const circleRef = useRef<any>(null);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const center = size / 2;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: progress,
        duration,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(progress);
    }
  }, [progress, animated, duration, animatedValue]);

  useEffect(() => {
    const listener = animatedValue.addListener(({ value }) => {
      if (circleRef.current) {
        const strokeDashoffset = circumference - (circumference * value) / 100;
        circleRef.current.setNativeProps({
          strokeDashoffset,
        });
      }
    });

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [animatedValue, circumference]);

  const getProgressColor = (progressValue: number): string => {
    if (progressValue >= 90) return '#10B981'; // Green
    if (progressValue >= 60) return '#F59E0B'; // Yellow
    if (progressValue >= 30) return '#EF4444'; // Red
    return color;
  };

  const currentColor = getProgressColor(progress);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <AnimatedCircle
          ref={circleRef}
          cx={center}
          cy={center}
          r={radius}
          stroke={currentColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          fill="transparent"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      
      {showPercentage && (
        <View style={styles.textContainer}>
          <Animated.Text style={[
            styles.percentageText,
            { 
              fontSize: size * 0.2,
              color: currentColor
            }
          ]}>
            {animated ? (
              <Animated.Text>
                {animatedValue.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0', '100'],
                  extrapolate: 'clamp',
                })}
              </Animated.Text>
            ) : (
              Math.round(progress)
            )}
            %
          </Animated.Text>
          
          <Text style={[
            styles.labelText,
            { fontSize: size * 0.08, color: currentColor }
          ]}>
            Complete
          </Text>
        </View>
      )}
    </View>
  );
}

/**
 * Mini version for compact display
 */
export function MiniProgressRing({
  progress,
  size = 40,
  strokeWidth = 4,
  color = '#58A16C'
}: Pick<ProgressRingProps, 'progress' | 'size' | 'strokeWidth' | 'color'>) {
  return (
    <ProgressRing
      progress={progress}
      size={size}
      strokeWidth={strokeWidth}
      color={color}
      showPercentage={false}
      animated={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  labelText: {
    fontWeight: '500',
    textAlign: 'center',
    marginTop: -2,
    opacity: 0.8,
  },
});