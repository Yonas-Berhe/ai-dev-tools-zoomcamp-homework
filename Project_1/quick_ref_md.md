# Quick Reference - Micro-Loan Calculator PWA

## Critical Numbers

| Requirement | Target | Max Allowed | Why |
|-------------|--------|-------------|-----|
| Total initial bundle (gzipped) | <300KB | 500KB | 3G load time <3s |
| Main JS (gzipped) | <150KB | 200KB | Core app logic |
| Main CSS (gzipped) | <20KB | 30KB | Styling |
| HTML | <10KB | 15KB | Initial page |
| Load time on 3G | <3s | 5s | User patience limit |
| Lighthouse Performance | >90 | 85 | Google PWA standard |
| Touch target size | 44px | 40px | Accessibility standard |
| Calculation accuracy | 2 decimals | N/A | Financial precision |
| Predatory loan warning | >50% APR | N/A | User protection |

---

## Tech Stack (LOCKED - Do Not Change)

### ✅ Use These (Required)

| Technology | Purpose | Why This Choice |
|------------|---------|-----------------|
| **Vite** | Build tool | 10-100x faster than CRA, smaller bundles |
| **React 18** | UI framework | Familiar, widely supported |
| **Zustand** | State management | 1KB vs Redux 8KB, simpler API |
| **IndexedDB (via idb)** | Storage | No 5MB limit like localStorage |
| **Tailwind CSS** | Styling | Tree-shakeable, small bundle |
| **Workbox** | Service Worker | Battle-tested offline support |
| **Vitest** | Testing | Vite-native, fast |
| **Netlify/Vercel** | Hosting | Free HTTPS, global CDN |

### ❌ Never Use These (Forbidden)

| Technology | Why NOT | Use Instead |
|------------|---------|-------------|
| **localStorage** | 5MB limit, synchronous | IndexedDB via idb |
| **Redux** | 8KB + boilerplate | Zustand (1KB) |
| **Create React App** | Larger bundles, slower | Vite |
| **Chart.js** | Heavy library | CSS progress bars |
| **Moment.js** | 67KB (huge!) | Native Date + Intl |
| **Lodash** | Unnecessary weight | Native JS methods |
| **Icon fonts** | Extra HTTP request | Inline SVG |
| **External fonts** | Extra KB + requests | System fonts |
| **Bootstrap** | Unused CSS | Tailwind (purged) |
| **jQuery** | Outdated, heavy | Native DOM APIs |

---

## Browser Support

| Browser | Version | Priority | Market Share | Notes |
|---------|---------|----------|--------------|-------|
| Chrome (Android) | 90+ | **Primary** | 60%+ | Most users |
| Safari (iOS) | 14+ | **Primary** | 25%+ | iPhone users |
| Firefox (Android) | 88+ | Secondary | 5% | Tech-savvy users |
| Opera Mini | Latest | Secondary | 5%+ | Feature phones |
| KaiOS Browser | Latest | Secondary | 3%+ | Feature phones |
| IE 11 | N/A | ❌ Not supported | Dead | Too old |

**Testing Priority:**
1. Chrome on Android (low-end device)
2. Safari on iOS
3. Opera Mini (progressive enhancement)
4. KaiOS (basic functionality)

---

## Storage Strategy

| Data Type | Storage Method | Max Capacity | Why |
|-----------|---------------|--------------|-----|
| Loan calculations | IndexedDB | ~50MB+ | Structured data, unlimited history |
| Savings goals | IndexedDB | ~50MB+ | Transactions, relationships |
| User preferences | IndexedDB | ~50MB+ | Consistency with other data |
| Static assets (HTML/CSS/JS) | Service Worker | ~50MB+ | Offline access |
| Financial literacy content | Service Worker | ~50MB+ | Cache-first strategy |

**Why NOT localStorage:**
- Only 5MB limit (too small)
- Synchronous (blocks UI)
- String-only (requires JSON parse/stringify)
- No transaction support
- No indexing/queries

**IndexedDB Advantages:**
- 50MB+ storage (browser dependent)
- Asynchronous (non-blocking)
- Supports structured data
- Transaction support
- Can create indexes for queries

---

## Financial Formulas

### Flat Rate Interest
```
Total Interest = Principal × Rate × Term
Monthly Payment = (Principal + Total Interest) / Number of Payments

Example:
Principal: $1,000
Rate: 10% per year
Term: 2 years
Total Interest = 1000 × 0.10 × 2 = $200
Total Cost = $1,200
Monthly Payment = $1,200 / 24 = $50
```

### Reducing Balance (Most Common)
```
Monthly Payment = P × [r(1+r)^n] / [(1+r)^n - 1]

Where:
P = Principal
r = Monthly interest rate (annual rate / 12)
n = Number of payments

Example:
Principal: $1,000
Annual Rate: 10%
Monthly Rate: 0.10/12 = 0.00833
Term: 24 months
Monthly Payment = 1000 × [0.00833(1.00833)^24] / [(1.00833)^24 - 1]
                ≈ $46.14
Total Paid = $46.14 × 24 = $1,107.36
Total Interest = $107.36
```

### Compound Interest
```
Final Amount = P × (1 + r/n)^(n×t)

Where:
P = Principal
r = Annual interest rate
n = Compounding frequency per year
t = Time in years

Example:
Principal: $1,000
Rate: 10% per year
Compounded: Monthly (n=12)
Term: 2 years
Final Amount = 1000 × (1 + 0.10/12)^(12×2)
             = 1000 × (1.00833)^24
             ≈ $1,219.39
```

### Effective APR Calculation
```
Effective APR = [(Total Amount Paid / Principal) - 1] / Years × 100

Example:
Borrowed: $1,000
Total Paid: $1,200
Term: 2 years
Effective APR = [(1200/1000) - 1] / 2 × 100 = 10%
```

---

## Component Size Budget

| Component/Feature | Max Bundle Impact | Notes |
|-------------------|------------------|-------|
| LoanCalculator | 10KB | Core feature, always loaded |
| SavingsTracker | 8KB | Core feature, lazy-loadable |
| FinancialLiteracy | 5KB | Lazy-loaded per lesson |
| Common components (Button, Input, Card) | 15KB total | Shared across app |
| Zustand stores | 3KB total | State management |
| IndexedDB wrapper | 2KB | Database layer |
| Utilities (calculations, validators) | 5KB | Pure functions |
| **Total** | **<150KB** | Main bundle target |

**How to Check:**
```bash
npm run build
ls -lh dist/assets/
# Check main.[hash].js size
```

---

## Performance Checklist

### Before Committing ANY Code:

- [ ] **Bundle size check**: Run `npm run build` and verify <300KB total
- [ ] **Lighthouse audit**: Score >90 for Performance, Accessibility, Best Practices, SEO
- [ ] **Slow 3G test**: Chrome DevTools Network throttling, page loads <3s
- [ ] **Offline test**: Toggle offline in DevTools, app still works
- [ ] **Low-end device**: Test on 512MB RAM device profile
- [ ] **Touch targets**: All buttons/links ≥44px height
- [ ] **Accessibility**: No console errors, screen reader compatible
- [ ] **No console warnings**: Clean console in production build
- [ ] **JavaScript disabled**: Critical features still work (progressive enhancement)

### Chrome DevTools Settings for Testing:
1. **Network**: Throttling → Slow 3G (400ms RTT, 400kbps down, 400kbps up)
2. **Performance**: CPU throttling → 6x slowdown
3. **Device**: Mobile device emulation → Moto G4 (512MB RAM)
4. **Application**: Service Workers → Check "Offline" to test offline mode

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Using Heavy Dependencies

**BAD:**
```javascript
import _ from 'lodash'; // 24KB!
import moment from 'moment'; // 67KB!
import { Icon } from '@iconify/react'; // 15KB!

const sorted = _.sortBy(array, 'name');
const date = moment().format('YYYY-MM-DD');
```

**GOOD:**
```javascript
// Native JS methods (0KB)
const sorted = [...array].sort((a, b) => a.name.localeCompare(b.name));
const date = new Date().toISOString().split('T')[0];

// Inline SVG for icons (1-2KB total)
const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
);
```

### ❌ Mistake 2: Using localStorage

**BAD:**
```javascript
// localStorage has 5MB limit and is synchronous
localStorage.setItem('goals', JSON.stringify(goals));
const goals = JSON.parse(localStorage.getItem('goals') || '[]');
```

**GOOD:**
```javascript
// IndexedDB is unlimited and asynchronous
import { openDB } from 'idb';

const db = await openDB('MicroLoanDB', 1);
await db.put('goals', goal);
const goals = await db.getAll('goals');
```

### ❌ Mistake 3: Importing Entire Libraries

**BAD:**
```javascript
import * as lodash from 'lodash'; // Imports everything!
import { Button } from '@mui/material'; // 100KB+
```

**GOOD:**
```javascript
// Create lightweight components yourself
const Button = ({ children, onClick, variant = 'primary' }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 rounded ${
      variant === 'primary' ? 'bg-blue-600 text-white' : 'bg-gray-200'
    }`}
  >
    {children}
  </button>
);
```

### ❌ Mistake 4: Not Code Splitting

**BAD:**
```javascript
// All routes loaded upfront
import LoanCalculator from './components/LoanCalculator';
import SavingsTracker from './components/SavingsTracker';
import Lessons from './components/Lessons';
```

**GOOD:**
```javascript
// Lazy load routes
import { lazy, Suspense } from 'react';

const LoanCalculator = lazy(() => import('./components/LoanCalculator'));
const SavingsTracker = lazy(() => import('./components/SavingsTracker'));
const Lessons = lazy(() => import('./components/Lessons'));

// Wrap in Suspense
<Suspense fallback={<div>Loading...</div>}>
  <Routes>
    <Route path="/calculator" element={<LoanCalculator />} />
    <Route path="/savings" element={<SavingsTracker />} />
    <Route path="/lessons" element={<Lessons />} />
  </Routes>
</Suspense>
```

---

## Vite Configuration Template

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: {
        name: 'Micro-Loan Calculator',
        short_name: 'MicroLoan',
        description: 'Calculate loans, track savings, learn financial literacy',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    target: 'es2015',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          store: ['zustand'],
          db: ['idb']
        }
      }
    }
  }
});
```

---

## IndexedDB Setup Template

```javascript
// src/utils/db.js
import { openDB } from 'idb';

const DB_NAME = 'MicroLoanDB';
const DB_VERSION = 1;

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Loan calculations store
      if (!db.objectStoreNames.contains('loans')) {
        const loanStore = db.createObjectStore('loans', { keyPath: 'id' });
        loanStore.createIndex('createdAt', 'createdAt');
      }
      
      // Savings goals store
      if (!db.objectStoreNames.contains('goals')) {
        const goalStore = db.createObjectStore('goals', { keyPath: 'id' });
        goalStore.createIndex('createdAt', 'createdAt');
      }
      
      // User preferences store (singleton)
      if (!db.objectStoreNames.contains('preferences')) {
        db.createObjectStore('preferences', { keyPath: 'id' });
      }
    }
  });
}

// Helper functions
export async function saveLoan(loan) {
  const db = await initDB();
  return db.put('loans', loan);
}

export async function getLoan(id) {
  const db = await initDB();
  return db.get('loans', id);
}

export async function getAllLoans() {
  const db = await initDB();
  return db.getAll('loans');
}

export async function deleteLoan(id) {
  const db = await initDB();
  return db.delete('loans', id);
}

// Similar functions for goals and preferences...
```

---

## Service Worker Basics (Workbox)

```javascript
// Workbox is configured in vite.config.js
// But here's what it does:

// 1. Precache all static assets
// - HTML, CSS, JS files
// - Icons, images
// - Manifest

// 2. Cache strategies
// - Static assets: Cache-first (instant load)
// - API calls (future): Network-first with fallback
// - Images: Cache-first with expiration

// 3. Offline fallback
// - When offline, serve cached version
// - Show offline indicator in UI

// 4. Update flow
// - New version detected → prompt user to refresh
// - User refreshes → new version loads
```

---

## Testing Commands

```bash
# Development server
npm run dev
# Opens http://localhost:5173

# Production build
npm run build
# Creates dist/ folder

# Preview production build
npm run preview
# Opens production build locally

# Check bundle size
npm run build
ls -lh dist/assets/
# Look for main.[hash].js size

# Analyze bundle composition
npm run build
npx vite-bundle-visualizer
# Opens interactive bundle analyzer

# Run tests
npm run test

# Test offline mode
npm run build
npx serve dist
# Then toggle offline in Chrome DevTools > Application > Service Workers

# Lighthouse audit
npm run build
npx serve dist
# Open Chrome DevTools > Lighthouse > Generate report
# Aim for >90 in all categories
```

---

## Deployment Checklist

### Pre-Deployment:
- [ ] Production build completes without errors
- [ ] Bundle size <500KB total (check dist/assets/)
- [ ] Lighthouse score >90 all categories
- [ ] Service Worker registered and working
- [ ] Works offline (test with DevTools)
- [ ] manifest.json configured correctly
- [ ] Icons optimized (192px, 512px)
- [ ] No console errors or warnings
- [ ] Tested on actual low-end Android device
- [ ] Tested on Opera Mini browser
- [ ] All financial calculations verified accurate

### Netlify Deployment:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod

# Site is live at https://[random-name].netlify.app
# Configure custom domain in Netlify dashboard
```

### Vercel Deployment:
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Site is live at https://[project-name].vercel.app
```

### Post-Deployment:
- [ ] HTTPS working (automatic on Netlify/Vercel)
- [ ] PWA installable (test "Add to Home Screen")
- [ ] Service Worker updating correctly
- [ ] All features work in production
- [ ] Share link via SMS/WhatsApp (test user journey)

---

## Emergency Fixes

### Bundle Size Exploded
```bash
# Identify culprit
npx vite-bundle-visualizer

# Common causes:
# 1. Accidentally imported full library
# 2. Added heavy dependency
# 3. Not using code splitting
# 4. Images not optimized

# Fix: Remove heavy dependencies, lazy load routes
```

### Lighthouse Score Dropped
```bash
# Run Lighthouse
# Open Chrome DevTools > Lighthouse > Generate report

# Common issues:
# 1. Images too large → Optimize images
# 2. Too much JavaScript → Code split
# 3. Render-blocking resources → Preload critical assets
# 4. Slow server response → Use CDN (Netlify/Vercel)
```

### Service Worker Not Updating
```bash
# Clear cache
# Chrome DevTools > Application > Storage > Clear site data

# Unregister old Service Worker
# Chrome DevTools > Application > Service Workers > Unregister

# Hard refresh
# Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

---

## Quick Reference Card (Print/Save!)

```
╔═══════════════════════════════════════════════╗
║     MICRO-LOAN PWA - CRITICAL NUMBERS         ║
╠═══════════════════════════════════════════════╣
║ BUNDLE SIZE (GZIPPED)                         ║
║ ├─ Total: <300KB (max 500KB)                 ║
║ ├─ Main JS: <150KB (max 200KB)               ║
║ ├─ Main CSS: <20KB (max 30KB)                ║
║ └─ HTML: <10KB (max 15KB)                    ║
╠═══════════════════════════════════════════════╣
║ TECH STACK (NEVER CHANGE)                    ║
║ ├─ ✅ Vite + React 18                        ║
║ ├─ ✅ Zustand (1KB state)                    ║
║ ├─ ✅ IndexedDB via idb                      ║
║ ├─ ✅ Tailwind CSS (purged)                  ║
║ └─ ✅ Workbox (Service Worker)               ║
╠═══════════════════════════════════════════════╣
║ NEVER USE (FORBIDDEN)                         ║
║ ├─ ❌ localStorage (use IndexedDB)           ║
║ ├─ ❌ Redux (use Zustand)                    ║
║ ├─ ❌ Create React App (use Vite)            ║
║ ├─ ❌ Chart.js (use CSS)                     ║
║ ├─ ❌ Moment.js (use native Date)            ║
║ └─ ❌ Lodash (use native JS)                 ║
╠═══════════════════════════════════════════════╣
║ BEFORE EVERY COMMIT                           ║
║ ├─ npm run build (check size)                ║
║ ├─ Test offline mode                          ║
║ ├─ Lighthouse score >90                       ║
║ ├─ Slow 3G test (<3s load)                   ║
║ └─ No console errors                          ║
╚═══════════════════════════════════════════════╝

Emergency contacts:
- PRD: docs/PRD.md (what to build)
- Constraints: .cursorrules (how to build)
- This file: docs/quick-ref.md (technical limits)
```

---

**Last Updated**: January 27, 2026  
**Project**: Micro-Loan Calculator & Savings Tracker PWA  
**Version**: 1.0