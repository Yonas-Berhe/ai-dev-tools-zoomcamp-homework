# Multi-stage Dockerfile for Coding Interview Platform
# Combines frontend (React/Vite) and backend (Express.js) in one container

# ============================================
# Stage 1: Build Frontend
# ============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build the frontend for production
RUN npm run build

# ============================================
# Stage 2: Production Image
# ============================================
FROM node:20-alpine AS production

WORKDIR /app

# Install production dependencies for backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copy backend source
COPY backend/src ./backend/src

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port
ENV PORT=3001
EXPOSE 3001

# Set production environment
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Start the backend server (which also serves frontend in production)
WORKDIR /app/backend
CMD ["node", "src/index.js"]
