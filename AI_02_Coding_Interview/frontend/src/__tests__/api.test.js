/**
 * Tests for API Service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import api from '../services/api';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Service', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createSession', () => {
    it('should create a session with correct payload', async () => {
      const mockSession = {
        id: 'test-id',
        title: 'Test Session',
        language: 'javascript',
        link: 'http://localhost:5173/interview/test-id',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSession),
      });

      const result = await api.createSession({
        title: 'Test Session',
        language: 'javascript',
        createdBy: 'Test User',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/sessions'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );

      expect(result).toEqual(mockSession);
    });

    it('should throw error on failed request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: { message: 'Failed' } }),
      });

      await expect(api.createSession({})).rejects.toThrow('Failed');
    });
  });

  describe('getSession', () => {
    it('should fetch session by ID', async () => {
      const mockSession = {
        id: 'test-id',
        title: 'Test Session',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSession),
      });

      const result = await api.getSession('test-id');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/sessions/test-id')
      );
      expect(result).toEqual(mockSession);
    });

    it('should throw error for non-existent session', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: { message: 'Session not found' } }),
      });

      await expect(api.getSession('non-existent')).rejects.toThrow('Session not found');
    });
  });

  describe('listSessions', () => {
    it('should fetch all sessions', async () => {
      const mockSessions = {
        sessions: [
          { id: '1', title: 'Session 1' },
          { id: '2', title: 'Session 2' },
        ],
        count: 2,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSessions),
      });

      const result = await api.listSessions();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/sessions')
      );
      expect(result.sessions).toHaveLength(2);
    });
  });

  describe('deleteSession', () => {
    it('should delete session by ID', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Session deleted successfully' }),
      });

      const result = await api.deleteSession('test-id');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/sessions/test-id'),
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(result.message).toBe('Session deleted successfully');
    });
  });

  describe('getParticipants', () => {
    it('should fetch session participants', async () => {
      const mockParticipants = {
        participants: [
          { id: 'socket-1', name: 'User 1' },
          { id: 'socket-2', name: 'User 2' },
        ],
        count: 2,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockParticipants),
      });

      const result = await api.getParticipants('test-id');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/sessions/test-id/participants')
      );
      expect(result.participants).toHaveLength(2);
    });
  });

  describe('getCode', () => {
    it('should fetch session code', async () => {
      const mockCode = {
        code: 'console.log("Hello");',
        language: 'javascript',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCode),
      });

      const result = await api.getCode('test-id');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/sessions/test-id/code')
      );
      expect(result.code).toBe('console.log("Hello");');
    });
  });

  describe('healthCheck', () => {
    it('should check server health', async () => {
      const mockHealth = {
        status: 'ok',
        timestamp: new Date().toISOString(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHealth),
      });

      const result = await api.healthCheck();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/health')
      );
      expect(result.status).toBe('ok');
    });
  });
});
