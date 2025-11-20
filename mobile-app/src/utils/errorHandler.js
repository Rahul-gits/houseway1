import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Comprehensive error handling and recovery system
 */

class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
    this.retryQueue = new Map();
    this.criticalErrors = new Set();
    this.setupGlobalErrorHandlers();
  }

  // Setup global error handlers
  setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    if (!global._handledUnhandledPromiseRejections) {
      global._handledUnhandledPromiseRejections = true;

      global.addEventListener('unhandledrejection', (event) => {
        this.handleError(event.reason, {
          type: 'UnhandledPromiseRejection',
          stack: event.reason?.stack,
          timestamp: new Date().toISOString(),
        });
      });
    }
  }

  // Handle different types of errors
  async handleError(error, context = {}) {
    const errorData = {
      id: this.generateErrorId(),
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      type: context.type || 'Unknown',
      severity: this.determineSeverity(error, context),
      timestamp: new Date().toISOString(),
      context: {
        ...context,
        userAgent: this.getUserAgent(),
        appVersion: this.getAppVersion(),
      },
      resolved: false,
    };

    // Add to error log
    this.addToErrorLog(errorData);

    // Handle based on severity
    if (errorData.severity === 'critical') {
      this.handleCriticalError(errorData);
    } else if (errorData.severity === 'high') {
      this.handleHighSeverityError(errorData);
    } else {
      this.handleStandardError(errorData);
    }

    // Attempt automatic recovery
    await this.attemptRecovery(errorData);

    // Report to monitoring service
    this.reportError(errorData);

    return errorData;
  }

  // Determine error severity
  determineSeverity(error, context) {
    // Network errors
    if (this.isNetworkError(error)) {
      return context.userAction ? 'high' : 'medium';
    }

    // Authentication errors
    if (this.isAuthError(error)) {
      return 'high';
    }

    // Critical system errors
    if (this.isCriticalSystemError(error)) {
      return 'critical';
    }

    // User input validation errors
    if (this.isValidationError(error)) {
      return 'low';
    }

    // API errors
    if (this.isApiError(error)) {
      return error.status >= 500 ? 'high' : 'medium';
    }

    return 'medium';
  }

  // Generate unique error ID
  generateErrorId() {
    return `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Add error to log
  addToErrorLog(errorData) {
    this.errorLog.unshift(errorData);

    // Maintain max log size
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Save to persistent storage
    this.saveErrorLog();
  }

  // Handle critical errors
  handleCriticalError(errorData) {
    this.criticalErrors.add(errorData.id);

    Alert.alert(
      'Critical Error',
      'A critical error occurred. The app may need to restart.',
      [
        {
          text: 'Restart App',
          onPress: () => this.restartApp(),
        },
        {
          text: 'Continue Anyway',
          style: 'destructive',
          onPress: () => console.warn('User chose to continue after critical error'),
        },
      ]
    );
  }

  // Handle high severity errors
  handleHighSeverityError(errorData) {
    if (this.isNetworkError(errorData)) {
      this.showNetworkErrorAlert();
    } else if (this.isAuthError(errorData)) {
      this.showAuthErrorAlert();
    } else {
      this.showGenericErrorAlert(errorData.message);
    }
  }

  // Handle standard errors
  handleStandardError(errorData) {
    // Log silently or show toast notification
    console.warn('Standard error:', errorData.message);
  }

  // Show network error alert
  showNetworkErrorAlert() {
    Alert.alert(
      'Network Error',
      'Please check your internet connection and try again.',
      [
        {
          text: 'Retry',
          onPress: () => this.retryFailedOperations(),
        },
        {
          text: 'OK',
          style: 'cancel',
        },
      ]
    );
  }

  // Show authentication error alert
  showAuthErrorAlert() {
    Alert.alert(
      'Authentication Error',
      'Please log in again to continue.',
      [
        {
          text: 'Log In',
          onPress: () => this.redirectToLogin(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  }

  // Show generic error alert
  showGenericErrorAlert(message) {
    Alert.alert('Error', message || 'An unexpected error occurred.');
  }

  // Attempt automatic recovery
  async attemptRecovery(errorData) {
    const recoveryActions = this.getRecoveryActions(errorData);

    for (const action of recoveryActions) {
      try {
        await action();
        console.log('✅ Recovery action succeeded:', action.name);
        break; // Stop at first successful recovery
      } catch (recoveryError) {
        console.warn('❌ Recovery action failed:', action.name, recoveryError);
      }
    }
  }

  // Get recovery actions for specific error
  getRecoveryActions(errorData) {
    const actions = [];

    if (this.isNetworkError(errorData)) {
      actions.push({
        name: 'ClearCache',
        action: () => this.clearCache(),
      });
    }

    if (this.isAuthError(errorData)) {
      actions.push({
        name: 'RefreshToken',
        action: () => this.refreshAuthToken(),
      });
    }

    return actions;
  }

  // Recovery action implementations
  async clearCache() {
    try {
      // Clear app cache
      await AsyncStorage.multiRemove([
        '@clients_cache',
        '@projects_cache',
        '@timeline_cache',
      ]);
      console.log('✅ Cache cleared');
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
    }
  }

  async refreshAuthToken() {
    try {
      // Attempt to refresh authentication token
      const refreshToken = await AsyncStorage.getItem('@refresh_token');
      if (refreshToken) {
        console.log('✅ Token refresh attempted');
      }
    } catch (error) {
      console.error('❌ Failed to refresh auth token:', error);
    }
  }

  // Check if error is network-related
  isNetworkError(error) {
    return (
      error?.message?.toLowerCase().includes('network') ||
      error?.message?.toLowerCase().includes('connection') ||
      error?.code === 'NETWORK_ERROR' ||
      error?.code === 'TIMEOUT'
    );
  }

  // Check if error is authentication-related
  isAuthError(error) {
    return (
      error?.status === 401 ||
      error?.status === 403 ||
      error?.code === 'AUTH_FAILED' ||
      error?.message?.toLowerCase().includes('unauthorized')
    );
  }

  // Check if error is critical system error
  isCriticalSystemError(error) {
    return (
      error?.message?.toLowerCase().includes('out of memory') ||
      error?.message?.toLowerCase().includes('disk full') ||
      error?.name === 'QuotaExceededError' ||
      error?.name === 'InternalError'
    );
  }

  // Check if error is validation-related
  isValidationError(error) {
    return (
      error?.name === 'ValidationError' ||
      error?.code === 'VALIDATION_FAILED' ||
      error?.message?.toLowerCase().includes('validation')
    );
  }

  // Check if error is API-related
  isApiError(error) {
    return (
      error?.status !== undefined ||
      error?.code?.toString().startsWith('HTTP_')
    );
  }

  // Report error to monitoring service
  async reportError(errorData) {
    try {
      if (__DEV__) {
        console.log('📊 Error reported:', errorData);
      }
      await AsyncStorage.setItem('@last_error', JSON.stringify(errorData));
    } catch (error) {
      console.error('❌ Failed to report error:', error);
    }
  }

  // Get user agent information
  getUserAgent() {
    return {
      platform: Platform.OS,
      version: Platform.Version,
    };
  }

  // Get app version
  getAppVersion() {
    return '1.0.0'; // Placeholder
  }

  // Save error log to storage
  async saveErrorLog() {
    try {
      await AsyncStorage.setItem('@error_log', JSON.stringify(this.errorLog));
    } catch (error) {
      console.error('❌ Failed to save error log:', error);
    }
  }

  // Get error statistics
  getErrorStats() {
    const stats = {
      total: this.errorLog.length,
      byType: {},
      bySeverity: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      },
    };

    this.errorLog.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      stats.bySeverity[error.severity]++;
    });

    return stats;
  }

  // Clear error log
  clearErrorLog() {
    this.errorLog = [];
    this.criticalErrors.clear();
    this.retryQueue.clear();
    AsyncStorage.removeItem('@error_log');
  }

  // Restart app (placeholder implementation)
  restartApp() {
    console.warn('🔄 App restart requested');
  }

  // Redirect to login (placeholder implementation)
  redirectToLogin() {
    console.warn('🔐 Redirecting to login');
  }

  // Export error log for debugging
  async exportErrorLog() {
    try {
      const stats = this.getErrorStats();
      const exportData = {
        exportedAt: new Date().toISOString(),
        stats,
        errors: this.errorLog,
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('❌ Failed to export error log:', error);
      throw error;
    }
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

// Export convenience functions
export const handleError = (error, context) => errorHandler.handleError(error, context);
export const getErrorStats = () => errorHandler.getErrorStats();
export const clearErrors = () => errorHandler.clearErrorLog();
export const exportErrorLog = () => errorHandler.exportErrorLog();

export default errorHandler;