import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Import premium components
import GlassModalSheet from '../../components/premium/GlassModalSheet';

// Import theme
import { colors, typography, spacing, borderRadius } from '../../styles/theme';

const { width } = Dimensions.get('window');

const AddTimelineEventScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { projectId, clientId } = route.params || {};

  const [formData, setFormData] = useState({
    eventType: '',
    title: '',
    description: '',
    visibility: 'public',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    location: '',
    attachments: [],
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const eventTypes = [
    { key: 'meeting', icon: 'people', label: 'Meeting', color: '#3E60D8' },
    { key: 'milestone', icon: 'flag', label: 'Milestone', color: '#7DB87A' },
    { key: 'update', icon: 'information-circle', label: 'Update', color: '#566FE0' },
    { key: 'issue', icon: 'warning', label: 'Issue', color: '#D75A5A' },
    { key: 'note', icon: 'document-text', label: 'Note', color: '#C9B89A' },
    { key: 'media', icon: 'images', label: 'Media Update', color: '#E8B25D' },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEventTypeSelect = (type) => {
    setFormData(prev => ({
      ...prev,
      eventType: type.key
    }));
  };

  const handleSaveDraft = () => {
    if (!formData.title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for this event');
      return;
    }

    // Save draft logic here
    console.log('Saving draft:', formData);
    Alert.alert('Draft Saved', 'Your event has been saved as a draft');
    navigation.goBack();
  };

  const handlePublish = () => {
    if (!formData.eventType) {
      Alert.alert('Event Type Required', 'Please select an event type');
      return;
    }

    if (!formData.title.trim()) {
      Alert.alert('Title Required', 'Please enter a title for this event');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Description Required', 'Please enter a description');
      return;
    }

    // Publish logic here
    console.log('Publishing event:', formData);
    Alert.alert('Event Published', 'Your timeline event has been published successfully');
    navigation.goBack();
  };

  const renderEventTypeChips = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Event Type</Text>
      <View style={styles.chipsContainer}>
        {eventTypes.map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[
              styles.chip,
              formData.eventType === type.key && {
                backgroundColor: type.color,
                borderColor: type.color,
              },
            ]}
            onPress={() => handleEventTypeSelect(type)}
          >
            <Ionicons
              name={type.icon}
              size={16}
              color={formData.eventType === type.key ? '#FFFFFF' : type.color}
            />
            <Text
              style={[
                styles.chipText,
                formData.eventType === type.key && { color: '#FFFFFF' },
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTitleInput = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Title *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter event title"
        placeholderTextColor={colors.text.muted}
        value={formData.title}
        onChangeText={(value) => handleInputChange('title', value)}
        multiline={false}
      />
    </View>
  );

  const renderDescriptionInput = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Description *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe what happened in this event..."
        placeholderTextColor={colors.text.muted}
        value={formData.description}
        onChangeText={(value) => handleInputChange('description', value)}
        multiline={true}
        numberOfLines={4}
        textAlignVertical="top"
      />
    </View>
  );

  const renderLocationInput = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Location (Optional)</Text>
      <View style={styles.locationInput}>
        <Ionicons name="location" size={20} color="#7487C1" style={styles.inputIcon} />
        <TextInput
          style={styles.locationText}
          placeholder="Enter location or meeting place"
          placeholderTextColor={colors.text.muted}
          value={formData.location}
          onChangeText={(value) => handleInputChange('location', value)}
        />
      </View>
    </View>
  );

  const renderAttachmentsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Attach Files</Text>
      <TouchableOpacity style={styles.attachButton}>
        <Ionicons name="attach" size={20} color="#3E60D8" />
        <Text style={styles.attachButtonText}>Add Files</Text>
        <Text style={styles.attachNote}>Photos, documents, or other files</Text>
      </TouchableOpacity>

      {formData.attachments.length > 0 && (
        <View style={styles.attachmentsList}>
          {formData.attachments.map((file, index) => (
            <View key={index} style={styles.attachmentItem}>
              <Ionicons name="document-text" size={16} color="#7487C1" />
              <Text style={styles.attachmentName}>{file.name}</Text>
              <TouchableOpacity>
                <Ionicons name="close-circle" size={16} color="#D75A5A" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderVisibilitySection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Visibility</Text>
      <View style={styles.visibilityContainer}>
        <TouchableOpacity
          style={[
            styles.visibilityOption,
            formData.visibility === 'public' && styles.visibilityOptionActive,
          ]}
          onPress={() => handleInputChange('visibility', 'public')}
        >
          <Ionicons
            name="globe"
            size={20}
            color={formData.visibility === 'public' ? '#FFFFFF' : '#7487C1'}
          />
          <Text
            style={[
              styles.visibilityText,
              formData.visibility === 'public' && { color: '#FFFFFF' },
            ]}
          >
            Public
          </Text>
          <Text
            style={[
              styles.visibilitySubtext,
              formData.visibility === 'public' && { color: 'rgba(255, 255, 255, 0.8)' },
            ]}
          >
            Client can see this
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.visibilityOption,
            formData.visibility === 'internal' && styles.visibilityOptionActive,
          ]}
          onPress={() => handleInputChange('visibility', 'internal')}
        >
          <Ionicons
            name="lock-closed"
            size={20}
            color={formData.visibility === 'internal' ? '#FFFFFF' : '#7487C1'}
          />
          <Text
            style={[
              styles.visibilityText,
              formData.visibility === 'internal' && { color: '#FFFFFF' },
            ]}
          >
            Internal
          </Text>
          <Text
            style={[
              styles.visibilitySubtext,
              formData.visibility === 'internal' && { color: 'rgba(255, 255, 255, 0.8)' },
            ]}
          >
            Team only
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDateTimeSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Date & Time</Text>
      <View style={styles.dateTimeContainer}>
        <TouchableOpacity
          style={styles.dateTimeInput}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar" size={20} color="#7487C1" style={styles.inputIcon} />
          <Text style={styles.dateTimeText}>
            {formData.date || 'Select date'}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#7487C1" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateTimeInput}
          onPress={() => setShowTimePicker(true)}
        >
          <Ionicons name="time" size={20} color="#7487C1" style={styles.inputIcon} />
          <Text style={styles.dateTimeText}>
            {formData.time || 'Select time'}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#7487C1" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={styles.draftButton}
        onPress={handleSaveDraft}
      >
        <Text style={styles.draftButtonText}>Save Draft</Text>
      </TouchableOpacity>

      <GradientButton
        title="Publish Event"
        gradientColors={['#3E60D8', '#566FE0']}
        onPress={handlePublish}
        style={styles.publishButton}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FBF7EE', '#F8F1E6', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Timeline Event</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderEventTypeChips()}
          {renderTitleInput()}
          {renderDescriptionInput()}
          {renderLocationInput()}
          {renderAttachmentsSection()}
          {renderDateTimeSection()}
          {renderVisibilitySection()}
          {renderActionButtons()}

          <View style={styles.spacer} />
        </ScrollView>
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
  headerTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.display,
    color: colors.text.primary,
    fontWeight: '800',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxxxl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    marginBottom: spacing.md,
    fontWeight: '700',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.beige[200],
    borderWidth: 2,
    borderColor: 'transparent',
    gap: spacing.sm,
  },
  chipText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.background.glass,
    borderWidth: shapes.glass.borderWidth,
    borderColor: shapes.glass.borderColor,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
  },
  textArea: {
    minHeight: 120,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.glass,
    borderWidth: shapes.glass.borderWidth,
    borderColor: shapes.glass.borderColor,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  locationText: {
    flex: 1,
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
  },
  attachButton: {
    borderWidth: 2,
    borderColor: colors.blue[500],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: 'rgba(62, 96, 216, 0.05)',
  },
  attachButtonText: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.blue[500],
    marginTop: spacing.sm,
    fontWeight: '600',
  },
  attachNote: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  attachmentsList: {
    marginTop: spacing.md,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  attachmentName: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  visibilityContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  visibilityOption: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.beige[200],
    borderWidth: 2,
    borderColor: 'transparent',
  },
  visibilityOptionActive: {
    backgroundColor: colors.blue[500],
    borderColor: colors.blue[500],
  },
  visibilityText: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  visibilitySubtext: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  dateTimeContainer: {
    gap: spacing.md,
  },
  dateTimeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.glass,
    borderWidth: shapes.glass.borderWidth,
    borderColor: shapes.glass.borderColor,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  dateTimeText: {
    flex: 1,
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  draftButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.beige[300],
    alignItems: 'center',
  },
  draftButtonText: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.tertiary,
    fontWeight: '600',
  },
  publishButton: {
    flex: 2,
  },
  spacer: {
    height: spacing.xxxxxl,
  },
});

export default AddTimelineEventScreen;