import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const FoldedPanel = ({
  title,
  children,
  initiallyExpanded = false,
  icon = null,
  variant = 'default', // default, primary, secondary
  style = null,
}) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const rotateAnimation = useRef(new Animated.Value(0)).current;
  const contentHeight = useRef(0);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);

    const toValue = isExpanded ? 0 : 1;

    Animated.parallel([
      Animated.timing(animatedHeight, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(rotateAnimation, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const rotateTransform = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const contentMaxHeight = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, contentHeight.current || 500],
  });

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          headerGradient: ['#3E60D8', '#566FE0'],
          headerTextColor: '#FFFFFF',
          contentBackgroundColor: '#F8F1E6',
        };
      case 'secondary':
        return {
          headerGradient: ['#EFE4D3', '#FBF7EE'],
          headerTextColor: '#1B2540',
          contentBackgroundColor: '#FFFFFF',
        };
      default:
        return {
          headerGradient: ['#FFFFFF', '#FBF7EE'],
          headerTextColor: '#1B2540',
          contentBackgroundColor: '#FFFFFF',
        };
    }
  };

  const variantStyles = getVariantStyles();

  const measureContentHeight = (event) => {
    contentHeight.current = event.nativeEvent.layout.height;
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpand}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={variantStyles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.headerGradient}
        >
          {/* Folded corner effect */}
          <View style={styles.foldedCorner} />

          <View style={styles.headerContent}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text
              style={[
                styles.title,
                { color: variantStyles.headerTextColor },
              ]}
            >
              {title}
            </Text>
          </View>

          <Animated.View
            style={[
             styles.chevron,
              { transform: [{ rotate: rotateTransform }] },
            ]}
          >
            <View style={styles.chevronLine} />
            <View style={[styles.chevronLine, styles.chevronLineRotated]} />
          </Animated.View>
        </LinearGradient>
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.content,
          {
            height: contentMaxHeight,
            backgroundColor: variantStyles.contentBackgroundColor,
          },
        ]}
      >
        <View
          style={styles.contentInner}
          onLayout={measureContentHeight}
        >
          {children}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#1B2540',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    height: 64,
  },
  headerGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    position: 'relative',
  },
  foldedCorner: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderRightWidth: 20,
    borderTopWidth: 20,
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'InterDisplay-Bold',
    flex: 1,
  },
  chevron: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronLine: {
    position: 'absolute',
    width: 12,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 1,
  },
  chevronLineRotated: {
    transform: [{ rotate: '90deg' }],
  },
  content: {
    overflow: 'hidden',
  },
  contentInner: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    position: 'absolute',
    left: 0,
    right: 0,
  },
});

export default FoldedPanel;