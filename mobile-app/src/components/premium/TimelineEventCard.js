import React, { useState } from 'react';
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

const TimelineEventCard = ({
  event,
  onPress,
  onExpand,
  expanded = false,
  style = null,
  showConnector = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const animatedHeight = useRef(new Animated.Value(0)).current;

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'meeting':
        return 'people';
      case 'milestone':
        return 'flag';
      case 'update':
        return 'information-circle';
      case 'issue':
        return 'warning';
      case 'note':
        return 'document-text';
      case 'media':
        return 'images';
      case 'invoice':
        return 'receipt';
      default:
        return 'circle';
    }
  };

  const getEventColor = (eventType) => {
    switch (eventType) {
      case 'meeting':
        return '#3E60D8';
      case 'milestone':
        return '#7DB87A';
      case 'update':
        return '#566FE0';
      case 'issue':
        return '#D75A5A';
      case 'note':
        return '#C9B89A';
      case 'media':
        return '#E8B25D';
      case 'invoice':
        return '#7487C1';
      default:
        return '#7487C1';
    }
  };

  const getEventGradient = (eventType) => {
    const color = getEventColor(eventType);
    return [color, `${color}CC`, `${color}66`];
  };

  const toggleExpand = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);

    if (onExpand) {
      onExpand(newExpandedState);
    }

    Animated.timing(animatedHeight, {
      toValue: newExpandedState ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const eventIcon = getEventIcon(event.type);
  const eventColor = getEventColor(event.type);
  const gradientColors = getEventGradient(event.type);

  const expandedHeight = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 150],
  });

  const renderEventIcon = () => (
    <View style={[styles.iconContainer, { backgroundColor: eventColor }]}>
      <Ionicons
        name={eventIcon}
        size={16}
        color="#FFFFFF"
        style={styles.eventIcon}
      />
    </View>
  );

  const renderEventContent = () => (
    <View style={styles.eventContent}>
      <View style={styles.eventHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <View style={styles.eventTime}>
            <Text style={styles.timeText}>{event.time}</Text>
          </View>
        </View>

        {/* Visibility indicator */}
        {event.isInternal && (
          <View style={styles.internalIndicator}>
            <Text style={styles.internalText}>Internal</Text>
          </View>
        )}
      </View>

      {/* Event description */}
      {event.description && (
        <Text style={styles.eventDescription} numberOfLines={isExpanded ? undefined : 2}>
          {event.description}
        </Text>
      )}

      {/* Attachments */}
      {event.attachments && event.attachments.length > 0 && (
        <View style={styles.attachmentsContainer}>
          <Ionicons name="attach" size={14} color="#7487C1" />
          <Text style={styles.attachmentsText}>
            {event.attachments.length} attachment{event.attachments.length > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actionButtons}>
        {event.description && event.description.length > 100 && (
          <TouchableOpacity
            style={styles.expandButton}
            onPress={toggleExpand}
          >
            <Text style={styles.expandButtonText}>
              {isExpanded ? 'Show Less' : 'Show More'}
            </Text>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color="#566FE0"
            />
          </TouchableOpacity>
        )}

        {event.onPress && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => event.onPress(event)}
          >
            <Text style={styles.actionButtonText}>View Details</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Connector line */}
      {showConnector && (
        <View style={[styles.connector, { backgroundColor: eventColor }]} />
      )}

      {/* Timeline dot */}
      <View style={styles.timelineDotContainer}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.timelineDot}
        >
          {renderEventIcon()}
        </LinearGradient>

        {/* Pulse animation for recent events */}
        {event.isRecent && (
          <View style={[styles.pulseRing, { borderColor: eventColor }]} />
        )}
      </View>

      {/* Event card */}
      <TouchableOpacity
        style={styles.eventCard}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#FFFFFF', '#FBF7EE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.cardGradient}
        >
          {renderEventContent()}

          {/* Expandable content */}
          <Animated.View
            style={[
              styles.expandedContent,
              {
                height: expandedHeight,
                opacity: animatedHeight,
              },
            ]}
          >
            <View style={styles.expandedContentInner}>
              {event.location && (
                <View style={styles.detailRow}>
                  <Ionicons name="location" size={14} color="#7487C1" />
                  <Text style={styles.detailText}>{event.location}</Text>
                </View>
              )}

              {event.createdBy && (
                <View style={styles.detailRow}>
                  <Ionicons name="person" size={14} color="#7487C1" />
                  <Text style={styles.detailText}>{event.createdBy}</Text>
                </View>
              )}

              {event.tags && event.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {event.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </Animated.View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 20,
    position: 'relative',
  },
  connector: {
    width: 2,
    height: 60,
    marginLeft: 23,
    marginTop: 40,
  },
  timelineDotContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1B2540',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  eventIcon: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  pulseRing: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    opacity: 0.6,
  },
  eventCard: {
    flex: 1,
    borderRadius: 16,
    shadowColor: '#1B2540',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 16,
  },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'InterDisplay-Bold',
    color: '#1B2540',
    marginBottom: 4,
  },
  eventTime: {
    alignSelf: 'flex-start',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    color: '#7487C1',
  },
  internalIndicator: {
    backgroundColor: 'rgba(201, 184, 154, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  internalText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
    color: '#C9B89A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventDescription: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
    color: '#566FE0',
    lineHeight: 20,
    marginBottom: 12,
  },
  attachmentsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  attachmentsText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    color: '#7487C1',
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandButtonText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
    color: '#566FE0',
    marginRight: 4,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(62, 96, 216, 0.1)',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
    color: '#3E60D8',
  },
  expandedContent: {
    overflow: 'hidden',
    marginTop: 12,
  },
  expandedContentInner: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EFE4D3',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
    color: '#7487C1',
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: 'rgba(116, 135, 193, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    color: '#7487C1',
  },
});

export default TimelineEventCard;