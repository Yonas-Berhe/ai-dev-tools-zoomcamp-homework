# Online Coding Interview Platform

A real-time collaborative coding interview platform with live code sharing, syntax highlighting, and sandboxed code execution.

## Features

- 🔗 **Unique Interview Links**: Generate shareable links for each interview session
- 👥 **Real-time Collaboration**: Code together with instant synchronization
- 🎨 **Syntax Highlighting**: Support for multiple programming languages (Monaco Editor)
- ▶️ **Browser-Based Code Execution**: 
  - JavaScript: Web Workers (sandboxed)
  - Python: Pyodide (WebAssembly) - runs entirely in the browser
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🐳 **Docker Support**: Easy deployment with Docker
- 🚀 **Render Ready**: One-click deployment to Render

## Tech Stack

### Backend
- Node.js with Express.js
- Socket.io for WebSocket communication
- OpenAPI 3.0 specification with Swagger UI
- Jest for testing

### Frontend
- React 18 with Vite
- Monaco Editor (VS Code's editor)
- Socket.io client
- Tailwind CSS
- Pyodide (Python WASM) for in-browser Python execution
- Vitest for testing

## Deployment

### Deploy to Render (Recommended)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

**Manual Deployment:**

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `coding-interview` (or your choice)
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./AI_02_Coding_Interview/Dockerfile`
   - **Docker Context**: `./AI_02_Coding_Interview`
5. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `3001`
6. Click **Create Web Service**

Your app will be live at `https://your-service-name.onrender.com`

### Docker (Local/Self-hosted)

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build and run manually
docker build -t coding-interview .
docker run -p 3001:3001 coding-interview
```

The application will be available at **http://localhost:3001**

## Quick Start (Local Development)

### Prerequisites

- Node.js 18+ installed
- npm or yarn

#### Installation & Running

```bash
# Install all dependencies
npm run install:all

# Start both servers concurrently
npm start
```

Or run in separate terminals:

```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend
cd frontend && npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api-docs

## Commands Reference

### Root Commands (from project root)

```bash
# Install all dependencies (backend + frontend)
npm run install:all

# Start both servers concurrently
npm start

# Run all tests
npm test
```

### Backend Commands

```bash
cd backend

# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Start production server
npm start

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Frontend Commands

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint
```

## Testing

### Running All Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Test Coverage

The project includes comprehensive tests:

**Backend Tests (`backend/__tests__/`):**
- `api.test.js` - REST API integration tests
- `websocket.test.js` - WebSocket communication tests
- `sessionManager.test.js` - Session management unit tests

**Frontend Tests (`frontend/src/__tests__/`):**
- `Home.test.jsx` - Home page component tests
- `api.test.js` - API service tests
- `socket.test.js` - Socket service tests
- `codeExecutor.test.js` - Code execution tests

### Test Examples

```bash
# Run specific backend test file
cd backend && npm test -- api.test.js

# Run frontend tests with coverage report
cd frontend && npm run test:coverage

# Run tests matching a pattern
cd backend && npm test -- --testNamePattern="create session"
```

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
