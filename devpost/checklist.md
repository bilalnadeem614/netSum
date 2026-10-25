---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast (no commits by Claude; learner commits and pushes)

## Slices

- [x] **1. Set up payment methods and see balances on Home**
  Becomes usable: Open the app, go Welcome → Payment Methods (Cash and Account fixed, + for more) → Home, which shows each method's opening balance. Data is in Supabase and survives reload.
  Why now: Proves the whole path (React → FastAPI → Supabase) and the riskiest unknowns (Supabase connection, API key, CORS) on the first slice. Every later slice lands on this.
  PRD ref: `prd.md > The Core Journey` (steps 1, 2, 5), `prd.md > Onboarding`
  Spec ref: `spec.md > File Structure`, `spec.md > Data Model` (payment_methods, settings), `spec.md > Look and Feel`, `spec.md > Backend: Balance Engine`
  Build: Scaffold `backend/` (FastAPI, db.py, API-key middleware, schema.sql, requirements, .env.example) and `frontend/` (Vite React, api.js, dark styles.css); write `CLAUDE.md` and extend `.gitignore` (node_modules, __pycache__); `GET /api/state`, `POST /api/methods`, `GET /api/home`; Welcome and Methods screens; Home balances strip. Pin versions.
  Verify (mechanical): Backend starts; `curl` with and without `X-API-Key` returns 200 / 401; POST two methods then `GET /api/home` shows both balances; `npm run build` succeeds.
  Learner check: Open `http://localhost:5173`, enter balances for Cash and Account plus one extra method, land on Home, reload, and confirm balances are still there and the look matches the dark bank-app feel.
  Commit: `Add scaffold, payment method setup and Home balances`

- [x] **2. Define expenses and add logs that move balances**
  Becomes usable: Finish onboarding's expense step, then on Home tap Add log (expense, amount, method, note); the log shows in today's list and the method balance drops. Logs can be edited and deleted.
  Why now: Logs are the input the kernel needs; the gate cannot be tried without them.
  PRD ref: `prd.md > Daily Logs`, `prd.md > The Core Journey` (steps 3, 6)
  Spec ref: `spec.md > Backend: CRUD Routes`, `spec.md > Backend: Balance Engine`, `spec.md > Frontend: Home and Add Log`
  Build: expenses table + routes, logs table + create/edit/delete (open day only), calculated balance = opening − logs, Expenses onboarding screen, Add log form, log list on Home.
  Verify (mechanical): Add a log of 100 to Cash via API and confirm Cash balance drops by 100; edit then delete restores it; pytest for the balance engine passes.
  Learner check: Add three logs across two methods, edit one amount, and confirm balances match your own arithmetic.
  Commit: `Add expenses and daily logs with calculated balances`

- [x] **3. Day-close gate blocks mismatches (the kernel)**
  Becomes usable: Close day shows calculated balance per method and total; typing real balances that differ is blocked with a red per-method difference; matching closes the day and Home resets to the next day.
  Why now: This is the unique kernel; it comes right after logs so feedback on it can shape everything else.
  PRD ref: `prd.md > Day-Close Reconciliation`, `prd.md > The Core Journey` (steps 7–9)
  Spec ref: `spec.md > Backend: Day-Close Gate`, `spec.md > Frontend: Close Day`, `spec.md > Important Failure Modes`
  Build: `GET /api/close-preview`, `POST /api/close-day` (409 with differences, or insert `days` row), open-day rule, Close Day screen, `tests/test_close_gate.py` (match closes, mismatch blocks, 0.10 + 0.20 exactness, opening chain).
  Verify (mechanical): `pytest` passes; via API a mismatched close returns 409 and writes no `days` row; a matching close returns success and the next opening equals the real balances.
  Learner check: Close with one wrong number and see it blocked in red; fix a missing log, close again successfully, and see Home reset with new opening balances.
  Commit: `Add day-close reconciliation gate`

- [x] **4. History of closed days**
  Becomes usable: History lists closed days newest first; tapping one shows its logs and closing balances; closed days cannot be edited; a missed day shows "Catching up: <date>".
  Why now: Completes the close loop and proves the opening-balance chain across multiple days.
  PRD ref: `prd.md > History`, `prd.md > States and Boundaries` (Closed day, Missed day, No history yet)
  Spec ref: `spec.md > Backend: Reports` (days routes), `spec.md > Frontend: History`
  Build: `GET /api/days`, `GET /api/days/{date}`, 403 on closed-day edits, History pages, empty state, catching-up label.
  Verify (mechanical): Close two days; list returns both newest first; detail returns logs and closing; PATCH of a closed-day log returns 403.
  Learner check: Close two days, open History, tap each, and confirm day 2's opening equals day 1's real closing.
  Commit: `Add history of closed days`

- [ ] **5. Loans and savings with progress charts**
  Becomes usable: Enter loans and savings (onboarding step and own screens); logging a loan payment or saving deposit uses a method (and passes the gate); charts show loan remaining shrinking and savings growing.
  Why now: Reuses the log path from slice 2; adds the remaining onboarding step so the full core journey is complete.
  PRD ref: `prd.md > Loans`, `prd.md > Savings and Saving Goals`, `prd.md > The Core Journey` (step 4)
  Spec ref: `spec.md > Data Model` (loans, savings, logs CHECK), `spec.md > Frontend: Charts, Savings and Goals, Loans`
  Build: loans/savings tables and routes, LoansSavings onboarding screen, Loans and Savings pages with Recharts, Add log extended to pick a loan or saving.
  Verify (mechanical): Add loan total 1000, log payment 200 via API; remaining returns 800 and the method balance drops 200; frontend builds.
  Learner check: Add a loan and a saving, make a payment and a deposit, and see the charts change and the method balance drop.
  Commit: `Add loans and savings with charts`

- [ ] **6. Saving goal and daily non-essential threshold**
  Becomes usable: Set a goal (purpose, amount, daily threshold); Home shows today's non-essential spend against the threshold; goal progress is charted.
  Why now: Smaller add-on to the working loop, so it comes after the core is proven.
  PRD ref: `prd.md > Savings and Saving Goals`
  Spec ref: `spec.md > Data Model` (goal, expenses.essential), `spec.md > Frontend: Charts, Savings and Goals, Loans`
  Build: goal route, goal form on Savings page, threshold indicator on Home, progress chart.
  Verify (mechanical): Set threshold 50, log non-essential 60; Home API reports spend 60 over threshold 50.
  Learner check: Set a goal and threshold, log a non-essential spend over it, and confirm Home shows you went over.
  Commit: `Add saving goal and daily threshold`

- [ ] **7. Spend charts and PWA install**
  Becomes usable: Charts page shows spend by expense and by method; the app is installable as a PWA and shows a "Can't reach server" banner when the backend is down.
  Why now: Read-only reporting and shell polish need real data from earlier slices.
  PRD ref: `prd.md > Charts of Usage`, `prd.md > Look and Feel`
  Spec ref: `spec.md > Backend: Reports`, `spec.md > Frontend: PWA Shell`, `spec.md > Important Failure Modes`
  Build: `GET /api/charts/spend`, Charts page, vite-plugin-pwa manifest and service worker, server-unreachable banner, README with run steps.
  Verify (mechanical): Spend endpoint totals match logged amounts; `npm run build` emits manifest and service worker; stopping the backend shows the banner.
  Learner check: Open Charts and confirm totals match your logs; install the app from the browser and open it; stop the backend and see the banner.
  Commit: `Add spend charts, PWA shell and README`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — after slice 3 (the day-close gate)
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence:
Route and stops:
Edit outcome:
Reflection:
Activity mode:

## Revisions

