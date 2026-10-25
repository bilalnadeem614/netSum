# netSum

Personal finance PWA that tracks money per payment method and won't close a day until your real balances match the calculated ones.

Stack: React + Vite (frontend), FastAPI (backend), Supabase Postgres (database).

## Run locally
Requirements: Python 3.11+, Node 20+, a Supabase project.

1. Run `backend/schema.sql` once in the Supabase SQL editor.
2. Backend:
   ```
   conda create -n netsum python=3.11 && conda activate netsum
   cd backend
   pip install -r requirements.txt
   cp .env.example .env        # fill SUPABASE_URL and SUPABASE_SERVICE_KEY
   uvicorn app.main:app --reload
   ```
3. Frontend:
   ```
   cd frontend
   cp .env.example .env        # VITE_API_URL=http://localhost:8000
   npm install
   npm run dev                 # http://localhost:5173
   ```
4. Tests: `cd backend && pytest`

## Deploy
- Backend (Render web service, root `backend`): build `pip install -r requirements.txt`, start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Env: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `ALLOWED_ORIGIN` (the frontend URL, no trailing slash), `PYTHON_VERSION=3.11.17`.
- Frontend (Vercel, root `frontend`): env `VITE_API_URL` = the Render URL (no `/api`).

There is no login: anyone with the backend URL can read and change the data.
