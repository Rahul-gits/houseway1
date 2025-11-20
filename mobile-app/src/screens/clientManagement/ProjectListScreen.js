import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

// Import premium components
import GradientButton from '../../components/premium/GradientButton';

// Import theme
import { colors, typography, spacing, borderRadius } from '../../styles/theme';

const { width } = Dimensions.get('window');

const ProjectListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { clientId } = route.params || {};

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const mockProjects = [
    {
      id: '1',
      name: 'Kitchen Renovation',
      client: 'Sarah Johnson',
      status: 'In Progress',
      statusColor: '#3E60D8',
      progress: 65,
      budget: '$80,000',
      image: 'https://picsum.photos/400/200?random=1',
      startDate: '2024-01-15',
      expectedCompletion: '2024-03-30',
      lastActivity: '2 hours ago',
      priority: 'High',
      team: ['John Smith', 'Emily Chen'],
      milestones: 8,
      completedMilestones: 5,
      description: 'Complete kitchen remodel with modern design and premium appliances',
    },
    {
      id: '2',
      name: 'Master Bathroom',
      client: 'Sarah Johnson',
      status: 'Planning',
      statusColor: '#7487C1',
      progress: 15,
      budget: '$45,000',
      image: 'https://picsum.photos/400/200?random=2',
      startDate: '2024-02-01',
      expectedCompletion: '2024-05-15',
      lastActivity: '1 day ago',
      priority: 'Medium',
      team: ['Michael Brown'],
      milestones: 6,
      completedMilestones: 1,
      description: 'Luxury master bathroom with spa features and modern fixtures',
    },
    {
      id: '3',
      name: 'Living Room Makeover',
      client: 'David Thompson',
      status: 'In Progress',
      statusColor: '#3E60D8',
      progress: 45,
      budget: '$35,000',
      image: 'https://picsum.photos/400/200?random=3',
      startDate: '2024-01-20',
      expectedCompletion: '2024-03-15',
      lastActivity: '3 hours ago',
      priority: 'High',
      team: ['Sarah Davis', 'Tom Wilson'],
      milestones: 5,
      completedMilestones: 2,
      description: 'Contemporary living room redesign with custom built-ins',
    },
    {
      id: '4',
      name: 'Home Office',
      client: 'Robert Wilson',
      status: 'Completed',
      statusColor: '#7DB87A',
      progress: 100,
      budget: '$25,000',
      image: 'https://picsum.photos/400/200?random=4',
      startDate: '2023-11-10',
      expectedCompletion: '2024-01-15',
      lastActivity: '2 weeks ago',
      priority: 'Low',
      team: ['Lisa Anderson'],
      milestones: 4,
      completedMilestones: 4,
      description: 'Custom home office with ergonomic design and smart features',
    },
    {
      id: '5',
      name: 'Outdoor Kitchen',
      client: 'Amanda Foster',
      status: 'On Hold',
      statusColor: '#E8B25D',
      progress: 30,
      budget: '$60,000',
      image: 'https://picsum.photos/400/200?random=5',
      startDate: '2024-01-05',
      expectedCompletion: '2024-04-20',
      lastActivity: '5 days ago',
      priority: 'Medium',
      team: ['Chris Taylor'],
      milestones: 7,
      completedMilestones: 2,
      description: 'Outdoor entertainment area with full kitchen setup',
    },
  ];

  useEffect(() => {
    loadProjects();
  }, [clientId]);

  const loadProjects = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const filteredProjects = clientId
        ? mockProjects.filter(p => p.clientId === clientId)
        : mockProjects;
      setProjects(filteredProjects);
      setLoading(false);
    }, 500);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#D75A5A';
      case 'Medium': return '#E8B25D';
      case 'Low': return '#7DB87A';
      default: return '#7487C1';
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
      </TouchableOpacity>

      <Text style={styles.title}>Projects</Text>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('CreateProject', { clientId })}
      >
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Create</Text>
      </TouchableOpacity>
    </View>
  );

  const renderProjectTile = ({ item, index }) => {
    const scaleValue = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scaleValue.value }],
      };
    });

    const handlePressIn = () => {
      scaleValue.value = withSpring(0.98, { damping: 15, stiffness: 100 });
    };

    const handlePressOut = () => {
      scaleValue.value = withSpring(1, { damping: 15, stiffness: 100 });
    };

    return (
      <Animated.View style={[animatedStyle, styles.projectTileContainer]}>
        <TouchableOpacity
          style={styles.projectTile}
          onPress={() => navigation.navigate('ProjectDetail', { projectId: item.id })}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          {/* Background Image with Overlay */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.image }} style={styles.projectImage} />
            <LinearGradient
              colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.imageOverlay}
            />
          </View>

          {/* Content */}
          <View style={styles.projectContent}>
            {/* Status and Priority */}
            <View style={styles.statusBar}>
              <View style={[styles.statusIndicator, { backgroundColor: item.statusColor }]} />
              <Text style={styles.statusText}>{item.status}</Text>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
                <Text style={styles.priorityText}>{item.priority}</Text>
              </View>
            </View>

            {/* Project Name and Client */}
            <Text style={styles.projectName}>{item.name}</Text>
            <Text style={styles.clientName}>{item.client}</Text>

            {/* Progress Bar */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={styles.progressPercentage}>{item.progress}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
              </View>
            </View>

            {/* Budget and Timeline */}
            <View style={styles.projectDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="card" size={14} color="#7487C1" />
                <Text style={styles.detailText}>{item.budget}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="calendar" size={14} color="#7487C1" />
                <Text style={styles.detailText}>Due {item.expectedCompletion}</Text>
              </View>
            </View>

            {/* Team and Milestones */}
            <View style={styles.footerInfo}>
              <View style={styles.teamInfo}>
                <Ionicons name="people" size={14} color="#7487C1" />
                <Text style={styles.teamText}>{item.team.length} team members</Text>
              </View>
              <View style={styles.milestoneInfo}>
                <Ionicons name="flag" size={14} color="#7487C1" />
                <Text style={styles.milestoneText}>
                  {item.completedMilestones}/{item.milestones} milestones
                </Text>
              </View>
            </View>

            {/* Activity Pulse for recent activity */}
            {item.lastActivity.includes('hour') && (
              <View style={styles.activityPulse}>
                <View style={styles.pulseDot} />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="folder-open" size={64} color="#C9B89A" />
      <Text style={styles.emptyStateTitle}>No Projects Found</Text>
      <Text style={styles.emptyStateSubtitle}>
        {clientId
          ? "This client doesn't have any projects yet"
          : "Start by creating your first project"
        }
      </Text>
      <GradientButton
        title="Create First Project"
        onPress={() => navigation.navigate('CreateProject', { clientId })}
        gradientColors={['#3E60D8', '#566FE0']}
        style={styles.createButton}
      />
    </View>
  );

  const renderQuickStats = () => (
    <View style={styles.quickStats}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{projects.length}</Text>
        <Text style={styles.statLabel}>Total Projects</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>
          {projects.filter(p => p.status === 'In Progress').length}
        </Text>
        <Text style={styles.statLabel}>In Progress</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>
          {projects.filter(p => p.priority === 'High').length}
        </Text>
        <Text style={styles.statLabel}>High Priority</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>
          {Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length || 0)}%
        </Text>
        <Text style={styles.statLabel}>Avg Progress</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FBF7EE', '#F8F1E6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        {renderHeader()}

        {projects.length > 0 && renderQuickStats()}

        <FlatList
          data={projects}
          renderItem={renderProjectTile}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            projects.length === 0 && styles.listContentEmpty,
          ]}
          refreshing={loading}
          onRefresh={loadProjects}
        />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.beige[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSizes.xxxl,
    fontFamily: typography.fontFamily.display,
    color: colors.text.primary,
    fontWeight: '800',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blue[500],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    shadowColor: colors.blue[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.white,
    marginLeft: spacing.sm,
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.display,
    color: colors.text.primary,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxxxl,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  projectTileContainer: {
    marginBottom: spacing.lg,
  },
  projectTile: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  imageContainer: {
    height: 140,
    position: 'relative',
  },
  projectImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  projectContent: {
    padding: spacing.lg,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  statusText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
    fontWeight: '600',
    marginRight: spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    marginLeft: 'auto',
  },
  priorityText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.white,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  projectName: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.display,
    color: colors.text.primary,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  clientName: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },
  progressSection: {
    marginBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.tertiary,
  },
  progressPercentage: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.beige[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.blue[500],
    borderRadius: 3,
  },
  projectDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.tertiary,
    marginLeft: spacing.xs,
  },
  footerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.tertiary,
    marginLeft: spacing.xs,
  },
  milestoneInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestoneText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.tertiary,
    marginLeft: spacing.xs,
  },
  activityPulse: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7DB87A',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xxxl,
  },
  emptyStateTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.display,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyStateSubtitle: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  createButton: {
    alignSelf: 'center',
  },
});

export default ProjectListScreen;