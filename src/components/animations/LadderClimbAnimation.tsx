/**
 * LadderClimbAnimation - 60日間はしごのぼりアニメーション
 * 毎日1段ずつはしごを登り、60日後に山頂で旗を掲げる
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  Animated,
} from 'react-native';
import Svg, { Path, Rect, Circle, G, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import LottieView from 'lottie-react-native';
import { Colors } from '../../utils/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface LadderClimbAnimationProps {
  achievedDays: number; // 0-60
  cycleLength: number; // 7, 15, 30, 45, or 60
  size?: number;
  onMilestone?: (day: number) => void;
  testID?: string;
}

// マイルストーン日数
const MILESTONES = [7, 15, 30, 45, 60];

// カラーパレット
const COLORS = {
  mountain: {
    light: '#B1D5C8',
    dark: '#24403C',
  },
  ladder: {
    normal: '#8E8E8E',
    today: '#FFD54F',
    gold: '#FFD700',
  },
  climber: '#5E8BFF',
  flag: '#FF5252',
  sky: {
    light: '#E3F2FD',
    dark: '#0D47A1',
  },
};

export const LadderClimbAnimation: React.FC<LadderClimbAnimationProps> = ({
  achievedDays,
  cycleLength,
  size = screenWidth - 40,
  onMilestone,
  testID = 'ladder-climb-animation',
}) => {
  const [showEffect, setShowEffect] = useState<number | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const flagAnim = useRef(new Animated.Value(0)).current;
  
  // SVGのサイズ計算
  const svgHeight = size * 1.5; // 山は縦長
  const svgWidth = size;
  
  // はしごのパラメータ
  const rungHeight = svgHeight / cycleLength; // 1段の高さ
  const rungWidth = svgWidth * 0.15; // はしごの幅
  const rungSpacing = 3; // 段の間隔
  
  // 山の形状
  const mountainBase = svgHeight * 0.9;
  const mountainPeak = svgHeight * 0.1;
  const mountainCenterX = svgWidth / 2;
  
  // クライマーの位置計算
  const climberY = mountainBase - (achievedDays * rungHeight);
  const climberX = mountainCenterX;
  
  // マイルストーンチェック
  useEffect(() => {
    if (MILESTONES.includes(achievedDays)) {
      setShowEffect(achievedDays);
      onMilestone?.(achievedDays);
      
      // パルスアニメーション
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      // エフェクトを3秒後に消す
      setTimeout(() => setShowEffect(null), 3000);
    }
    
    // 60日達成時の旗アニメーション
    if (achievedDays === 60) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(flagAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(flagAnim, {
            toValue: -1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [achievedDays]);
  
  // クライマーの状態
  const getClimberState = () => {
    if (achievedDays === 0) return 'standing';
    if (achievedDays === cycleLength) return 'celebrating';
    if ([15, 30, 45].includes(achievedDays)) return 'cheering';
    return 'climbing';
  };
  
  const climberState = getClimberState();
  
  // マイルストーンエフェクトの選択
  const getMilestoneEffect = () => {
    switch (showEffect) {
      case 7:
        return 'spark';
      case 15:
        return 'glow';
      case 30:
        return 'flag-wave';
      case 45:
        return 'clouds';
      case 60:
        return 'fireworks';
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { width: size, height: svgHeight }]} testID={testID}>
      <Svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        <Defs>
          {/* グラデーション定義 */}
          <LinearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.sky.light} />
            <Stop offset="100%" stopColor={COLORS.sky.dark} />
          </LinearGradient>
          <LinearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.mountain.light} />
            <Stop offset="100%" stopColor={COLORS.mountain.dark} />
          </LinearGradient>
        </Defs>
        
        {/* 背景 */}
        <Rect x="0" y="0" width={svgWidth} height={svgHeight} fill="url(#skyGradient)" />
        
        {/* 山 */}
        <Path
          d={`
            M 0 ${mountainBase}
            L ${mountainCenterX - svgWidth * 0.3} ${mountainPeak}
            L ${mountainCenterX} ${mountainPeak - 20}
            L ${mountainCenterX + svgWidth * 0.3} ${mountainPeak}
            L ${svgWidth} ${mountainBase}
            L ${svgWidth} ${svgHeight}
            L 0 ${svgHeight}
            Z
          `}
          fill="url(#mountainGradient)"
          stroke="#90A4AE"
          strokeWidth="2"
        />
        
        {/* はしご */}
        <G>
          {/* 縦の支柱 */}
          <Line
            x1={mountainCenterX - rungWidth / 2}
            y1={mountainBase}
            x2={mountainCenterX - rungWidth / 2}
            y2={mountainBase - (achievedDays * rungHeight)}
            stroke={COLORS.ladder.normal}
            strokeWidth="4"
          />
          <Line
            x1={mountainCenterX + rungWidth / 2}
            y1={mountainBase}
            x2={mountainCenterX + rungWidth / 2}
            y2={mountainBase - (achievedDays * rungHeight)}
            stroke={COLORS.ladder.normal}
            strokeWidth="4"
          />
          
          {/* 横の段 */}
          {Array.from({ length: achievedDays }, (_, i) => {
            const isToday = i === achievedDays - 1;
            const isMilestone = MILESTONES.includes(i + 1);
            const y = mountainBase - ((i + 1) * rungHeight);
            
            return (
              <Rect
                key={i}
                x={mountainCenterX - rungWidth / 2}
                y={y - 2}
                width={rungWidth}
                height="4"
                fill={
                  isToday ? COLORS.ladder.today :
                  isMilestone && i + 1 === 60 ? COLORS.ladder.gold :
                  COLORS.ladder.normal
                }
                opacity={isToday ? 0.8 : 1}
              />
            );
          })}
        </G>
        
        {/* クライマー */}
        <G transform={`translate(${climberX}, ${climberY})`}>
          {/* 体 */}
          <Circle cx="0" cy="-10" r="8" fill={COLORS.climber} />
          <Rect x="-8" y="-10" width="16" height="20" rx="4" fill={COLORS.climber} />
          
          {/* 腕 */}
          {climberState === 'cheering' || climberState === 'celebrating' ? (
            <>
              <Line x1="-8" y1="-5" x2="-15" y2="-15" stroke={COLORS.climber} strokeWidth="3" strokeLinecap="round" />
              <Line x1="8" y1="-5" x2="15" y2="-15" stroke={COLORS.climber} strokeWidth="3" strokeLinecap="round" />
            </>
          ) : (
            <>
              <Line x1="-8" y1="-5" x2="-12" y2="0" stroke={COLORS.climber} strokeWidth="3" strokeLinecap="round" />
              <Line x1="8" y1="-5" x2="12" y2="0" stroke={COLORS.climber} strokeWidth="3" strokeLinecap="round" />
            </>
          )}
          
          {/* 脚 */}
          <Line x1="-4" y1="10" x2="-4" y2="20" stroke={COLORS.climber} strokeWidth="3" strokeLinecap="round" />
          <Line x1="4" y1="10" x2="4" y2="20" stroke={COLORS.climber} strokeWidth="3" strokeLinecap="round" />
        </G>
        
        {/* 60日達成時の旗 */}
        {achievedDays === 60 && (
          <G transform={`translate(${mountainCenterX}, ${mountainPeak - 20})`}>
            <Line x1="0" y1="0" x2="0" y2="-40" stroke="#8D6E63" strokeWidth="3" />
            <Path
              d={`M 0 -40 L 30 -30 L 30 -20 L 0 -30 Z`}
              fill={COLORS.flag}
              transform={`rotate(${flagAnim._value * 10}, 0, -30)`}
            />
          </G>
        )}
      </Svg>
      
      {/* マイルストーンエフェクト */}
      {showEffect && (
        <>
          <View style={styles.effectContainer}>
            <Text style={styles.milestoneText}>
              {showEffect === 7 && '1週間達成！🎯'}
              {showEffect === 15 && '15日達成！💪'}
              {showEffect === 30 && '折り返し地点！🏃'}
              {showEffect === 45 && 'もうすぐゴール！🔥'}
              {showEffect === 60 && '完全制覇！🎊'}
            </Text>
          </View>
          
          {/* 花火エフェクト（60日達成時） */}
          {showEffect === 60 && (
            <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
              <LottieView
                source={require('../../assets/animations/milestone-fireworks.json')}
                autoPlay
                loop={false}
                style={StyleSheet.absoluteFillObject}
              />
            </View>
          )}
        </>
      )}
      
      {/* デバッグ情報 */}
      {__DEV__ && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            Day {achievedDays}/{cycleLength} • {Math.round((achievedDays / cycleLength) * 100)}%
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
  },
  effectContainer: {
    position: 'absolute',
    top: '20%',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  milestoneText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  debugInfo: {
    position: 'absolute',
    bottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  debugText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
});