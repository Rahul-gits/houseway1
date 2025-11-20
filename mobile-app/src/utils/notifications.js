import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';
 AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Push notification utilities for client updates
 */

class NotificationManager {
  constructor() {
    this.initializePushNotifications();
    this.setupNotificationChannels();
  }

  // Initialize push notifications
  initializePushNotifications() {
    PushNotification.configure({
      onRegister: async (token) => {
        console.log('📱 Push notification token:', token);
        await this.saveDeviceToken(token);
      },

      onNotification: (notification) => {
        console.log('📢 Notification received:', notification);

        if (notification.userInteraction) {
          this.handleNotificationPress(notification);
        }

        // Handle foreground notifications
        if (notification.foreground) {
          this.showInAppNotification(notification);
        }
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });
  }

  // Setup notification channels for Android
  setupNotificationChannels() {
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'client-updates',
          channelName: 'Client Updates',
          channelDescription: 'Notifications for client activities and updates',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log('Channel created:', created)
      );

      PushNotification.createChannel(
        {
          channelId: 'project-milestones',
          channelName: 'Project Milestones',
          channelDescription: 'Notifications for project milestones and deadlines',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log('Channel created:', created)
      );

      PushNotification.createChannel(
        {
          channelId: 'invoice-reminders',
          channelName: 'Invoice Reminders',
          channelDescription: 'Notifications for invoice due dates and payments',
          playSound: true,
          soundName: 'default',
          importance: 3,
          vibrate: true,
        },
        (created) => console.log('Channel created:', created)
      );
    }
  }

  // Save device token to server
  async saveDeviceToken(token) {
    try {
      const userToken = await AsyncStorage.getItem('@auth_token');
      if (userToken) {
        await fetch('/api/users/device-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
          },
          body: JSON.stringify({
            token: token.token,
            platform: Platform.OS
          })
        });
      }
    } catch (error) {
      console.error('Error saving device token:', error);
    }
  }

  // Show local notification
  showLocalNotification(title, message, data = {}) {
    PushNotification.localNotification({
      channelId: 'client-updates',
      title,
      message,
      userInfo: data,
      playSound: true,
      soundName: 'default',
      actions: ['View', 'Dismiss']
    });
  }

  // Schedule notification for specific time
  scheduleNotification(title, message, date, data = {}) {
    PushNotification.localNotificationSchedule({
      channelId: 'project-milestones',
      title,
      message,
      date,
      userInfo: data,
      playSound: true,
      soundName: 'default',
    });
  }

  // Show notification for new client
  notifyNewClient(client) {
    this.showLocalNotification(
      'New Client Added',
      `${client.firstName} ${client.lastName} has been added to your client list.`,
      { type: 'new_client', clientId: client._id }
    );
  }

  // Show notification for project milestone
  notifyProjectMilestone(project, milestone) {
    this.showLocalNotification(
      'Project Milestone Reached',
      `🎉 ${project.title} has reached: ${milestone.title}`,
      { type: 'milestone', projectId: project._id }
    );
  }

  // Show notification for invoice due
  notifyInvoiceDue(invoice) {
    const daysLeft = Math.ceil((new Date(invoice.dueDate) - new Date()) / (1000 * 60 * 60 * 24));

    this.showLocalNotification(
      'Invoice Due Soon',
      `Invoice ${invoice.invoiceNumber} is due in ${daysLeft} days ($${invoice.totalAmount})`,
      { type: 'invoice_due', invoiceId: invoice._id }
    );
  }

  // Show notification for timeline event
  notifyTimelineEvent(event) {
    const eventEmojis = {
      meeting: '🤝',
      milestone: '🎯',
      issue: '⚠️',
      note: '📝',
      photo: '📸',
      video: '🎥',
      document: '📄'
    };

    const emoji = eventEmojis[event.eventType] || '📌';

    this.showLocalNotification(
      'New Timeline Event',
      `${emoji} ${event.title} - ${event.project?.title || 'Project'}`,
      { type: 'timeline_event', eventId: event._id }
    );
  }

  // Show notification for client message
  notifyClientMessage(client, message) {
    this.showLocalNotification(
      `Message from ${client.firstName}`,
      message,
      { type: 'client_message', clientId: client._id }
    );
  }

  // Handle notification press
  handleNotificationPress(notification) {
    const { userInfo } = notification.data;

    switch (userInfo.type) {
      case 'new_client':
        navigation.navigate('ClientProfile', { clientId: userInfo.clientId });
        break;
      case 'milestone':
        navigation.navigate('ProjectDetail', { projectId: userInfo.projectId });
        break;
      case 'invoice_due':
        navigation.navigate('InvoiceDetail', { invoiceId: userInfo.invoiceId });
        break;
      case 'timeline_event':
        navigation.navigate('ProjectDetail', {
          projectId: userInfo.projectId,
          initialTab: 'timeline'
        });
        break;
      case 'client_message':
        navigation.navigate('ClientProfile', { clientId: userInfo.clientId });
        break;
      default:
        navigation.navigate('HomeDashboard');
    }
  }

  // Show in-app notification banner
  showInAppNotification(notification) {
    // This would integrate with a in-app notification component
    console.log('In-app notification:', notification);
  }

  // Schedule daily digest notifications
  scheduleDailyDigest() {
    // Schedule for 9 AM every day
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    PushNotification.localNotificationSchedule({
      channelId: 'client-updates',
      title: 'Daily Client Summary',
      message: 'Check your daily client activity summary',
      date: tomorrow,
      repeatType: 'day',
      userInfo: { type: 'daily_digest' }
    });
  }

  // Cancel all scheduled notifications
  cancelAllNotifications() {
    PushNotification.cancelAllLocalNotifications();
  }

  // Get notification settings
  async getNotificationSettings() {
    try {
      const settings = await AsyncStorage.getItem('@notification_settings');
      return settings ? JSON.parse(settings) : {
        clientUpdates: true,
        projectMilestones: true,
        invoiceReminders: true,
        dailyDigest: false,
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00'
        }
      };
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return {};
    }
  }

  // Update notification settings
  async updateNotificationSettings(settings) {
    try {
      await AsyncStorage.setItem('@notification_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  }

  // Check if quiet hours are active
  async isQuietHours() {
    const settings = await this.getNotificationSettings();
    if (!settings.quietHours?.enabled) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const { start, end } = settings.quietHours;

    if (start < end) {
      return currentTime >= start && currentTime <= end;
    } else {
      // Overnight quiet hours (e.g., 22:00 to 08:00)
      return currentTime >= start || currentTime <= end;
    }
  }
}

// Create singleton instance
const notificationManager = new NotificationManager();

export default notificationManager;