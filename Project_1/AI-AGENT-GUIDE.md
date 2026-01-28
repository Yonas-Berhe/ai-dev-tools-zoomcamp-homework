# AI Agent Guide: Micro-Loan Calculator PWA
## Working with Claude Opus 4.5 in VS Code

---

## Quick Start

### 1. Save These Files First

```
project-root/
├── .cursorrules              # Agent context (see below)
├── docs/
│   ├── PRD.md               # Product requirements (web app version)
│   ├── quick-ref.md         # Technical quick reference (see below)
│   └── AI-AGENT-GUIDE.md    # This file
└── README.md
```

---

## 2. .cursorrules File (Copy This Exactly)

```markdown
# Micro-Loan Calculator & Savings Tracker (PWA)

## Project Type
Progressive Web App (PWA) for developing nations - NOT a native mobile app.

## Target Users
People in developing nations with:
- Low-end devices (512MB RAM)
- Poor connectivity (2G/3G)
- Limited data budgets
- Feature phones with browsers (Opera Mini, KaiOS)

## Critical Constraints

### Bundle Size (NON-NEGOTIABLE)
- Total initial load: <300KB (gzipped)
- Main JS bundle: <150KB (gzipped)
- Main CSS: <20KB (gzipped)
- HTML: <10KB
- Lighthouse Performance: >90

### Technology Stack (FIXED)
- Framework: React 18 + Vite (NOT Create React App)
- State: Zustand (NOT Redux - too heavy)
- Storage: IndexedDB via idb library (NOT localStorage)
- CSS: Tailwind with PurgeCSS (NOT CSS-in-JS)
- PWA: Workbox for Service Worker
- Build: Vite (fast, small bundles)

### What NOT to Use (STRICT)
❌ localStorage (use IndexedDB - more capacity)
❌ Redux (use Zustand - 1KB vs 8KB)
❌ Create React App (use Vite - smaller bundles)
❌ Chart.js (use CSS progress bars - lighter)
❌ Moment.js (use native Date/Intl)
❌ Lodash (use native JS methods)
❌ Icon fonts (use inline SVG)
❌ External fonts (use system fonts)

### Core Requirements
✅ Offline-first (Service Worker + IndexedDB)
✅ Works on Opera Mini browser (progressive enhancement)
✅ All calculations client-side (no server)
✅ <3s load time on 3G
✅ Works without JavaScript (basic functionality)
✅ Touch targets ≥44px
✅ WCAG 2.1 Level AA accessibility

## Development Rules

### Code Standards
- Mobile-first CSS (design for 320px width first)
- Lazy load everything non-critical
- Check bundlephobia.com before adding ANY dependency
- Comment all financial calculation logic
- Link code to PRD sections in comments
- Test with Chrome DevTools slow 3G throttling

### Financial Accuracy
- All calculations accurate to 2 decimal places
- Handle edge cases (0% interest, long terms)
- Validate all numeric inputs
- Show warnings for predatory rates (>50% APR)

### Performance Budget
- Each component: <10KB contribution to bundle
- Each route: Code-split and lazy-loaded
- Images: WebP with PNG fallback, lazy-loaded
- No unnecessary re-renders (use React.memo wisely)

## MVP Features (Phase 1)
1. Loan calculator (flat, reducing, compound interest)
2. Savings tracker (single goal)
3. 5 financial literacy lessons
4. PWA with offline support
5. IndexedDB storage
6. Service Worker caching

## File Organization
src/
├── components/     # React components
├── stores/         # Zustand stores
├── utils/          # Calculations, db, validators
├── hooks/          # Custom hooks
├── sw.js          # Service Worker
└── main.jsx       # Entry point

## Before Writing Code
Always ask yourself:
1. Does this work offline?
2. What's the bundle size impact?
3. Does this work on a 512MB RAM device?
4. Can I use a lighter alternative?
5. Does this need JavaScript or can CSS handle it?

## Documentation References
- Full PRD: docs/PRD.md
- Quick reference: docs/quick-ref.md
- This guide: docs/AI-AGENT-GUIDE.md
```

---

## 3. docs/quick-ref.md (Copy This)

```markdown
# Quick Reference - Micro-Loan PWA

## Critical Numbers

| Requirement | Target | Max | Current |
|-------------|--------|-----|---------|
| Initial bundle (gzipped) | <300KB | 500KB | - |
| Main JS (gzipped) | <150KB | 200KB | - |
| Main CSS (gzipped) | <20KB | 30KB | - |
| Load time on 3G | <3s | 5s | - |
| Lighthouse Performance | >90 | 85 | - |
| Touch target size | 44px | 40px | - |

## Tech Stack (LOCKED)

✅ **Use These:**
- React 18 + Vite
- Zustand (state management)
- IndexedDB via idb
- Tailwind CSS
- Workbox (Service Worker)
- Vitest (testing)

❌ **Never Use:**
- localStorage (5MB limit, sync)
- Redux (too heavy)
- Create React App (larger bundles)
- Chart.js (use CSS instead)
- Moment.js (use native Date)
- Any icon library (inline SVG)

## Browser Support

| Browser | Version | Priority | Notes |
|---------|---------|----------|-------|
| Chrome | 90+ | Primary | Most users |
| Safari | 14+ | Primary | iOS users |
| Firefox | 88+ | Secondary | Android users |
| Opera Mini | Latest | Secondary | Feature phones |
| KaiOS Browser | Latest | Secondary | Feature phones |

## Storage Strategy

| Data | Method | Why |
|------|--------|-----|
| Loan calculations | IndexedDB | Structured data, unlimited |
| Savings goals | IndexedDB | Relationships, queries |
| User preferences | IndexedDB | Consistency |
| Static assets | Service Worker | Offline access |
| App shell | Service Worker | Instant load |

## Financial Formulas

### Flat Rate Interest
```
Total Interest = Principal × Rate × Term
Monthly Payment = (Principal + Total Interest) / Number of Payments
```

### Reducing Balance
```
Monthly Payment = Principal × [r(1+r)^n] / [(1+r)^n - 1]
where r = monthly rate, n = number of payments
```

### Compound Interest
```
Final Amount = Principal × (1 + rate/frequency)^(frequency × term)
```

## Component Size Budget

| Component | Max Bundle Impact | Notes |
|-----------|------------------|-------|
| LoanCalculator | 10KB | Core feature |
| SavingsTracker | 8KB | Core feature |
| FinancialLiteracy | 5KB | Lazy loaded |
| Common components | 15KB total | Buttons, inputs, etc. |

## Performance Checklist

Before committing ANY code:
- [ ] Checked bundle size impact (run `npm run build`)
- [ ] Tested on Chrome DevTools slow 3G
- [ ] Tested with JavaScript disabled (if critical feature)
- [ ] All touch targets ≥44px
- [ ] No console errors or warnings
- [ ] Lighthouse score still >90
- [ ] Works offline (test with Service Worker)

## Common Mistakes to Avoid

❌ **Adding heavy dependencies**
```javascript
// BAD
import _ from 'lodash';
import moment from 'moment';

// GOOD
const unique = [...new Set(array)];
const date = new Date().toLocaleDateString();
```

❌ **Using localStorage for everything**
```javascript
// BAD
localStorage.setItem('goals', JSON.stringify(goals));

// GOOD
import { openDB } from 'idb';
const db = await openDB('MicroLoanDB', 1);
await db.put('goals', goal);
```

❌ **Importing entire libraries**
```javascript
// BAD
import { Button } from '@mui/material'; // Huge bundle

// GOOD
// Create your own lightweight Button component
```

## Vite Config Template

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
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  build: {
    target: 'es2015',
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

## IndexedDB Schema

```javascript
// src/utils/db.js
import { openDB } from 'idb';

const DB_NAME = 'MicroLoanDB';
const DB_VERSION = 1;

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Loan calculations
      if (!db.objectStoreNames.contains('loans')) {
        db.createObjectStore('loans', { keyPath: 'id' });
      }
      
      // Savings goals
      if (!db.objectStoreNames.contains('goals')) {
        db.createObjectStore('goals', { keyPath: 'id' });
      }
      
      // User preferences
      if (!db.objectStoreNames.contains('preferences')) {
        db.createObjectStore('preferences', { keyPath: 'id' });
      }
    }
  });
}
```

## Service Worker Basics

```javascript
// public/sw.js (using Workbox)
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';

// Precache all build assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache images
registerRoute(
  ({request}) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      {
        cacheWillUpdate: async ({ response }) => {
          return response.status === 200 ? response : null;
        },
      },
    ],
  })
);
```

## Testing Commands

```bash
# Development
npm run dev

# Build and check bundle size
npm run build
ls -lh dist/assets/

# Analyze bundle
npm run build
npx vite-bundle-visualizer

# Test offline
npm run build
npx serve dist
# Then toggle offline in Chrome DevTools

# Lighthouse audit
npm run build
npx serve dist
# Open Chrome DevTools > Lighthouse > Generate report
```

## Deployment Checklist

- [ ] Build size <500KB total
- [ ] Lighthouse score >90 all categories
- [ ] Works offline (test with Service Worker)
- [ ] manifest.json configured correctly
- [ ] Icons (192px, 512px) optimized
- [ ] HTTPS enabled (automatic on Netlify/Vercel)
- [ ] Tested on actual low-end device
- [ ] Tested on Opera Mini
```

---

## 4. How to Start with Claude Opus 4.5

### First Message to Claude

```
Hi Claude! I'm building a Progressive Web App (PWA) for developing nations.

Project: Micro-Loan Calculator & Savings Tracker

IMPORTANT: This is a web app, NOT React Native.

Please read these files first:
- .cursorrules (CRITICAL - read this first!)
- docs/PRD.md (product requirements)
- docs/quick-ref.md (technical constraints)

Key constraints:
- Bundle size <300KB gzipped
- Offline-first PWA
- Works on Opera Mini browser
- IndexedDB (NOT localStorage)
- Vite + React (NOT Create React App)
- Zustand (NOT Redux)

After reading, tell me:
1. What's our bundle size budget?
2. Why IndexedDB instead of localStorage?
3. Why Zustand instead of Redux?
4. What should we build first?

Don't write code yet - let's align on approach.
```

### Second Message (After Claude Confirms)

```
Great! Let's initialize the project.

Task 1: Set up Vite + React project

Requirements from .cursorrules:
- Vite (NOT Create React App)
- React 18
- TypeScript optional (your call)
- Target: <300KB initial bundle

Please provide:
1. Exact initialization commands
2. Dependencies to install (Zustand, idb, Tailwind, Workbox)
3. vite.config.js configuration for:
   - Bundle size optimization
   - PWA plugin
   - Code splitting
4. Recommended folder structure

Format as a step-by-step checklist. Don't execute yet - let me review.
```

### Third Message (Project Setup)

```
Task 2: Configure PWA basics

Based on .cursorrules PWA requirements:

1. Create public/manifest.json with:
   - App name and description
   - Icons (192px, 512px)
   - Display: standalone
   - Theme colors

2. Set up Service Worker with Workbox:
   - Cache static assets
   - Offline fallback
   - Cache-first for assets

3. Register Service Worker in main.jsx

Show me manifest.json first, then we'll do Service Worker.
```

---

## 5. Feature Development Pattern

### For Each Feature, Use This Template:

```
Task: Implement [FEATURE_NAME] (PRD section X.X)

Context: Read docs/PRD.md section X.X

Requirements:
- [Key requirement 1]
- [Key requirement 2]

Constraints from .cursorrules:
- Bundle impact: <[X]KB
- Works offline: [yes/no]
- Browser support: [list]

Create:
1. [Component/file name]
2. [Another component]

Approach:
- Start with utils (pure functions)
- Then component structure
- Finally integration with Zustand/IndexedDB

Show me the [first piece] before continuing.
```

### Example: Loan Calculator

```
Task: Implement Loan Calculator (PRD section 3.1)

Context: Read docs/PRD.md section 3.1

Requirements:
- 3 interest types (flat, reducing, compound)
- Accurate to 2 decimal places
- <500ms calculation time
- Works 100% offline

Constraints from .cursorrules:
- Bundle impact: <10KB
- Pure JavaScript functions
- No external calculation libraries

Create:
1. src/utils/loanCalculations.js (pure functions)
2. src/components/LoanCalculator/LoanForm.jsx
3. src/stores/useLoanStore.js (Zustand)

Approach:
- Start with calculation utilities (flat rate first)
- Test with edge cases (0%, long terms)
- Then build form component
- Finally wire to Zustand store

Show me calculateFlatRate function with tests first.
```

---

## 6. Code Review Prompts

### Before Committing

```
Review this code against:
- .cursorrules constraints
- docs/quick-ref.md bundle size targets
- PRD section X.X requirements

Check:
1. Bundle size impact (run build check)
2. Offline functionality
3. Performance on slow 3G
4. Accessibility (touch targets, contrast)
5. Works without JavaScript (if critical feature)

Suggest optimizations.
```

### After Feature Complete

```
Feature complete: [FEATURE_NAME]

Please verify:
- [ ] Meets PRD section X.X requirements
- [ ] Bundle size within budget
- [ ] Lighthouse score still >90
- [ ] Works offline
- [ ] Tested on low-end device profile
- [ ] All financial calculations accurate to 2 decimals
- [ ] Linked code to PRD in comments

Run full check and report any issues.
```

---

## 7. Common Claude Conversations

### "Should I use [LIBRARY]?"

```
I'm considering using [LIBRARY] for [PURPOSE].

Before we add it:
1. What's the bundle size impact? (check bundlephobia.com)
2. Can we achieve this with native JS/CSS?
3. Is there a lighter alternative?
4. Is this critical for MVP?

Check against .cursorrules "What NOT to Use" section.
```

### "This calculation seems complex"

```
I need to implement [CALCULATION] per docs/quick-ref.md formulas.

Requirements:
- Accurate to 2 decimal places
- Handle edge cases (0%, very long terms, small amounts)
- <100ms execution time
- Pure function (no side effects)

Show me the function with:
1. TypeScript types (or JSDoc)
2. Input validation
3. Edge case handling
4. Unit test examples
5. Comments linking to PRD section X.X
```

### "How should I structure this component?"

```
Creating [COMPONENT_NAME] component.

Requirements:
- Mobile-first (320px width)
- Touch targets ≥44px
- Works without JavaScript (if critical)
- Lazy-loaded (if not critical)
- <10KB bundle impact

Show me:
1. Component structure
2. Tailwind CSS classes (no custom CSS if possible)
3. Accessibility considerations (ARIA labels, semantic HTML)
4. How it integrates with Zustand store
```

---

## 8. Testing Prompts

```
Task: Create tests for [FEATURE]

Using Vitest, create tests covering:

PRD requirements from section X.X:
1. [Requirement 1]
2. [Requirement 2]

Test cases:
- Happy path
- Edge cases (from docs/quick-ref.md)
- Error handling
- Accuracy (2 decimal places for financial calculations)

Show me test structure first.
```

---

## 9. Performance Optimization

```
Task: Optimize [COMPONENT/FEATURE]

Current issue:
- Bundle size: [X]KB (target: [Y]KB)
- Load time: [X]s (target: [Y]s)
- Lighthouse score: [X] (target: >90)

Check against docs/quick-ref.md:
1. Are we using heavy dependencies?
2. Can we lazy-load this?
3. Can we use CSS instead of JS?
4. Are we re-rendering unnecessarily?

Suggest optimizations with bundle size impact for each.
```

---

## 10. Deployment Preparation

```
Task: Prepare for deployment

Check against docs/quick-ref.md deployment checklist:

1. Run production build: npm run build
2. Check bundle size: ls -lh dist/assets/
3. Run Lighthouse audit
4. Test offline mode
5. Verify manifest.json
6. Check icons (192px, 512px)
7. Test on actual device (if possible)

Report results and any issues found.
```

---

## 11. What to Do When Stuck

### Claude suggests something that violates .cursorrules:

```
Stop - that violates our constraints.

Issue: You suggested [X]
Problem: .cursorrules says [Y]
Correct approach: [Z]

Please revise using the allowed approach.
```

### Not sure if something is a good idea:

```
Before we proceed, help me evaluate:

Proposal: [DESCRIBE]

Questions:
1. Bundle size impact?
2. Offline compatibility?
3. Performance on 512MB RAM?
4. Lighter alternatives?
5. Is this in PRD scope?

Check against .cursorrules and docs/quick-ref.md.
```

### Feature is getting too complex:

```
This feature is getting complex. Let's break it down.

Feature: [NAME]
Current approach: [DESCRIBE]

Questions:
1. Can we simplify this?
2. What's the MVP version?
3. What can we defer to Phase 2?
4. Is there a lighter implementation?

Refer to PRD section X.X for actual requirements.
```

---

## 12. Daily Workflow

### Start of Day

```
Continuing work on [FEATURE].

Quick context refresh:
- Yesterday: [WHAT WE COMPLETED]
- Today's goal: [SPECIFIC GOAL]
- Relevant PRD section: X.X
- Key constraints: [FROM .cursorrules]

Ready to continue?
```

### End of Day

```
Wrapping up [FEATURE].

Completed today:
- [Item 1]
- [Item 2]

Checklist:
- [ ] Code committed
- [ ] Tests passing
- [ ] Bundle size checked
- [ ] Lighthouse score >90
- [ ] Linked to PRD in comments

Tomorrow: [NEXT STEPS]
```

---

## 13. Emergency Fixes

### Build Size Exploded

```
URGENT: Bundle size is [X]KB (max is 500KB)

Debug steps:
1. Run: npx vite-bundle-visualizer
2. Identify largest chunks
3. Check recent dependencies added
4. Look for accidental full library imports

Check against .cursorrules "What NOT to Use" section.

Help me identify the culprit and fix it.
```

### Lighthouse Score Dropped

```
URGENT: Lighthouse Performance dropped to [X] (need >90)

Run Lighthouse and check:
1. First Contentful Paint
2. Time to Interactive
3. Total Blocking Time
4. Largest Contentful Paint

Compare against docs/quick-ref.md targets.

Help me identify and fix the bottleneck.
```

---

## Quick Reference Card (Print This!)

```
┌─────────────────────────────────────────┐
│   MICRO-LOAN PWA - QUICK REFERENCE      │
├─────────────────────────────────────────┤
│ BUNDLE SIZE                             │
│ ├─ Total: <300KB (max 500KB)          │
│ ├─ Main JS: <150KB (max 200KB)        │
│ └─ Main CSS: <20KB (max 30KB)         │
├─────────────────────────────────────────┤
│ STACK (LOCKED)                          │
│ ├─ ✅ Vite + React 18                  │
│ ├─ ✅ Zustand (state)                  │
│ ├─ ✅ IndexedDB (storage)              │
│ └─ ✅ Tailwind + Workbox               │
├─────────────────────────────────────────┤
│ NEVER USE                               │
│ ├─ ❌ localStorage                      │
│ ├─ ❌ Redux                             │
│ ├─ ❌ Create React App                  │
│ ├─ ❌ Chart.js, Moment.js, Lodash      │
│ └─ ❌ Icon fonts, external fonts        │
├─────────────────────────────────────────┤
│ BEFORE EVERY COMMIT                     │
│ ├─ npm run build (check size)          │
│ ├─ Test offline                         │
│ ├─ Lighthouse >90                       │
│ └─ Slow 3G test                         │
└─────────────────────────────────────────┘
```

---

**Ready to start? Use the "First Message to Claude" above! 🚀**