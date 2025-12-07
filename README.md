# Online Coding Interview Platform

A real-time collaborative coding interview platform with live code sharing, syntax highlighting, and sandboxed code execution.

## Features

- 🔗 **Unique Interview Links**: Generate shareable links for each interview session
- 👥 **Real-time Collaboration**: Code together with instant synchronization
- 🎨 **Syntax Highlighting**: Support for multiple programming languages
- ▶️ **Code Execution**: Run JavaScript code safely in the browser (sandboxed)
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend
- Node.js with Express.js
- Socket.io for WebSocket communication
- OpenAPI 3.0 specification with Swagger UI

### Frontend
- React 18 with Vite
- Monaco Editor (VS Code's editor)
- Socket.io client
- Tailwind CSS

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── index.js              # Express server entry point
│   │   ├── routes/
│   │   │   └── sessions.js       # Session API routes
│   │   ├── services/
│   │   │   ├── sessionManager.js # In-memory session storage
│   │   │   └── socketHandler.js  # WebSocket event handlers
│   │   └── openapi/
│   │       └── spec.yaml         # OpenAPI specification
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── main.jsx              # React entry point
│   │   ├── App.jsx               # Router setup
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Landing page
│   │   │   └── Interview.jsx     # Interview room
│   │   ├── components/
│   │   │   ├── CodeEditor.jsx    # Monaco editor wrapper
│   │   │   ├── Toolbar.jsx       # Top toolbar
│   │   │   ├── ParticipantList.jsx
│   │   │   └── OutputPanel.jsx   # Code execution output
│   │   └── services/
│   │       ├── api.js            # REST API client
│   │       ├── socket.js         # WebSocket client
│   │       └── codeExecutor.js   # Sandboxed code execution
│   └── package.json
└── IMPLEMENTATION_PLAN.md
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd AI_Project_2
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   The server will start at http://localhost:3001
   API documentation available at http://localhost:3001/api-docs

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   The app will be available at http://localhost:5173

### Usage

1. Open http://localhost:5173 in your browser
2. Click "Create Interview Session" to start a new interview
3. Share the generated link with your candidate
4. Both participants can now code together in real-time!

## API Documentation

The backend provides a RESTful API documented with OpenAPI 3.0. After starting the backend server, visit:

**http://localhost:3001/api-docs**

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sessions` | Create a new interview session |
| GET | `/api/sessions` | List all active sessions |
| GET | `/api/sessions/:id` | Get session details |
| DELETE | `/api/sessions/:id` | End a session |
| GET | `/api/sessions/:id/participants` | List session participants |
| GET | `/api/sessions/:id/code` | Get current code |

### WebSocket Events

#### Client → Server
- `join-room` - Join an interview session
- `code-change` - Send code changes
- `language-change` - Change programming language
- `cursor-change` - Update cursor position

#### Server → Client
- `room-joined` - Confirmation of joining
- `code-update` - Receive code changes
- `language-update` - Language changed notification
- `participant-joined` - New participant notification
- `participant-left` - Participant left notification

## Supported Languages

- JavaScript
- TypeScript
- Python
- Java
- C++
- C#
- Go
- Rust

**Note**: Browser-based code execution is only available for JavaScript. Other languages can be edited collaboratively but require a backend execution service for running code.

## Environment Variables

### Backend (`.env`)
```
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

## Development

### Running Tests
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Building for Production

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm start
```

## Security Considerations

1. **Sandboxed Execution**: JavaScript code runs in Web Workers with no access to the DOM or main thread
2. **Input Validation**: All API inputs are validated
3. **CORS**: Configured to only allow requests from the frontend origin
4. **Session Cleanup**: Inactive sessions are automatically cleaned up after 24 hours

## Future Enhancements

- [ ] Video/audio integration for remote interviews
- [ ] Code playback/history feature
- [ ] Multiple file support
- [ ] Test case execution
- [ ] Database persistence (MongoDB/PostgreSQL)
- [ ] User authentication
- [ ] Interview templates and question library

## License

MIT License
