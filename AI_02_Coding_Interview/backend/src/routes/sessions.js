import express from 'express';
import sessionManager from '../services/sessionManager.js';

const router = express.Router();

/**
 * POST /api/sessions
 * Create a new interview session
 */
router.post('/', (req, res) => {
  try {
    const { title, language, createdBy } = req.body || {};

    // Validate language if provided
    const validLanguages = [
      'javascript',
      'typescript',
      'python',
      'java',
      'cpp',
      'csharp',
      'go',
      'rust',
    ];
    if (language && !validLanguages.includes(language)) {
      return res.status(400).json({
        error: {
          message: `Invalid language. Must be one of: ${validLanguages.join(', ')}`,
          code: 'INVALID_LANGUAGE',
        },
      });
    }

    const session = sessionManager.createSession({ title, language, createdBy });
    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      error: {
        message: 'Failed to create session',
        code: 'SESSION_CREATE_ERROR',
      },
    });
  }
});

/**
 * GET /api/sessions
 * List all active sessions
 */
router.get('/', (req, res) => {
  try {
    const sessions = sessionManager.getAllSessions();
    res.json({
      sessions,
      count: sessions.length,
    });
  } catch (error) {
    console.error('Error listing sessions:', error);
    res.status(500).json({
      error: {
        message: 'Failed to list sessions',
        code: 'SESSION_LIST_ERROR',
      },
    });
  }
});

/**
 * GET /api/sessions/:sessionId
 * Get session details
 */
router.get('/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = sessionManager.getSession(sessionId);

    if (!session) {
      return res.status(404).json({
        error: {
          message: 'Session not found',
          code: 'SESSION_NOT_FOUND',
        },
      });
    }

    res.json(session);
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({
      error: {
        message: 'Failed to get session',
        code: 'SESSION_GET_ERROR',
      },
    });
  }
});

/**
 * DELETE /api/sessions/:sessionId
 * Delete/end a session
 */
router.delete('/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionManager.hasSession(sessionId)) {
      return res.status(404).json({
        error: {
          message: 'Session not found',
          code: 'SESSION_NOT_FOUND',
        },
      });
    }

    sessionManager.deleteSession(sessionId);
    res.json({
      message: 'Session deleted successfully',
      sessionId,
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({
      error: {
        message: 'Failed to delete session',
        code: 'SESSION_DELETE_ERROR',
      },
    });
  }
});

/**
 * GET /api/sessions/:sessionId/participants
 * Get session participants
 */
router.get('/:sessionId/participants', (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionManager.hasSession(sessionId)) {
      return res.status(404).json({
        error: {
          message: 'Session not found',
          code: 'SESSION_NOT_FOUND',
        },
      });
    }

    const participants = sessionManager.getParticipants(sessionId);
    res.json({
      participants,
      count: participants.length,
    });
  } catch (error) {
    console.error('Error getting participants:', error);
    res.status(500).json({
      error: {
        message: 'Failed to get participants',
        code: 'PARTICIPANTS_GET_ERROR',
      },
    });
  }
});

/**
 * GET /api/sessions/:sessionId/code
 * Get current code for a session
 */
router.get('/:sessionId/code', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = sessionManager.getSession(sessionId);

    if (!session) {
      return res.status(404).json({
        error: {
          message: 'Session not found',
          code: 'SESSION_NOT_FOUND',
        },
      });
    }

    res.json({
      code: session.code,
      language: session.language,
    });
  } catch (error) {
    console.error('Error getting code:', error);
    res.status(500).json({
      error: {
        message: 'Failed to get code',
        code: 'CODE_GET_ERROR',
      },
    });
  }
});

export default router;
