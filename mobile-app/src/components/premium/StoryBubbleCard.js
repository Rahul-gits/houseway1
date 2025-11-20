import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const StoryBubbleCard = ({
  title,
  subtitle,
  avatar = null,
  onPress,
  isActive = false,
  hasGradient = true,
  gradientColors = ['#3E60D8', '#566FE0'],
  size = 'medium', // small, medium, large
  style = null,
  badge = null,
}) => {
  const getBubbleSize = () => {
    switch (size) {
      case 'small':
        return { width: 60, height: 60, fontSize: 12 };
      case 'large':
        return { width: 100, height: 100, fontSize: 14 };
      default: // medium
        return { width: 80, height: 80, fontSize: 12 };
    }
  };

  const bubbleSize = getBubbleSize();

  const BubbleContent = () => (
    <View style={[styles.bubbleContainer, { width: bubbleSize.width, height: bubbleSize.height }]}>
      {/* Gradient ring or solid background */}
      {hasGradient ? (
        <LinearGradient
          colors={isActive ? gradientColors : ['#EFE4D3', '#D4C4B0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientRing}
        >
          <View style={styles.innerCircle}>
            {avatar || (
              <View style={styles.placeholderIcon}>
                <View style={styles.placeholderDot} />
                <View style={[styles.placeholderDot, styles.placeholderDotMiddle]} />
                <View style={[styles.placeholderDot, styles.placeholderDotBottom]} />
              </View>
            )}
          </View>
        </LinearGradient>
      ) : (
        <View style={[styles.solidBubble, { backgroundColor: isActive ? '#3E60D8' : '#EFE4D3' }]}>
          {avatar || (
            <View style={styles.placeholderIcon}>
              <View style={styles.placeholderDot} />
              <View style={[styles.placeholderDot, styles.placeholderDotMiddle]} />
              <View style={[styles.placeholderDot, styles.placeholderDotBottom]} />
            </View>
          )}
        </View>
      )}

      {/* Active indicator */}
      {isActive && <View style={styles.activeIndicator} />}

      {/* Badge */}
      {badge && <View style={styles.badgeContainer}>{badge}</View>}
    </View>
  );

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <BubbleContent />

      {(title || subtitle) && (
        <View style={styles.textContainer}>
          <Text style={[styles.title, { fontSize: bubbleSize.fontSize }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { fontSize: bubbleSize.fontSize - 2 }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  bubbleContainer: {
    position: 'relative',
  },
  gradientRing: {
    flex: 1,
    borderRadius: 999,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3E60D8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  innerCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  solidBubble: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1B2540',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeholderIcon: {
    alignItems: 'center',
  },
  placeholderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C9B89A',
    marginVertical: 2,
  },
  placeholderDotMiddle: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  placeholderDotBottom: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#7DB87A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#D75A5A',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  textContainer: {
    marginTop: 8,
    alignItems: 'center',
    maxWidth: 100,
  },
  title: {
    fontFamily: 'InterDisplay-Bold',
    fontWeight: '700',
    color: '#1B2540',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    color: '#7487C1',
    textAlign: 'center',
    marginTop: 2,
  },
});

export default StoryBubbleCard;