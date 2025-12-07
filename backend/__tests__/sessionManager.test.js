/**
 * Unit Tests for Session Manager Service
 */

import sessionManager from '../src/services/sessionManager.js';

describe('SessionManager', () => {
  beforeEach(() => {
    // Clear all sessions before each test
    const sessions = sessionManager.getAllSessions();
    sessions.forEach((session) => {
      sessionManager.deleteSession(session.id);
    });
  });

  describe('createSession', () => {
    it('should create a session with default values', () => {
      const session = sessionManager.createSession();

      expect(session.id).toBeDefined();
      expect(session.language).toBe('javascript');
      expect(session.createdBy).toBe('Anonymous');
      expect(session.participantCount).toBe(0);
    });

    it('should create a session with custom values', () => {
      const session = sessionManager.createSession({
        title: 'Custom Session',
        language: 'python',
        createdBy: 'Test User',
      });

      expect(session.title).toBe('Custom Session');
      expect(session.language).toBe('python');
      expect(session.createdBy).toBe('Test User');
    });

    it('should generate unique IDs', () => {
      const session1 = sessionManager.createSession();
      const session2 = sessionManager.createSession();

      expect(session1.id).not.toBe(session2.id);
    });

    it('should include default code template', () => {
      const session = sessionManager.createSession({ language: 'javascript' });

      expect(session.code).toContain('Welcome to the coding interview');
      expect(session.code).toContain('function solution');
    });
  });

  describe('getSession', () => {
    it('should return session by ID', () => {
      const created = sessionManager.createSession({ title: 'Test' });
      const retrieved = sessionManager.getSession(created.id);

      expect(retrieved.id).toBe(created.id);
      expect(retrieved.title).toBe('Test');
    });

    it('should return null for non-existent session', () => {
      const result = sessionManager.getSession('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('updateCode', () => {
    it('should update session code', () => {
      const session = sessionManager.createSession();
      const newCode = 'const x = 42;';

      const result = sessionManager.updateCode(session.id, newCode);
      const updated = sessionManager.getSession(session.id);

      expect(result).toBe(true);
      expect(updated.code).toBe(newCode);
    });

    it('should return false for non-existent session', () => {
      const result = sessionManager.updateCode('non-existent', 'code');

      expect(result).toBe(false);
    });
  });

  describe('updateLanguage', () => {
    it('should update session language and reset code', () => {
      const session = sessionManager.createSession({ language: 'javascript' });

      const result = sessionManager.updateLanguage(session.id, 'python');
      const updated = sessionManager.getSession(session.id);

      expect(result).toBe(true);
      expect(updated.language).toBe('python');
      expect(updated.code).toContain('def solution');
    });
  });

  describe('Participant Management', () => {
    it('should add participant to session', () => {
      const session = sessionManager.createSession();

      const participant = sessionManager.addParticipant(
        session.id,
        'socket-123',
        'Test User'
      );

      expect(participant.id).toBe('socket-123');
      expect(participant.name).toBe('Test User');
      expect(participant.isActive).toBe(true);
    });

    it('should remove participant from session', () => {
      const session = sessionManager.createSession();
      sessionManager.addParticipant(session.id, 'socket-123', 'Test User');

      const result = sessionManager.removeParticipant(session.id, 'socket-123');
      const participants = sessionManager.getParticipants(session.id);

      expect(result).toBe(true);
      expect(participants).toHaveLength(0);
    });

    it('should list all participants', () => {
      const session = sessionManager.createSession();
      sessionManager.addParticipant(session.id, 'socket-1', 'User 1');
      sessionManager.addParticipant(session.id, 'socket-2', 'User 2');

      const participants = sessionManager.getParticipants(session.id);

      expect(participants).toHaveLength(2);
      expect(participants.map((p) => p.name)).toContain('User 1');
      expect(participants.map((p) => p.name)).toContain('User 2');
    });

    it('should update participant count in serialized session', () => {
      const session = sessionManager.createSession();
      sessionManager.addParticipant(session.id, 'socket-1', 'User 1');
      sessionManager.addParticipant(session.id, 'socket-2', 'User 2');

      const updated = sessionManager.getSession(session.id);

      expect(updated.participantCount).toBe(2);
    });
  });

  describe('deleteSession', () => {
    it('should delete existing session', () => {
      const session = sessionManager.createSession();

      const result = sessionManager.deleteSession(session.id);

      expect(result).toBe(true);
      expect(sessionManager.getSession(session.id)).toBeNull();
    });

    it('should return false for non-existent session', () => {
      const result = sessionManager.deleteSession('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('getAllSessions', () => {
    it('should return all sessions', () => {
      sessionManager.createSession({ title: 'Session 1' });
      sessionManager.createSession({ title: 'Session 2' });
      sessionManager.createSession({ title: 'Session 3' });

      const sessions = sessionManager.getAllSessions();

      expect(sessions).toHaveLength(3);
    });
  });

  describe('getDefaultCode', () => {
    it('should return JavaScript template', () => {
      const session = sessionManager.createSession({ language: 'javascript' });
      expect(session.code).toContain('function solution');
    });

    it('should return Python template', () => {
      const session = sessionManager.createSession({ language: 'python' });
      expect(session.code).toContain('def solution');
    });

    it('should return Java template', () => {
      const session = sessionManager.createSession({ language: 'java' });
      expect(session.code).toContain('public class Solution');
    });

    it('should return C++ template', () => {
      const session = sessionManager.createSession({ language: 'cpp' });
      expect(session.code).toContain('#include <iostream>');
    });
  });
});
