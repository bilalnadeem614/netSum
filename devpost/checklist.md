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

- [x] **5. Loans and savings with progress charts**
  Becomes usable: Enter loans and savings (onboarding step and own screens); logging a loan payment or saving deposit uses a method (and passes the gate); charts show loan remaining shrinking and savings growing.
  Why now: Reuses the log path from slice 2; adds the remaining onboarding step so the full core journey is complete.
  PRD ref: `prd.md > Loans`, `prd.md > Savings and Saving Goals`, `prd.md > The Core Journey` (step 4)
  Spec ref: `spec.md > Data Model` (loans, savings, logs CHECK), `spec.md > Frontend: Charts, Savings and Goals, Loans`
  Build: loans/savings tables and routes, LoansSavings onboarding screen, Loans and Savings pages with Recharts, Add log extended to pick a loan or saving.
  Verify (mechanical): Add loan total 1000, log payment 200 via API; remaining returns 800 and the method balance drops 200; frontend builds.
  Learner check: Add a loan and a saving, make a payment and a deposit, and see the charts change and the method balance drop.
  Commit: `Add loans and savings with charts`

- [x] **6. Saving goal and daily non-essential threshold**
  Becomes usable: Set a goal (purpose, amount, daily threshold); Home shows today's non-essential spend against the threshold; goal progress is charted.
  Why now: Smaller add-on to the working loop, so it comes after the core is proven.
  PRD ref: `prd.md > Savings and Saving Goals`
  Spec ref: `spec.md > Data Model` (goal, expenses.essential), `spec.md > Frontend: Charts, Savings and Goals, Loans`
  Build: goal route, goal form on Savings page, threshold indicator on Home, progress chart.
  Verify (mechanical): Set threshold 50, log non-essential 60; Home API reports spend 60 over threshold 50.
  Learner check: Set a goal and threshold, log a non-essential spend over it, and confirm Home shows you went over.
  Commit: `Add saving goal and daily threshold`

- [x] **7. Spend charts and PWA install**
  Becomes usable: Charts page shows spend by expense and by method; the app is installable as a PWA and shows a "Can't reach server" banner when the backend is down.
  Why now: Read-only reporting and shell polish need real data from earlier slices.
  PRD ref: `prd.md > Charts of Usage`, `prd.md > Look and Feel`
  Spec ref: `spec.md > Backend: Reports`, `spec.md > Frontend: PWA Shell`, `spec.md > Important Failure Modes`
  Build: `GET /api/charts/spend`, Charts page, vite-plugin-pwa manifest and service worker, server-unreachable banner, README with run steps.
  Verify (mechanical): Spend endpoint totals match logged amounts; `npm run build` emits manifest and service worker; stopping the backend shows the banner.
  Learner check: Open Charts and confirm totals match your logs; install the app from the browser and open it; stop the backend and see the banner.
  Commit: `Add spend charts, PWA shell and README`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after slice 3 (the day-close gate); covered by the learner's end-to-end testing in the final review
- [x] Final kick-the-tires exploration and feedback completed

## Final Review

- [x] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [x] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [x] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [x] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: Brief evidence-based recap, not hands-on practice. Connected the close-day gate (`backend/tests/test_close_gate.py`) to the concurrency 500s found after the parallel-query speedup (unit tests and JSON comparison passed; failure only appeared under concurrent requests; fixed in `backend/app/db.py`, confirmed with 90 simultaneous requests returning 200).
Route and stops: Reference route in the map, not toured live: `frontend/src/pages/CloseDay.jsx` (`async function close`), `backend/app/routes/days.py` (`def close_day`), `backend/app/balances.py` (`def differences`).
Edit outcome: not applicable (no edit tried).
Reflection: offered (one optional question), not yet answered.
Activity mode: recap, map generated from finished code; not opened in a browser by me.

## Revisions
- Added a light theme with a header toggle (follows system, remembers choice), a bottom tab bar, and a statement-style redesign — learner found the first UI generic and asked for a theme toggle; `prd.md > Look and Feel` and `spec.md > Look and Feel` specified dark only, so light is an addition and dark stays the look the learner chose.
- API key check removed from the backend — learner chose to skip it for the hackathon MVP; the public URL is open (see `README.md > Known limits`).
- `/api/home` and `/api/close-preview` now fetch rows once and run independent Supabase reads in parallel (about 4 s to under 1 s) — then 500s appeared under concurrency because threads shared one HTTP/2 connection; fixed with one client per thread in `backend/app/db.py`.
- Bottom tab bar with icons, pencil and bin icons on log rows, sun/moon theme toggle, and skeleton loaders added — learner asked for a less generic UI and better loading states; no router was needed.
- Settings screen from the PRD not built — the proof of concept sets payment methods during onboarding only.
- Income and transfer log kinds added (schema `kind` and `to_method_id`, `backend/migrations/002_income_transfer.sql`, `calculated()`, `LogIn` validation, Add log switch, ledger rows) — the plan only had spends, so receiving money, or moving cash to the account, raised a real balance with no matching log and the day-close gate could never pass.
- Income restricted to Cash and Account (frontend list plus a 422 in `backend/app/routes/logs.py`) and native `<select>` replaced by a themed `Select` component — learner asked for both; the native dropdown popup cannot be styled to the theme.
- Editing a log now opens a modal limited to that log's kind instead of the full Add log form — learner found the shared form confusing for edits.
- Charts now include income (overview, income vs spend by month, income by source via `GET /api/charts/cashflow`) — the first income build left the charts spend-only, which gave half the picture.
