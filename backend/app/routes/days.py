from decimal import Decimal

from fastapi import APIRouter, HTTPException

from .. import balances
from ..db import db
from ..schemas import CloseIn

router = APIRouter()


def _log_out(l):
    return {
        "id": l["id"], "method_id": l["method_id"], "expense_id": l["expense_id"],
        "loan_id": l["loan_id"], "saving_id": l["saving_id"],
        "expense": (l["expenses"] or l["loans"] or l["savings"])["name"],
        "kind": "expense" if l["expense_id"] else "loan" if l["loan_id"] else "saving",
        "amount": f"{Decimal(str(l['amount'])):.2f}", "description": l["description"],
    }


@router.get("/home")
def home():
    ms, last, st, expenses, loans, loan_logs, savings, saving_logs, goal = balances.par(
        balances.methods, balances.last_closed, balances.settings,
        lambda: balances._rows("expenses"), balances._loans_rows, lambda: balances._logs_with("loan_id"),
        balances._savings_rows, lambda: balances._logs_with("saving_id"), balances._goal_rows,
    )
    day = balances._open_day(last, st)
    logs = balances.day_logs(day)
    calc = balances.calculated(balances.opening(ms, last and last["closing"]), logs)
    sv = balances.savings_totals(savings, saving_logs)
    return {
        "day": day,
        "balances": [
            {"id": m["id"], "name": m["name"], "kind": m["kind"], "balance": f"{calc[m['id']]:.2f}"}
            for m in ms
        ],
        "logs": [_log_out(l) for l in logs],
        "expenses": expenses,
        "goal": balances.goal_progress(goal, sv),
        "non_essential_spent": f"{balances.non_essential_spend(logs):.2f}",
        "loans": balances.loans_remaining(loans, loan_logs),
        "savings": sv,
    }


@router.get("/close-preview")
def close_preview():
    day = balances.open_day()
    ms, calc, _ = balances.day_state(day)
    return {
        "day": day,
        "methods": [{"id": m["id"], "name": m["name"], "calculated": f"{calc[m['id']]:.2f}"} for m in ms],
        "total": f"{sum(calc.values()):.2f}",
    }


@router.post("/close-day")
def close_day(body: CloseIn):
    day = balances.open_day()
    calc = balances.calculated_balances(day)
    if set(body.real) != set(calc):
        raise HTTPException(422, "enter a real balance for every method")
    diff = balances.differences(calc, body.real)
    if diff:
        raise HTTPException(409, {"differences": {m: f"{d:.2f}" for m, d in diff.items()}})
    closing = {str(m): {"calculated": f"{calc[m]:.2f}", "real": f"{body.real[m]:.2f}"} for m in calc}
    db().table("days").insert({"day": day, "closing": closing}).execute()
    return {"closed": day}


@router.get("/days")
def days():
    return db().table("days").select("day, closed_at").order("day", desc=True).execute().data


@router.get("/days/{day}")
def day_detail(day: str):
    rows, ms, logs = balances.par(
        lambda: db().table("days").select("*").eq("day", day).execute().data,
        balances.methods, lambda: balances.day_logs(day),
    )
    if not rows:
        raise HTTPException(404, "day not closed")
    closing = rows[0]["closing"]
    return {
        "day": day,
        "logs": [_log_out(l) for l in logs],
        "closing": [
            {"id": m["id"], "name": m["name"], **closing[str(m["id"])]}
            for m in ms if str(m["id"]) in closing
        ],
    }
