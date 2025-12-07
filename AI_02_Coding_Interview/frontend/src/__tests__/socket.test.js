/**
 * Tests for Socket Service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { io } from 'socket.io-client';
import socketService from '../services/socket';

vi.mock('socket.io-client');

describe('Socket Service', () => {
  let mockSocket;

  beforeEach(() => {
    mockSocket = {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      disconnect: vi.fn(),
      connected: false,
    };
    io.mockReturnValue(mockSocket);
    io.mockClear();
    
    // Reset the singleton
    socketService.socket = null;
    socketService.listeners.clear();
  });

  describe('connect', () => {
    it('should create a new socket connection', () => {
      const socket = socketService.connect();

      expect(io).toHaveBeenCalled();
      expect(socket).toBe(mockSocket);
    });

    it('should return existing socket if already connected', () => {
      mockSocket.connected = true;
      socketService.socket = mockSocket;

      const socket = socketService.connect();

      expect(io).not.toHaveBeenCalled();
      expect(socket).toBe(mockSocket);
    });

    it('should setup default event listeners', () => {
      socketService.connect();

      expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('connect_error', expect.any(Function));
    });
  });

  describe('disconnect', () => {
    it('should disconnect the socket', () => {
      socketService.socket = mockSocket;

      socketService.disconnect();

      expect(mockSocket.disconnect).toHaveBeenCalled();
      expect(socketService.socket).toBeNull();
    });

    it('should handle disconnect when socket is null', () => {
      socketService.socket = null;

      expect(() => socketService.disconnect()).not.toThrow();
    });
  });

  describe('joinRoom', () => {
    it('should emit join-room event', () => {
      socketService.socket = mockSocket;

      socketService.joinRoom('session-123', 'Test User');

      expect(mockSocket.emit).toHaveBeenCalledWith('join-room', {
        sessionId: 'session-123',
        userName: 'Test User',
      });
    });
  });

  describe('leaveRoom', () => {
    it('should emit leave-room event', () => {
      socketService.socket = mockSocket;

      socketService.leaveRoom('session-123');

      expect(mockSocket.emit).toHaveBeenCalledWith('leave-room', {
        sessionId: 'session-123',
      });
    });
  });

  describe('sendCodeChange', () => {
    it('should emit code-change event', () => {
      socketService.socket = mockSocket;

      socketService.sendCodeChange('session-123', 'console.log("test")', { line: 1 });

      expect(mockSocket.emit).toHaveBeenCalledWith('code-change', {
        sessionId: 'session-123',
        code: 'console.log("test")',
        cursorPosition: { line: 1 },
      });
    });
  });

  describe('sendLanguageChange', () => {
    it('should emit language-change event', () => {
      socketService.socket = mockSocket;

      socketService.sendLanguageChange('session-123', 'python');

      expect(mockSocket.emit).toHaveBeenCalledWith('language-change', {
        sessionId: 'session-123',
        language: 'python',
      });
    });
  });

  describe('sendCursorChange', () => {
    it('should emit cursor-change event', () => {
      socketService.socket = mockSocket;

      socketService.sendCursorChange('session-123', { line: 10, column: 5 });

      expect(mockSocket.emit).toHaveBeenCalledWith('cursor-change', {
        sessionId: 'session-123',
        position: { line: 10, column: 5 },
      });
    });
  });

  describe('sendTypingStart', () => {
    it('should emit typing-start event', () => {
      socketService.socket = mockSocket;

      socketService.sendTypingStart('session-123');

      expect(mockSocket.emit).toHaveBeenCalledWith('typing-start', {
        sessionId: 'session-123',
      });
    });
  });

  describe('sendTypingStop', () => {
    it('should emit typing-stop event', () => {
      socketService.socket = mockSocket;

      socketService.sendTypingStop('session-123');

      expect(mockSocket.emit).toHaveBeenCalledWith('typing-stop', {
        sessionId: 'session-123',
      });
    });
  });

  describe('sendChatMessage', () => {
    it('should emit chat-message event', () => {
      socketService.socket = mockSocket;

      socketService.sendChatMessage('session-123', 'Hello!');

      expect(mockSocket.emit).toHaveBeenCalledWith('chat-message', {
        sessionId: 'session-123',
        message: 'Hello!',
      });
    });
  });

  describe('on/off', () => {
    it('should register event listener', () => {
      socketService.socket = mockSocket;
      const callback = vi.fn();

      socketService.on('test-event', callback);

      expect(mockSocket.on).toHaveBeenCalledWith('test-event', callback);
    });

    it('should store listener for cleanup', () => {
      socketService.socket = mockSocket;
      const callback = vi.fn();

      socketService.on('test-event', callback);

      expect(socketService.listeners.get('test-event')).toContain(callback);
    });

    it('should unregister event listener', () => {
      socketService.socket = mockSocket;
      const callback = vi.fn();

      socketService.off('test-event', callback);

      expect(mockSocket.off).toHaveBeenCalledWith('test-event', callback);
    });
  });

  describe('removeAllListeners', () => {
    it('should remove all registered listeners', () => {
      socketService.socket = mockSocket;
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      socketService.listeners.set('event1', [callback1]);
      socketService.listeners.set('event2', [callback2]);

      socketService.removeAllListeners();

      expect(mockSocket.off).toHaveBeenCalledWith('event1', callback1);
      expect(mockSocket.off).toHaveBeenCalledWith('event2', callback2);
      expect(socketService.listeners.size).toBe(0);
    });
  });
});
