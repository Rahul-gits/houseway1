import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const WaveHeader = ({
  title,
  subtitle,
  gradientColors = ['#3E60D8', '#566FE0', '#FBF7EE'],
  height = 120,
  showFloatingBlobs = true,
}) => {
  return (
    <View style={[styles.container, { height }]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.6 }}
        style={styles.gradient}
      >
        {/* Floating circular blobs */}
        {showFloatingBlobs && (
          <>
            <View style={[styles.blob, styles.blob1]} />
            <View style={[styles.blob, styles.blob2]} />
            <View style={[styles.blob, styles.blob3]} />
          </>
        )}

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {/* Wave shape at bottom */}
        <View style={styles.waveContainer}>
          <View style={styles.wave} />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    position: 'relative',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  blob1: {
    width: 80,
    height: 80,
    top: -20,
    right: width * 0.1,
  },
  blob2: {
    width: 60,
    height: 60,
    top: 20,
    right: width * 0.3,
  },
  blob3: {
    width: 40,
    height: 40,
    top: -10,
    right: width * 0.5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    zIndex: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
  },
  wave: {
    flex: 1,
    backgroundColor: '#FBF7EE',
    borderTopLeftRadius: width,
    borderTopRightRadius: width,
  },
});

export default WaveHeader;