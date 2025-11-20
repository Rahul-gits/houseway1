import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Import premium components
import FoldedPanel from '../../components/premium/FoldedPanel';
import GradientButton from '../../components/premium/GradientButton';
import WorkloadRing from '../../components/premium/WorkloadRing';
import MilestoneWavePath from '../../components/premium/MilestoneWavePath';

// Import theme
import { colors, typography, spacing, borderRadius } from '../../styles/theme';

const ClientProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { clientId } = route.params || {};

  const [client, setClient] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    details: true,
    contact: false,
    address: false,
    tags: false,
    financial: true,
  });

  const mockClient = {
    id: clientId || '1',
    name: 'Sarah Johnson',
    status: 'Active',
    statusColor: '#7DB87A',
    email: 'sarah.j@email.com',
    phone: '+1 (555) 123-4567',
    secondaryPhone: '+1 (555) 987-6543',
    address: {
      street: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA',
    },
    projectAddress: {
      street: '456 Oak Avenue',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94103',
    },
    clientType: 'Residential',
    preferredStyle: 'Modern',
    budgetRange: '$100k - $200k',
    propertyType: 'Single Family Home',
    startDate: '2024-01-15',
    riskScore: 'Low',
    lastActivity: '2 hours ago',
    communicationPreference: 'Email',
    preferredContactTime: 'Morning (9AM - 12PM)',
    totalSpent: '$125,000',
    averageProjectValue: '$62,500',
    paymentTerms: 'Net 30',
    tags: ['VIP', 'Referral', 'Modern Design', 'Quick Decisions'],
    notes: 'Client prefers modern minimalist design with natural materials. Very responsive to communication.',
    projects: [
      {
        id: '1',
        name: 'Kitchen Renovation',
        status: 'In Progress',
        progress: 65,
        budget: '$80,000',
        startDate: '2024-01-15',
        expectedCompletion: '2024-03-30',
      },
      {
        id: '2',
        name: 'Master Bathroom',
        status: 'Planning',
        progress: 15,
        budget: '$45,000',
        startDate: '2024-02-01',
        expectedCompletion: '2024-05-15',
      },
    ],
    milestones: [
      { title: 'Initial Consultation', date: 'Jan 15', status: 'completed' },
      { title: 'Design Approval', date: 'Jan 28', status: 'completed' },
      { title: 'Permit Application', date: 'Feb 10', status: 'current' },
      { title: 'Construction Start', date: 'Feb 20', status: 'upcoming' },
      { title: 'Final Inspection', date: 'Mar 30', status: 'upcoming' },
    ],
  };

  useEffect(() => {
    // Load client data
    setClient(mockClient);
  }, [clientId]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderHeroHeader = () => (
    <LinearGradient
      colors={['#3E60D8', '#566FE0', '#FBF7EE']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0.6}}
      style={styles.heroHeader}
    >
      <View style={styles.heroContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://picsum.photos/100/100' }}
              style={styles.avatar}
            />
            <View style={[styles.statusOrb, { backgroundColor: client?.statusColor }]} />
          </View>

          <Text style={styles.clientName}>{client?.name}</Text>

          <View style={styles.statusContainer}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{client?.status}</Text>
            </View>
            <Text style={styles.lastActivity}>Last activity: {client?.lastActivity}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.floatingActionButton}
            onPress={() => navigation.navigate('AddTimelineEvent', { clientId: client?.id })}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.fabText}>Update</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.floatingActionButton, styles.fabSecondary]}
            onPress={() => navigation.navigate('UploadMedia', { clientId: client?.id })}
          >
            <Ionicons name="camera" size={20} color="#3E60D8" />
            <Text style={[styles.fabText, { color: '#3E60D8' }]}>Media</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.floatingActionButton, styles.fabTertiary]}
            onPress={() => navigation.navigate('CreateInvoice', { clientId: client?.id })}
          >
            <Ionicons name="receipt" size={20} color="#7DB87A" />
            <Text style={[styles.fabText, { color: '#7DB87A' }]}>Invoice</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Wave shape at bottom */}
      <View style={styles.waveContainer}>
        <View style={styles.wave} />
      </View>
    </LinearGradient>
  );

  const renderClientDetails = () => (
    <FoldedPanel
      title="Client Details"
      icon={<Ionicons name="person" size={20} color="#3E60D8" />}
      initiallyExpanded={expandedSections.details}
      variant="default"
    >
      <View style={styles.detailsGrid}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Client Type:</Text>
          <Text style={styles.detailValue}>{client?.clientType}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Property Type:</Text>
          <Text style={styles.detailValue}>{client?.propertyType}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Style Preference:</Text>
          <Text style={styles.detailValue}>{client?.preferredStyle}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Budget Range:</Text>
          <Text style={styles.detailValue}>{client?.budgetRange}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Risk Score:</Text>
          <View style={styles.riskContainer}>
            <View style={[styles.riskIndicator, { backgroundColor: '#7DB87A' }]} />
            <Text style={styles.detailValue}>{client?.riskScore}</Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Client Since:</Text>
          <Text style={styles.detailValue}>{client?.startDate}</Text>
        </View>
      </View>
    </FoldedPanel>
  );

  const renderContactInfo = () => (
    <FoldedPanel
      title="Contact Information"
      icon={<Ionicons name="call" size={20} color="#3E60D8" />}
      initiallyExpanded={expandedSections.contact}
      variant="secondary"
    >
      <View style={styles.contactSection}>
        <TouchableOpacity style={styles.contactItem}>
          <View style={styles.contactIcon}>
            <Ionicons name="mail" size={20} color="#566FE0" />
          </View>
          <View style={styles.contactDetails}>
            <Text style={styles.contactLabel}>Email</Text>
            <Text style={styles.contactValue}>{client?.email}</Text>
          </View>
          <Ionicons name="send" size={16} color="#7487C1" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactItem}>
          <View style={styles.contactIcon}>
            <Ionicons name="call" size={20} color="#566FE0" />
          </View>
          <View style={styles.contactDetails}>
            <Text style={styles.contactLabel}>Primary Phone</Text>
            <Text style={styles.contactValue}>{client?.phone}</Text>
          </View>
          <Ionicons name="phone-portrait" size={16} color="#7487C1" />
        </TouchableOpacity>

        {client?.secondaryPhone && (
          <TouchableOpacity style={styles.contactItem}>
            <View style={styles.contactIcon}>
              <Ionicons name="call" size={20} color="#566FE0" />
            </View>
            <View style={styles.contactDetails}>
              <Text style={styles.contactLabel}>Secondary Phone</Text>
              <Text style={styles.contactValue}>{client?.secondaryPhone}</Text>
            </View>
            <Ionicons name="phone-portrait" size={16} color="#7487C1" />
          </TouchableOpacity>
        )}

        <View style={styles.communicationPref}>
          <Text style={styles.prefTitle}>Communication Preferences</Text>
          <View style={styles.prefItem}>
            <Text style={styles.prefLabel}>Preferred Method:</Text>
            <Text style={styles.prefValue}>{client?.communicationPreference}</Text>
          </View>
          <View style={styles.prefItem}>
            <Text style={styles.prefLabel}>Best Contact Time:</Text>
            <Text style={styles.prefValue}>{client?.preferredContactTime}</Text>
          </View>
        </View>
      </View>
    </FoldedPanel>
  );

  const renderAddressSection = () => (
    <FoldedPanel
      title="Address Information"
      icon={<Ionicons name="location" size={20} color="#3E60D8" />}
      initiallyExpanded={expandedSections.address}
      variant="default"
    >
      <View style={styles.addressSection}>
        <View style={styles.addressBlock}>
          <Text style={styles.addressTitle}>Project Address</Text>
          <Text style={styles.addressText}>{client?.address?.street}</Text>
          <Text style={styles.addressText}>
            {client?.address?.city}, {client?.address?.state} {client?.address?.zipCode}
          </Text>
          <Text style={styles.addressText}>{client?.address?.country}</Text>
        </View>

        {client?.projectAddress && (
          <View style={styles.addressBlock}>
            <Text style={styles.addressTitle}>Billing Address</Text>
            <Text style={styles.addressText}>{client?.projectAddress?.street}</Text>
            <Text style={styles.addressText}>
              {client?.projectAddress?.city}, {client?.projectAddress?.state} {client?.projectAddress?.zipCode}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.mapPreview}>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={32} color="#C9B89A" />
            <Text style={styles.mapText}>View on Map</Text>
          </View>
        </TouchableOpacity>
      </View>
    </FoldedPanel>
  );

  const renderTagsSection = () => (
    <FoldedPanel
      title="Tags & Labels"
      icon={<Ionicons name="pricetag" size={20} color="#3E60D8" />}
      initiallyExpanded={expandedSections.tags}
      variant="secondary"
    >
      <View style={styles.tagsContainer}>
        {client?.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
        <TouchableOpacity style={styles.addTagButton}>
          <Ionicons name="add" size={16} color="#3E60D8" />
          <Text style={styles.addTagText}>Add Tag</Text>
        </TouchableOpacity>
      </View>
    </FoldedPanel>
  );

  const renderFinancialSummary = () => (
    <FoldedPanel
      title="Financial Summary"
      icon={<Ionicons name="card" size={20} color="#3E60D8" />}
      initiallyExpanded={expandedSections.financial}
      variant="primary"
    >
      <View style={styles.financialSection}>
        <View style={styles.financialMetrics}>
          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Total Spent</Text>
            <Text style={styles.metricAmount}>{client?.totalSpent}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Avg. Project</Text>
            <Text style={styles.metricAmount}>{client?.averageProjectValue}</Text>
          </View>
        </View>

        <View style={styles.paymentTerms}>
          <Text style={styles.termsLabel}>Payment Terms:</Text>
          <Text style={styles.termsValue}>{client?.paymentTerms}</Text>
        </View>

        <View style={styles.spendingChart}>
          <WorkloadRing
            value={75}
            maxValue={100}
            size={120}
            strokeWidth={12}
            title="Budget Used"
            subtitle="This quarter"
            gradientColors={['#3E60D8', '#566FE0']}
          />
        </View>
      </View>
    </FoldedPanel>
  );

  const renderProjectMilestones = () => (
    <View style={styles.milestoneSection}>
      <Text style={styles.sectionTitle}>Project Milestones</Text>
      <MilestoneWavePath
        milestones={client?.milestones || []}
        currentProgress={40}
        height={100}
        showLabels={true}
      />
    </View>
  );

  const renderViewProjectsButton = () => (
    <GradientButton
      title="View Client Projects"
      subtitle={`${client?.projects?.length || 0} active projects`}
      onPress={() => navigation.navigate('ProjectList', { clientId: client?.id })}
      gradientColors={['#566FE0', '#3E60D8']}
      style={styles.viewProjectsButton}
    />
  );

  if (!client) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading client profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderHeroHeader()}

      <View style={styles.content}>
        {renderClientDetails()}
        {renderContactInfo()}
        {renderAddressSection()}
        {renderTagsSection()}
        {renderFinancialSummary()}
        {renderProjectMilestones()}
        {renderViewProjectsButton()}

        <View style={styles.spacer} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  heroHeader: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
    position: 'relative',
  },
  heroContent: {
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    position: 'absolute',
    top: spacing.xxl,
    left: spacing.lg,
    zIndex: 2,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statusOrb: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  clientName: {
    fontSize: typography.fontSizes.display,
    fontFamily: typography.fontFamily.display,
    color: colors.text.white,
    fontWeight: '800',
    marginBottom: spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    marginBottom: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.white,
    fontWeight: '600',
  },
  lastActivity: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.regular,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.xl,
  },
  floatingActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    shadowColor: '#1B2540',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  fabSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  fabTertiary: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  fabText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.white,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  wave: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: width * 0.5,
    borderTopRightRadius: width * 0.5,
  },
  content: {
    flex: 1,
    paddingTop: spacing.lg,
  },
  detailsGrid: {
    gap: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  detailLabel: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.tertiary,
    flex: 1,
  },
  detailValue: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  riskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  contactSection: {
    gap: spacing.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(62, 96, 216, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  contactDetails: {
    flex: 1,
  },
  contactLabel: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
  contactValue: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
  },
  communicationPref: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.accent,
    borderRadius: borderRadius.lg,
  },
  prefTitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  prefItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  prefLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.tertiary,
  },
  prefValue: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  addressSection: {
    gap: spacing.lg,
  },
  addressBlock: {
    padding: spacing.md,
    backgroundColor: colors.background.accent,
    borderRadius: borderRadius.lg,
  },
  addressTitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  addressText: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  mapPreview: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    height: 120,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.beige[200],
  },
  mapText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.blue[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
  },
  tagText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.blue[500],
    fontWeight: '600',
  },
  addTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    borderWidth: 2,
    borderColor: colors.blue[500],
    borderStyle: 'dashed',
  },
  addTagText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.blue[500],
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  financialSection: {
    gap: spacing.lg,
  },
  financialMetrics: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metricCard: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.beige[100],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  metricTitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
  },
  metricAmount: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    fontWeight: '700',
  },
  paymentTerms: {
    padding: spacing.md,
    backgroundColor: colors.beige[100],
    borderRadius: borderRadius.lg,
  },
  termsLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
  },
  termsValue: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  spendingChart: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  milestoneSection: {
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    fontWeight: '700',
  },
  viewProjectsButton: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  spacer: {
    height: spacing.xxxxxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
});

export default ClientProfileScreen;