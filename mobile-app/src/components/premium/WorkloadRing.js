import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const WorkloadRing = ({
  value,
  maxValue = 100,
  size = 120,
  strokeWidth = 12,
  title,
  subtitle,
  gradientColors = ['#3E60D8', '#566FE0'],
  showPercentage = true,
  animated = true,
  style = null,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / maxValue) * 100, 100);

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: percentage,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    } else {
      animatedValue.setValue(percentage);
    }
  }, [percentage, animated]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  const rotation = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['-90deg', '270deg'],
  });

  const getStatusColor = () => {
    if (percentage >= 80) {
      return { colors: ['#D75A5A', '#E8B25D'], status: 'High' };
    } else if (percentage >= 60) {
      return { colors: ['#E8B25D', '#E8B25D'], status: 'Medium' };
    } else {
      return { colors: ['#7DB87A', '#7DB87A'], status: 'Low' };
    }
  };

  const statusInfo = getStatusColor();

  const renderRing = (colors, animatedValue, strokeWidth) => (
    <View style={[styles.ringContainer, { width: size, height: size }]}>
      {/* Background ring */}
      <View
        style={[
          styles.backgroundRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
          },
        ]}
      />

      {/* Animated progress ring */}
      <Animated.View
        style={[
          styles.progressRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderTopColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: 'transparent',
            borderLeftColor: colors[0],
            transform: [{ rotate: rotation }],
          },
        ]}
      />

      {/* Gradient overlay */}
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradientOverlay,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderTopColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: 'transparent',
            borderLeftColor: 'transparent',
            borderWidth: strokeWidth,
          },
        ]}
      />
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {renderRing(gradientColors, animatedValue, strokeWidth)}

      {/* Center content */}
      <View style={styles.centerContent}>
        {showPercentage && (
          <View style={styles.percentageContainer}>
            <Text style={styles.percentageText}>
              {Math.round(percentage)}%
            </Text>
            <Text style={styles.percentageLabel}>Complete</Text>
          </View>
        )}

        {title && (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        )}

        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}

        {/* Status indicator */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: statusInfo.colors[0] },
            ]}
          />
          <Text style={styles.statusText}>{statusInfo.status}</Text>
        </View>
      </View>

      {/* Legend */}
      {maxValue && (
        <View style={styles.legend}>
          <Text style={styles.legendText}>
            {value} of {maxValue}
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
    position: 'relative',
  },
  ringContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundRing: {
    borderColor: '#EFE4D3',
    position: 'absolute',
  },
  progressRing: {
    position: 'absolute',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  gradientOverlay: {
    position: 'absolute',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageContainer: {
    alignItems: 'center',
    marginBottom: 4,
  },
  percentageText: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'InterDisplay-Bold',
    color: '#1B2540',
    lineHeight: 28,
  },
  percentageLabel: {
    fontSize: 10,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    color: '#7487C1',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
    color: '#1B2540',
    textAlign: 'center',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
    color: '#7487C1',
    textAlign: 'center',
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
    color: '#1B2540',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  legend: {
    marginTop: 8,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
    color: '#C9B89A',
    textAlign: 'center',
  },
});

export default WorkloadRing;