---
doc: spec
status: approved
---

# netSum — Technical Spec

## How This Works, In Plain Language
Three pieces:
- **React app (the face).** A phone-first PWA. It shows balances, forms, and charts, and sends your actions to the backend. It holds no rules.
- **FastAPI backend (the brain).** It computes each method's calculated balance and runs the day-close gate. If any real balance differs from calculated, it refuses to close and says by how much. Because the rule lives only here, the screen cannot skip it.
- **Supabase Postgres (the notebook).** Plain database tables holding payment methods, expense menu, logs, closed days, savings, and loans. No login: one owner, one set of data.

Balances are never stored as a running number. They are always **calculated**: a day's opening balance (previous closed day's *real* balance, or the onboarding balance) minus that day's logs. Loan remaining and savings totals are calculated from logs the same way. So a forgotten transaction can only show up as a mismatch at day close, which is the kernel (`scope.md > The Unique Kernel`).

Why not more: no auth, no real-time, no background jobs, no cloud deploy. None of those prove the kernel.

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`.
1. **First open** → React asks `GET /api/state`. Backend sees no payment methods → React shows Welcome and onboarding.
2. **Setup screens** → methods (`POST /api/methods`), expense menu (`POST /api/expenses`), loans and savings (`POST /api/loans`, `POST /api/savings`). Each lands as a row in Supabase. Cash and Account rows are created with the first setup save. The last step lands on Home.
3. **Home** → `GET /api/home` returns the open day's date, per-method balances (opening − today's logs), and today's logs.
4. **Add log** → pick expense, amount, method, optional note → `POST /api/logs`. Backend inserts one row and Home refetches; the method's balance drops.
5. **Close day** → React shows `GET /api/close-preview` (calculated per method plus total). You type real balances → `POST /api/close-day` with `{method_id: real}`.
6. **Gate** → backend compares. Any difference ≠ 0: responds `409` with a per-method difference list, nothing saved, React marks those methods red. All equal: it writes one `days` row (date plus closing snapshot), and the open day moves to the next date. Home resets to an empty day.
7. **Retry** → add or edit logs for the open day, close again. Repeat until every difference is 0.
8. **History** → `GET /api/days` lists closed days; tapping one calls `GET /api/days/{date}` for logs plus closing balances. Closed days are read-only.

## Stack
| Layer | Choice | Docs |
|---|---|---|
| Frontend | React + Vite, JavaScript | https://react.dev, https://vite.dev |
| PWA | vite-plugin-pwa (manifest + service worker) | https://vite-pwa-org.netlify.app |
| Charts | Recharts | https://recharts.org |
| Backend | Python 3.11+, FastAPI, uvicorn | https://fastapi.tiangolo.com |
| DB access | supabase-py (service key, server side only) | https://supabase.com/docs/reference/python |
| Database | Supabase Postgres | https://supabase.com/docs |
| Hosting | Render (backend), Vercel (frontend) | https://render.com/docs, https://vercel.com/docs |
| Tests | pytest (backend balance and gate logic) | https://docs.pytest.org |

Rationale: this is the learner's established stack (React + FastAPI + Supabase), accepted by the learner. Tradeoff accepted: auth is skipped for now. The Supabase service key stays only in backend env vars (git-ignored `.env` locally, Render env in production). Because the API is now on a public URL, see **Decisions and Open Issues** for the open-API risk.

Gemini and Groq free tiers are **not** in the PoC. The AI saving-goal feature is undecided (`prd.md > Deferred From the POC`).

Unverified: exact library versions. Check at build step 1 with current `pip` and `npm` output, then pin them.

## Where It Runs and How Someone Tries It
Runs locally for development, and is deployed: **backend on Render, frontend on Vercel**, database on Supabase (free tiers). The demo video can be recorded from either; the deployed URL also lets others try it.
- Requirements: Python 3.11+, Node 20+, a Supabase project, `backend/.env` with `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`, `frontend/.env` with `VITE_API_URL=http://localhost:8000`.
- One-time: run `backend/schema.sql` in the Supabase SQL editor.
- Start backend: `cd backend && uvicorn app.main:app --reload`
- Start frontend: `cd frontend && npm run dev`, then open `http://localhost:5173`. For the recording, use the browser's phone-width device mode.
- Deploy backend (Render web service, root `backend`): build `pip install -r requirements.txt`, start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`; env vars `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `ALLOWED_ORIGIN` (the Vercel URL). Docs: https://render.com/docs/deploy-fastapi
- Deploy frontend (Vercel project, root `frontend`, Vite preset): env var `VITE_API_URL` = the Render URL. Docs: https://vercel.com/docs/frameworks/vite
- Render free services sleep after inactivity and take ~30–60 s to wake; open the app once before recording.
- Demo recording: onboarding, log a few spends, close a day with a deliberate mismatch (blocked), fix, close successfully, show History.
- Submission needs the demo video and a public GitHub repo. Deployment (above) is extra and does not replace either. `.env` files stay out of the repo, with `.env.example` committed instead.

## Look and Feel
PRD ref: `prd.md > Look and Feel`.
- Dark background (near-black, not pure black), one green accent for "matched", red for "mismatch". Muted grays elsewhere.
- Clean sans-serif (Inter via system fallback), large tabular numerals for money.
- Dense but calm, bank-statement feel. No rounded bright cards or habit-tracker styling. Straight-ish corners (4–6px radius).
- Plain CSS with CSS variables in `frontend/src/styles.css`; no UI kit, so the look stays deliberate.
- **Themes:** dark is the default look; a light "paper" theme is available from a sun/moon icon in the header. The first visit follows the system setting and the choice is remembered in the browser. Charts read the same CSS variables.
- **Navigation:** a bottom tab bar with icons (Home, History, Charts, Savings, Loans).
- **Edit:** tapping a log's pencil icon opens a modal (`frontend/src/components/Modal.jsx`; a bottom sheet on phones, centered on desktop) with only the fields for that log's kind, so a spend, an income and a transfer each edit as themselves. Escape or tapping outside closes it. Add log stays inline on Home.
- **Dropdowns:** a themed `Select` component (`frontend/src/components/Select.jsx`) replaces the native `<select>`, whose popup cannot follow the theme. It supports keyboard use (arrows, Enter, Escape).
- **Statement style:** Home shows a large total, ruled rows per method and a ledger of today's logs with pencil and bin icons; amounts use monospace tabular figures.
- **Loading:** skeleton placeholders shaped like each screen. After 5 seconds they add a "Waking the server" note for the Render cold start.
- Copy is short and factual ("Difference: -250").
- Phone-first layout, centered max-width column on desktop.

## Components

### Backend: Balance Engine
Pure functions: `opening(...)`, `calculated(...)`, `differences(...)` in `balances.py`; the route code fetches rows and passes them in. Independent Supabase reads run concurrently (`par`), and `db.py` gives each thread its own client. Opening = latest closed day's real balance per method, or the method's onboarding balance if none. Calculated = opening, minus the day's spends, plus its income, with transfers moving money between two methods. Methods have no negative-balance rule.
PRD ref: `prd.md > Daily Logs`, `prd.md > History` (next day's opening = previous real).

### Backend: Day-Close Gate
`POST /api/close-day`. Validates the date is the open day, computes calculated, compares to submitted real values per method (exact decimal equality), and returns `409` plus differences, or saves a `days` row. This is the kernel and gets the pytest coverage.
PRD ref: `prd.md > Day-Close Reconciliation`.

### Backend: CRUD Routes
Methods, expenses, logs of any kind — spend, income, transfer (create, edit, delete — open day only), loans, savings, goal. `LogIn` in `schemas.py` validates the shape for each kind. Edit or delete of a log in a closed day returns `403`.
PRD ref: `prd.md > Onboarding`, `prd.md > Daily Logs`, `prd.md > Loans`, `prd.md > Savings and Saving Goals`.

### Backend: Reports
`GET /api/charts/spend` returns spend grouped by expense and by method, over closed and open days. `GET /api/charts/cashflow` returns income and spend per month, income by source, and the income, spend and net totals (spend = expenses only; transfers count as neither). `GET /api/days`, `GET /api/days/{date}` serve History.
PRD ref: `prd.md > Charts of Usage`, `prd.md > History`.

### Frontend: Onboarding
Welcome, Methods, Expenses, Loans and Savings screens, stepped. Shown only while the backend reports no setup. Home is unreachable until it finishes.
PRD ref: `prd.md > Onboarding`, `prd.md > States and Boundaries` (First use).

### Frontend: Home and Add Log
Total and per-method balances, today's log list with edit and delete icons (income in green with +, transfers shown as `From → To`), Add log form with a Spend / Income / Transfer switch, Close day button, and the bottom tab bar. (The planned tap-the-strip → Settings screen was not built; see What Was Simplified.) If the open day is earlier than today, it shows a "Catching up: <date>" label.
PRD ref: `prd.md > Daily Logs`, `prd.md > Screens and Layout`.

### Frontend: Close Day
Calculated per method plus total, input for real balances, red difference markers on mismatch, green when matched.
PRD ref: `prd.md > Day-Close Reconciliation`.

### Frontend: History
List of closed days (newest first), empty message when none; detail view with logs and closing balances.
PRD ref: `prd.md > History`.

### Frontend: Charts, Savings and Goals, Loans
Recharts pie and bar for spend and income (an overview, income vs spend by month, income by source); line or bar for savings growth and goal progress; pie or bar for loan remaining. A goal has a purpose, amount, and daily threshold; Home shows today's non-essential spend against the threshold.
PRD ref: `prd.md > Charts of Usage`, `prd.md > Savings and Saving Goals`, `prd.md > Loans`.

### Frontend: PWA Shell
Web manifest and service worker via vite-plugin-pwa so it is installable. The service worker caches the app shell only; data is always fetched live.
PRD ref: `prd.md > Look and Feel` (PWA).

## Data Model
Money is `numeric(12,2)` in Postgres and `Decimal` in Python, never float; JSON carries it as a string. Amounts go in and out with exactly two decimal places (prices converted from another currency, such as 1234.98, are stored exactly): the `Money` types in `schemas.py` reject a third decimal with 422 instead of rounding, every response formats money with `balances.fmt2`, and the frontend `MoneyInput` component flags more than two decimals as the person types. Currency is not hardcoded.

| Table | Columns | Notes |
|---|---|---|
| `payment_methods` | id, name, kind (`cash`/`account`/`custom`), opening_balance, created_at | Cash and Account created in onboarding; the rest user-added |
| `expenses` | id, name, kind (`daily`/`monthly`), essential (bool) | A menu. Any entry can be picked any time. `essential` drives the non-essential daily threshold. |
| `logs` | id, day (date), kind (`spend`/`income`/`transfer`), method_id, to_method_id, amount, description, expense_id / loan_id / saving_id | `spend`: exactly one of expense/loan/saving is set (a loan payment or saving deposit is a spend that names its loan or saving). `income`: no target; `description` is the source (e.g. Salary); adds to `method_id`, which must be Cash or Account (the log route returns 422 for a `custom` method). `transfer`: no target; moves `amount` from `method_id` to `to_method_id` (a different method). A CHECK (`logs_shape`) enforces this. `backend/migrations/002_income_transfer.sql` upgrades an existing database. |
| `loans` | id, name, total | Remaining = total − sum(logs for the loan) |
| `savings` | id, name, starting_amount | Total = starting + sum(logs for the saving) |
| `goal` | id (single row), purpose, goal_amount, daily_threshold | One goal in the PoC |
| `days` | day (date, PK), closed_at, closing (jsonb: method_id → {calculated, real}) | One row per closed day. Single insert, so the close is atomic. |
| `settings` | id (single row), start_date | Set at onboarding; first open day |

Open day = day after the latest `days.day`, or `settings.start_date` if none. Logs may only target the open day. Data lives in Supabase and persists across sessions; the app keeps nothing offline.

## File Structure
```
netSum/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, router mounting
│   │   ├── db.py            # Supabase client from env vars
│   │   ├── balances.py      # Balance Engine (pure functions)
│   │   ├── routes/
│   │   │   ├── setup.py     # methods, expenses, loans, savings, goal
│   │   │   ├── logs.py      # log create/edit/delete (open day only)
│   │   │   ├── days.py      # home, close-preview, close-day, history
│   │   │   └── charts.py    # spend aggregates
│   │   └── schemas.py       # Pydantic request/response models
│   ├── tests/
│   │   └── test_close_gate.py  # gate: match closes, mismatch blocks, opening chain
│   ├── schema.sql           # run once in Supabase SQL editor (fresh install)
│   ├── migrations/          # 002_income_transfer.sql for databases created before income/transfer
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── main.jsx, App.jsx    # theme toggle and onboarding flow (no router; Home switches views by tab)
│   │   ├── api.js               # fetch wrapper for the backend
│   │   ├── styles.css           # dark theme variables and base styles
│   │   ├── components/Loading.jsx, Select.jsx, Modal.jsx  # skeleton loaders, themed dropdown, edit dialog
│   │   └── pages/
│   │       ├── onboarding/      # Welcome, Methods, Expenses, LoansSavings
│   │       ├── Home.jsx, AddLog.jsx, CloseDay.jsx
│   │       ├── History.jsx, Charts.jsx
│   │       └── Savings.jsx, Loans.jsx
│   ├── index.html
│   ├── vite.config.js           # includes vite-plugin-pwa
│   └── .env.example
├── devpost/                 # Devpost learning workspace (profile, scope, prd, spec, checklist)
├── CLAUDE.md                # Claude Code project rules (see Decisions)
├── .gitignore               # includes .env, node_modules, __pycache__
└── README.md                # run instructions for reviewers
```

## External Services and Dependencies
**Supabase (free tier).** Used only from the backend via supabase-py with the service key: `client.table("logs").insert({...}).execute()`, `.select(...).eq(...)`. RLS is off in the PoC (single user, key never reaches the browser). Docs: https://supabase.com/docs/reference/python. Free-tier limit to be aware of: projects pause after a week of inactivity; unpause from the dashboard before recording.

**Gemini / Groq.** Not used in the PoC.

No other services.

## Important Failure Modes
- **Mismatch at close** (the intended case) → the method is highlighted with its difference, the day stays open, and nothing is written.
- **Render asleep (cold start) / Supabase paused** → first request is slow or fails; React shows a loading state then the banner below. Wake both before the demo.
- **Backend or Supabase unreachable / paused** → React shows a plain "Can't reach server" banner and keeps the form values; no silent failure.
- **Closed day edit attempt** → backend returns `403` and the UI shows closed days with no edit controls.
- **Concurrent requests on one connection** → parallel reads that shared a single Supabase client returned 500 (`ConnectionTerminated`). Fixed with one client per thread in `db.py`; checked with 90 simultaneous requests.
- **Decimal drift** → all money is `Decimal`/`numeric` and strings in JSON; the gate compares exact values and has a test with 0.10 + 0.20.
- **A third decimal typed or sent** → rejected with 422 (and flagged red in the form) so a value is never silently rounded before it reaches the gate.

## What Was Simplified and Why
- **No login, single owner** instead of Supabase Auth with per-user rules — auth does not prove the kernel. Multi-user adds a user_id column and RLS later.
- **Balances calculated, not stored** instead of cached running totals — avoids drift bugs. Fine at one person's data volume; add a cache only if queries get slow.
- **Closed days read-only** instead of editable history — editing would cascade through every later opening balance.
- **Logs only on the open day** — the PRD's backdated entry works by the open day being the oldest unclosed date, so there is no date picker and no out-of-order closing.
- **Single goal** instead of multiple goals.
- **Free-tier hosting, no custom domain, no CI** — push to deploy only.
- **No Settings screen** — payment methods can only be set during onboarding; managing them later is a follow-up.
- **Income has a free-text source** instead of a managed income list, and money borrowed (a loan received) is not modelled; both can come later.
- **No router** — Home swaps views by tab with component state, which is enough for five screens.
- **Reminders, networking, bill sharing, AI feature** stay deferred (`prd.md > Deferred From the POC`).

## Decisions and Open Issues
Learner decisions:
- **Stack:** React + FastAPI + Supabase; Gemini/Groq only if an AI piece is added later.
- **Single user, no login (skipped for now); FastAPI owns the rules.** Accepted.
- **Deployment:** backend on Render, frontend on Vercel.
- **Closed days are read-only.**
- **Expenses are a menu** pickable at any time; no monthly pre-fill (an end-of-month internet bill is just picked when it arrives).
- **Loan payments and savings deposits are normal logs** that reduce a payment method and so pass through the gate.
- **Income and transfers are logs too** (added after the first build, when the gate blocked a salary that raised a real balance): income adds to one method, a transfer moves money between two, so both pass through the gate.

Implementation details derived from these (not separate learner choices): the `days.closing` jsonb snapshot, the `essential` flag for the threshold, Recharts, plain-CSS theming, and the open-day rule.

**Learner uncertainty:** how to set up the repo for Claude Code (CLAUDE.md and the other `.md` files). Clarified here: `CLAUDE.md` at the repo root is read by Claude Code at the start of each session. It holds the run and test commands, conventions (money is `Decimal`; the gate lives only in `balances.py` and `days.py`; closed days are read-only), and pointers to `devpost/prd.md` and `devpost/spec.md`. `5-build` will write it in step 1 and keep progress in `devpost/checklist.md`. Check during the build: start a fresh Claude Code session and confirm it follows a rule from `CLAUDE.md` without being told.

Open:
- **Public API, no accounts:** no API key for the hackathon MVP; add a shared-secret header check only if needed later.
- Library versions to pin at build step 1.
- Whether the open day shows tomorrow's date right after you close tonight (current design: yes, it is simply the next date). Adjust in the build if it feels odd.
- Currency symbol/format (shown as plain numbers for now).
