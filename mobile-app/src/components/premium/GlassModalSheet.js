import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Modal,
  PanResponder,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const GlassModalSheet = ({
  visible,
  onClose,
  title,
  subtitle,
  children,
  height = '80%',
  snapPoints = ['50%', '80%', '100%'],
  enableSwipeToDismiss = true,
  showDragHandle = true,
  backdropColor = 'rgba(27, 37, 64, 0.4)',
  style = null,
}) => {
  const translateY = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const currentSnapIndex = useRef(1); // Start at middle snap point

  useEffect(() => {
    if (visible) {
      openSheet();
    } else {
      closeSheet();
    }
  }, [visible]);

  const openSheet = () => {
    const targetValue = 0;

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: targetValue,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSheet = () => {
    const targetValue = height;

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: targetValue,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose?.();
    });
  };

  const snapToPoint = (point) => {
    const snapHeight = height * (parseFloat(point) / 100);

    Animated.timing(translateY, {
      toValue: height - snapHeight,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return enableSwipeToDismiss && Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > height * 0.3) {
          closeSheet();
        } else if (gestureState.dy > 0) {
          openSheet();
        }
      },
    })
  ).current;

  const renderDragHandle = () => {
    if (!showDragHandle) return null;

    return (
      <View style={styles.dragHandleContainer}>
        <View style={styles.dragHandle} />
      </View>
    );
  };

  const renderHeader = () => {
    if (!title && !subtitle) return null;

    return (
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {title && (
            <Text style={styles.title}>{title}</Text>
          )}
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={closeSheet}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color="#1B2540" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderSnapPoints = () => {
    if (snapPoints.length <= 1) return null;

    return (
      <View style={styles.snapPoints}>
        {snapPoints.map((point, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.snapPoint,
              currentSnapIndex.current === index && styles.snapPointActive,
            ]}
            onPress={() => {
              currentSnapIndex.current = index;
              snapToPoint(point);
            }}
          />
        ))}
      </View>
    );
  };

  const sheetHeight = typeof height === 'string'
    ? height.includes('%')
      ? height * (parseFloat(height) / 100)
      : height
    : height;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent
      onRequestClose={closeSheet}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              backgroundColor: backdropColor,
              opacity: opacity,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backdropTouchable}
            onPress={enableSwipeToDismiss ? closeSheet : undefined}
            activeOpacity={1}
          />
        </Animated.View>

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              height: sheetHeight,
              transform: [{ translateY }],
            },
            style,
          ]}
          {...panResponder.panHandlers}
        >
          <LinearGradient
            colors={[
              'rgba(251, 247, 238, 0.95)',
              'rgba(248, 241, 230, 0.95)',
              'rgba(255, 255, 255, 0.98)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.sheetGradient}
          >
            {/* Glass effect overlay */}
            <View style={styles.glassOverlay} />

            {/* Drag handle */}
            {renderDragHandle()}

            {/* Header */}
            {renderHeader()}

            {/* Snap points */}
            {renderSnapPoints()}

            {/* Content */}
            <View style={styles.content}>
              {children}
            </View>
          </LinearGradient>

          {/* Bottom glow effect */}
          <LinearGradient
            colors={['transparent', 'rgba(62, 96, 216, 0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.bottomGlow}
          />
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backdropTouchable: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#1B2540',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 20,
  },
  sheetGradient: {
    flex: 1,
    position: 'relative',
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(15px)',
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingTop: 20,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(27, 37, 64, 0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(207, 213, 230, 0.3)',
  },
  headerContent: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'InterDisplay-Bold',
    color: '#1B2540',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
    color: '#566FE0',
    lineHeight: 22,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(27, 37, 64, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  snapPoints: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  snapPoint: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(27, 37, 64, 0.1)',
    marginHorizontal: 4,
  },
  snapPointActive: {
    backgroundColor: '#3E60D8',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
  },
});

export default GlassModalSheet;