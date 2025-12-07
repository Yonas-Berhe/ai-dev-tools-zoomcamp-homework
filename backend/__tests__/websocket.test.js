/**
 * Integration Tests for WebSocket Communication
 * Tests real-time collaboration between client and server
 */

import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import express from 'express';
import cors from 'cors';
import sessionsRouter from '../src/routes/sessions.js';
import { setupSocketHandlers } from '../src/services/socketHandler.js';
import sessionManager from '../src/services/sessionManager.js';

describe('WebSocket Integration Tests', () => {
  let httpServer;
  let io;
  let app;
  let serverAddress;
  let cleanupInterval;

  beforeAll((done) => {
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api/sessions', sessionsRouter);

    httpServer = createServer(app);
    io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    // Store the interval for cleanup
    const originalSetInterval = global.setInterval;
    global.setInterval = (fn, delay) => {
      if (delay === 5 * 60 * 1000) {
        cleanupInterval = originalSetInterval(fn, delay);
        return cleanupInterval;
      }
      return originalSetInterval(fn, delay);
    };

    setupSocketHandlers(io);
    global.setInterval = originalSetInterval;

    httpServer.listen(() => {
      const { port } = httpServer.address();
      serverAddress = `http://localhost:${port}`;
      done();
    });
  });

  afterAll((done) => {
    if (cleanupInterval) {
      clearInterval(cleanupInterval);
    }
    io.close();
    httpServer.close(done);
  });

  beforeEach(() => {
    // Clear all sessions
    const sessions = sessionManager.getAllSessions();
    sessions.forEach((session) => {
      sessionManager.deleteSession(session.id);
    });
  });

  function createClient() {
    return Client(serverAddress, {
      transports: ['websocket'],
      forceNew: true,
      reconnection: false,
    });
  }

  describe('Room Join', () => {
    it('should allow a client to join a valid session', (done) => {
      const session = sessionManager.createSession({ title: 'Test Session' });
      const client = createClient();

      client.on('connect', () => {
        client.emit('join-room', {
          sessionId: session.id,
          userName: 'Test User',
        });
      });

      client.on('room-joined', (data) => {
        expect(data.sessionId).toBe(session.id);
        expect(data.participant.name).toBe('Test User');
        expect(data.session).toBeDefined();
        expect(data.participants).toHaveLength(1);
        client.disconnect();
        done();
      });
    });

    it('should receive error when joining non-existent session', (done) => {
      const client = createClient();

      client.on('connect', () => {
        client.emit('join-room', {
          sessionId: 'non-existent-session',
          userName: 'Test User',
        });
      });

      client.on('error', (error) => {
        expect(error.type).toBe('SESSION_NOT_FOUND');
        client.disconnect();
        done();
      });
    });
  });

  describe('Code Synchronization', () => {
    it('should persist code changes in session', (done) => {
      const session = sessionManager.createSession({ title: 'Test Session' });
      const client = createClient();
      const newCode = 'function test() { return 42; }';

      client.on('connect', () => {
        client.emit('join-room', {
          sessionId: session.id,
          userName: 'User 1',
        });
      });

      client.on('room-joined', () => {
        client.emit('code-change', {
          sessionId: session.id,
          code: newCode,
        });

        // Give time for the update to process
        setTimeout(() => {
          const updatedSession = sessionManager.getSession(session.id);
          expect(updatedSession.code).toBe(newCode);
          client.disconnect();
          done();
        }, 100);
      });
    });
  });

  describe('Session State', () => {
    it('should update session language', (done) => {
      const session = sessionManager.createSession({
        title: 'Test Session',
        language: 'javascript',
      });
      const client = createClient();

      client.on('connect', () => {
        client.emit('join-room', {
          sessionId: session.id,
          userName: 'User 1',
        });
      });

      client.on('room-joined', () => {
        client.emit('language-change', {
          sessionId: session.id,
          language: 'python',
        });
      });

      client.on('language-update', (data) => {
        expect(data.language).toBe('python');
        expect(data.code).toContain('def solution'); // Python template

        const updatedSession = sessionManager.getSession(session.id);
        expect(updatedSession.language).toBe('python');

        client.disconnect();
        done();
      });
    });
  });
});
