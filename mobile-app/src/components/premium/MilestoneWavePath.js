import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const MilestoneWavePath = ({
  milestones,
  currentProgress = 0,
  height = 80,
  showLabels = true,
  animated = true,
}) => {
  const milestoneWidth = width / milestones.length;

  const getMilestoneStatus = (index) => {
    const progressPerMilestone = 100 / (milestones.length - 1);
    const milestoneProgress = index * progressPerMilestone;

    if (currentProgress >= milestoneProgress) {
      return 'completed';
    } else if (currentProgress >= milestoneProgress - progressPerMilestone / 2) {
      return 'current';
    }
    return 'upcoming';
  };

  const getMilestoneColor = (status) => {
    switch (status) {
      case 'completed':
        return '#7DB87A';
      case 'current':
        return '#3E60D8';
      default:
        return '#C9B89A';
    }
  };

  const renderMilestone = (milestone, index) => {
    const status = getMilestoneStatus(index);
    const isActive = status === 'current';
    const isCompleted = status === 'completed';
    const color = getMilestoneColor(status);

    return (
      <View
        key={index}
        style={[
          styles.milestone,
          {
            left: index * milestoneWidth,
            width: milestoneWidth,
          },
        ]}
      >
        {/* Connector line */}
        {index < milestones.length - 1 && (
          <View
            style={[
              styles.connector,
              {
                left: milestoneWidth / 2,
                width: milestoneWidth,
                backgroundColor: isCompleted ? '#7DB87A' : '#EFE4D3',
              },
            ]}
          />
        )}

        {/* Wave curve at milestone point */}
        <View
          style={[
            styles.waveContainer,
            {
              left: milestoneWidth / 2 - 15,
              backgroundColor: color,
            },
          ]}
        >
          <View style={[styles.waveTop, { borderBottomColor: color }]} />
          <View style={[styles.waveBottom, { borderTopColor: color }]} />

          {/* Milestone circle */}
          <View
            style={[
              styles.milestoneCircle,
              {
                backgroundColor: isCompleted ? '#FFFFFF' : color,
                borderColor: color,
                borderWidth: 3,
              },
            ]}
          >
            {isCompleted && (
              <View style={[styles.completedDot, { backgroundColor: color }]} />
            )}
          </View>

          {/* Active pulse animation */}
          {isActive && animated && (
            <View style={[styles.pulseContainer, { borderColor: color }]}>
              <View style={[styles.pulseDot, { backgroundColor: color }]} />
            </View>
          )}
        </View>

        {/* Labels */}
        {showLabels && (
          <View style={[styles.labelContainer, { left: milestoneWidth / 2 }]}>
            <Text style={[styles.labelTitle, { color: isCompleted ? '#1B2540' : '#7487C1' }]}>
              {milestone.title}
            </Text>
            {milestone.date && (
              <Text style={[styles.labelDate, { color: '#C9B89A' }]}>
                {milestone.date}
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { height }]}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#F8F1E6', '#FBF7EE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.backgroundGradient}
      />

      {/* Progress indicator overlay */}
      <View
        style={[
          styles.progressOverlay,
          {
            width: (width * currentProgress) / 100,
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(125, 184, 122, 0.2)', 'rgba(125, 184, 122, 0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.progressGradient}
        />
      </View>

      {/* Milestones */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.timelineContainer}>
          {milestones.map((milestone, index) => renderMilestone(milestone, index))}
        </View>
      </ScrollView>

      {/* Current progress percentage */}
      {showLabels && (
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>{Math.round(currentProgress)}% Complete</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  progressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
  },
  progressGradient: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  timelineContainer: {
    height: '100%',
    position: 'relative',
  },
  milestone: {
    position: 'absolute',
    height: '100%',
    alignItems: 'flex-start',
  },
  connector: {
    position: 'absolute',
    top: 40,
    height: 4,
    zIndex: 1,
  },
  waveContainer: {
    position: 'absolute',
    top: 30,
    width: 30,
    height: 20,
    zIndex: 2,
  },
  waveTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 10,
    borderBottomWidth: 10,
    borderLeftWidth: 15,
    borderStyle: 'solid',
    borderBottomLeftRadius: 15,
  },
  waveBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 10,
    borderTopWidth: 10,
    borderLeftWidth: 15,
    borderStyle: 'solid',
    borderTopLeftRadius: 15,
  },
  milestoneCircle: {
    position: 'absolute',
    top: 15,
    left: 7.5,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  completedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pulseContainer: {
    position: 'absolute',
    top: 5,
    left: 2.5,
    width: 25,
    height: 25,
    borderRadius: 12.5,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  labelContainer: {
    position: 'absolute',
    top: 55,
    alignItems: 'center',
    width: 80,
    marginLeft: -40,
  },
  labelTitle: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginBottom: 2,
  },
  labelDate: {
    fontSize: 8,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  progressInfo: {
    position: 'absolute',
    bottom: 8,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'InterDisplay-Bold',
    color: '#3E60D8',
  },
});

export default MilestoneWavePath;