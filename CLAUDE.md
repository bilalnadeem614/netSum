# netSum

Personal finance PWA. Day cannot close until real balance equals calculated balance per payment method (the kernel).
Plans: `devpost/scope.md`, `devpost/prd.md`, `devpost/spec.md`. Build progress: `devpost/checklist.md`.

## Required plugins (always use)
- **caveman** — terse replies (code, commits, security notes written normally).
- **ponytail** — laziest working solution; stdlib/native first, no speculative abstractions.
- **graphify** — use `/graphify` for codebase questions; check `graphify-out/` first if it exists.

## Python environment
- Conda env `netsum` (Python 3.11). Never use base or system pip.
- Activate: `conda activate netsum`. One-off: `conda run -n netsum <cmd>`.
- All Python libraries go in `backend/requirements.txt`; install new ones into `netsum` and add them there.

## Commands
- Backend: `cd backend && conda run -n netsum uvicorn app.main:app --reload`
- Tests: `cd backend && conda run -n netsum pytest`
- Frontend: `cd frontend && npm run dev`

## Rules
- Money is `Decimal` in Python, `numeric(12,2)` in Postgres, string in JSON. Never float.
- Day-close gate lives only in `backend/app/balances.py` and `backend/app/routes/days.py`.
- Closed days are read-only (403 on edit).
- Secrets only in git-ignored `.env`; commit `.env.example`.
- Git: commit locally after each verified slice. **Never push**; the user pushes.
