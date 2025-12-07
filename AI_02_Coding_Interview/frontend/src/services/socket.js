import { io } from 'socket.io-client';

// In production (same origin), use relative URL. In development, use the backend URL.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 
  (import.meta.env.PROD ? window.location.origin : 'http://localhost:3001');

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  /**
   * Connect to the WebSocket server
   */
  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connected to server');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from server:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return this.socket;
  }

  /**
   * Disconnect from the server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Get the socket instance
   */
  getSocket() {
    if (!this.socket) {
      return this.connect();
    }
    return this.socket;
  }

  /**
   * Join an interview room
   */
  joinRoom(sessionId, userName) {
    const socket = this.getSocket();
    socket.emit('join-room', { sessionId, userName });
  }

  /**
   * Leave the current room
   */
  leaveRoom(sessionId) {
    const socket = this.getSocket();
    socket.emit('leave-room', { sessionId });
  }

  /**
   * Send code changes
   */
  sendCodeChange(sessionId, code, cursorPosition) {
    const socket = this.getSocket();
    socket.emit('code-change', { sessionId, code, cursorPosition });
  }

  /**
   * Send language change
   */
  sendLanguageChange(sessionId, language) {
    const socket = this.getSocket();
    socket.emit('language-change', { sessionId, language });
  }

  /**
   * Send cursor position
   */
  sendCursorChange(sessionId, position) {
    const socket = this.getSocket();
    socket.emit('cursor-change', { sessionId, position });
  }

  /**
   * Send selection change
   */
  sendSelectionChange(sessionId, selection) {
    const socket = this.getSocket();
    socket.emit('selection-change', { sessionId, selection });
  }

  /**
   * Send typing indicator
   */
  sendTypingStart(sessionId) {
    const socket = this.getSocket();
    socket.emit('typing-start', { sessionId });
  }

  sendTypingStop(sessionId) {
    const socket = this.getSocket();
    socket.emit('typing-stop', { sessionId });
  }

  /**
   * Send chat message
   */
  sendChatMessage(sessionId, message) {
    const socket = this.getSocket();
    socket.emit('chat-message', { sessionId, message });
  }

  /**
   * Subscribe to an event
   */
  on(event, callback) {
    const socket = this.getSocket();
    socket.on(event, callback);
    
    // Store listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Unsubscribe from an event
   */
  off(event, callback) {
    const socket = this.getSocket();
    if (callback) {
      socket.off(event, callback);
    } else {
      socket.off(event);
    }
  }

  /**
   * Remove all listeners
   */
  removeAllListeners() {
    const socket = this.getSocket();
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        socket.off(event, callback);
      });
    });
    this.listeners.clear();
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
