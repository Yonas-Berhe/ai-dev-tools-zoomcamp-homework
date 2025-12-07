import { v4 as uuidv4 } from 'uuid';

/**
 * In-memory session storage
 * In production, this should be replaced with Redis or a database
 */
class SessionManager {
  constructor() {
    this.sessions = new Map();
  }

  /**
   * Create a new interview session
   * @param {Object} options - Session options
   * @returns {Object} Created session
   */
  createSession({ title, language = 'javascript', createdBy } = {}) {
    const id = uuidv4();
    const session = {
      id,
      title: title || `Interview Session`,
      language,
      code: this.getDefaultCode(language),
      createdBy: createdBy || 'Anonymous',
      createdAt: new Date().toISOString(),
      participants: new Map(),
      link: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/interview/${id}`,
    };

    this.sessions.set(id, session);
    return this.serializeSession(session);
  }

  /**
   * Get a session by ID
   * @param {string} sessionId - Session ID
   * @returns {Object|null} Session or null if not found
   */
  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    return this.serializeSession(session);
  }

  /**
   * Get raw session (with Map objects intact)
   * @param {string} sessionId - Session ID
   * @returns {Object|null} Raw session or null
   */
  getRawSession(sessionId) {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Check if a session exists
   * @param {string} sessionId - Session ID
   * @returns {boolean} True if session exists
   */
  hasSession(sessionId) {
    return this.sessions.has(sessionId);
  }

  /**
   * Update session code
   * @param {string} sessionId - Session ID
   * @param {string} code - New code content
   * @returns {boolean} Success status
   */
  updateCode(sessionId, code) {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    session.code = code;
    return true;
  }

  /**
   * Update session language
   * @param {string} sessionId - Session ID
   * @param {string} language - New language
   * @returns {boolean} Success status
   */
  updateLanguage(sessionId, language) {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    session.language = language;
    session.code = this.getDefaultCode(language);
    return true;
  }

  /**
   * Add a participant to a session
   * @param {string} sessionId - Session ID
   * @param {string} participantId - Participant socket ID
   * @param {string} name - Participant name
   * @returns {Object|null} Participant info or null
   */
  addParticipant(sessionId, participantId, name) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const participant = {
      id: participantId,
      name: name || `User ${session.participants.size + 1}`,
      joinedAt: new Date().toISOString(),
      isActive: true,
      cursorPosition: null,
    };

    session.participants.set(participantId, participant);
    return participant;
  }

  /**
   * Remove a participant from a session
   * @param {string} sessionId - Session ID
   * @param {string} participantId - Participant socket ID
   * @returns {boolean} Success status
   */
  removeParticipant(sessionId, participantId) {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    return session.participants.delete(participantId);
  }

  /**
   * Get participants for a session
   * @param {string} sessionId - Session ID
   * @returns {Array} Array of participants
   */
  getParticipants(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return [];
    return Array.from(session.participants.values());
  }

  /**
   * Update participant cursor position
   * @param {string} sessionId - Session ID
   * @param {string} participantId - Participant socket ID
   * @param {Object} position - Cursor position
   */
  updateCursor(sessionId, participantId, position) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    const participant = session.participants.get(participantId);
    if (participant) {
      participant.cursorPosition = position;
    }
  }

  /**
   * Delete a session
   * @param {string} sessionId - Session ID
   * @returns {boolean} Success status
   */
  deleteSession(sessionId) {
    return this.sessions.delete(sessionId);
  }

  /**
   * Get all sessions
   * @returns {Array} Array of all sessions
   */
  getAllSessions() {
    return Array.from(this.sessions.values()).map((s) =>
      this.serializeSession(s)
    );
  }

  /**
   * Serialize session for API response
   * @param {Object} session - Raw session object
   * @returns {Object} Serialized session
   */
  serializeSession(session) {
    return {
      id: session.id,
      title: session.title,
      language: session.language,
      code: session.code,
      createdBy: session.createdBy,
      createdAt: session.createdAt,
      link: session.link,
      participantCount: session.participants.size,
    };
  }

  /**
   * Get default code template for a language
   * @param {string} language - Programming language
   * @returns {string} Default code template
   */
  getDefaultCode(language) {
    const templates = {
      javascript: `// Welcome to the coding interview!
// Write your JavaScript code here

function solution(input) {
  // Your code here
  return input;
}

// Test your solution
console.log(solution("Hello, World!"));
`,
      typescript: `// Welcome to the coding interview!
// Write your TypeScript code here

function solution(input: string): string {
  // Your code here
  return input;
}

// Test your solution
console.log(solution("Hello, World!"));
`,
      python: `# Welcome to the coding interview!
# Write your Python code here

def solution(input):
    # Your code here
    return input

# Test your solution
print(solution("Hello, World!"))
`,
      java: `// Welcome to the coding interview!
// Write your Java code here

public class Solution {
    public static void main(String[] args) {
        System.out.println(solution("Hello, World!"));
    }
    
    public static String solution(String input) {
        // Your code here
        return input;
    }
}
`,
      cpp: `// Welcome to the coding interview!
// Write your C++ code here

#include <iostream>
#include <string>

std::string solution(std::string input) {
    // Your code here
    return input;
}

int main() {
    std::cout << solution("Hello, World!") << std::endl;
    return 0;
}
`,
      csharp: `// Welcome to the coding interview!
// Write your C# code here

using System;

class Solution {
    static void Main() {
        Console.WriteLine(Solve("Hello, World!"));
    }
    
    static string Solve(string input) {
        // Your code here
        return input;
    }
}
`,
      go: `// Welcome to the coding interview!
// Write your Go code here

package main

import "fmt"

func solution(input string) string {
    // Your code here
    return input
}

func main() {
    fmt.Println(solution("Hello, World!"))
}
`,
      rust: `// Welcome to the coding interview!
// Write your Rust code here

fn solution(input: &str) -> String {
    // Your code here
    input.to_string()
}

fn main() {
    println!("{}", solution("Hello, World!"));
}
`,
    };

    return templates[language] || templates.javascript;
  }
}

// Singleton instance
const sessionManager = new SessionManager();

export default sessionManager;
