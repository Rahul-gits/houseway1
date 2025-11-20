import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  ScrollView,
  Dimensions,
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';

// Import premium components
import WaveHeader from '../../components/premium/WaveHeader';
import GradientTiles from '../../components/premium/GradientTiles';
import StatusRibbonCard from '../../components/premium/StatusRibbonCard';
import WorkloadRing from '../../components/premium/WorkloadRing';

// Import theme
import { colors, typography, spacing, shapes, borderRadius } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native';

const { width } = Dimensions.get('window');

const HomeDashboardScreen = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalClients: 0,
    activeProjects: 0,
    pendingInvoices: 0,
    recentMedia: 0,
    clientGrowth: 0,
    projectCompletion: 0,
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setDashboardData({
        totalClients: 24,
        activeProjects: 12,
        pendingInvoices: 5,
        recentMedia: 18,
        clientGrowth: 85,
        projectCompletion: 72,
      });
      setRefreshing(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // Load initial data
    onRefresh();
  }, [onRefresh]);

  const actionTiles = [
    {
      key: 'clients',
      title: 'View Clients',
      subtitle: 'Manage client relationships',
      icon: 'people',
      variant: 'primary',
      badge: dashboardData.totalClients.toString(),
      onPress: () => navigation.navigate('ClientsList'),
    },
    {
      key: 'projects',
      title: 'View Projects',
      subtitle: 'Track project progress',
      icon: 'folder',
      variant: 'info',
      badge: dashboardData.activeProjects.toString(),
      onPress: () => navigation.navigate('ProjectList'),
    },
    {
      key: 'invoices',
      title: 'Create Invoice',
      subtitle: 'Generate new invoices',
      icon: 'receipt',
      variant: 'warning',
      badge: dashboardData.pendingInvoices.toString(),
      onPress: () => navigation.navigate('CreateInvoice'),
    },
    {
      key: 'media',
      title: 'Upload Media',
      subtitle: 'Add photos & files',
      icon: 'images',
      variant: 'success',
      badge: dashboardData.recentMedia.toString(),
      onPress: () => navigation.navigate('UploadMedia'),
    },
  ];

  const recentClients = [
    {
      id: '1',
      name: 'Sarah Johnson',
      subtitle: 'Kitchen Renovation',
      status: 'Active',
      statusColor: '#7DB87A',
      avatar: null, // Would be Image component
    },
    {
      id: '2',
      name: 'Michael Chen',
      subtitle: 'Bathroom Remodel',
      status: 'At Risk',
      statusColor: '#E8B25D',
      avatar: null,
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      subtitle: 'Living Room Design',
      status: 'Pending',
      statusColor: '#566FE0',
      avatar: null,
    },
  ];

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInput}>
        <Ionicons name="search" size={20} color="#7487C1" style={styles.searchIcon} />
        <Text style={styles.searchPlaceholder}>Search clients, projects, invoices...</Text>
      </View>
    </View>
  );

  const renderQuickStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <WorkloadRing
          value={dashboardData.clientGrowth}
          maxValue={100}
          size={80}
          strokeWidth={8}
          title="Growth"
          subtitle="This month"
          gradientColors={['#7DB87A', '#68B168']}
        />
      </View>
      <View style={styles.statItem}>
        <WorkloadRing
          value={dashboardData.projectCompletion}
          maxValue={100}
          size={80}
          strokeWidth={8}
          title="On Track"
          subtitle="Projects"
          gradientColors={['#3E60D8', '#566FE0']}
        />
      </View>
      <View style={styles.statItem}>
        <View style={styles.quickActions}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('AddTimelineEvent')}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Add Update</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionButton, styles.quickActionSecondary]}
          >
            <Ionicons name="document-text" size={20} color="#3E60D8" />
            <Text style={[styles.quickActionText, { color: '#3E60D8' }]}>New Note</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderRecentClients = () => (
    <View style={styles.recentSection}>
      <Text style={styles.sectionTitle}>Recent Clients</Text>
      {recentClients.map((client) => (
        <StatusRibbonCard
          key={client.id}
          title={client.name}
          subtitle={client.subtitle}
          status={client.status}
          statusColor={client.statusColor}
          avatar={client.avatar}
          onPress={() => navigation.navigate('ClientProfile', { clientId: client.id })}
          ribbonPosition="left"
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3E60D8', '#566FE0']}
            tintColor="#3E60D8"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <WaveHeader
          title="Client Management"
          subtitle="Welcome back! Here's your overview"
          showFloatingBlobs={true}
        />

        {renderSearchBar()}

        <GradientTiles
          tiles={actionTiles}
          columns={2}
          spacing={16}
          onPress={(tile) => tile.onPress()}
        />

        {renderQuickStats()}

        {renderRecentClients()}

        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxxxl,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.glass,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: shapes.glass.borderWidth,
    borderColor: shapes.glass.borderColor,
  },
  searchIcon: {
    marginRight: spacing.md,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.muted,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.xl,
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickActions: {
    alignItems: 'center',
    width: '100%',
  },
  quickActionsTitle: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blue[500],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.sm,
    shadowColor: colors.blue[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  quickActionSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.blue[500],
    shadowOpacity: 0,
    elevation: 0,
  },
  quickActionText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.white,
    marginLeft: spacing.sm,
  },
  recentSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    marginBottom: spacing.md,
    fontWeight: '700',
  },
  spacer: {
    height: spacing.xxxxxl,
  },
});

export default HomeDashboardScreen;