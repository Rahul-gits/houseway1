import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import { Platform } from 'react-native';

/**
 * Security enhancements and audit logging utilities
 */

class SecurityManager {
  constructor() {
    this.auditLog = [];
    this.maxLogSize = 1000;
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
    this.encryptionKey = this.getOrCreateEncryptionKey();
    this.setupSessionMonitoring();
  }

  // Generate or retrieve encryption key
  getOrCreateEncryptionKey() {
    const key = 'SecureClientManagementKey2024';
    return CryptoJS.enc.Utf8.parse(key);
  }

  // Setup session monitoring
  setupSessionMonitoring() {
    this.lastActivity = Date.now();
    this.sessionTimer = setInterval(() => {
      this.checkSessionTimeout();
    }, 60000); // Check every minute
  }

  // Check if session has timed out
  checkSessionTimeout() {
    const now = Date.now();
    if (now - this.lastActivity > this.sessionTimeout) {
      this.handleSessionTimeout();
    }
  }

  // Update last activity timestamp
  updateActivity() {
    this.lastActivity = Date.now();
  }

  // Handle session timeout
  async handleSessionTimeout() {
    await this.logSecurityEvent({
      type: 'SESSION_TIMEOUT',
      severity: 'high',
      details: 'User session timed out due to inactivity',
      timestamp: new Date().toISOString(),
    });

    // Clear authentication data
    await this.clearSession();

    // Emit session timeout event
    this.emit('SESSION_TIMEOUT');
  }

  // Encrypt sensitive data
  encrypt(data) {
    try {
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(data),
        this.encryptionKey,
        {
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );
      return encrypted.toString();
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  // Decrypt sensitive data
  decrypt(encryptedData) {
    try {
      const decrypted = CryptoJS.AES.decrypt(
        encryptedData,
        this.encryptionKey,
        {
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );
      return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  // Securely store sensitive data
  async secureStore(key, data) {
    try {
      const encrypted = this.encrypt(data);
      await AsyncStorage.setItem(`secure_${key}`, encrypted);
      await this.logSecurityEvent({
        type: 'DATA_ENCRYPTED',
        severity: 'low',
        details: `Encrypted data for key: ${key}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Secure store error:', error);
      await this.logSecurityEvent({
        type: 'SECURE_STORE_ERROR',
        severity: 'high',
        details: `Failed to securely store data for key: ${key}`,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  // Securely retrieve sensitive data
  async secureRetrieve(key) {
    try {
      const encrypted = await AsyncStorage.getItem(`secure_${key}`);
      if (!encrypted) return null;

      const decrypted = this.decrypt(encrypted);
      this.updateActivity();
      return decrypted;
    } catch (error) {
      console.error('Secure retrieve error:', error);
      await this.logSecurityEvent({
        type: 'SECURE_RETRIEVE_ERROR',
        severity: 'high',
        details: `Failed to securely retrieve data for key: ${key}`,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  // Validate user session
  async validateSession() {
    try {
      const sessionData = await this.secureRetrieve('user_session');
      if (!sessionData) {
        return false;
      }

      // Check if session is expired
      const now = Date.now();
      if (now > sessionData.expiresAt) {
        await this.logSecurityEvent({
          type: 'SESSION_EXPIRED',
          severity: 'medium',
          details: 'User session has expired',
          timestamp: new Date().toISOString(),
        });
        return false;
      }

      // Update session activity
      sessionData.lastActivity = now;
      sessionData.expiresAt = now + this.sessionTimeout;
      await this.secureStore('user_session', sessionData);

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  // Create user session
  async createSession(userData) {
    try {
      const sessionData = {
        userId: userData.id,
        role: userData.role,
        permissions: userData.permissions || [],
        loginTime: Date.now(),
        lastActivity: Date.now(),
        expiresAt: Date.now() + this.sessionTimeout,
        deviceInfo: this.getDeviceInfo(),
      };

      await this.secureStore('user_session', sessionData);
      await this.logSecurityEvent({
        type: 'SESSION_CREATED',
        severity: 'low',
        details: `Session created for user: ${userData.id}`,
        timestamp: new Date().toISOString(),
      });

      this.updateActivity();
      return sessionData;
    } catch (error) {
      console.error('Session creation error:', error);
      throw error;
    }
  }

  // Clear user session
  async clearSession() {
    try {
      await AsyncStorage.removeItem('secure_user_session');
      await AsyncStorage.removeItem('@auth_token');
      await AsyncStorage.removeItem('@refresh_token');
      await this.logSecurityEvent({
        type: 'SESSION_CLEARED',
        severity: 'medium',
        details: 'User session cleared',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Session clear error:', error);
    }
  }

  // Check user permissions
  async checkPermission(permission) {
    try {
      const sessionData = await this.secureRetrieve('user_session');
      if (!sessionData) return false;

      const hasPermission = sessionData.permissions.includes(permission) ||
                           sessionData.role === 'owner' ||
                           (sessionData.role === 'employee' && this.isEmployeePermission(permission));

      await this.logSecurityEvent({
        type: 'PERMISSION_CHECK',
        severity: 'low',
        details: `Permission check for ${permission}: ${hasPermission}`,
        timestamp: new Date().toISOString(),
      });

      return hasPermission;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }

  // Check if permission applies to employees
  isEmployeePermission(permission) {
    const employeePermissions = [
      'view_clients',
      'edit_clients',
      'view_projects',
      'edit_projects',
      'create_timeline_events',
      'view_invoices',
      'create_invoices',
      'upload_files'
    ];
    return employeePermissions.includes(permission);
  }

  // Validate API request
  async validateApiRequest(endpoint, method, userId) {
    try {
      // Check rate limiting
      const rateLimitKey = `rate_limit_${userId}_${endpoint}`;
      const rateLimitData = await this.secureRetrieve(rateLimitKey);

      if (rateLimitData) {
        const requests = rateLimitData.requests || [];
        const now = Date.now();
        const oneMinuteAgo = now - 60000;

        // Remove old requests (older than 1 minute)
        const recentRequests = requests.filter(time => time > oneMinuteAgo);

        // Check if rate limit exceeded (60 requests per minute)
        if (recentRequests.length >= 60) {
          await this.logSecurityEvent({
            type: 'RATE_LIMIT_EXCEEDED',
            severity: 'high',
            details: `Rate limit exceeded for ${endpoint} by user ${userId}`,
            timestamp: new Date().toISOString(),
          });
          return false;
        }

        // Add current request
        recentRequests.push(now);
        rateLimitData.requests = recentRequests;
      } else {
        rateLimitData.requests = [Date.now()];
      }

      await this.secureStore(rateLimitKey, rateLimitData);

      // Log API request
      await this.logSecurityEvent({
        type: 'API_REQUEST',
        severity: 'low',
        details: `${method} ${endpoint} by user ${userId}`,
        timestamp: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error('API request validation error:', error);
      return false;
    }
  }

  // Get device information for security
  getDeviceInfo() {
    return {
      platform: Platform.OS,
      version: Platform.Version,
      isPad: Platform.isPad || false,
      timestamp: Date.now(),
    };
  }

  // Log security events
  async logSecurityEvent(event) {
    try {
      const securityEvent = {
        ...event,
        id: this.generateEventId(),
        deviceInfo: this.getDeviceInfo(),
      };

      this.auditLog.unshift(securityEvent);

      // Maintain max log size
      if (this.auditLog.length > this.maxLogSize) {
        this.auditLog = this.auditLog.slice(0, this.maxLogSize);
      }

      // Save to persistent storage
      await this.saveAuditLog();

      // Report critical events immediately
      if (event.severity === 'critical' || event.severity === 'high') {
        await this.reportSecurityEvent(securityEvent);
      }
    } catch (error) {
      console.error('Security event logging error:', error);
    }
  }

  // Generate unique event ID
  generateEventId() {
    return `SEC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Save audit log to storage
  async saveAuditLog() {
    try {
      await AsyncStorage.setItem('@security_audit_log', JSON.stringify(this.auditLog));
    } catch (error) {
      console.error('Failed to save audit log:', error);
    }
  }

  // Report security event to monitoring service
  async reportSecurityEvent(event) {
    try {
      if (__DEV__) {
        console.log('🔒 Security Event:', event);
      }

      // In production, send to security monitoring service
      // Could integrate with services like Sentry, custom endpoints, etc.
      const criticalEvents = await AsyncStorage.getItem('@critical_security_events');
      const events = criticalEvents ? JSON.parse(criticalEvents) : [];
      events.push(event);

      // Keep only last 50 critical events
      const recentEvents = events.slice(-50);
      await AsyncStorage.setItem('@critical_security_events', JSON.stringify(recentEvents));
    } catch (error) {
      console.error('Failed to report security event:', error);
    }
  }

  // Get security statistics
  getSecurityStats() {
    const stats = {
      totalEvents: this.auditLog.length,
      byType: {},
      bySeverity: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      },
      recentEvents: this.auditLog.filter(e =>
        new Date(e.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length,
    };

    this.auditLog.forEach(event => {
      stats.byType[event.type] = (stats.byType[event.type] || 0) + 1;
      stats.bySeverity[event.severity]++;
    });

    return stats;
  }

  // Detect suspicious activity
  detectSuspiciousActivity() {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const recentEvents = this.auditLog.filter(e => new Date(e.timestamp) > oneHourAgo);

    const suspiciousPatterns = [];

    // Multiple failed login attempts
    const failedLogins = recentEvents.filter(e => e.type === 'LOGIN_FAILED').length;
    if (failedLogins > 5) {
      suspiciousPatterns.push({
        type: 'MULTIPLE_FAILED_LOGINS',
        count: failedLogins,
        severity: 'high'
      });
    }

    // Rapid API requests
    const apiRequests = recentEvents.filter(e => e.type === 'API_REQUEST').length;
    if (apiRequests > 1000) {
      suspiciousPatterns.push({
        type: 'RAPID_API_REQUESTS',
        count: apiRequests,
        severity: 'medium'
      });
    }

    // Session timeouts
    const sessionTimeouts = recentEvents.filter(e => e.type === 'SESSION_TIMEOUT').length;
    if (sessionTimeouts > 3) {
      suspiciousPatterns.push({
        type: 'MULTIPLE_SESSION_TIMEOUTS',
        count: sessionTimeouts,
        severity: 'medium'
      });
    }

    return suspiciousPatterns;
  }

  // Generate security report
  async generateSecurityReport() {
    try {
      const stats = this.getSecurityStats();
      const suspiciousActivity = this.detectSuspiciousActivity();
      const criticalEvents = this.auditLog.filter(e => e.severity === 'critical' || e.severity === 'high');

      const report = {
        generatedAt: new Date().toISOString(),
        summary: stats,
        suspiciousActivity,
        criticalEvents: criticalEvents.slice(0, 20), // Last 20 critical events
        recommendations: this.generateSecurityRecommendations(stats, suspiciousActivity),
      };

      return this.encrypt(report);
    } catch (error) {
      console.error('Failed to generate security report:', error);
      throw error;
    }
  }

  // Generate security recommendations
  generateSecurityRecommendations(stats, suspiciousActivity) {
    const recommendations = [];

    if (stats.bySeverity.critical > 0) {
      recommendations.push({
        priority: 'HIGH',
        message: 'Critical security events detected. Immediate investigation required.',
        action: 'Review critical events and consider account lockouts.'
      });
    }

    if (suspiciousActivity.some(p => p.type === 'MULTIPLE_FAILED_LOGINS')) {
      recommendations.push({
        priority: 'HIGH',
        message: 'Multiple failed login attempts detected.',
        action: 'Implement account lockout policy and monitor for brute force attacks.'
      });
    }

    if (stats.recentEvents > 1000) {
      recommendations.push({
        priority: 'MEDIUM',
        message: 'High security event volume detected.',
        action: 'Review activity patterns and consider enhanced monitoring.'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'INFO',
        message: 'Security posture appears normal.',
        action: 'Continue regular monitoring and maintain security best practices.'
      });
    }

    return recommendations;
  }

  // Clear security audit log
  async clearAuditLog() {
    try {
      this.auditLog = [];
      await AsyncStorage.removeItem('@security_audit_log');
      await AsyncStorage.removeItem('@critical_security_events');
    } catch (error) {
      console.error('Failed to clear audit log:', error);
    }
  }

  // Validate input data for security
  validateInput(data, type) {
    const validations = {
      email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      phone: (value) => /^[\d\s\-\+\(\)]+$/.test(value) && value.length >= 10,
      name: (value) => value.length >= 2 && value.length <= 100 && /^[a-zA-Z\s\-']+$/.test(value),
      id: (value) => /^[a-fA-F0-9]{24}$/.test(value), // MongoDB ObjectId
      amount: (value) => !isNaN(value) && parseFloat(value) >= 0,
    };

    const validator = validations[type];
    if (!validator) {
      return { valid: false, error: 'Unknown validation type' };
    }

    const isValid = validator(data);
    return {
      valid: isValid,
      error: isValid ? null : `Invalid ${type} format`
    };
  }

  // Sanitize user input
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;

    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/javascript:/gi, '') // Remove javascript protocols
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }

  // Event listener management
  eventListeners = new Map();

  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  // Cleanup
  cleanup() {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
    }
    this.eventListeners.clear();
  }
}

// Create singleton instance
const securityManager = new SecurityManager();

// Export convenience functions
export const encryptData = (data) => securityManager.encrypt(data);
export const decryptData = (encryptedData) => securityManager.decrypt(encryptedData);
export const secureStore = (key, data) => securityManager.secureStore(key, data);
export const secureRetrieve = (key) => securityManager.secureRetrieve(key);
export const checkPermission = (permission) => securityManager.checkPermission(permission);
export const validateSession = () => securityManager.validateSession();
export const logSecurityEvent = (event) => securityManager.logSecurityEvent(event);

export default securityManager;