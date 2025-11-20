import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, borderRadius } from '../../styles/theme';

const { width, height } = Dimensions.get('window');

const OnboardingWizard = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const scrollRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const onboardingSteps = [
    {
      id: 'welcome',
      title: 'Welcome to Client Management',
      subtitle: 'Your premium mobile solution for managing clients, projects, and timelines',
      icon: 'rocket-outline',
      iconColor: colors.blue[500],
      gradient: [colors.blue[500], colors.blue[600]],
      features: [
        '📱 Mobile-first premium design',
        '🎨 Beautiful Blue-Beige theme',
        '⚡ Lightning-fast performance',
        '🔒 Secure and reliable'
      ]
    },
    {
      id: 'dashboard',
      title: 'Intuitive Dashboard',
      subtitle: 'Get a complete overview of your client management activities',
      icon: 'grid-outline',
      iconColor: colors.success[500],
      gradient: [colors.success[500], colors.success[600]],
      features: [
        '📊 Real-time metrics and analytics',
        '🎯 Track client growth trends',
        '💰 Monitor revenue and invoices',
        '📈 Performance insights'
      ]
    },
    {
      id: 'clients',
      title: 'Comprehensive Client Management',
      subtitle: 'Manage your clients with powerful tools and insights',
      icon: 'people-outline',
      iconColor: colors.warning[500],
      gradient: [colors.warning[500], colors.warning[600]],
      features: [
        '👤 Detailed client profiles',
        '📋 Advanced search and filtering',
        '🏷️ Custom tags and categories',
        '📞 Communication tracking'
      ]
    },
    {
      id: 'projects',
      title: 'Project Management Excellence',
      subtitle: 'Track projects from start to finish with ease',
      icon: 'folder-outline',
      iconColor: colors.blue[600],
      gradient: [colors.blue[600], colors.blue[700]],
      features: [
        '📅 Timeline and milestones',
        '📸 Media gallery uploads',
        '📝 Meeting notes and events',
        '🎯 Progress tracking'
      ]
    },
    {
      id: 'collaboration',
      title: 'Real-time Collaboration',
      subtitle: 'Work together seamlessly with your team',
      icon: 'share-outline',
      iconColor: colors.danger[500],
      gradient: [colors.danger[500], colors.danger[600]],
      features: [
        '🔄 Live data synchronization',
        '📱 Push notifications',
        '💬 Team communication',
        '📊 Shared dashboards'
      ]
    }
  ];

  // Navigate to next step
  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(currentStep + 1);
        scrollRef.current?.scrollTo({ x: (currentStep + 1) * width, animated: false });
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    } else {
      completeOnboarding();
    }
  };

  // Navigate to previous step
  const prevStep = () => {
    if (currentStep > 0) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(currentStep - 1);
        scrollRef.current?.scrollTo({ x: (currentStep - 1) * width, animated: false });
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  // Skip onboarding
  const skipOnboarding = async () => {
    await AsyncStorage.setItem('@onboarding_completed', 'true');
    onSkip?.();
  };

  // Complete onboarding
  const completeOnboarding = async () => {
    await AsyncStorage.setItem('@onboarding_completed', 'true');
    onComplete?.();
  };

  // Go to specific step
  const goToStep = (stepIndex) => {
    if (stepIndex !== currentStep) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(stepIndex);
        scrollRef.current?.scrollTo({ x: stepIndex * width, animated: false });
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  // Render individual step
  const renderStep = (step, index) => {
    const isActive = index === currentStep;

    return (
      <View key={step.id} style={[styles.stepContainer, { width }]}>
        <LinearGradient
          colors={step.gradient}
          style={styles.stepGradient}
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons
              name={step.icon}
              size={80}
              color={colors.beige[100]}
              style={styles.stepIcon}
            />
          </View>

          {/* Content */}
          <Animated.View style={[styles.stepContent, { opacity: fadeAnim }]}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepSubtitle}>{step.subtitle}</Text>

            {/* Features */}
            <View style={styles.featuresContainer}>
              {step.features.map((feature, featureIndex) => (
                <View key={featureIndex} style={styles.featureItem}>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </LinearGradient>
      </View>
    );
  };

  // Render pagination dots
  const renderPagination = () => (
    <View style={styles.pagination}>
      {onboardingSteps.map((_, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.paginationDot,
            index === currentStep && styles.paginationDotActive
          ]}
          onPress={() => goToStep(index)}
        />
      ))}
    </View>
  );

  // Render action buttons
  const renderActions = () => {
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === onboardingSteps.length - 1;

    return (
      <View style={styles.actions}>
        {!isFirstStep && (
          <TouchableOpacity
            style={[styles.actionButton, styles.backButton]}
            onPress={prevStep}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.nextButton]}
          onPress={isLastStep ? completeOnboarding : nextStep}
        >
          <Text style={styles.nextButtonText}>
            {isLastStep ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons
            name={isLastStep ? 'checkmark' : 'arrow-forward'}
            size={16}
            color={colors.beige[100]}
            style={styles.buttonIcon}
          />
        </TouchableOpacity>

        {!isLastStep && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={skipOnboarding}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <LinearGradient
          colors={[colors.blue[500], colors.blue[600]]}
          style={[
            styles.progressFill,
            {
              width: `${((currentStep + 1) / onboardingSteps.length) * 100}%`
            }
          ]}
        />
      </View>

      {/* Steps Carousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.stepsContainer}
      >
        {onboardingSteps.map((step, index) => renderStep(step, index))}
      </ScrollView>

      {/* Pagination */}
      {renderPagination()}

      {/* Actions */}
      {renderActions()}
    </View>
  );
};

// Quick tip component for contextual help
export const QuickTip = ({ title, content, icon = 'bulb-outline', visible }) => {
  if (!visible) return null;

  return (
    <LinearGradient
      colors={[colors.warning[50], colors.warning[100]]}
      style={styles.quickTip}
    >
      <View style={styles.tipHeader}>
        <Ionicons name={icon} size={20} color={colors.warning[600]} />
        <Text style={styles.tipTitle}>{title}</Text>
      </View>
      <Text style={styles.tipContent}>{content}</Text>
    </LinearGradient>
  );
};

// Help tooltip component
export const HelpTooltip = ({ children, helpText, position = 'top' }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <View style={styles.helpTooltipContainer}>
      <TouchableOpacity
        style={styles.helpButton}
        onPress={() => setShowTooltip(!showTooltip)}
      >
        <Ionicons name="help-circle-outline" size={20} color={colors.blue[500]} />
      </TouchableOpacity>

      {showTooltip && (
        <View style={[
          styles.tooltip,
          position === 'top' ? styles.tooltipTop : styles.tooltipBottom
        ]}>
          <Text style={styles.tooltipText}>{helpText}</Text>
          <TouchableOpacity
            style={styles.tooltipClose}
            onPress={() => setShowTooltip(false)}
          >
            <Ionicons name="close" size={12} color={colors.neutral[600]} />
          </TouchableOpacity>
        </View>
      )}

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.beige[100],
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.beige[300],
    width: '100%',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  stepsContainer: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepGradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  stepIcon: {
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  stepContent: {
    alignItems: 'center',
    maxWidth: width * 0.8,
  },
  stepTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: colors.beige[100],
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  stepSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.beige[200],
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  featuresContainer: {
    width: '100%',
    maxWidth: width * 0.7,
  },
  featureItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    backdropFilter: 'blur(10px)',
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.beige[100],
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.beige[300],
    marginHorizontal: spacing.xs,
  },
  paginationDotActive: {
    backgroundColor: colors.blue[500],
    width: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.beige[100],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.blue[500],
  },
  nextButton: {
    backgroundColor: colors.blue[500],
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: colors.blue[500],
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: colors.beige[100],
  },
  buttonIcon: {
    marginLeft: spacing.xs,
  },
  skipButton: {
    position: 'absolute',
    right: spacing.lg,
  },
  skipButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.neutral[500],
  },
  quickTip: {
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning[500],
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tipTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: colors.warning[700],
    marginLeft: spacing.sm,
  },
  tipContent: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: colors.warning[600],
    lineHeight: 18,
  },
  helpTooltipContainer: {
    position: 'relative',
  },
  helpButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    zIndex: 1,
    backgroundColor: colors.beige[100],
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.blue[500],
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: colors.neutral[800],
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    maxWidth: 200,
    zIndex: 2,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  tooltipTop: {
    bottom: 30,
    right: 0,
  },
  tooltipBottom: {
    top: 30,
    right: 0,
  },
  tooltipText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.beige[100],
    lineHeight: 16,
  },
  tooltipClose: {
    position: 'absolute',
    top: 4,
    right: 4,
    padding: 2,
  },
});

export default OnboardingWizard;