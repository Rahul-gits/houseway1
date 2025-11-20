import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TabView, SceneMap } from 'react-native-tab-view';
import Animated from 'react-native-reanimated';

// Import premium components
import WorkloadRing from '../../components/premium/WorkloadRing';
import MilestoneWavePath from '../../components/premium/MilestoneWavePath';
import StoryBubbleCard from '../../components/premium/StoryBubbleCard';
import FilmStripGallery from '../../components/premium/FilmStripGallery';
import TimelineEventCard from '../../components/premium/TimelineEventCard';
import InvoicePreviewCard from '../../components/premium/InvoicePreviewCard';
import GradientButton from '../../components/premium/GradientButton';

// Import theme
import { colors, typography, spacing, borderRadius } from '../../styles/theme';

const { width } = Dimensions.get('window');

const ProjectDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { projectId } = route.params || {};

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'overview', title: 'Overview' },
    { key: 'timeline', title: 'Timeline' },
    { key: 'media', title: 'Media' },
    { key: 'invoices', title: 'Invoices' },
    { key: 'files', title: 'Files' },
    { key: 'notes', title: 'Notes' },
  ]);

  const scrollViewRef = useRef(null);

  const mockProject = {
    id: projectId || '1',
    name: 'Kitchen Renovation',
    client: 'Sarah Johnson',
    status: 'In Progress',
    progress: 65,
    budget: '$80,000',
    spent: '$52,000',
    startDate: '2024-01-15',
    expectedCompletion: '2024-03-30',
    description: 'Complete kitchen remodel with modern design, premium appliances, and custom cabinetry.',
    team: [
      { name: 'John Smith', role: 'Project Manager', avatar: null },
      { name: 'Emily Chen', role: 'Lead Designer', avatar: null },
    ],
    milestones: [
      { title: 'Initial Consultation', date: 'Jan 15', status: 'completed' },
      { title: 'Design Approval', date: 'Jan 28', status: 'completed' },
      { title: 'Permit Application', date: 'Feb 10', status: 'current' },
      { title: 'Construction Start', date: 'Feb 20', status: 'upcoming' },
      { title: 'Final Inspection', date: 'Mar 30', status: 'upcoming' },
    ],
    timeline: [
      {
        id: '1',
        type: 'milestone',
        title: 'Design Phase Completed',
        description: 'All design elements approved by client. Moving to construction phase.',
        time: '2 days ago',
        isRecent: true,
        createdBy: 'Emily Chen',
        attachments: 2,
      },
      {
        id: '2',
        type: 'update',
        title: 'Permit Application Submitted',
        description: 'Building permit application submitted to city planning department. Expected approval within 2 weeks.',
        time: '1 week ago',
        isRecent: false,
        createdBy: 'John Smith',
        attachments: 1,
      },
      {
        id: '3',
        type: 'meeting',
        title: 'Client Meeting - Material Selection',
        description: 'Discussed and finalized countertop materials, cabinet finishes, and appliance selections.',
        time: '2 weeks ago',
        isRecent: false,
        createdBy: 'Emily Chen',
        attachments: 3,
        location: 'Client Residence',
      },
    ],
    media: [
      { id: '1', uri: 'https://picsum.photos/400/300?random=10', title: 'Initial Design Render' },
      { id: '2', uri: 'https://picsum.photos/400/300?random=11', title: 'Material Samples' },
      { id: '3', uri: 'https://picsum.photos/400/300?random=12', title: 'Before Photos' },
      { id: '4', uri: 'https://picsum.photos/400/300?random=13', title: 'Floor Plan' },
      { id: '5', uri: 'https://picsum.photos/400/300?random=14', title: '3D View' },
    ],
    invoices: [
      {
        id: '1',
        invoiceNumber: 'INV-2024-001',
        client: { name: 'Sarah Johnson' },
        project: { name: 'Kitchen Renovation' },
        status: 'paid',
        totalAmount: 15000,
        issueDate: '2024-01-20',
        dueDate: '2024-02-20',
        daysUntilDue: -10,
        items: [
          { description: 'Design consultation', quantity: 1, rate: 2500, amount: 2500 },
          { description: 'Initial deposit', quantity: 1, rate: 12500, amount: 12500 },
        ],
        paymentStatus: 'Paid',
      },
      {
        id: '2',
        invoiceNumber: 'INV-2024-002',
        client: { name: 'Sarah Johnson' },
        project: { name: 'Kitchen Renovation' },
        status: 'sent',
        totalAmount: 20000,
        issueDate: '2024-02-15',
        dueDate: '2024-03-15',
        daysUntilDue: 5,
        items: [
          { description: 'Cabinet fabrication', quantity: 1, rate: 12000, amount: 12000 },
          { description: 'Appliances purchase', quantity: 1, rate: 8000, amount: 8000 },
        ],
        paymentStatus: 'Pending',
      },
    ],
    files: [
      { id: '1', name: 'Kitchen_Design_Final.pdf', type: 'PDF', size: '2.4 MB', date: 'Jan 28, 2024' },
      { id: '2', name: 'Material_Specifications.xlsx', type: 'Excel', size: '845 KB', date: 'Jan 30, 2024' },
      { id: '3', name: 'Permit_Application.pdf', type: 'PDF', size: '1.2 MB', date: 'Feb 10, 2024' },
      { id: '4', name: 'Contract_Draft.pdf', type: 'PDF', size: '3.1 MB', date: 'Feb 12, 2024' },
    ],
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#3E60D8', '#566FE0', '#FBF7EE']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0.6 }}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.projectName}>{mockProject.name}</Text>
          <Text style={styles.clientName}>{mockProject.client}</Text>
        </View>

        <TouchableOpacity style={styles.optionsButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const OverviewRoute = () => (
    <ScrollView style={styles.scene} showsVerticalScrollIndicator={false}>
      {/* Hero Section with Swoosh Gradient */}
      <LinearGradient
        colors={['#F8F1E6', '#FBF7EE', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.3 }}
        style={styles.heroSection}
      >
        <Text style={styles.sectionTitle}>Project Overview</Text>

        {/* Workload Rings */}
        <View style={styles.ringsContainer}>
          <WorkloadRing
            value={mockProject.progress}
            maxValue={100}
            size={100}
            strokeWidth={12}
            title="Progress"
            subtitle="Overall"
            gradientColors={['#3E60D8', '#566FE0']}
          />
          <WorkloadRing
            value={(mockProject.spent.replace('$', '').replace(',', '') / mockProject.budget.replace('$', '').replace(',', '')) * 100}
            maxValue={100}
            size={100}
            strokeWidth={12}
            title="Budget Used"
            subtitle={mockProject.spent}
            gradientColors={['#7DB87A', '#68B168']}
          />
          <WorkloadRing
            value={65}
            maxValue={100}
            size={100}
            strokeWidth={12}
            title="On Schedule"
            subtitle="Timeline"
            gradientColors={['#E8B25D', '#D49A48']}
          />
        </View>

        {/* Wave Path Milestone Tracker */}
        <View style={styles.milestoneSection}>
          <Text style={styles.milestoneTitle}>Project Milestones</Text>
          <MilestoneWavePath
            milestones={mockProject.milestones}
            currentProgress={mockProject.progress}
            height={80}
            showLabels={true}
          />
        </View>

        {/* Story Bubbles */}
        <View style={styles.storySection}>
          <Text style={styles.storyTitle}>Recent Updates</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storyContainer}
          >
            <StoryBubbleCard
              title="Design"
              subtitle="Completed"
              isActive={true}
              onPress={() => console.log('Design bubble pressed')}
            />
            <StoryBubbleCard
              title="Media"
              subtitle="New Photos"
              onPress={() => console.log('Media bubble pressed')}
            />
            <StoryBubbleCard
              title="Invoice"
              subtitle="Paid"
              onPress={() => console.log('Invoice bubble pressed')}
            />
            <StoryBubbleCard
              title="Timeline"
              subtitle="Updated"
              onPress={() => console.log('Timeline bubble pressed')}
            />
          </ScrollView>
        </View>
      </LinearGradient>

      {/* Project Details */}
      <View style={styles.detailsSection}>
        <Text style={styles.detailsTitle}>Project Details</Text>

        <View style={styles.detailCard}>
          <Text style={styles.description}>{mockProject.description}</Text>

          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Start Date</Text>
              <Text style={styles.detailValue}>{mockProject.startDate}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Expected Completion</Text>
              <Text style={styles.detailValue}>{mockProject.expectedCompletion}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Budget</Text>
              <Text style={styles.detailValue}>{mockProject.budget}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Spent</Text>
              <Text style={styles.detailValue}>{mockProject.spent}</Text>
            </View>
          </View>
        </View>

        {/* Team Section */}
        <View style={styles.teamSection}>
          <Text style={styles.teamTitle}>Project Team</Text>
          {mockProject.team.map((member, index) => (
            <View key={index} style={styles.teamMember}>
              <View style={styles.memberAvatar}>
                <Text style={styles.avatarInitial}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
              </View>
              <TouchableOpacity style={styles.contactButton}>
                <Ionicons name="mail" size={16} color="#3E60D8" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* Floating CTA */}
      <View style={styles.floatingCTA}>
        <GradientButton
          title="Add Timeline Event"
          gradientColors={['#3E60D8', '#566FE0']}
          onPress={() => navigation.navigate('AddTimelineEvent', { projectId: mockProject.id })}
        />
      </View>
    </ScrollView>
  );

  const TimelineRoute = () => (
    <ScrollView style={styles.scene} showsVerticalScrollIndicator={false}>
      <View style={styles.timelineScene}>
        <Text style={styles.sceneTitle}>Project Timeline</Text>

        {mockProject.timeline.map((event, index) => (
          <TimelineEventCard
            key={event.id}
            event={event}
            onPress={() => console.log('Event pressed:', event.id)}
            onExpand={(expanded) => console.log('Event expanded:', expanded)}
            showConnector={index < mockProject.timeline.length - 1}
          />
        ))}

        {/* Floating Add Button */}
        <TouchableOpacity style={styles.addTimelineButton}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addTimelineText}>Add Event</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const MediaRoute = () => (
    <ScrollView style={styles.scene} showsVerticalScrollIndicator={false}>
      <View style={styles.mediaScene}>
        <Text style={styles.sceneTitle}>Project Media</Text>

        {/* Film Strip Gallery */}
        <FilmStripGallery
          images={mockProject.media}
          onImagePress={(image, index) => console.log('Image pressed:', index)}
          showFilmStrip={true}
          autoPlay={false}
        />

        {/* Upload Card */}
        <TouchableOpacity style={styles.uploadCard}>
          <LinearGradient
            colors={['#3E60D8', '#566FE0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.uploadGradient}
          >
            <Ionicons name="camera" size={32} color="#FFFFFF" />
            <Text style={styles.uploadText}>Add Photos</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const InvoicesRoute = () => (
    <ScrollView style={styles.scene} showsVerticalScrollIndicator={false}>
      <View style={styles.invoicesScene}>
        <Text style={styles.sceneTitle}>Project Invoices</Text>

        {mockProject.invoices.map((invoice) => (
          <InvoicePreviewCard
            key={invoice.id}
            invoice={invoice}
            onPress={() => console.log('Invoice pressed:', invoice.id)}
            onStatusChange={(inv, newStatus) => console.log('Status change:', inv.id, newStatus)}
            showActions={true}
          />
        ))}

        {/* Floating Create Button */}
        <TouchableOpacity style={styles.createInvoiceButton}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.createInvoiceText}>Create Invoice</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const FilesRoute = () => (
    <ScrollView style={styles.scene} showsVerticalScrollIndicator={false}>
      <View style={styles.filesScene}>
        <Text style={styles.sceneTitle}>Project Files</Text>

        {mockProject.files.map((file) => (
          <TouchableOpacity key={file.id} style={styles.fileItem}>
            <View style={styles.fileIcon}>
              <Ionicons
                name={
                  file.type === 'PDF' ? 'document-text' :
                  file.type === 'Excel' ? 'grid' : 'document'
                }
                size={24}
                color="#3E60D8"
              />
            </View>
            <View style={styles.fileInfo}>
              <Text style={styles.fileName}>{file.name}</Text>
              <Text style={styles.fileMeta}>{file.size} • {file.date}</Text>
            </View>
            <TouchableOpacity style={styles.fileAction}>
              <Ionicons name="download" size={20} color="#7487C1" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const NotesRoute = () => (
    <View style={styles.notesScene}>
      <Text style={styles.sceneTitle}>Project Notes</Text>

      <View style={styles.notesEditor}>
        <View style={styles.editorToolbar}>
          <TouchableOpacity style={styles.toolbarButton}>
            <Ionicons name="bold" size={18} color="#3E60D8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarButton}>
            <Ionicons name="italic" size={18} color="#3E60D8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarButton}>
            <Ionicons name="list" size={18} color="#3E60D8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarButton}>
            <Ionicons name="link" size={18} color="#3E60D8" />
          </TouchableOpacity>
        </View>

        <View style={styles.editorCanvas}>
          <Text style={styles.editorPlaceholder}>
            Start typing your notes here... You can use markdown formatting.
          </Text>
        </View>
      </View>
    </View>
  );

  const renderScene = SceneMap({
    overview: OverviewRoute,
    timeline: TimelineRoute,
    media: MediaRoute,
    invoices: InvoicesRoute,
    files: FilesRoute,
    notes: NotesRoute,
  });

  const renderTabBar = (props) => {
    const inputRange = props.navigationState.routes.map((_, i) => i);

    return (
      <View style={styles.tabBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabContainer}
        >
          {props.navigationState.routes.map((route, i) => {
            const opacity = props.position.interpolate({
              inputRange,
              outputRange: inputRange.map((inputIndex) =>
                inputIndex === i ? 1 : 0.5
              ),
            });

            return (
              <TouchableOpacity
                key={i}
                style={styles.tab}
                onPress={() => setIndex(i)}
              >
                <Animated.Text style={[styles.tabText, { opacity }]}>
                  {route.title}
                </Animated.Text>
                {i === index && (
                  <View style={styles.tabIndicator} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={{ width }}
        swipeEnabled={true}
        sceneContainerStyle={styles.sceneContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  projectName: {
    fontSize: typography.fontSizes.xxl,
    fontFamily: typography.fontFamily.display,
    color: colors.text.white,
    fontWeight: '800',
  },
  clientName: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  optionsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  tabContainer: {
    paddingHorizontal: spacing.lg,
  },
  tab: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    position: 'relative',
  },
  tabText: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: spacing.lg,
    right: spacing.lg,
    height: 3,
    backgroundColor: colors.blue[500],
    borderRadius: 2,
  },
  sceneContainer: {
    flex: 1,
  },
  scene: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  // Overview Styles
  heroSection: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.xxl,
    fontFamily: typography.fontFamily.display,
    color: colors.text.primary,
    fontWeight: '800',
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  ringsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xxl,
  },
  milestoneSection: {
    marginBottom: spacing.xl,
  },
  milestoneTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    fontWeight: '600',
  },
  storySection: {
    marginBottom: spacing.xl,
  },
  storyTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    fontWeight: '600',
  },
  storyContainer: {
    paddingHorizontal: spacing.lg,
  },
  detailsSection: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  detailsTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    fontWeight: '600',
  },
  detailCard: {
    backgroundColor: colors.background.card,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: spacing.lg,
  },
  description: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  detailGrid: {
    gap: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  detailLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.tertiary,
  },
  detailValue: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  teamSection: {
    backgroundColor: colors.background.card,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  teamTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    fontWeight: '600',
  },
  teamMember: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.blue[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarInitial: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.display,
    color: colors.blue[500],
    fontWeight: '800',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  memberRole: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.tertiary,
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(62, 96, 216, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingCTA: {
    padding: spacing.lg,
  },
  // Timeline Styles
  timelineScene: {
    padding: spacing.lg,
  },
  sceneTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.display,
    color: colors.text.primary,
    fontWeight: '800',
    marginBottom: spacing.lg,
  },
  addTimelineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue[500],
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginTop: spacing.lg,
    shadowColor: colors.blue[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addTimelineText: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.white,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  // Media Styles
  mediaScene: {
    padding: spacing.lg,
  },
  uploadCard: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: colors.blue[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  uploadGradient: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  uploadText: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.white,
    marginTop: spacing.sm,
    fontWeight: '600',
  },
  // Invoices Styles
  invoicesScene: {
    padding: spacing.lg,
  },
  createInvoiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success[500],
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginTop: spacing.lg,
    shadowColor: colors.success[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createInvoiceText: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.white,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  // Files Styles
  filesScene: {
    padding: spacing.lg,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(62, 96, 216, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  fileMeta: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.tertiary,
  },
  fileAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(116, 135, 193, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Notes Styles
  notesScene: {
    flex: 1,
    padding: spacing.lg,
  },
  notesEditor: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  editorToolbar: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.beige[100],
  },
  toolbarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(62, 96, 216, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  editorCanvas: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: '#F8F1E6',
  },
  editorPlaceholder: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
});

export default ProjectDetailScreen;