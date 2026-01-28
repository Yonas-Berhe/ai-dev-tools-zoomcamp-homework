# Product Requirements Document: Micro-Loan Calculator & Savings Tracker
## Progressive Web App (PWA) Version

## 1. Executive Summary

### Product Vision
Empower individuals in developing nations to make informed financial decisions through a lightweight, offline-first Progressive Web App that provides transparent loan calculations, savings tracking, and basic financial literacy—accessible on any device with a browser, including feature phones.

### Problem Statement
Many people in developing nations:
- Lack transparency into predatory lending terms and hidden fees
- Cannot easily compare loan offers from different lenders
- Have limited financial literacy to understand interest calculations
- Need tools to build savings habits but lack access to formal banking
- Use feature phones or low-end smartphones with poor internet connectivity
- Cannot afford data costs for heavy apps or have limited app store access

### Why Web App (PWA) Instead of Native App?
- **No app store barriers**: Users access directly via browser URL
- **Lower data costs**: Smaller initial download (~300KB vs 5-50MB native app)
- **Universal access**: Works on iOS, Android, KaiOS, and desktop browsers
- **Easier distribution**: Share via SMS link, QR code, or social media
- **Instant updates**: No app store approval delays
- **Progressive enhancement**: Works even on feature phone browsers like Opera Mini
- **Installable**: Can be added to home screen like a native app

### Success Metrics
- **Adoption**: 100K active users within 6 months of launch
- **Engagement**: 3+ sessions per week per active user
- **Impact**: 40% of users report avoiding unfavorable loan terms
- **Retention**: 60% 30-day retention rate
- **Education**: 70% of users complete at least one financial literacy module
- **Performance**: Lighthouse score >90, <3s load time on 3G
- **Installation**: 30% of users install PWA to home screen

---

## 2. Target Users

[Same as before - Maria, James, Aisha personas]

---

## 3. Core Features

### 3.1 Loan Calculator (MVP - Priority 1)

**Web-Specific Features:**
- Client-side JavaScript calculations (no server needed)
- Works offline via Service Worker
- URL sharing for calculations
- <500ms response time
- Works on Opera Mini (progressive enhancement)

**Technical Requirements:**
- Bundle size contribution: <50KB
- Pure JavaScript functions for calculations
- IndexedDB for history storage
- No external API dependencies
- Works without JavaScript (basic HTML form fallback)

### 3.2 Savings Tracker (MVP - Priority 1)

**Web-Specific Features:**
- CSS-based progress bars (no chart library needed)
- IndexedDB for unlimited storage
- CSV export (client-side generation)
- Offline sync queue

**Technical Requirements:**
- Bundle size contribution: <40KB
- Background sync API for queued transactions
- No Chart.js or heavy visualization libraries
- Service Worker caching for instant loads

### 3.3 Financial Literacy (MVP - Priority 2)

**Web-Specific Features:**
- Static content cached by Service Worker
- Lazy-loaded by language
- Text-to-speech via Web Speech API (future)

**Technical Requirements:**
- Content size: <2MB for 5 lessons
- Markdown or HTML format
- Aggressive caching (cache-first strategy)
- Separate chunks per language

### 3.4 PWA Features (MVP - Priority 1)

**Core PWA Requirements:**
- Web App Manifest with icons
- Service Worker for offline functionality
- Add to Home Screen capability
- Full-screen app experience
- Background sync
- Update notifications

---

## 4. Technical Architecture

### Technology Stack
- **Framework**: React 18 + Vite
- **State**: Zustand (1KB vs Redux 8KB)
- **Storage**: IndexedDB via idb library
- **CSS**: Tailwind with PurgeCSS
- **PWA**: Workbox
- **Testing**: Vitest
- **Hosting**: Netlify or Vercel

### Bundle Size Targets
| Asset | Target (gzipped) | Max |
|-------|-----------------|-----|
| HTML | <10KB | 15KB |
| Main JS | <150KB | 200KB |
| CSS | <20KB | 30KB |
| Total initial | <300KB | 500KB |

### Browser Support
- Chrome 90+ (primary)
- Safari 14+ (iOS)
- Firefox 88+
- Opera Mini (basic functionality)
- KaiOS Browser (feature phones)

### Data Models

```typescript
interface LoanCalculation {
  id: string;
  amount: number;
  currency: string;
  interestRate: number;
  interestType: 'flat' | 'reducing' | 'compound';
  termLength: number;
  termUnit: 'weeks' | 'months' | 'years';
  fees: number;
  createdAt: number;
  results: {
    monthlyPayment: number;
    totalInterest: number;
    totalCost: number;
    effectiveAPR: number;
  };
}

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currency: string;
  targetDate?: number;
  currentAmount: number;
  transactions: Transaction[];
  createdAt: number;
  completedAt?: number;
}
```

### Folder Structure
```
src/
├── components/
│   ├── LoanCalculator/
│   ├── SavingsTracker/
│   ├── FinancialLiteracy/
│   └── common/
├── stores/          # Zustand stores
├── utils/           # Calculations, db, validators
├── hooks/           # useOfflineStatus, etc.
├── styles/
├── sw.js           # Service Worker
└── main.jsx
```

---

## 5. Performance Requirements

### Core Web Vitals
- **LCP** (Largest Contentful Paint): <2.5s
- **FID** (First Input Delay): <100ms
- **CLS** (Cumulative Layout Shift): <0.1

### Network Performance
- First load on 3G: <3s
- Repeat visits: <1s (cached)
- Offline: Instant load

### Lighthouse Scores
- Performance: >90
- Accessibility: >90
- Best Practices: >90
- SEO: >90
- PWA: Pass all checks

---

## 6. Development Roadmap

### Phase 1: MVP (Months 1-3)
- Vite + React setup
- Loan calculator (3 interest types)
- Basic savings tracker (single goal)
- 5 financial literacy lessons
- PWA with Service Worker
- IndexedDB integration
- English only
- Lighthouse score >90

**Launch Criteria:**
- 50 beta testers complete all features successfully
- <300KB initial load (gzipped)
- Works on 512MB RAM device
- 100% offline functionality
- All calculations accurate to 2 decimals

### Phase 2: Enhancement (Months 4-6)
- Multiple savings goals
- Loan comparison mode
- 10 additional literacy lessons
- Spanish and Swahili localization
- CSV export
- URL sharing for calculations
- Dark mode

### Phase 3: Community (Months 7-9)
- Lender database with reviews
- User accounts (optional)
- Cloud sync (optional, encrypted)
- Community tips sharing
- SMS integration pilot

### Phase 4: Scale (Months 10-12)
- 5 additional languages
- API for partners
- White-label version for MFIs
- Advanced analytics
- Push notifications
- Budget planning tool

---

## 7. Go-to-Market Strategy

### Distribution
- **Primary**: SMS campaigns with short links
- **Secondary**: Social media, QR codes
- **Partnerships**: NGOs, MFIs, mobile money providers

### Marketing
- Community champions
- Radio campaigns with memorable URL
- Market day demonstrations
- Word-of-mouth incentives

### Pricing
- **Free forever**: Core features
- **No ads**: Build trust
- **B2B revenue**: White-label, API access

---

## 8. Risks & Mitigation

### Technical Risks
- **Browser compatibility**: Test on all target browsers, progressive enhancement
- **Performance on low-end devices**: Continuous testing, bundle size limits
- **Data loss**: Export features, future cloud backup

### Business Risks
- **Trust**: Partner with local NGOs, transparent calculations
- **Adoption**: Low barrier to entry (just a URL), viral sharing
- **Competition**: Focus on underserved users, keep it free

---

## 9. Open Questions

1. Should we prioritize Opera Mini support over advanced features?
2. What's the minimum viable Service Worker for MVP?
3. Should we build SMS fallback in Phase 1 or Phase 3?
4. How do we measure impact without tracking users?
5. What's our update strategy to avoid cache issues?

---

**Document Version**: 2.0 (Web App)  
**Last Updated**: January 27, 2026  
**Owner**: Product Team  
**Previous Version**: 1.0 (React Native - superseded)