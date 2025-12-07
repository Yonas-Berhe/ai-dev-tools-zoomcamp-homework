/**
 * Integration Tests for REST API
 * Tests the session management API endpoints
 */

import request from 'supertest';
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import sessionsRouter from '../src/routes/sessions.js';
import sessionManager from '../src/services/sessionManager.js';

describe('Sessions API Integration Tests', () => {
  let app;
  let server;

  beforeAll((done) => {
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api/sessions', sessionsRouter);
    
    server = createServer(app);
    server.listen(0, done); // Listen on random port
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(() => {
    // Clear all sessions before each test
    const sessions = sessionManager.getAllSessions();
    sessions.forEach((session) => {
      sessionManager.deleteSession(session.id);
    });
  });

  describe('POST /api/sessions', () => {
    it('should create a new session with default values', async () => {
      const response = await request(app)
        .post('/api/sessions')
        .send({});

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('link');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body.language).toBe('javascript');
    });

    it('should create a session with custom title and language', async () => {
      const response = await request(app)
        .post('/api/sessions')
        .send({
          title: 'Senior Dev Interview',
          language: 'python',
          createdBy: 'John Doe',
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Senior Dev Interview');
      expect(response.body.language).toBe('python');
      expect(response.body.createdBy).toBe('John Doe');
    });

    it('should reject invalid language', async () => {
      const response = await request(app)
        .post('/api/sessions')
        .send({
          language: 'invalid-language',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error.code).toBe('INVALID_LANGUAGE');
    });

    it('should generate unique session IDs', async () => {
      const response1 = await request(app).post('/api/sessions').send({});
      const response2 = await request(app).post('/api/sessions').send({});

      expect(response1.body.id).not.toBe(response2.body.id);
    });
  });

  describe('GET /api/sessions', () => {
    it('should return empty list when no sessions exist', async () => {
      const response = await request(app).get('/api/sessions');

      expect(response.status).toBe(200);
      expect(response.body.sessions).toEqual([]);
      expect(response.body.count).toBe(0);
    });

    it('should return all active sessions', async () => {
      // Create two sessions
      await request(app).post('/api/sessions').send({ title: 'Session 1' });
      await request(app).post('/api/sessions').send({ title: 'Session 2' });

      const response = await request(app).get('/api/sessions');

      expect(response.status).toBe(200);
      expect(response.body.sessions).toHaveLength(2);
      expect(response.body.count).toBe(2);
    });
  });

  describe('GET /api/sessions/:sessionId', () => {
    it('should return session details for valid ID', async () => {
      const createResponse = await request(app)
        .post('/api/sessions')
        .send({ title: 'Test Session' });

      const sessionId = createResponse.body.id;

      const response = await request(app).get(`/api/sessions/${sessionId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(sessionId);
      expect(response.body.title).toBe('Test Session');
    });

    it('should return 404 for non-existent session', async () => {
      const response = await request(app).get(
        '/api/sessions/non-existent-id-12345'
      );

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('SESSION_NOT_FOUND');
    });
  });

  describe('DELETE /api/sessions/:sessionId', () => {
    it('should delete an existing session', async () => {
      const createResponse = await request(app)
        .post('/api/sessions')
        .send({ title: 'To Delete' });

      const sessionId = createResponse.body.id;

      const deleteResponse = await request(app).delete(
        `/api/sessions/${sessionId}`
      );

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.message).toBe('Session deleted successfully');

      // Verify session is deleted
      const getResponse = await request(app).get(`/api/sessions/${sessionId}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 when deleting non-existent session', async () => {
      const response = await request(app).delete(
        '/api/sessions/non-existent-id-12345'
      );

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('SESSION_NOT_FOUND');
    });
  });

  describe('GET /api/sessions/:sessionId/participants', () => {
    it('should return empty participants list for new session', async () => {
      const createResponse = await request(app).post('/api/sessions').send({});
      const sessionId = createResponse.body.id;

      const response = await request(app).get(
        `/api/sessions/${sessionId}/participants`
      );

      expect(response.status).toBe(200);
      expect(response.body.participants).toEqual([]);
      expect(response.body.count).toBe(0);
    });

    it('should return 404 for non-existent session', async () => {
      const response = await request(app).get(
        '/api/sessions/non-existent-id/participants'
      );

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/sessions/:sessionId/code', () => {
    it('should return default code for new session', async () => {
      const createResponse = await request(app)
        .post('/api/sessions')
        .send({ language: 'javascript' });
      const sessionId = createResponse.body.id;

      const response = await request(app).get(
        `/api/sessions/${sessionId}/code`
      );

      expect(response.status).toBe(200);
      expect(response.body.language).toBe('javascript');
      expect(response.body.code).toContain('Welcome to the coding interview');
    });

    it('should return Python template for Python session', async () => {
      const createResponse = await request(app)
        .post('/api/sessions')
        .send({ language: 'python' });
      const sessionId = createResponse.body.id;

      const response = await request(app).get(
        `/api/sessions/${sessionId}/code`
      );

      expect(response.status).toBe(200);
      expect(response.body.language).toBe('python');
      expect(response.body.code).toContain('def solution');
    });
  });
});
