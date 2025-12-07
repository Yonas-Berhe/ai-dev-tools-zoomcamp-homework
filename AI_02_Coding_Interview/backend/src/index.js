import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yaml';

import sessionsRouter from './routes/sessions.js';
import { setupSocketHandlers } from './services/socketHandler.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Configure CORS (more permissive in production since frontend is served from same origin)
const corsOptions = {
  origin: isProduction ? true : (process.env.FRONTEND_URL || 'http://localhost:5173'),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Load OpenAPI specification
const openApiPath = path.join(__dirname, 'openapi', 'spec.yaml');
const openApiSpec = YAML.parse(fs.readFileSync(openApiPath, 'utf8'));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

// API Routes
app.use('/api/sessions', sessionsRouter);

// Health check endpoint (used by Docker health check)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API info endpoint (only in development, production serves frontend at /)
if (!isProduction) {
  app.get('/', (req, res) => {
    res.json({
      name: 'Coding Interview Platform API',
      version: '1.0.0',
      documentation: '/api-docs',
    });
  });
}

// Configure Socket.io
const io = new Server(httpServer, {
  cors: corsOptions,
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Setup WebSocket handlers
setupSocketHandlers(io);

// In production, serve the built frontend BEFORE error handlers
if (isProduction) {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  
  // Check if frontend build exists
  if (fs.existsSync(frontendPath)) {
    // Serve static files
    app.use(express.static(frontendPath));
    
    // Handle client-side routing - serve index.html for all non-API routes
    app.get('*', (req, res) => {
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
    
    console.log('📁 Serving frontend from:', frontendPath);
  } else {
    console.warn('⚠️ Frontend build not found at:', frontendPath);
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
});

// 404 handler for development (API-only mode)
if (!isProduction) {
  app.use((req, res) => {
    res.status(404).json({ error: { message: 'Not found' } });
  });
}

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
});

export { app, httpServer, io };
