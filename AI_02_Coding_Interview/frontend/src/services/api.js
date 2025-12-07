const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * API service for session management
 */
const api = {
  /**
   * Create a new interview session
   * @param {Object} options - Session options
   * @returns {Promise<Object>} Created session
   */
  async createSession({ title, language, createdBy } = {}) {
    const response = await fetch(`${API_BASE_URL}/api/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, language, createdBy }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to create session');
    }

    return response.json();
  },

  /**
   * Get session details
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Session details
   */
  async getSession(sessionId) {
    const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get session');
    }

    return response.json();
  },

  /**
   * List all sessions
   * @returns {Promise<Object>} Sessions list
   */
  async listSessions() {
    const response = await fetch(`${API_BASE_URL}/api/sessions`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to list sessions');
    }

    return response.json();
  },

  /**
   * Delete a session
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteSession(sessionId) {
    const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to delete session');
    }

    return response.json();
  },

  /**
   * Get session participants
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Participants list
   */
  async getParticipants(sessionId) {
    const response = await fetch(
      `${API_BASE_URL}/api/sessions/${sessionId}/participants`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get participants');
    }

    return response.json();
  },

  /**
   * Get current code for a session
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Code and language
   */
  async getCode(sessionId) {
    const response = await fetch(
      `${API_BASE_URL}/api/sessions/${sessionId}/code`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get code');
    }

    return response.json();
  },

  /**
   * Health check
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  },
};

export default api;
