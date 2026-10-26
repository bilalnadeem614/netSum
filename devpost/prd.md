---
doc: prd
status: approved
---

# netSum — Product Requirements

Personal finance PWA that tracks money per payment method and won't let you close a day until calculated and real balances match. Built first for the learner (fresh grad replacing WhatsApp transaction notes).
Source: `scope.md > The Unique Kernel`, `scope.md > The Core Loop`, `scope.md > The POC Boundary`.

## The Core Journey
1. First open: welcome screen.
2. Payment methods screen: **Cash** and **Account balance** are fixed. Person enters an opening balance for each. A **+** button adds more methods (e.g. metro card), each with a name and opening balance.
3. Expenses screen: person defines predefined daily and monthly expenses (e.g. office travel, lunch, dinner, bills).
4. Loans and savings screen: person enters loan details and savings details.
5. Onboarding ends. Home screen opens.
6. Through the day: person taps **Add log**, picks a listed expense, enters amount, picks payment method, optionally adds a description. Save. Balances at the top update.
7. End of day: person taps **Close day**. App shows the calculated balance per method and the total. Person counts real balances manually and types them in.
8. All real balances equal calculated: day is saved, home resets to a fresh day with no logs.
9. Any mismatch: day does not close. Person goes back, adds or edits logs, tries close again. Repeats until every difference is 0.

Success = a day closed with all methods matching.

## Screens and Layout
- **Welcome** — first open only.
- **Setup: Payment Methods** — Cash and Account fixed rows, + button for more.
- **Setup: Expenses** — list of daily and monthly expenses.
- **Setup: Loans and Savings** — entry of loan and saving details.
- **Home** — top strip shows each payment method with its current balance; tapping it opens settings. Below: today's logs, **Add log** button, **Close day** button, access to charts, savings and loans.
- **Add Log form** — appears after tapping Add log.
- **Close Day screen** — calculated amount per method plus total, input for real balance per method, mismatch markers.
- **Settings** — opened from the balances strip; manage payment methods.
- **History** — list of closed days, newest first; tap a day to see its logs and closing balances per method (statement style).
- **Charts** — spending usage charts.
- **Savings and Goals** — savings list, saving goal, progress chart.
- **Loans** — loan list, progress chart.

## Look and Feel
- Calm and serious, bank-app feel: dark background, one green accent for "matched", red for "mismatch", clean sans-serif font, large easy-to-read numbers.
- Explicitly avoid: light, rounded, bright "habit tracker" look (learner called it generic AI slop).
- PWA: phone-first, installable, also works in a desktop browser.
- Build note: dark stays the default look; a light theme with a sun/moon toggle was added on the learner's request. Navigation is a bottom tab bar.
- Build note: the Settings screen (manage methods after onboarding) was not built in the proof of concept.

## Features and Behavior

### Onboarding
Source: `scope.md > The Core Loop` step 1.
- As the owner, I want to set opening balances once so that the app can calculate from a true starting point.
  - [ ] Welcome screen leads to payment methods screen.
  - [ ] Cash and Account balance rows exist without being added.
  - [ ] + adds another method with name and opening balance.
  - [ ] Flow continues expenses, then loans and savings, then lands on Home.
  - [ ] Home balances strip shows the opening balances entered.

### Daily Logs
- As the owner, I want to log a spend in a few taps so that logging stays easy.
  - [ ] Add log shows: expense (chosen from the predefined list), amount, payment method, optional description.
  - [ ] After save, the log appears in today's list and the chosen method's balance drops by the amount.
  - [ ] Logs can be edited.
  - [ ] If a day was missed, person can pick an older date, add that day's logs, and close it. Days close in order, so each day's opening balance is the previous day's closed real balance.

### Day-Close Reconciliation (the kernel)
Source: `scope.md > The Unique Kernel`.
- As the owner, I want the app to refuse closing a day that doesn't match reality so that I catch missed transactions.
  - [ ] Close day shows calculated balance per method and total.
  - [ ] Person enters real balance per method.
  - [ ] If every real equals calculated: day saves, home resets to no logs.
  - [ ] If any differ: the mismatched method is highlighted with the difference, and the day stays open.
  - [ ] Person can go back to add or edit logs, then retry; close succeeds only at 0 difference for all methods.

### History
- As the owner, I want to look back at past days like an account statement so that I can trace where money went.
  - [ ] Each closed day is saved with its logs and closing real balance per method.
  - [ ] History lists closed days; tapping one shows that day's logs and per-method closing balances.
  - [ ] Next day's opening balance per method equals the previous day's closed real balance.

### Charts of Usage
- [ ] Spend charted by expense category and by payment method.

### Savings and Saving Goals
- [ ] Savings list (e.g. cash, bank) with a chart showing the saved amount growing.
- [ ] Saving goal: person enters purpose and goal amount; sees progress; sets a daily threshold for non-essential spending.

### Loans
- [ ] Loan list; each shows amount owed and amount remaining, as a simple pie or bar chart that shrinks as paid.

## States and Boundaries
- **First use** — onboarding runs; Home is not reachable before it finishes.
- **Empty day** — Home shows balances and an empty log list with the Add log button.
- **Mismatch** — close blocked, difference shown per method.
- **Missed day** — person selects the old date, enters its logs, and closes it through the same reconciliation gate.
- **Closed day** — logs cleared from home; day saved to History and its real balances become tomorrow's opening balances.
- **No history yet** — History shows an empty message until the first day closes.
- **Persistence** — setup data, saved days and balances remain between sessions.

## Product Decisions
- Only Cash and Account are fixed; everything else user-added — keeps setup minimal.
- Close requires manual counting by the person — that friction is the product.
- Charts kept simple (pie or bar) — loans shrink to satisfy, savings grow to motivate.
- PWA for mobile plus desktop browser.
- Dark, serious bank-style look.
- All seven scope features stay in plus History. Time budget is 8 days at 2–4 hours each, so the build fits.
- Closed days must be viewable like account statements.

## What We're Building
Onboarding, methods, predefined expenses, daily logs, day-close gate, History of closed days, charts of usage, savings with goals and daily threshold, loans with chart.

## Deferred From the POC
- Reminders ("I must pay X", "X must return my money") — not in the learner's POC list; revisit after the core works.
- Networking and bill sharing — listed under Later in scope.
- AI feature for saving goals — learner left undecided.

## Possible Later Enhancements
- WhatsApp-style import of old logs.
- Open-source release and multi-user.

## Non-Goals
- No daily budget suggestions and single-total logging like the friend's app — the opposite of the kernel.

## Open Questions
- None blocking. Detail for backdated days (e.g. editing an already-closed day) can be settled in 4-spec or the build.
