# netSum

Personal finance PWA. Day cannot close until real balance equals calculated balance per payment method (the kernel).
Plans: `devpost/scope.md`, `devpost/prd.md`, `devpost/spec.md`. Build progress: `devpost/checklist.md`.

## Required plugins (always use)
- **caveman** — terse replies (code, commits, security notes written normally).
- **ponytail** — laziest working solution; stdlib/native first, no speculative abstractions.
- **graphify** — use `/graphify` for codebase questions; check `graphify-out/` first if it exists.

## Python environment
- Conda env `netsum` (Python 3.11). Never use base or system pip.
- Activate: `conda activate netsum`. In scripts call `~/miniconda3/envs/netsum/bin/python -m ...` (`conda run` fell back to base python).
- All Python libraries go in `backend/requirements.txt`; install new ones into `netsum` and add them there.

## Commands
- Backend: `cd backend && ~/miniconda3/envs/netsum/bin/python -m uvicorn app.main:app --reload`
- Tests: `cd backend && ~/miniconda3/envs/netsum/bin/python -m pytest`
- Frontend: `cd frontend && npm run dev`

## Rules
- Money is `Decimal` in Python, `numeric(12,2)` in Postgres, string in JSON. Never float.
- Money in: at most 2 decimal places and 12 digits, enforced by the `Money` types in `backend/app/schemas.py` (extra decimals are rejected with 422, never rounded). Money out: always a 2-decimal string via `balances.fmt2`. The frontend uses `MoneyInput` for every amount field.
- Day-close gate lives only in `backend/app/balances.py` and `backend/app/routes/days.py`.
- Closed days are read-only (403 on edit).
- Secrets only in git-ignored `.env`; commit `.env.example`.
- Git: **never commit and never push**. The user does all commits and pushes. Leave changes uncommitted.
