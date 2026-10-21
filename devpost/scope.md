---
doc: scope
status: approved
---

# netSum

Personal finance manager that tracks money per payment method and won't let you close a day until your numbers match reality.

## The Unique Kernel
Day-close reconciliation gate. Each payment method (cash, bank card, metro card...) has its own balance. App calculates it from logged spends. If calculated balance differs from real balance, app highlights the mismatch and the day cannot close until both are equal. Friend's app only took one total amount, suggested a daily budget, and logged one number per day.

## Who It's For
The learner first: a fresh grad who today tracks daily transactions in WhatsApp, with money split across cash, bank account and other methods. Needs reminders for "I must pay X" and "X must return my money". Later: other people with the same problem (open source, then market).

## The Core Loop
1. Start of month: enter opening balance for each payment method (one-time onboarding setup).
2. Through the day or at day end: log each spend with amount and payment method (e.g. office travel, lunch, dinner), often from predefined daily/monthly expenses.
3. Compare calculated balance with real balance per method. Usually a missed transaction causes a mismatch. App highlights it; fix it; day closes only when equal.
Comes back daily because the day isn't "closed" until it matches.

## Inspiration & Identity
No visual direction given yet. Friend's recommended app (name not given) was the reference for what was missing: only total amount, suggested daily budget, one daily log. `3-prd` asks for look and feel.

## Why This Matters to the Learner
Solves their own WhatsApp-based routine first. Plans to open source it and market it. Wants to understand agent tools better while building.

## What "Working" Looks Like
The app does the loop above with all MVP features: set up payment methods with opening balances, log expenses by method, see daily log and closing balance per method, blocked day-close on mismatch, charts of usage, savings, saving goals, loans. Demo video to be made once the app is built; specific demo beat not yet decided.

## The POC Boundary
Learner's chosen MVP, all in:
- Predefined daily and monthly expenses (bills, office travel, breakfast, lunch, dinner...)
- Payment methods list (cash, bank card, metro card balance...), initialized once at onboarding, auto-updated from logged expenses
- Savings list (cash / bank balance etc.)
- Everyday logs with closing balance per method
- Charts of usage
- Saving goals (AI feature undecided; simple start: get the user's purpose and set a daily threshold for non-essential spending)
- List of loans

## Later
- Networking features
- Bill sharing
- Other post-hackathon ideas (not specified)

## Explicitly Cut
Nothing cut by learner. Open risk: 7 features in a 2–4 hour build; see `3-prd` for depth per feature.
