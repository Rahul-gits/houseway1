import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

/**
 * Offline data synchronization utilities
 */

class OfflineSync {
  constructor() {
    this.isOnline = true;
    this.syncQueue = [];
    this.setupNetworkListener();
  }

  // Setup network connectivity listener
  setupNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected;

      // Trigger sync when coming back online
      if (wasOffline && this.isOnline) {
        this.processSyncQueue();
      }
    });
  }

  // Store data locally
  async storeData(key, data) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now(),
        synced: this.isOnline
      }));
    } catch (error) {
      console.error('Error storing data:', error);
    }
  }

  // Retrieve data from local storage
  async getData(key, maxAge = 3600000) { // 1 hour default
    try {
      const stored = await AsyncStorage.getItem(key);
      if (!stored) return null;

      const { data, timestamp, synced } = JSON.parse(stored);

      // Check if data is too old
      if (Date.now() - timestamp > maxAge) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  }

  // Add operation to sync queue
  async addToSyncQueue(operation) {
    const syncItem = {
      id: Date.now().toString(),
      ...operation,
      timestamp: Date.now(),
      retries: 0
    };

    this.syncQueue.push(syncItem);
    await this.saveSyncQueue();

    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  // Save sync queue to storage
  async saveSyncQueue() {
    try {
      await AsyncStorage.setItem('@sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  }

  // Load sync queue from storage
  async loadSyncQueue() {
    try {
      const stored = await AsyncStorage.getItem('@sync_queue');
      if (stored) {
        this.syncQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading sync queue:', error);
    }
  }

  // Process sync queue when online
  async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    const failedItems = [];

    for (const item of this.syncQueue) {
      try {
        await this.executeSyncOperation(item);
        console.log(`✅ Synced: ${item.type} - ${item.id}`);
      } catch (error) {
        console.error(`❌ Sync failed: ${item.type} - ${item.id}`, error);

        item.retries++;
        if (item.retries < 3) {
          failedItems.push(item);
        } else {
          console.log(`🚫 Max retries reached for: ${item.id}`);
        }
      }
    }

    this.syncQueue = failedItems;
    await this.saveSyncQueue();
  }

  // Execute individual sync operation
  async executeSyncOperation(operation) {
    const { type, url, method, data } = operation;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await this.getAuthToken()}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status}`);
    }

    return response.json();
  }

  // Get authentication token
  async getAuthToken() {
    try {
      return await AsyncStorage.getItem('@auth_token');
    } catch (error) {
      return null;
    }
  }

  // Sync specific data type
  async syncData(type, apiEndpoint, storageKey) {
    if (!this.isOnline) return;

    try {
      const response = await fetch(apiEndpoint, {
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        await this.storeData(storageKey, data);
        return data;
      }
    } catch (error) {
      console.error(`Error syncing ${type}:`, error);
    }
  }

  // Force refresh all cached data
  async refreshAllData() {
    const endpoints = {
      clients: '/api/clients',
      timeline: '/api/timeline/dashboard/summary',
      invoices: '/api/invoices/dashboard/summary',
      dashboard: '/api/dashboard/client-management'
    };

    const results = {};

    for (const [key, endpoint] of Object.entries(endpoints)) {
      results[key] = await this.syncData(key, endpoint, `@${key}_data`);
    }

    return results;
  }

  // Clear all cached data
  async clearCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const dataKeys = keys.filter(key =>
        key.startsWith('@') && !key.includes('auth') && !key.includes('sync')
      );

      await AsyncStorage.multiRemove(dataKeys);
      console.log('✅ Cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Get sync status
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      queueLength: this.syncQueue.length,
      lastSync: this.lastSyncTimestamp
    };
  }
}

// Create singleton instance
const offlineSync = new OfflineSync();

export default offlineSync;