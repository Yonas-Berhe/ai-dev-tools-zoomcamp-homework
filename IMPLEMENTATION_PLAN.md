# Online Coding Interview Platform - Implementation Plan

## Project Overview
A real-time collaborative coding interview platform that enables interviewers and candidates to code together with synchronized editing, syntax highlighting, and sandboxed code execution.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React + Vite)                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Interview UI  │  │  Code Editor    │  │  Code Executor  │  │
│  │   (Room Join)   │  │  (Monaco/CM)    │  │  (Sandboxed)    │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                              │                      │            │
│                              │ WebSocket            │ Local      │
│                              │ (Socket.io)          │ Sandbox    │
└──────────────────────────────┼──────────────────────┼────────────┘
                               │                      │
┌──────────────────────────────┼──────────────────────┘────────────┐
│                        Backend (Express.js)                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   REST API      │  │  WebSocket      │  │  Session        │  │
│  │   (OpenAPI)     │  │  Server         │  │  Manager        │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                              │                                   │
│                    ┌─────────┴─────────┐                        │
│                    │   In-Memory Store │                        │
│                    │   (Sessions/Rooms)│                        │
│                    └───────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **WebSocket**: Socket.io
- **API Documentation**: OpenAPI 3.0 (Swagger)
- **Session Storage**: In-memory (can be extended to Redis)
- **ID Generation**: UUID

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Code Editor**: Monaco Editor (VS Code's editor)
- **Real-time Communication**: Socket.io-client
- **Styling**: Tailwind CSS
- **Code Execution**: Browser sandbox (Web Workers + iframe)

## Implementation Phases

### Phase 1: Backend Foundation
1. Initialize Express.js project
2. Set up project structure
3. Configure CORS and middleware
4. Create OpenAPI specification
5. Implement session management API
6. Generate unique interview links

### Phase 2: Real-time Communication
1. Integrate Socket.io
2. Implement room-based collaboration
3. Handle code synchronization events
4. Manage participant presence

### Phase 3: Frontend Foundation
1. Initialize React + Vite project
2. Set up routing
3. Create main layout components
4. Implement landing/join page

### Phase 4: Collaborative Editor
1. Integrate Monaco Editor
2. Connect to WebSocket server
3. Implement real-time code sync
4. Add syntax highlighting for multiple languages

### Phase 5: Code Execution
1. Implement sandboxed execution (Web Workers)
2. Support JavaScript execution
3. Add output display
4. Handle execution errors

### Phase 6: Polish & Testing
1. Add error handling
2. Implement reconnection logic
3. Add participant indicators
4. Final testing

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/sessions | Create a new interview session |
| GET | /api/sessions/:id | Get session details |
| DELETE | /api/sessions/:id | End/delete a session |
| GET | /api/sessions/:id/participants | List participants |

## WebSocket Events

### Client → Server
- `join-room`: Join an interview session
- `code-change`: Send code changes
- `language-change`: Change programming language
- `cursor-change`: Update cursor position

### Server → Client
- `room-joined`: Confirmation of joining
- `code-update`: Receive code changes
- `language-update`: Language changed notification
- `participant-joined`: New participant notification
- `participant-left`: Participant left notification
- `cursor-update`: Other user's cursor position

## File Structure

```
AI_Project_2/
├── backend/
│   ├── package.json
│   ├── src/
│   │   ├── index.js
│   │   ├── routes/
│   │   │   └── sessions.js
│   │   ├── services/
│   │   │   ├── sessionManager.js
│   │   │   └── socketHandler.js
│   │   └── openapi/
│   │       └── spec.yaml
│   └── .env
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── components/
│       │   ├── CodeEditor.jsx
│       │   ├── Toolbar.jsx
│       │   ├── ParticipantList.jsx
│       │   └── OutputPanel.jsx
│       ├── pages/
│       │   ├── Home.jsx
│       │   └── Interview.jsx
│       ├── services/
│       │   ├── socket.js
│       │   └── codeExecutor.js
│       └── styles/
│           └── index.css
└── IMPLEMENTATION_PLAN.md
```

## Security Considerations

1. **Code Execution Sandbox**: Uses Web Workers and iframe isolation
2. **Rate Limiting**: Prevent abuse of API endpoints
3. **Session Expiry**: Auto-expire inactive sessions
4. **Input Validation**: Sanitize all user inputs

## Future Enhancements

- Video/audio integration
- Code playback/history
- Multiple file support
- Test case execution
- Database persistence (MongoDB/PostgreSQL)
- User authentication
- Interview templates
