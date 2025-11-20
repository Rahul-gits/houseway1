import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';

// Import premium components
import StatusRibbonCard from '../../components/premium/StatusRibbonCard';

// Import theme
import { colors, typography, spacing, borderRadius, cardStyles } from '../../styles/theme';

const { width } = Dimensions.get('window');

const ClientsListScreen = ({ navigation }) => {
  const route = useRoute();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(false);

  const scrollViewRef = useRef(null);

  const statusFilters = [
    { key: 'All', label: 'All', color: '#7487C1' },
    { key: 'Active', label: 'Active', color: '#7DB87A' },
    { key: 'At Risk', label: 'At Risk', color: '#E8B25D' },
    { key: 'Pending', label: 'Pending', color: '#566FE0' },
    { key: 'Inactive', label: 'Inactive', color: '#C9B89A' },
  ];

  const mockClients = [
    {
      id: '1',
      name: 'Sarah Johnson',
      subtitle: 'Kitchen Renovation • 2 active projects',
      status: 'Active',
      statusColor: '#7DB87A',
      email: 'sarah.j@email.com',
      phone: '+1 (555) 123-4567',
      avatar: null,
      lastActivity: '2 hours ago',
      totalValue: '$125,000',
      projectCount: 2,
    },
    {
      id: '2',
      name: 'Michael Chen',
      subtitle: 'Bathroom Remodel • 1 active project',
      status: 'At Risk',
      statusColor: '#E8B25D',
      email: 'mchen@email.com',
      phone: '+1 (555) 234-5678',
      avatar: null,
      lastActivity: '3 days ago',
      totalValue: '$45,000',
      projectCount: 1,
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      subtitle: 'Living Room Design • Planning phase',
      status: 'Pending',
      statusColor: '#566FE0',
      email: 'emily.r@email.com',
      phone: '+1 (555) 345-6789',
      avatar: null,
      lastActivity: '1 week ago',
      totalValue: '$75,000',
      projectCount: 1,
    },
    {
      id: '4',
      name: 'David Thompson',
      subtitle: 'Full Home Renovation • 3 active projects',
      status: 'Active',
      statusColor: '#7DB87A',
      email: 'dthompson@email.com',
      phone: '+1 (555) 456-7890',
      avatar: null,
      lastActivity: '5 hours ago',
      totalValue: '$250,000',
      projectCount: 3,
    },
    {
      id: '5',
      name: 'Jessica Martinez',
      subtitle: 'Bedroom Suite • Completed',
      status: 'Inactive',
      statusColor: '#C9B89A',
      email: 'jmartinez@email.com',
      phone: '+1 (555) 567-8901',
      avatar: null,
      lastActivity: '2 weeks ago',
      totalValue: '$35,000',
      projectCount: 0,
    },
    {
      id: '6',
      name: 'Robert Wilson',
      subtitle: 'Office Space Design • 1 active project',
      status: 'Active',
      statusColor: '#7DB87A',
      email: 'rwilson@email.com',
      phone: '+1 (555) 678-9012',
      avatar: null,
      lastActivity: '1 day ago',
      totalValue: '$85,000',
      projectCount: 1,
    },
    {
      id: '7',
      name: 'Amanda Foster',
      subtitle: 'Outdoor Kitchen • At Risk',
      status: 'At Risk',
      statusColor: '#E8B25D',
      email: 'afoster@email.com',
      phone: '+1 (555) 789-0123',
      avatar: null,
      lastActivity: '5 days ago',
      totalValue: '$60,000',
      projectCount: 1,
    },
  ];

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [searchQuery, selectedFilter, clients]);

  const loadClients = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setClients(mockClients);
      setLoading(false);
    }, 500);
  };

  const filterClients = () => {
    let filtered = [...clients];

    // Filter by status
    if (selectedFilter !== 'All') {
      filtered = filtered.filter(client => client.status === selectedFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(query) ||
        client.subtitle.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.phone.includes(query)
      );
    }

    setFilteredClients(filtered);
  };

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInput}>
        <Ionicons name="search" size={20} color="#7487C1" style={styles.searchIcon} />
        <TextInput
          style={styles.searchText}
          placeholder="Search clients by name, email, phone..."
          placeholderTextColor={colors.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#7487C1" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderFilterChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterScrollContent}
    >
      {statusFilters.map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterChip,
            selectedFilter === filter.key && {
              backgroundColor: filter.color,
              borderColor: filter.color,
            },
          ]}
          onPress={() => setSelectedFilter(filter.key)}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedFilter === filter.key && { color: '#FFFFFF' },
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderClientCard = ({ item, index }) => (
    <StatusRibbonCard
      key={item.id}
      title={item.name}
      subtitle={
        <View>
          <Text style={styles.clientSubtitle}>{item.subtitle}</Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactRow}>
              <Ionicons name="mail" size={12} color="#7487C1" />
              <Text style={styles.contactText}>{item.email}</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="call" size={12} color="#7487C1" />
              <Text style={styles.contactText}>{item.phone}</Text>
            </View>
          </View>
        </View>
      }
      status={item.status}
      statusColor={item.statusColor}
      avatar={item.avatar}
      onPress={() => navigation.navigate('ClientProfile', { clientId: item.id })}
      ribbonPosition="left"
      style={styles.clientCard}
    >
      <View style={styles.clientMetrics}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Projects</Text>
          <Text style={styles.metricValue}>{item.projectCount}</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Value</Text>
          <Text style={styles.metricValue}>{item.totalValue}</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Last Activity</Text>
          <Text style={styles.metricValue}>{item.lastActivity}</Text>
        </View>
      </View>
    </StatusRibbonCard>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color="#C9B89A" />
      <Text style={styles.emptyStateTitle}>No clients found</Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchQuery
          ? 'Try adjusting your search or filters'
          : 'Start by adding your first client'}
      </Text>
      {!searchQuery && (
        <TouchableOpacity style={styles.addClientButton}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addClientButtonText}>Add First Client</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Clients</Text>
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add Client</Text>
      </TouchableOpacity>
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

        {renderSearchBar()}

        {renderFilterChips()}

        <FlatList
          ref={scrollViewRef}
          data={filteredClients}
          renderItem={renderClientCard}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            filteredClients.length === 0 && styles.listContentEmpty,
          ]}
          refreshing={loading}
          onRefresh={loadClients}
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
  searchContainer: {
    paddingHorizontal: spacing.lg,
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
    marginRight: spacing.sm,
  },
  searchText: {
    flex: 1,
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
  },
  filterScrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.beige[200],
    borderWidth: 1,
    borderColor: colors.beige[300],
    marginRight: spacing.sm,
  },
  filterChipText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxxxxl,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  clientCard: {
    marginBottom: spacing.md,
  },
  clientSubtitle: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  contactInfo: {
    marginTop: spacing.sm,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  contactText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.tertiary,
    marginLeft: spacing.xs,
  },
  clientMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  metricValue: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    fontWeight: '600',
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
    fontFamily: typography.fontFamily.heading,
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
  addClientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blue[500],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    shadowColor: colors.blue[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addClientButtonText: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.white,
    marginLeft: spacing.sm,
  },
});

export default ClientsListScreen;