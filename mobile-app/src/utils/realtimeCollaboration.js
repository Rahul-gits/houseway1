import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Real-time collaboration utilities for client management
 */

class RealtimeCollaboration {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.rooms = new Set();
    this.eventListeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  // Initialize connection
  async initialize() {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      this.socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:3000', {
        auth: { token },
        transports: ['websocket'],
        timeout: 10000,
        forceNew: true,
      });

      this.setupEventHandlers();
    } catch (error) {
      console.error('Error initializing real-time collaboration:', error);
      this.scheduleReconnect();
    }
  }

  // Setup socket event handlers
  setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🔗 Real-time connection established');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connectionChange', { connected: true });

      // Rejoin rooms after reconnection
      this.rooms.forEach(room => {
        this.socket.emit('joinRoom', { room });
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Real-time connection lost:', reason);
      this.isConnected = false;
      this.emit('connectionChange', { connected: false });

      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect automatically
        return;
      }

      this.scheduleReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('🚫 Connection error:', error);
      this.isConnected = false;
      this.emit('connectionError', error);
    });

    // Real-time event handlers
    this.socket.on('clientUpdate', (data) => {
      this.emit('clientUpdate', data);
    });

    this.socket.on('projectUpdate', (data) => {
      this.emit('projectUpdate', data);
    });

    this.socket.on('timelineEvent', (data) => {
      this.emit('timelineEvent', data);
    });

    this.socket.on('newInvoice', (data) => {
      this.emit('newInvoice', data);
    });

    this.socket.on('userTyping', (data) => {
      this.emit('userTyping', data);
    });

    this.socket.on('userPresence', (data) => {
      this.emit('userPresence', data);
    });

    this.socket.on('commentAdded', (data) => {
      this.emit('commentAdded', data);
    });

    this.socket.on('fileShared', (data) => {
      this.emit('fileShared', data);
    });
  }

  // Schedule reconnection attempt
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      this.emit('reconnectFailed');
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

    setTimeout(() => {
      this.reconnectAttempts++;
      this.initialize();
    }, delay);
  }

  // Join a room for specific client/project
  joinRoom(room) {
    if (!this.socket || !this.isConnected) {
      console.warn('⚠️ Cannot join room - not connected');
      return;
    }

    this.socket.emit('joinRoom', { room });
    this.rooms.add(room);
    console.log(`📝 Joined room: ${room}`);
  }

  // Leave a room
  leaveRoom(room) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('leaveRoom', { room });
    this.rooms.delete(room);
    console.log(`📤 Left room: ${room}`);
  }

  // Send client update event
  sendClientUpdate(clientId, changes, user) {
    if (!this.socket || !this.isConnected) {
      console.warn('⚠️ Cannot send client update - not connected');
      return;
    }

    this.socket.emit('clientUpdate', {
      clientId,
      changes,
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Send project update event
  sendProjectUpdate(projectId, changes, user) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('projectUpdate', {
      projectId,
      changes,
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Send typing indicator
  sendTyping(room, isTyping, user) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('typing', {
      room,
      isTyping,
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
    });
  }

  // Send presence update
  sendPresence(status, activity = null) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('presence', {
      status, // 'online', 'away', 'busy', 'offline'
      activity,
      timestamp: new Date().toISOString(),
    });
  }

  // Send comment
  sendComment(entityType, entityId, comment, user) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('comment', {
      entityType, // 'client', 'project', 'timeline', 'invoice'
      entityId,
      comment: {
        text: comment.text,
        mentions: comment.mentions || [],
        attachments: comment.attachments || [],
      },
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Share file with collaborators
  shareFile(file, recipients, user) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('shareFile', {
      file: {
        id: file.id,
        name: file.name,
        type: file.type,
        size: file.size,
        url: file.url,
      },
      recipients, // Array of user IDs
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Add event listener
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  // Remove event listener
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Emit event to listeners
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

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      rooms: Array.from(this.rooms),
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.rooms.clear();
    this.eventListeners.clear();
  }

  // Real-time collaboration hooks for React components
  createCollaborationHooks() {
    return {
      useRealtimePresence: (room) => {
        const [presence, setPresence] = useState({});
        const [typingUsers, setTypingUsers] = useState([]);

        useEffect(() => {
          const handlePresence = (data) => {
            if (data.room === room) {
              setPresence(prev => ({
                ...prev,
                [data.user.id]: data,
              }));
            }
          };

          const handleTyping = (data) => {
            if (data.room === room) {
              setTypingUsers(prev => {
                const filtered = prev.filter(u => u.id !== data.user.id);
                return data.isTyping ? [...filtered, data.user] : filtered;
              });
            }
          };

          this.on('userPresence', handlePresence);
          this.on('userTyping', handleTyping);

          return () => {
            this.off('userPresence', handlePresence);
            this.off('userTyping', handleTyping);
          };
        }, [room]);

        return { presence, typingUsers };
      },

      useRealtimeComments: (entityType, entityId) => {
        const [comments, setComments] = useState([]);

        useEffect(() => {
          const handleComment = (data) => {
            if (data.entityType === entityType && data.entityId === entityId) {
              setComments(prev => [...prev, data]);
            }
          };

          this.on('commentAdded', handleComment);
          return () => this.off('commentAdded', handleComment);
        }, [entityType, entityId]);

        const addComment = (comment, user) => {
          this.sendComment(entityType, entityId, comment, user);
        };

        return { comments, addComment };
      },

      useRealtimeFiles: (room) => {
        const [sharedFiles, setSharedFiles] = useState([]);

        useEffect(() => {
          const handleFileShare = (data) => {
            if (data.recipients.includes(this.currentUserId) || data.room === room) {
              setSharedFiles(prev => [...prev, data.file]);
            }
          };

          this.on('fileShared', handleFileShare);
          return () => this.off('fileShared', handleFileShare);
        }, [room]);

        const shareFile = (file, recipients, user) => {
          this.shareFile(file, recipients, user);
        };

        return { sharedFiles, shareFile };
      },
    };
  }
}

// Collaboration UI Component
export const CollaborationIndicator = ({ presence, typingUsers }) => {
  const onlineUsers = Object.values(presence).filter(p => p.status === 'online');
  const activeTyping = typingUsers.slice(0, 3);

  return (
    <View style={styles.collaborationContainer}>
      {/* Online users */}
      <View style={styles.onlineUsers}>
        <Text style={styles.onlineLabel}>
          {onlineUsers.length} online
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {onlineUsers.map(user => (
            <View key={user.id} style={styles.userAvatar}>
              <Image
                source={{ uri: user.avatar || '/default-avatar.png' }}
                style={styles.avatar}
              />
              <View style={[styles.statusDot, {
                backgroundColor: user.status === 'online' ? '#4CAF50' : '#9E9E9E'
              }]} />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Typing indicators */}
      {activeTyping.length > 0 && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>
            {activeTyping.map(u => u.name).join(', ')}
            {activeTyping.length === 1 ? ' is' : ' are'} typing...
          </Text>
          <View style={styles.typingDots}>
            <View style={styles.dot} />
            <View style={[styles.dot, { animationDelay: '0.2s' }]} />
            <View style={[styles.dot, { animationDelay: '0.4s' }]} />
          </View>
        </View>
      )}
    </View>
  );
};

// Create singleton instance
const realtimeCollaboration = new RealtimeCollaboration();

export default realtimeCollaboration;