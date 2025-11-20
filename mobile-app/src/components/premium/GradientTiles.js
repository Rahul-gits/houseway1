import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const GradientTiles = ({
  tiles,
  columns = 2,
  spacing = 16,
  onPress,
  animated = true,
  style = null,
}) => {
  const tileWidth = (width - spacing * (columns + 1)) / columns;

  const Tile = ({ tile, index }) => {
    const scaleValue = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      if (animated) {
        Animated.spring(scaleValue, {
          toValue: 0.95,
          useNativeDriver: true,
          tension: 150,
          friction: 8,
        }).start();
      }
    };

    const handlePressOut = () => {
      if (animated) {
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          tension: 150,
          friction: 8,
        }).start();
      }
    };

    const getTileGradient = (variant) => {
      switch (variant) {
        case 'success':
          return ['#7DB87A', '#68B168'];
        case 'warning':
          return ['#E8B25D', '#D49A48'];
        case 'danger':
          return ['#D75A5A', '#C54545'];
        case 'info':
          return ['#7487C1', '#566FE0'];
        case 'secondary':
          return ['#EFE4D3', '#D4C4B0'];
        default: // primary
          return ['#3E60D8', '#566FE0'];
      }
    };

    const getIconName = (iconKey) => {
      switch (iconKey) {
        case 'clients':
          return 'people';
        case 'projects':
          return 'folder';
        case 'invoices':
          return 'receipt';
        case 'media':
          return 'images';
        case 'timeline':
          return 'time';
        case 'settings':
          return 'settings';
        case 'analytics':
          return 'bar-chart';
        case 'documents':
          return 'document-text';
        default:
          return 'grid';
      }
    };

    const gradientColors = tile.gradientColors || getTileGradient(tile.variant);
    const iconName = tile.icon || getIconName(tile.key);

    const renderTileContent = () => (
      <>
        {/* Background pattern */}
        <View style={styles.backgroundPattern}>
          {[...Array(3)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.patternDot,
                {
                  top: 20 + i * 30,
                  left: i === 1 ? 'auto' : 15 + i * 25,
                  right: i === 1 ? 15 : 'auto',
                },
              ]}
            />
          ))}
        </View>

        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons
            name={iconName}
            size={32}
            color="#FFFFFF"
            style={styles.tileIcon}
          />
        </View>

        {/* Content */}
        <View style={styles.tileContent}>
          <Text style={styles.tileTitle}>{tile.title}</Text>
          {tile.subtitle && (
            <Text style={styles.tileSubtitle}>{tile.subtitle}</Text>
          )}
          {tile.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{tile.badge}</Text>
            </View>
          )}
        </View>

        {/* Wave shape */}
        <View style={styles.waveShape}>
          <View style={styles.waveTop} />
          <View style={styles.waveBottom} />
        </View>
      </>
    );

    return (
      <Animated.View
        style={[
          {
            width: tileWidth,
            height: tileWidth,
            transform: [{ scale: scaleValue }],
          },
          index % columns === 0 && { marginLeft: spacing },
        ]}
      >
        <TouchableOpacity
          style={styles.tile}
          onPress={() => onPress?.(tile, index)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tileGradient}
          >
            {renderTileContent()}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderTileRow = (rowTiles, rowIndex) => (
    <View key={rowIndex} style={styles.row}>
      {rowTiles.map((tile, index) => (
        <Tile
          key={tile.key || index}
          tile={tile}
          index={rowIndex * columns + index}
        />
      ))}
    </View>
  );

  // Group tiles into rows
  const rows = [];
  for (let i = 0; i < tiles.length; i += columns) {
    rows.push(tiles.slice(i, i + columns));
  }

  return (
    <View style={[styles.container, { marginHorizontal: spacing }, style]}>
      {rows.map((row, rowIndex) => renderTileRow(row, rowIndex))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tile: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#1B2540',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  tileGradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
    position: 'relative',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tileIcon: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tileContent: {
    flex: 1,
    justifyContent: 'flex-end',
    zIndex: 2,
  },
  tileTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'InterDisplay-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tileSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  waveShape: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 80,
    height: 40,
    overflow: 'hidden',
  },
  waveTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopRightRadius: 80,
    transform: [{ skewX: '-15deg' }],
  },
  waveBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomRightRadius: 60,
  },
});

export default GradientTiles;