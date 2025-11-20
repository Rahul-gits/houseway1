import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const FilmStripGallery = ({
  images,
  onImagePress,
  showFilmStrip = true,
  autoPlay = false,
  autoPlayInterval = 3000,
  style = null,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const scrollViewRef = useRef(null);

  React.useEffect(() => {
    if (autoPlay && images.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, autoPlayInterval);

      return () => clearInterval(interval);
    }
  }, [autoPlay, autoPlayInterval, images.length]);

  const handleImagePress = (image, index) => {
    setSelectedImage({ ...image, index });
    setIsFullScreen(true);
    onImagePress?.(image, index);
  };

  const handleThumbnailPress = (index) => {
    setCurrentIndex(index);
    scrollViewRef.current?.scrollTo({ x: index * width, animated: true });
  };

  const renderMainImage = (image, index) => {
    return (
      <TouchableOpacity
        key={index}
        style={[styles.mainImageContainer, { width }]}
        onPress={() => handleImagePress(image, index)}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: image.uri }}
          style={styles.mainImage}
          resizeMode="cover"
        />

        {/* Film strip overlay */}
        {showFilmStrip && (
          <View style={styles.filmStripOverlay}>
            <View style={styles.filmStripHoles}>
              {[...Array(4)].map((_, i) => (
                <View key={i} style={styles.filmStripHole} />
              ))}
            </View>
          </View>
        )}

        {/* Image info overlay */}
        {image.title && (
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.7)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.imageInfoOverlay}
          >
            <Text style={styles.imageTitle}>{image.title}</Text>
            {image.subtitle && (
              <Text style={styles.imageSubtitle}>{image.subtitle}</Text>
            )}
          </LinearGradient>
        )}
      </TouchableOpacity>
    );
  };

  const renderThumbnail = (image, index) => {
    const isActive = index === currentIndex;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.thumbnail,
          isActive && styles.activeThumbnail,
        ]}
        onPress={() => handleThumbnailPress(index)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: image.uri }}
          style={[
            styles.thumbnailImage,
            isActive && styles.activeThumbnailImage,
          ]}
          resizeMode="cover"
        />

        {/* Film strip holes */}
        {showFilmStrip && (
          <View style={styles.thumbnailFilmStrip}>
            <View style={styles.thumbnailHole} />
            <View style={styles.thumbnailHole} />
          </View>
        )}

        {/* Active indicator */}
        {isActive && (
          <View style={styles.activeIndicator} />
        )}
      </TouchableOpacity>
    );
  };

  const renderFullScreenImage = () => {
    if (!selectedImage) return null;

    return (
      <Modal
        visible={isFullScreen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsFullScreen(false)}
      >
        <View style={styles.fullScreenContainer}>
          <TouchableOpacity
            style={styles.fullScreenBackdrop}
            onPress={() => setIsFullScreen(false)}
            activeOpacity={1}
          >
            <Image
              source={{ uri: selectedImage.uri }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />

            {/* Full screen controls */}
            <View style={styles.fullScreenControls}>
              <View style={styles.imageCounter}>
                <Text style={styles.counterText}>
                  {selectedImage.index + 1} / {images.length}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsFullScreen(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Navigation buttons */}
            {images.length > 1 && (
              <>
                <TouchableOpacity
                  style={[styles.navButton, styles.prevButton]}
                  onPress={() => {
                    const prevIndex = (selectedImage.index - 1 + images.length) % images.length;
                    setSelectedImage({ ...images[prevIndex], index: prevIndex });
                  }}
                >
                  <Text style={styles.navButtonText}>‹</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.navButton, styles.nextButton]}
                  onPress={() => {
                    const nextIndex = (selectedImage.index + 1) % images.length;
                    setSelectedImage({ ...images[nextIndex], index: nextIndex });
                  }}
                >
                  <Text style={styles.navButtonText}>›</Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };

  if (!images || images.length === 0) {
    return (
      <View style={[styles.emptyContainer, style]}>
        <Text style={styles.emptyText}>No images available</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Main image slider */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
        style={styles.mainScrollView}
      >
        {images.map((image, index) => renderMainImage(image, index))}
      </ScrollView>

      {/* Film strip thumbnails */}
      {showFilmStrip && images.length > 1 && (
        <View style={styles.filmStripContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailScrollContent}
          >
            {images.map((image, index) => renderThumbnail(image, index))}
          </ScrollView>
        </View>
      )}

      {/* Image counter */}
      {images.length > 1 && (
        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>
            {currentIndex + 1} / {images.length}
          </Text>
        </View>
      )}

      {/* Full screen modal */}
      {renderFullScreenImage()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B2540',
  },
  mainScrollView: {
    flex: 1,
  },
  mainImageContainer: {
    height: 250,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  filmStripOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingTop: 10,
  },
  filmStripHoles: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
  filmStripHole: {
    width: 12,
    height: 8,
    backgroundColor: '#000000',
    borderRadius: 2,
  },
  imageInfoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  imageTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'InterDisplay-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  imageSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  filmStripContainer: {
    backgroundColor: '#0A0A0A',
    paddingVertical: 10,
  },
  thumbnailScrollContent: {
    paddingHorizontal: 10,
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginHorizontal: 5,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  activeThumbnail: {
    borderWidth: 2,
    borderColor: '#3E60D8',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  activeThumbnailImage: {
    opacity: 1,
  },
  thumbnailFilmStrip: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  thumbnailHole: {
    width: 4,
    height: 3,
    backgroundColor: '#000000',
    borderRadius: 1,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: '#3E60D8',
  },
  counterContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FBF7EE',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    color: '#7487C1',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  fullScreenBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: width,
    height: width * 0.75,
  },
  fullScreenControls: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageCounter: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  navButton: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prevButton: {
    left: 20,
  },
  nextButton: {
    right: 20,
  },
  navButtonText: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
});

export default FilmStripGallery;