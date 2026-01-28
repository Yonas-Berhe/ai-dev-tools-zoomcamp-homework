# Micro-Loan Calculator PWA

A Progressive Web Application for loan calculations and savings tracking, designed to empower users in emerging markets with financial literacy tools.

---

## 🎯 Mission & Purpose

### The Problem We're Solving

Millions of people in developing nations face significant financial challenges:

- **Predatory Lending**: Hidden fees and confusing interest calculations trap borrowers in debt cycles
- **Lack of Transparency**: Difficulty understanding and comparing loan terms from different lenders
- **Limited Financial Literacy**: Many don't understand how interest compounds or what APR really means
- **No Savings Tools**: Limited access to formal banking makes building savings habits difficult
- **Connectivity Barriers**: Poor internet and expensive data plans limit access to financial apps
- **Device Limitations**: Feature phones and low-end smartphones can't run heavy native apps

### Our Solution

The Micro-Loan Calculator PWA is a **lightweight, offline-first** web application that:

1. **Demystifies Loan Costs**: Shows the true cost of borrowing with clear breakdowns of interest, fees, and total repayment
2. **Exposes Predatory Terms**: Automatically warns users when loan terms are exploitative (high APR alerts)
3. **Compares Interest Types**: Educates users on flat rate vs. reducing balance vs. compound interest
4. **Builds Savings Habits**: Simple goal tracking to encourage financial discipline
5. **Works Everywhere**: Runs on any browser, even on feature phones with Opera Mini
6. **Works Offline**: Full functionality without internet after first load
7. **Respects Data Costs**: Under 300KB initial download (vs 5-50MB for native apps)

### Who Is This For?

- **Small Business Owners**: Comparing microfinance loans for inventory or equipment
- **Farmers**: Understanding agricultural loan terms and planning seasonal finances
- **Market Vendors**: Evaluating daily or weekly loan offers from informal lenders
- **Students**: Learning financial literacy and planning education savings
- **Anyone**: Who wants to understand what they're really paying for a loan

---

## 💡 How to Use the App

### Loan Calculator

1. **Enter Loan Details**:
   - Principal amount (how much you want to borrow)
   - Interest rate (annual percentage)
   - Loan term (weeks, months, or years)
   - Any additional fees

2. **Select Interest Type**:
   - **Flat Rate**: Interest calculated on original amount throughout the term (common but more expensive)
   - **Reducing Balance**: Interest on remaining balance only (better for borrowers)
   - **Compound Interest**: Interest on interest (watch out!)

3. **View Results**:
   - Monthly payment amount
   - Total interest paid
   - Total cost of the loan
   - Effective APR (true annual cost)
   - ⚠️ Predatory lending warnings if APR is dangerously high

4. **Compare Loans**: Save calculations to compare multiple offers side-by-side

### Savings Tracker

1. **Create a Goal**: Name your goal and set a target amount
2. **Add Transactions**: Log deposits and withdrawals
3. **Track Progress**: Visual progress bar shows how close you are
4. **Stay Motivated**: Celebrate milestones on your savings journey

### Financial Literacy Lessons

Interactive lessons covering:
- Understanding different interest types
- Spotting predatory lenders
- Building emergency funds
- Comparing loan offers effectively
- Creating simple budgets

### Lenders Directory

A curated list of vetted microfinance institutions with:
- Average APR rates
- User ratings and reviews
- Contact information
- Service descriptions

---

## 🚀 Features

- **Loan Calculator**: Calculate flat rate, reducing balance, and compound interest loans
- **Predatory Lending Alerts**: Warnings for high APR loans
- **Savings Tracker**: Set and track savings goals
- **Financial Literacy**: Educational content about responsible borrowing
- **Lenders Directory**: Vetted microfinance institutions
- **Offline Support**: PWA with offline capabilities
- **Cloud Sync**: Optional user accounts for data synchronization

## 📁 Project Structure

```
Project_1/
├── backend/           # Express.js API server
│   ├── routes/        # API route handlers
│   ├── db/            # SQLite database
│   ├── middleware/    # Auth middleware
│   ├── utils/         # Calculation utilities
│   ├── tests/         # Backend tests
│   ├── Dockerfile     # Production Docker image
│   └── Dockerfile.dev # Development Docker image
├── micro-loan-pwa/    # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── utils/       # Frontend utilities
│   │   └── stores/      # Zustand state stores
│   ├── public/          # Static assets
│   ├── Dockerfile       # Production Docker image
│   └── Dockerfile.dev   # Development Docker image
├── docker-compose.yml     # Production compose file
├── docker-compose.dev.yml # Development compose file
└── render.yaml            # Render deployment blueprint
```

## 🐳 Running with Docker (Recommended)

The easiest way to run the entire application locally is using Docker Compose.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed

### Quick Start (Production Build)

```bash
# Clone the repository and navigate to project
cd Project_1

# Build and start all services
docker compose up --build

# Or run in detached mode (background)
docker compose up --build -d
```

The application will be available at:
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

### Development Mode (Hot Reloading)

For development with live code reloading:

```bash
# Start development containers
docker compose -f docker-compose.dev.yml up --build

# Or in detached mode
docker compose -f docker-compose.dev.yml up --build -d
```

Development servers:
- **Frontend (Vite)**: http://localhost:5173
- **Backend**: http://localhost:3001

Changes to your code will automatically reload.

### Docker Commands Reference

```bash
# View running containers
docker compose ps

# View logs
docker compose logs -f

# View logs for specific service
docker compose logs -f backend
docker compose logs -f frontend

# Stop all services
docker compose down

# Stop and remove volumes (clears database)
docker compose down -v

# Rebuild a specific service
docker compose build backend
docker compose build frontend

# Restart a specific service
docker compose restart backend
```

### Environment Variables

Create a `.env` file in the project root for Docker Compose:

```bash
# .env file for docker-compose
JWT_SECRET=your-super-secret-jwt-key-change-this
```

### Running Individual Containers

If you prefer to run services separately:

**Backend only:**
```bash
cd backend
docker build -t micro-loan-api .
docker run -p 3001:3001 \
  -e JWT_SECRET=your-secret-key \
  -e CORS_ORIGIN=http://localhost:8080 \
  -v micro-loan-data:/app/data \
  micro-loan-api
```

**Frontend only:**
```bash
cd micro-loan-pwa
docker build -t micro-loan-pwa \
  --build-arg VITE_API_URL=http://localhost:3001/api .
docker run -p 8080:80 micro-loan-pwa
```

---

## 🛠️ Local Development (Without Docker)

### Prerequisites
- Node.js >= 20.0.0
- npm

### Backend Setup
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend Setup
```bash
cd micro-loan-pwa
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:3001`.

## 🧪 Testing

### Frontend Tests
```bash
cd micro-loan-pwa
npm test
```

### Backend Tests
```bash
cd backend
npm test
```

### Integration Tests
```bash
# Start the backend server first
cd backend && npm start

# In another terminal, run integration tests
cd backend && node --test tests/integration.test.js
```

## 🌐 Deployment to Render

### Option 1: Using Blueprint (Recommended)

1. Push your code to a GitHub repository

2. Go to [Render Dashboard](https://dashboard.render.com/)

3. Click **New** → **Blueprint**

4. Connect your GitHub repository

5. Render will automatically detect `render.yaml` and create both services

6. After deployment, update environment variables:
   - **Backend** (`micro-loan-api`): Set `CORS_ORIGIN` to your frontend URL (e.g., `https://micro-loan-pwa.onrender.com`)
   - **Frontend** (`micro-loan-pwa`): Update `VITE_API_URL` environment variable to your backend URL (e.g., `https://micro-loan-api.onrender.com/api`)

7. Redeploy the frontend after updating `VITE_API_URL`

### Option 2: Manual Deployment

#### Deploy Backend

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **Web Service**
3. Connect your repository
4. Configure:
   - **Name**: `micro-loan-api`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: (generate a secure random string)
   - `JWT_EXPIRES_IN`: `7d`
   - `CORS_ORIGIN`: (your frontend URL, set after frontend deployment)
   - `DB_PATH`: `/opt/render/project/src/data/microloan.db`
6. Add a disk:
   - **Mount Path**: `/opt/render/project/src/data`
   - **Size**: 1 GB

#### Deploy Frontend

1. Click **New** → **Static Site**
2. Connect your repository
3. Configure:
   - **Name**: `micro-loan-pwa`
   - **Root Directory**: `micro-loan-pwa`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add environment variables:
   - `VITE_API_URL`: `https://your-backend-url.onrender.com/api`
5. Add rewrite rule: `/* → /index.html` (for SPA routing)

### Post-Deployment

1. Update the backend's `CORS_ORIGIN` with the frontend URL
2. Update `micro-loan-pwa/.env.production` with the actual backend URL
3. Test the health endpoint: `https://your-backend.onrender.com/api/health`

## 🔒 Environment Variables

### Backend
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |
| `CORS_ORIGIN` | Allowed origins (comma-separated) | `http://localhost:5173` |
| `JWT_SECRET` | Secret for JWT signing | Required in production |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `DB_PATH` | SQLite database path | `./data/microloan.db` |

### Frontend
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3001/api` |

## 📝 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/auth/register` | POST | Register user |
| `/api/auth/login` | POST | Login user |
| `/api/auth/me` | GET | Get current user |
| `/api/loans/calculate` | POST | Calculate loan |
| `/api/loans` | GET/POST | Loan history CRUD |
| `/api/savings` | GET/POST | Savings goals CRUD |
| `/api/lessons` | GET | Financial literacy lessons |
| `/api/lenders` | GET | Lenders directory |

## 📄 License

ISC

---

## 🤝 Contributing

Contributions are welcome! This project aims to help underserved communities, and we'd love your help.

### Ways to Contribute

- **Translations**: Help translate the app into local languages
- **Financial Content**: Contribute financial literacy lessons relevant to specific regions
- **Bug Reports**: Found an issue? Open a GitHub issue
- **Feature Ideas**: Suggest improvements that would help users
- **Code**: Submit pull requests for bug fixes or new features

### Development Guidelines

1. Keep bundle size minimal (target <300KB)
2. Ensure offline functionality works
3. Test on low-end devices and slow connections
4. Write tests for new features
5. Follow existing code patterns

---

## 📞 Support

If you encounter issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed description
3. Include browser/device information for bugs

---

## 🙏 Acknowledgments

This project was inspired by the need for financial transparency in emerging markets. Special thanks to:

- Microfinance institutions working ethically to serve underbanked communities
- Financial literacy advocates worldwide
- The open-source community

---

**Built with ❤️ for financial empowerment**
