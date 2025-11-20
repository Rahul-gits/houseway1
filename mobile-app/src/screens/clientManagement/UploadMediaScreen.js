import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Image,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

// Import premium components
import FilmStripGallery from '../../components/premium/FilmStripGallery';
import GradientButton from '../../components/premium/GradientButton';

// Import theme
import { colors, typography, spacing, borderRadius } from '../../styles/theme';

const { width } = Dimensions.get('window');

const UploadMediaScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { projectId, clientId } = route.params || {};

  const [selectedImages, setSelectedImages] = useState([]);
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState([]);
  const [selectedTimelineEvent, setSelectedTimelineEvent] = useState('');
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  const scrollViewRef = useRef(null);

  const mockTimelineEvents = [
    { id: '1', title: 'Design Phase Completed', date: '2 days ago' },
    { id: '2', title: 'Permit Application', date: '1 week ago' },
    { id: '3', title: 'Client Meeting', date: '2 weeks ago' },
  ];

  const suggestedTags = [
    'Before', 'After', 'Progress', 'Design', 'Materials', 'Construction',
    'Completed', 'Inspiration', 'Client Review', 'Team Update'
  ];

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled) {
        const newImages = result.assets.map(asset => ({
          id: Date.now() + Math.random(),
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          size: asset.fileSize,
          type: asset.mimeType || 'image/jpeg',
        }));

        setSelectedImages(prev => [...prev, ...newImages]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select images. Please try again.');
      console.error('Image picker error:', error);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const newImage = {
          id: Date.now(),
          uri: result.assets[0].uri,
          name: result.assets[0].fileName || `photo_${Date.now()}.jpg`,
          size: result.assets[0].fileSize,
          type: result.assets[0].mimeType || 'image/jpeg',
        };

        setSelectedImages(prev => [...prev, newImage]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
      console.error('Camera error:', error);
    }
  };

  const removeImage = (imageId) => {
    setSelectedImages(prev => prev.filter(img => img.id !== imageId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[imageId];
      return newProgress;
    });
  };

  const toggleTag = (tag) => {
    setTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const simulateUpload = () => {
    setIsUploading(true);

    selectedImages.forEach((image, index) => {
      setTimeout(() => {
        setUploadProgress(prev => ({
          ...prev,
          [image.id]: { status: 'uploading', progress: 0 }
        }));

        // Simulate upload progress
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += Math.random() * 30;
          if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);

            setUploadProgress(prev => ({
              ...prev,
              [image.id]: { status: 'completed', progress: 100 }
            }));
          } else {
            setUploadProgress(prev => ({
              ...prev,
              [image.id]: { status: 'uploading', progress }
            }));
          }
        }, 200);
      }, index * 500);
    });

    setTimeout(() => {
      setIsUploading(false);
      Alert.alert(
        'Upload Complete',
        `Successfully uploaded ${selectedImages.length} image(s)`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 3000 + selectedImages.length * 500);
  };

  const handleUpload = () => {
    if (selectedImages.length === 0) {
      Alert.alert('No Images', 'Please select at least one image to upload');
      return;
    }

    simulateUpload();
  };

  const renderDropZone = () => (
    <TouchableOpacity
      style={styles.dropZone}
      onPress={handleImagePicker}
      disabled={isUploading}
    >
      <LinearGradient
        colors={['#3E60D8', '#566FE0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.dropZoneGradient}
      >
        <View style={styles.dropZoneContent}>
          <Ionicons name="cloud-upload" size={48} color="#FFFFFF" />
          <Text style={styles.dropZoneTitle}>Tap to Select Images</Text>
          <Text style={styles.dropZoneSubtitle}>or use the buttons below</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={[styles.actionButton, styles.cameraButton]}
        onPress={handleCameraCapture}
        disabled={isUploading}
      >
        <Ionicons name="camera" size={24} color="#3E60D8" />
        <Text style={styles.cameraButtonText}>Take Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.galleryButton]}
        onPress={handleImagePicker}
        disabled={isUploading}
      >
        <Ionicons name="images" size={24} color="#3E60D8" />
        <Text style={styles.galleryButtonText}>From Gallery</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSelectedImages = () => {
    if (selectedImages.length === 0) return null;

    return (
      <View style={styles.selectedImagesSection}>
        <Text style={styles.sectionTitle}>
          Selected Images ({selectedImages.length})
        </Text>

        <FilmStripGallery
          images={selectedImages}
          onImagePress={(image, index) => {
            // Could open full screen viewer here
            console.log('View image:', index);
          }}
          showFilmStrip={true}
        />

        {/* Selected images list with delete options */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imagesScrollContent}
        >
          {selectedImages.map((image) => (
            <View key={image.id} style={styles.imageThumbnail}>
              <Image source={{ uri: image.uri }} style={styles.thumbnailImage} />
              {uploadProgress[image.id] && (
                <View style={styles.uploadProgress}>
                  {uploadProgress[image.id].status === 'completed' ? (
                    <Ionicons name="checkmark-circle" size={24} color="#7DB87A" />
                  ) : (
                    <>
                      <Text style={styles.progressText}>
                        {Math.round(uploadProgress[image.id].progress)}%
                      </Text>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${uploadProgress[image.id].progress}%`
                            }
                          ]}
                        />
                      </View>
                    </>
                  )}
                </View>
              )}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => removeImage(image.id)}
                disabled={isUploading}
              >
                <Ionicons name="close-circle" size={24} color="#D75A5A" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderCaptionSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Caption</Text>
      <TextInput
        style={styles.captionInput}
        placeholder="Add a description for these images..."
        placeholderTextColor={colors.text.muted}
        value={caption}
        onChangeText={setCaption}
        multiline={true}
        numberOfLines={3}
        textAlignVertical="top"
        editable={!isUploading}
      />
    </View>
  );

  const renderTagsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Tags</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagsScrollContent}
      >
        {suggestedTags.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={[
              styles.tag,
              tags.includes(tag) && styles.tagActive
            ]}
            onPress={() => toggleTag(tag)}
            disabled={isUploading}
          >
            <Text
              style={[
                styles.tagText,
                tags.includes(tag) && styles.tagTextActive
              ]}
            >
              #{tag}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Custom tag input */}
      <View style={styles.customTagInput}>
        <Ionicons name="pricetag" size={20} color="#7487C1" />
        <TextInput
          style={styles.tagTextInput}
          placeholder="Add custom tag..."
          placeholderTextColor={colors.text.muted}
          onSubmitEditing={(e) => {
            const tag = e.nativeEvent.text.trim();
            if (tag && !tags.includes(tag)) {
              toggleTag(tag);
            }
          }}
          editable={!isUploading}
        />
      </View>
    </View>
  );

  const renderTimelineLink = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Link to Timeline Event (Optional)</Text>

      <TouchableOpacity
        style={styles.timelineSelector}
        disabled={isUploading}
      >
        <Ionicons name="time" size={20} color="#7487C1" />
        <Text style={styles.timelineText}>
          {selectedTimelineEvent
            ? mockTimelineEvents.find(e => e.id === selectedTimelineEvent)?.title
            : 'Select timeline event...'
          }
        </Text>
        <Ionicons name="chevron-down" size={16} color="#7487C1" />
      </TouchableOpacity>

      {/* Timeline events list (would be a modal in real app) */}
      {selectedTimelineEvent && (
        <View style={styles.selectedEvent}>
          <Text style={styles.selectedEventText}>
            Linked to: {mockTimelineEvents.find(e => e.id === selectedTimelineEvent)?.title}
          </Text>
          <TouchableOpacity onPress={() => setSelectedTimelineEvent('')}>
            <Ionicons name="close-circle" size={16} color="#7487C1" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderUploadButton = () => (
    <View style={styles.uploadSection}>
      <GradientButton
        title={`Upload ${selectedImages.length} Image${selectedImages.length !== 1 ? 's' : ''}`}
        subtitle={tags.length > 0 ? `${tags.length} tag${tags.length !== 1 ? 's' : ''} added` : ''}
        gradientColors={['#3E60D8', '#566FE0']}
        onPress={handleUpload}
        loading={isUploading}
        disabled={isUploading || selectedImages.length === 0}
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
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upload Media</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderDropZone()}
          {renderActionButtons()}
          {renderSelectedImages()}
          {renderCaptionSection()}
          {renderTagsSection()}
          {renderTimelineLink()}
          {renderUploadButton()}

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
  dropZone: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: colors.blue[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: spacing.xl,
  },
  dropZoneGradient: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  dropZoneContent: {
    alignItems: 'center',
  },
  dropZoneTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.display,
    color: colors.text.white,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  dropZoneSubtitle: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.regular,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background.card,
    borderWidth: 2,
    borderColor: colors.blue[500],
    gap: spacing.sm,
  },
  cameraButtonText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.blue[500],
    fontWeight: '600',
  },
  galleryButtonText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.blue[500],
    fontWeight: '600',
  },
  selectedImagesSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    marginBottom: spacing.md,
    fontWeight: '700',
  },
  imagesScrollContent: {
    paddingHorizontal: spacing.lg,
  },
  imageThumbnail: {
    width: 80,
    height: 80,
    marginRight: spacing.sm,
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.lg,
  },
  uploadProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.white,
    fontWeight: '600',
  },
  progressBar: {
    width: '80%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success[500],
    borderRadius: 2,
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.background.card,
    borderRadius: 12,
    padding: 2,
  },
  section: {
    marginBottom: spacing.xl,
  },
  captionInput: {
    backgroundColor: colors.background.glass,
    borderWidth: shapes.glass.borderWidth,
    borderColor: shapes.glass.borderColor,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
    minHeight: 100,
  },
  tagsScrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.beige[200],
    marginRight: spacing.sm,
  },
  tagActive: {
    backgroundColor: colors.blue[500],
  },
  tagText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  tagTextActive: {
    color: colors.text.white,
  },
  customTagInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.glass,
    borderWidth: shapes.glass.borderWidth,
    borderColor: shapes.glass.borderColor,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  tagTextInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
  },
  timelineSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.glass,
    borderWidth: shapes.glass.borderWidth,
    borderColor: shapes.glass.borderColor,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  timelineText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
  },
  selectedEvent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.beige[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
  },
  selectedEventText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
  },
  uploadSection: {
    marginTop: spacing.xl,
  },
  spacer: {
    height: spacing.xxxxxl,
  },
});

export default UploadMediaScreen;