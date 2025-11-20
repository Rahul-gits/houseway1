import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import ModernHeader from '../../components/ModernHeader';
import ModernBottomNav, { EmployeeTabs } from '../../components/ModernBottomNav';
import { useAuth } from '../../context/AuthContext';
import { projectsAPI, materialRequestsAPI, dashboardAPI } from '../../utils/api';
import theme from '../../styles/theme';
import { socket } from '../../utils/socket';

const EmployeeDashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    assignedProjects: [],
    materialRequests: [],
    recentActivities: [],
    stats: {
      totalProjects: 0,
      activeProjects: 0,
      pendingRequests: 0,
      completedProjects: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadDashboardData();

    // Listen for real-time updates through socket.io
    socket.on('projectUpdated', handleRealtimeUpdate);
    socket.on('materialRequest', handleRealtimeUpdate);

    return () => {
      socket.off('projectUpdated', handleRealtimeUpdate);
      socket.off('materialRequest', handleRealtimeUpdate);
    };
  }, []);

  // Refetch dashboard data when any real-time update relevant to employee occurs
  const handleRealtimeUpdate = (event) => {
    // Filter for relevant update? (Optional: could inspect event payload to narrow reloads)
    loadDashboardData();
  };

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load assigned projects, material requests, and recent activities
      const [projectsRes, materialRequestsRes, activitiesRes] = await Promise.allSettled([
        projectsAPI.getProjects({ assignedTo: user._id, limit: 20 }),
        materialRequestsAPI.getMaterialRequests({ createdBy: user._id, limit: 10 }),
        dashboardAPI.getRecentActivity(5), // Get last 5 activities
      ]);

      let projects = [];
      let materialRequests = [];

      // Process projects data
      if (projectsRes.status === 'fulfilled' && projectsRes.value.success) {
        projects = projectsRes.value.data.projects || [];
      }

      // Process material requests data
      if (materialRequestsRes.status === 'fulfilled' && materialRequestsRes.value.success) {
        materialRequests = materialRequestsRes.value.data.materialRequests || [];
      }

      // Calculate stats
      const stats = {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => ['planning', 'in-progress'].includes(p.status)).length,
        completedProjects: projects.filter(p => p.status === 'completed').length,
        pendingRequests: materialRequests.filter(r => r.status === 'pending').length,
      };

      // Process recent activities
      let recentActivities = [];
      if (activitiesRes.status === 'fulfilled' && activitiesRes.value.success) {
        recentActivities = activitiesRes.value.data.activities || [];
      }

      setDashboardData({
        assignedProjects: projects,
        materialRequests,
        recentActivities,
        stats,
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleLogout = () => {
    // For web, use window.confirm; for mobile, use Alert
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to logout?');
      if (confirmed) {
        performLogout();
      }
    } else {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', style: 'destructive', onPress: performLogout },
        ]
      );
    }
  };

  const performLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      if (Platform.OS === 'web') {
        alert('Failed to logout. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to logout. Please try again.');
      }
    }
  };

  const StatCard = ({ title, value, subtitle, color, onPress }) => (
    <TouchableOpacity style={{...styles.statCard, borderLeftColor: color}} onPress={onPress}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </TouchableOpacity>
  );

  const ProjectCard = ({ project }) => (
    <TouchableOpacity
      style={styles.projectCard}
      onPress={() => navigation.navigate('Projects', {
        screen: 'ProjectDetails',
        params: { projectId: project._id }
      })}
    >
      <View style={styles.projectIdHeader}>
        <Text style={styles.projectIdText}>
          Project ID: {project.projectId || project._id.slice(-8).toUpperCase()}
        </Text>
      </View>
      <View style={styles.projectHeader}>
        <Text style={styles.projectTitle} numberOfLines={2}>{project.title}</Text>
        <View style={{...styles.statusBadge, backgroundColor: getStatusColor(project.status)}}>
          <Text style={styles.statusText}>{project.status.replace('-', ' ')}</Text>
        </View>
      </View>
      <Text style={styles.projectDescription} numberOfLines={2}>
        {project.description}
      </Text>
      <View style={styles.projectFooter}>
        <Text style={styles.projectProgress}>
          Progress: {project.progress?.percentage || 0}%
        </Text>
        <Text style={styles.projectDate}>
          Due: {project.timeline?.expectedEndDate ?
            new Date(project.timeline.expectedEndDate).toLocaleDateString() :
            'Not set'
          }
        </Text>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    const colors = {
      planning: '#2196F3',
      'in-progress': '#4CAF50',
      completed: '#9C27B0',
      'on-hold': '#FF9800',
      cancelled: '#f44336',
    };
    return colors[status] || colors.planning;
  };

  const ActivityItem = ({ activity }) => {
    const getActivityIcon = (type) => {
      switch (type) {
        case 'project': return 'folder';
        case 'materialRequest': return 'package';
        default: return 'bell';
      }
    };

    return (
      <View style={styles.activityItem}>
        <View style={styles.activityIconContainer}>
          <Feather name={getActivityIcon(activity.type)} size={20} color="#666" />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle} numberOfLines={1}>{activity.message || activity.title}</Text>
          <Text style={styles.activityTime}>{activity.time}</Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <ModernHeader
        title="Employee Dashboard"
        user={user}
        onProfilePress={handleLogout}
        notificationCount={0} // TODO: wire up real notifications
      />
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>

          <View style={styles.statsGrid}>
            <StatCard
              title="Assigned Projects"
              value={dashboardData.stats.totalProjects}
              subtitle={`${dashboardData.stats.activeProjects} active`}
              color={theme.colors.primary.main}
              onPress={() => navigation.navigate('Projects')}
            />

            <StatCard
              title="Completed"
              value={dashboardData.stats.completedProjects}
              subtitle="Projects finished"
              color={theme.colors.secondary[500]}
              onPress={() => navigation.navigate('Projects')}
            />

            <StatCard
              title="Material Requests"
              value={dashboardData.materialRequests.length}
              subtitle={`${dashboardData.stats.pendingRequests} pending`}
              color={theme.colors.warning[500]}
              onPress={() => navigation.navigate('Materials')}
            />

            <StatCard
              title="Active Tasks"
              value={dashboardData.stats.activeProjects}
              subtitle="In progress"
              color={theme.colors.primary.medium}
              onPress={() => navigation.navigate('Projects')}
            />
          </View>
        </View>

        {/* Recent Projects */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Projects</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Projects')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {dashboardData.assignedProjects.length > 0 ? (
            dashboardData.assignedProjects.slice(0, 3).map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No projects assigned yet</Text>
            </View>
          )}
        </View>

        {/* Recent Activity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            {dashboardData.recentActivities.length > 0 ? (
              dashboardData.recentActivities.map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))
            ) : (
              <Text style={styles.noActivityText}>No recent activities</Text>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Materials', { screen: 'CreateRequest' })}
            >
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionTitle}>New Material Request</Text>
              <Text style={styles.actionSubtitle}>Request materials for projects</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Projects')}
            >
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionTitle}>Update Progress</Text>
              <Text style={styles.actionSubtitle}>Update project status</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Files')}
            >
              <Text style={styles.actionIcon}>📁</Text>
              <Text style={styles.actionTitle}>Upload Files</Text>
              <Text style={styles.actionSubtitle}>Add project documents</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Projects')}
            >
              <Text style={styles.actionIcon}>📷</Text>
              <Text style={styles.actionTitle}>Site Photos</Text>
              <Text style={styles.actionSubtitle}>Upload progress photos</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <ModernBottomNav
        tabs={EmployeeTabs}
        activeTab={activeTab}
        onTabPress={setActiveTab}
        showLabels={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: theme.colors.primary.main,
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 2,
  },
  roleText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    padding: 20,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  seeAllText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  projectIdHeader: {
    backgroundColor: theme.colors.background.tertiary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
    alignSelf: 'flex-start',
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary.main,
  },
  projectIdText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary.main,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  projectDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectProgress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  projectDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
  noActivityText: {
    textAlign: 'center',
    paddingVertical: 20,
    color: '#999',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default EmployeeDashboardScreen;
