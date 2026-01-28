/**
 * Financial Literacy Lessons Routes
 * PRD Reference: Section 3.3 - Financial Literacy
 */

const express = require('express');
const router = express.Router();

// Lessons content (same as frontend for consistency)
// In production, this could come from a CMS or database
const LESSONS = {
  en: [
    {
      id: 1,
      title: 'Understanding Interest Rates',
      emoji: '📈',
      summary: 'Learn how interest affects what you pay back on a loan.',
      content: `**What is Interest?**
Interest is the cost of borrowing money. When you take a loan, you pay back more than you borrowed - that extra amount is interest.

**Types of Interest:**

1. **Flat Rate**: Interest calculated on the original loan amount for the entire term. Simple but often more expensive.

2. **Reducing Balance**: Interest calculated on what you still owe. As you pay down the loan, you pay less interest. This is usually better for borrowers.

3. **Compound Interest**: Interest charged on both the original amount AND accumulated interest. Can grow quickly - great for savings, expensive for loans.

**Example:**
Borrow $1,000 at 10% for 1 year:
- Flat rate: Pay $100 interest = $1,100 total
- Reducing balance: Pay ~$55 interest = $1,055 total

**Key Takeaway:** Always ask what type of interest calculation is used!`,
      order: 1,
    },
    {
      id: 2,
      title: 'Spotting Predatory Lenders',
      emoji: '⚠️',
      summary: 'Warning signs of unfair loan terms to watch out for.',
      content: `**Red Flags to Watch For:**

1. **Very High Interest Rates**
   - If APR is over 50%, be very cautious
   - Some lenders charge 100%+ APR
   - Compare with other options first

2. **Hidden Fees**
   - Processing fees
   - Insurance requirements
   - Early payment penalties
   - Ask for ALL costs in writing

3. **Pressure Tactics**
   - "Limited time offer"
   - "Sign now, read later"
   - Refusing to explain terms
   - Take time to understand before signing

4. **Targeting Vulnerable People**
   - "No credit check needed"
   - "Everyone approved"
   - These often have the worst terms

**What to Do:**
- Always calculate the TOTAL cost (principal + all interest + all fees)
- Compare at least 3 different lenders
- Ask trusted friends or family for advice
- If it seems too easy, the terms are probably bad

**Key Takeaway:** If you feel rushed or confused, walk away!`,
      order: 2,
    },
    {
      id: 3,
      title: 'Building an Emergency Fund',
      emoji: '🏦',
      summary: 'Why and how to save for unexpected expenses.',
      content: `**Why Emergency Funds Matter:**
Unexpected expenses happen to everyone - medical bills, job loss, repairs. Without savings, you may need expensive loans.

**How Much to Save:**
- Start small: Even $50 is a good start
- Goal 1: $500 (covers small emergencies)
- Goal 2: 1 month of expenses
- Ultimate goal: 3-6 months of expenses

**How to Build It:**

1. **Start Now, Start Small**
   - Save any amount you can
   - $5/week = $260/year
   - It adds up!

2. **Make It Automatic**
   - Set aside savings first, before spending
   - "Pay yourself first"

3. **Keep It Separate**
   - Don't mix with daily spending money
   - Harder to spend if it's separate

4. **Only for True Emergencies**
   - Job loss
   - Medical emergency
   - Critical repairs
   - NOT for sales or wants

**Key Takeaway:** The best time to start saving was yesterday. The second best time is today!`,
      order: 3,
    },
    {
      id: 4,
      title: 'Comparing Loan Offers',
      emoji: '⚖️',
      summary: 'How to compare different loans to get the best deal.',
      content: `**What to Compare:**

1. **Total Cost of Loan**
   - Not just monthly payment
   - Add up: Principal + All Interest + All Fees
   - The lowest total cost is usually best

2. **Annual Percentage Rate (APR)**
   - Includes interest AND fees
   - Better for comparing than interest rate alone
   - Lower APR = usually better deal

3. **Monthly Payment**
   - Can you afford it every month?
   - Include it in your budget
   - What happens if you miss a payment?

4. **Loan Term (Length)**
   - Longer term = lower monthly payment
   - BUT longer term = more total interest
   - Balance what you can afford monthly vs total cost

5. **Penalties**
   - Late payment fees
   - Early repayment penalties
   - Hidden charges

**Comparison Example:**
| | Loan A | Loan B |
|---|---|---|
| Amount | $1,000 | $1,000 |
| Interest | 15% flat | 20% reducing |
| Term | 12 months | 12 months |
| Total Interest | $150 | $110 |
| **Total Cost** | **$1,150** | **$1,110** |

Loan B has higher interest rate but costs less!

**Key Takeaway:** Always compare TOTAL COST, not just interest rate or monthly payment.`,
      order: 4,
    },
    {
      id: 5,
      title: 'Creating a Simple Budget',
      emoji: '📝',
      summary: 'Track your money to reach your financial goals.',
      content: `**Why Budget?**
A budget helps you see where your money goes and find ways to save more.

**Simple 50/30/20 Rule:**
- **50% Needs**: Rent, food, transport, utilities
- **30% Wants**: Entertainment, eating out, extras
- **20% Savings/Debt**: Emergency fund, loan payments

**Steps to Start:**

1. **Track Your Income**
   - Write down all money coming in
   - Include irregular income

2. **Track Your Spending**
   - Write down EVERYTHING for 1 month
   - Use categories: food, transport, etc.
   - Be honest!

3. **Find the Leaks**
   - Small daily expenses add up
   - $2/day = $60/month = $720/year
   - Look for patterns

4. **Make a Plan**
   - Set limits for each category
   - Savings FIRST, then spending
   - Review weekly

5. **Adjust as Needed**
   - Life changes, budgets change
   - Be flexible but consistent

**Quick Tips:**
- Use cash for spending categories (when it's gone, it's gone)
- Wait 24 hours before unplanned purchases
- Celebrate small wins!

**Key Takeaway:** You don't need to track every penny forever - just long enough to understand your habits.`,
      order: 5,
    },
  ],
  // Future: Add Spanish and Swahili translations
  es: [],
  sw: [],
};

/**
 * GET /api/lessons
 * Get all lessons (public endpoint)
 */
router.get('/', (req, res) => {
  const { language = 'en' } = req.query;
  
  const lessons = LESSONS[language] || LESSONS.en;
  
  // Return without full content for list view
  const summaries = lessons.map(({ content, ...rest }) => rest);
  
  res.json({
    success: true,
    data: summaries,
    meta: {
      language,
      availableLanguages: Object.keys(LESSONS).filter(lang => LESSONS[lang].length > 0),
      totalLessons: lessons.length,
    },
  });
});

/**
 * GET /api/lessons/:id
 * Get a specific lesson with full content (public endpoint)
 */
router.get('/:id', (req, res) => {
  const { language = 'en' } = req.query;
  const lessonId = parseInt(req.params.id);
  
  const lessons = LESSONS[language] || LESSONS.en;
  const lesson = lessons.find(l => l.id === lessonId);
  
  if (!lesson) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Lesson not found' }
    });
  }
  
  res.json({
    success: true,
    data: {
      ...lesson,
      language,
    },
  });
});

module.exports = router;
