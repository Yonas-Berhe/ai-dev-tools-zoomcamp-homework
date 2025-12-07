import sessionManager from './sessionManager.js';

/**
 * Setup WebSocket event handlers for real-time collaboration
 * @param {Server} io - Socket.io server instance
 */
export function setupSocketHandlers(io) {
  // Track socket to session mapping
  const socketToSession = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    /**
     * Join a session room
     */
    socket.on('join-room', ({ sessionId, userName }) => {
      console.log(`📥 User ${userName || 'Anonymous'} joining room ${sessionId}`);

      // Validate session exists
      if (!sessionManager.hasSession(sessionId)) {
        socket.emit('error', {
          type: 'SESSION_NOT_FOUND',
          message: 'Session does not exist',
        });
        return;
      }

      // Leave any previous room
      const previousSession = socketToSession.get(socket.id);
      if (previousSession) {
        socket.leave(previousSession);
        sessionManager.removeParticipant(previousSession, socket.id);
        io.to(previousSession).emit('participant-left', {
          participantId: socket.id,
          participants: sessionManager.getParticipants(previousSession),
        });
      }

      // Join the new room
      socket.join(sessionId);
      socketToSession.set(socket.id, sessionId);

      // Add participant to session
      const participant = sessionManager.addParticipant(
        sessionId,
        socket.id,
        userName
      );

      // Get current session state
      const session = sessionManager.getSession(sessionId);
      const participants = sessionManager.getParticipants(sessionId);

      // Send confirmation to the joining user
      socket.emit('room-joined', {
        sessionId,
        participant,
        session,
        participants,
      });

      // Notify others in the room
      socket.to(sessionId).emit('participant-joined', {
        participant,
        participants,
      });

      console.log(`✅ User ${participant.name} joined room ${sessionId}`);
    });

    /**
     * Handle code changes
     */
    socket.on('code-change', ({ sessionId, code, cursorPosition }) => {
      // Validate user is in the session
      if (socketToSession.get(socket.id) !== sessionId) {
        socket.emit('error', {
          type: 'NOT_IN_SESSION',
          message: 'You are not in this session',
        });
        return;
      }

      // Update code in session
      sessionManager.updateCode(sessionId, code);

      // Broadcast to others in the room
      socket.to(sessionId).emit('code-update', {
        code,
        senderId: socket.id,
        cursorPosition,
      });
    });

    /**
     * Handle language changes
     */
    socket.on('language-change', ({ sessionId, language }) => {
      // Validate user is in the session
      if (socketToSession.get(socket.id) !== sessionId) {
        socket.emit('error', {
          type: 'NOT_IN_SESSION',
          message: 'You are not in this session',
        });
        return;
      }

      // Update language in session
      sessionManager.updateLanguage(sessionId, language);
      const session = sessionManager.getSession(sessionId);

      // Broadcast to everyone in the room (including sender)
      io.to(sessionId).emit('language-update', {
        language,
        code: session.code,
        senderId: socket.id,
      });

      console.log(`🔄 Language changed to ${language} in room ${sessionId}`);
    });

    /**
     * Handle cursor position updates
     */
    socket.on('cursor-change', ({ sessionId, position }) => {
      // Validate user is in the session
      if (socketToSession.get(socket.id) !== sessionId) {
        return;
      }

      // Update cursor position
      sessionManager.updateCursor(sessionId, socket.id, position);

      // Broadcast to others
      socket.to(sessionId).emit('cursor-update', {
        participantId: socket.id,
        position,
      });
    });

    /**
     * Handle selection changes
     */
    socket.on('selection-change', ({ sessionId, selection }) => {
      if (socketToSession.get(socket.id) !== sessionId) {
        return;
      }

      socket.to(sessionId).emit('selection-update', {
        participantId: socket.id,
        selection,
      });
    });

    /**
     * Handle typing indicators
     */
    socket.on('typing-start', ({ sessionId }) => {
      if (socketToSession.get(socket.id) !== sessionId) {
        return;
      }

      socket.to(sessionId).emit('user-typing', {
        participantId: socket.id,
        isTyping: true,
      });
    });

    socket.on('typing-stop', ({ sessionId }) => {
      if (socketToSession.get(socket.id) !== sessionId) {
        return;
      }

      socket.to(sessionId).emit('user-typing', {
        participantId: socket.id,
        isTyping: false,
      });
    });

    /**
     * Handle chat messages (optional feature)
     */
    socket.on('chat-message', ({ sessionId, message }) => {
      if (socketToSession.get(socket.id) !== sessionId) {
        return;
      }

      const participants = sessionManager.getParticipants(sessionId);
      const sender = participants.find((p) => p.id === socket.id);

      io.to(sessionId).emit('chat-message', {
        senderId: socket.id,
        senderName: sender?.name || 'Anonymous',
        message,
        timestamp: new Date().toISOString(),
      });
    });

    /**
     * Handle disconnection
     */
    socket.on('disconnect', (reason) => {
      console.log(`🔌 Client disconnected: ${socket.id} (${reason})`);

      const sessionId = socketToSession.get(socket.id);
      if (sessionId) {
        // Remove participant from session
        sessionManager.removeParticipant(sessionId, socket.id);
        socketToSession.delete(socket.id);

        // Notify others in the room
        const participants = sessionManager.getParticipants(sessionId);
        io.to(sessionId).emit('participant-left', {
          participantId: socket.id,
          participants,
        });

        console.log(`👋 User left room ${sessionId}`);
      }
    });

    /**
     * Handle explicit leave room
     */
    socket.on('leave-room', ({ sessionId }) => {
      const currentSession = socketToSession.get(socket.id);
      if (currentSession === sessionId) {
        socket.leave(sessionId);
        sessionManager.removeParticipant(sessionId, socket.id);
        socketToSession.delete(socket.id);

        const participants = sessionManager.getParticipants(sessionId);
        io.to(sessionId).emit('participant-left', {
          participantId: socket.id,
          participants,
        });

        socket.emit('room-left', { sessionId });
        console.log(`👋 User explicitly left room ${sessionId}`);
      }
    });
  });

  // Periodic cleanup of empty sessions (every 5 minutes)
  setInterval(() => {
    const sessions = sessionManager.getAllSessions();
    sessions.forEach((session) => {
      if (session.participantCount === 0) {
        const createdAt = new Date(session.createdAt);
        const now = new Date();
        const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);

        // Delete sessions older than 24 hours with no participants
        if (hoursSinceCreation > 24) {
          sessionManager.deleteSession(session.id);
          console.log(`🧹 Cleaned up inactive session: ${session.id}`);
        }
      }
    });
  }, 5 * 60 * 1000);

  console.log('✅ WebSocket handlers initialized');
}
