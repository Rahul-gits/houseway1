import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const StatusRibbonCard = ({
  title,
  subtitle,
  status,
  statusColor = '#3E60D8',
  avatar = null,
  children,
  onPress,
  ribbonPosition = 'left', // left, right
  style = null,
  shadowIntensity = 'medium', // light, medium, heavy
}) => {
  const getShadowStyle = () => {
    switch (shadowIntensity) {
      case 'light':
        return {
          shadowColor: '#1B2540',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        };
      case 'heavy':
        return {
          shadowColor: '#1B2540',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 24,
          elevation: 12,
        };
      default: // medium
        return {
          shadowColor: '#1B2540',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 6,
        };
    }
  };

  const CardContent = () => (
    <View style={styles.cardContent}>
      {avatar && <View style={styles.avatarContainer}>{avatar}</View>}

      <View style={styles.textContent}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
        {children}
      </View>

      {status && (
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {status}
          </Text>
        </View>
      )}
    </View>
  );

  const cardStyle = [
    styles.card,
    ribbonPosition === 'left' && styles.ribbonLeft,
    ribbonPosition === 'right' && styles.ribbonRight,
    { borderLeftColor: statusColor, borderRightColor: statusColor },
    getShadowStyle(),
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#FFFFFF', '#FBF7EE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradient}
        >
          <CardContent />
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle}>
      <LinearGradient
        colors={['#FFFFFF', '#FBF7EE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <CardContent />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  ribbonLeft: {
    borderLeftWidth: 6,
  },
  ribbonRight: {
    borderRightWidth: 6,
  },
  gradient: {
    flex: 1,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  avatarContainer: {
    marginRight: 16,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'InterDisplay-Bold',
    color: '#1B2540',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
    color: '#7487C1',
    lineHeight: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(62, 96, 216, 0.1)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default StatusRibbonCard;