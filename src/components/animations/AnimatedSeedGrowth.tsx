/**
 * AnimatedSeedGrowth - Live2D Quality Plant Growth Animation
 * Features sophisticated 2D animations with dynamic color transitions
 */

import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withRepeat,
  withTiming,
  interpolateColor,
  interpolate,
  Easing,
  useAnimatedProps,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Path,
  Ellipse,
  LinearGradient,
  Stop,
  Defs,
  G,
} from 'react-native-svg';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export enum GrowthStage {
  SEED = 'seed',
  SPROUT = 'sprout',
  PLANT = 'plant',
  BLOOM = 'bloom',
}

interface AnimatedSeedGrowthProps {
  stage?: GrowthStage;
  progress?: number;
  size?: number;
  colors?: {
    seed: string;
    sprout: string;
    plant: string;
    bloom: string;
  };
  showParticles?: boolean;
  onStageChange?: (stage: GrowthStage) => void;
}

const defaultColors = {
  seed: '#8B4513',
  sprout: '#228B22',
  plant: '#006400',
  bloom: '#FF69B4',
};

export const AnimatedSeedGrowth: React.FC<AnimatedSeedGrowthProps> = ({
  stage = GrowthStage.SEED,
  progress,
  size = screenHeight * 0.5,
  colors = defaultColors,
  showParticles = false,
  onStageChange,
}) => {
  // Shared values for animations
  const growthProgress = useSharedValue(0);
  const trunkHeight = useSharedValue(0);
  const leafScale = useSharedValue(0);
  const flowerScale = useSharedValue(0);
  const swayRotation = useSharedValue(0);
  const particleOpacity = useSharedValue(0);
  const seedScale = useSharedValue(1);
  const branchSpread = useSharedValue(0);

  // Calculate stage from progress - optimized for daily growth over 60 days
  const getStageFromProgress = (prog: number): GrowthStage => {
    if (prog <= 20) return GrowthStage.SEED;    // Days 1-12 (0-20%)
    if (prog <= 45) return GrowthStage.SPROUT;  // Days 13-27 (21-45%)
    if (prog <= 75) return GrowthStage.PLANT;   // Days 28-45 (46-75%)
    return GrowthStage.BLOOM;                   // Days 46-60 (76-100%)
  };

  const currentStage = progress !== undefined ? getStageFromProgress(progress) : stage;
  // Use actual progress for smooth daily growth, fallback to stage-based values
  const progressValue = progress !== undefined ? progress : 
    (currentStage === GrowthStage.SEED ? 10 :
     currentStage === GrowthStage.SPROUT ? 32 :
     currentStage === GrowthStage.PLANT ? 60 : 90);

  // Animate to target stage with smooth daily growth
  useEffect(() => {
    const targetProgress = progressValue / 100;
    
    growthProgress.value = withSpring(targetProgress, {
      damping: 30,
      stiffness: 100,
      mass: 1,
    });

    // Continuous growth based on progress (0-100% over 60 days)
    // Trunk grows progressively from day 8 onwards
    const trunkProgress = Math.max(0, (progressValue - 15) / 85); // Starts at ~15%, full at 100%
    trunkHeight.value = withSpring(trunkProgress, { damping: 25, stiffness: 80 });
    
    // Leaves appear from day 12 and grow throughout
    const leafProgress = Math.max(0, (progressValue - 20) / 80); // Starts at ~20%, full at 100%
    leafScale.value = withSpring(leafProgress, { damping: 20 });
    
    // Seed shrinks as plant grows
    const seedProgress = Math.max(0.3, 1 - (progressValue / 100) * 0.7); // From 1.0 to 0.3
    seedScale.value = withSpring(seedProgress, { damping: 15 });
    
    // Branches spread from day 25 onwards
    const branchProgress = Math.max(0, (progressValue - 40) / 60); // Starts at ~40%, full at 100%
    branchSpread.value = withSpring(branchProgress, { damping: 20 });
    
    // Flowers bloom in final stage (day 45+ / 75%+)
    const flowerProgress = Math.max(0, (progressValue - 75) / 25); // Starts at 75%, full at 100%
    flowerScale.value = withSpring(flowerProgress, { damping: 15, stiffness: 150 });

    // Particle effects for growing plants (after 20% progress)
    if (showParticles && progressValue > 20) {
      particleOpacity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 800, delay: 200 })
      );
    }

    onStageChange?.(currentStage);
  }, [progressValue, showParticles, onStageChange, currentStage]);

  // Continuous sway animation (starts when trunk appears, ~day 8 / 15% progress)
  useEffect(() => {
    if (progressValue > 15) {
      // Sway intensity increases with growth
      const swayIntensity = Math.min(3, (progressValue - 15) / 85 * 3);
      swayRotation.value = withRepeat(
        withSequence(
          withTiming(swayIntensity, { duration: 2500, easing: Easing.sin }),
          withTiming(-swayIntensity, { duration: 2500, easing: Easing.sin })
        ),
        -1,
        true
      );
    } else {
      swayRotation.value = withSpring(0);
    }
  }, [progressValue]);

  // Container animation style
  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${interpolate(
            swayRotation.value,
            [-5, 5],
            [-2, 2]
          )}deg`,
        },
        {
          scale: interpolate(
            growthProgress.value,
            [0, 1],
            [0.8, 1]
          ),
        },
      ],
    };
  });

  // Seed animation props
  const seedAnimatedProps = useAnimatedProps(() => {
    return {
      rx: interpolate(seedScale.value, [0, 1], [8, 15]),
      ry: interpolate(seedScale.value, [0, 1], [12, 20]),
      opacity: interpolate(growthProgress.value, [0, 0.3], [1, 0.3]),
    };
  });

  // Trunk animation props
  const trunkAnimatedProps = useAnimatedProps(() => {
    const pathHeight = interpolate(trunkHeight.value, [0, 1], [0, size * 0.6]);
    return {
      d: `M${size/2},${size - 40} Q${size/2 - 5},${size - 40 - pathHeight/2} ${size/2},${size - 40 - pathHeight}`,
      strokeWidth: interpolate(trunkHeight.value, [0, 1], [2, 12]),
      opacity: interpolate(trunkHeight.value, [0, 0.1], [0, 1]),
    };
  });

  // Leaves animation props
  const leavesAnimatedProps = useAnimatedProps(() => {
    return {
      transform: `scale(${leafScale.value})`,
      opacity: leafScale.value,
    };
  });

  // Flowers animation props
  const flowersAnimatedProps = useAnimatedProps(() => {
    return {
      transform: `scale(${flowerScale.value})`,
      opacity: flowerScale.value,
    };
  });

  // Dynamic color interpolation
  const dynamicColors = useAnimatedStyle(() => {
    const leafColor = interpolateColor(
      growthProgress.value,
      [0, 0.3, 0.6, 1],
      [colors.seed, colors.sprout, colors.plant, colors.plant]
    );

    return {
      // This can be used for any additional styling needs
    };
  });

  // Render particle effects
  const renderParticles = () => {
    if (!showParticles) return null;

    const particleStyle = useAnimatedStyle(() => {
      return {
        opacity: particleOpacity.value,
      };
    });

    return (
      <Animated.View
        testID="particle-effects"
        style={[styles.particles, particleStyle]}
      >
        {Array.from({ length: 12 }).map((_, index) => {
          const particleAnimationStyle = useAnimatedStyle(() => {
            const delay = index * 50;
            const translateY = interpolate(
              particleOpacity.value,
              [0, 1],
              [0, -30 - Math.random() * 20]
            );
            const translateX = interpolate(
              particleOpacity.value,
              [0, 1],
              [0, (Math.random() - 0.5) * 40]
            );

            return {
              transform: [
                { translateX },
                { translateY },
                { scale: interpolate(particleOpacity.value, [0, 1], [0, 1]) }
              ],
            };
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.particle,
                particleAnimationStyle,
                {
                  left: (size * 0.3) + Math.random() * (size * 0.4),
                  top: size * 0.5 + Math.random() * (size * 0.3),
                  backgroundColor: colors.sprout,
                },
              ]}
            />
          );
        })}
      </Animated.View>
    );
  };

  return (
    <Animated.View
      testID="animated-seed-growth"
      style={[
        styles.container,
        {
          width: size,
          height: size,
        },
        containerStyle,
      ]}
      accessibilityLabel={`Growth visualization: ${currentStage} stage`}
      accessibilityRole="image"
    >
      <AnimatedSvg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="seedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.seed} stopOpacity="1" />
            <Stop offset="100%" stopColor="#4A2C17" stopOpacity="1" />
          </LinearGradient>
          
          <LinearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#8B4513" stopOpacity="1" />
            <Stop offset="100%" stopColor="#654321" stopOpacity="1" />
          </LinearGradient>
          
          <LinearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.sprout} stopOpacity="1" />
            <Stop offset="100%" stopColor={colors.plant} stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Underground seed */}
        <AnimatedEllipse
          testID="growth-stage-seed"
          cx={size / 2}
          cy={size - 30}
          fill="url(#seedGradient)"
          stroke="#2E1B0E"
          strokeWidth="1"
          animatedProps={seedAnimatedProps}
        />

        {/* Main trunk */}
        <AnimatedPath
          stroke="url(#trunkGradient)"
          fill="none"
          strokeLinecap="round"
          animatedProps={trunkAnimatedProps}
        />

        {/* Sprout leaves */}
        <G testID="growth-stage-sprout" animatedProps={leavesAnimatedProps}>
          <Ellipse
            cx={size / 2 - 25}
            cy={size - 120}
            rx="20"
            ry="8"
            fill="url(#leafGradient)"
            transform={`rotate(-30 ${size / 2 - 25} ${size - 120})`}
          />
          <Ellipse
            cx={size / 2 + 25}
            cy={size - 110}
            rx="20"
            ry="8"
            fill="url(#leafGradient)"
            transform={`rotate(30 ${size / 2 + 25} ${size - 110})`}
          />
        </G>

        {/* Plant branches and leaves */}
        <G testID="growth-stage-plant" animatedProps={leavesAnimatedProps}>
          {/* Left branch */}
          <Path
            d={`M${size / 2},${size - 150} Q${size / 2 - 30},${size - 160} ${size / 2 - 50},${size - 170}`}
            stroke="url(#trunkGradient)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          {/* Right branch */}
          <Path
            d={`M${size / 2},${size - 180} Q${size / 2 + 30},${size - 190} ${size / 2 + 50},${size - 200}`}
            stroke="url(#trunkGradient)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Branch leaves */}
          <Circle cx={size / 2 - 50} cy={size - 170} r="25" fill={colors.plant} opacity="0.8" />
          <Circle cx={size / 2 + 50} cy={size - 200} r="25" fill={colors.plant} opacity="0.8" />
          <Circle cx={size / 2 - 30} cy={size - 160} r="18" fill={colors.plant} opacity="0.7" />
          <Circle cx={size / 2 + 30} cy={size - 190} r="18" fill={colors.plant} opacity="0.7" />
        </G>

        {/* Blooming tree crown */}
        <G testID="growth-stage-bloom" animatedProps={leavesAnimatedProps}>
          {/* Large canopy */}
          <Circle
            cx={size / 2}
            cy={size - 200}
            r="80"
            fill={colors.plant}
            opacity="0.6"
          />
          <Circle
            cx={size / 2 - 40}
            cy={size - 180}
            r="50"
            fill={colors.plant}
            opacity="0.7"
          />
          <Circle
            cx={size / 2 + 40}
            cy={size - 180}
            r="50"
            fill={colors.plant}
            opacity="0.7"
          />
        </G>

        {/* Flowers on the tree */}
        <G animatedProps={flowersAnimatedProps}>
          {Array.from({ length: 20 }).map((_, index) => {
            const angle = (index / 20) * Math.PI * 2;
            const radius = 40 + Math.random() * 30;
            const x = size / 2 + Math.cos(angle) * radius;
            const y = size - 200 + Math.sin(angle) * radius * 0.6;
            
            return (
              <Circle
                key={index}
                cx={x}
                cy={y}
                r={4 + Math.random() * 3}
                fill={index % 3 === 0 ? colors.bloom : '#FFB6C1'}
                opacity="0.9"
              />
            );
          })}
          
          {/* Larger flower clusters */}
          <Circle cx={size / 2 - 20} cy={size - 180} r="8" fill={colors.bloom} />
          <Circle cx={size / 2 + 25} cy={size - 190} r="8" fill="#FFB6C1" />
          <Circle cx={size / 2} cy={size - 170} r="10" fill={colors.bloom} />
          <Circle cx={size / 2 - 35} cy={size - 210} r="7" fill="#FFB6C1" />
          <Circle cx={size / 2 + 30} cy={size - 220} r="9" fill={colors.bloom} />
        </G>
      </AnimatedSvg>

      {renderParticles()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  particles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.8,
  },
});