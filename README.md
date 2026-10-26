# netSum

A personal finance PWA that tracks money per payment method and won't close a day until the balances you count match the balances it calculates.

Built for the Devpost "Build With AI: Basics" hackathon. It replaces a habit of noting daily transactions in WhatsApp.

## The idea

Each payment method (cash, bank account, a metro card…) has its own balance. You log every spend against a method. At the end of the day you count what you really have and type it in. If any real balance differs from the calculated one, the app shows the difference per method and refuses to close the day until they match. That usually exposes a forgotten transaction.

## Features

- **Onboarding:** opening balances for Cash, Account and any extra methods; a menu of expenses (daily or monthly, essential or not); optional loans and savings.
- **Daily logs:** three kinds. **Spend** (an expense, loan payment or saving deposit, paid from a method), **Income** (salary or money paid back, with its source, added to a method) and **Transfer** (move money between your own methods, such as an ATM withdrawal). Edit or delete while the day is open.
- **Day-close gate:** blocks on any mismatch, shows the difference in red, and saves the day only when every method matches.
- **History:** closed days as read-only statements with their logs and closing balances. Each day opens at the previous day's real balance.
- **Loans and savings:** payments and deposits are normal logs, charted as remaining and growth.
- **Saving goal:** a purpose, a target and a daily limit for non-essential spending, shown on Home.
- **Charts:** spend by expense and by payment method.
- **PWA and UI:** installable; light and dark theme with a sun/moon toggle (follows your system by default); bottom tab bar; skeleton loading screens that explain a slow server wake-up.

## Stack

| Part | Choice |
|---|---|
| Frontend | React, Vite, Recharts, vite-plugin-pwa |
| Backend | Python 3.11, FastAPI, supabase-py |
| Database | Supabase Postgres |
| Hosting | Vercel (frontend), Render (backend) |

Balances are never stored; they are calculated from logs. Money is `Decimal` in Python, `numeric(12,2)` in Postgres, and a string in JSON, never a float. The day-close rule lives only in the backend (`backend/app/balances.py` and `backend/app/routes/days.py`).

## Run it locally

Requirements: Python 3.11+, Node 20+, a free Supabase project.

1. In the Supabase SQL editor, run `backend/schema.sql` once. If your database already exists from before income and transfers, run `backend/migrations/002_income_transfer.sql` instead.
2. Backend:
   ```
   conda create -n netsum python=3.11 && conda activate netsum
   cd backend
   pip install -r requirements.txt
   cp .env.example .env     # set SUPABASE_URL and SUPABASE_SERVICE_KEY
   uvicorn app.main:app --reload
   ```
3. Frontend:
   ```
   cd frontend
   cp .env.example .env     # VITE_API_URL=http://localhost:8000
   npm install
   npm run dev              # http://localhost:5173
   ```
4. Tests: `cd backend && pytest`

To try it on a phone on the same network, set `VITE_API_URL` to your computer's address, set `ALLOWED_ORIGIN` in `backend/.env` to the frontend address, start the backend with `--host 0.0.0.0`, and start the frontend with `npm run dev -- --host`.

## Deploy

- **Order matters on an existing database:** run any new file from `backend/migrations/` in Supabase first, then deploy the backend.
- **Backend (Render web service, root `backend`):** build `pip install -r requirements.txt`, start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Environment: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `ALLOWED_ORIGIN` (the frontend URL, no trailing slash), `PYTHON_VERSION=3.11.17`.
- **Frontend (Vercel, root `frontend`):** environment `VITE_API_URL` set to the Render URL, with no `/api` on the end.

The free Render tier sleeps when idle, so the first request after a pause takes 30 to 60 seconds.

## Known limits

- **No login.** One owner, one set of data. Anyone with the backend URL can read and change it. Real accounts would add a user id to each table and Supabase row-level security.
- Closed days are read-only; there is no editing of history.
- Payment methods are set during onboarding only; there is no Settings screen to change them afterwards.
- Reminders ("I must pay X"), bill sharing and an AI saving-goal feature are not built.

## Project docs

The plans this was built from are in `devpost/` (`scope.md`, `prd.md`, `spec.md`, `checklist.md`). `devpost/app-map.html` is a one-page guide to how the code fits together, and `CLAUDE.md` holds the conventions for working on it with Claude Code.
