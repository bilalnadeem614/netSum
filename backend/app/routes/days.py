from decimal import Decimal

from fastapi import APIRouter, HTTPException

from .. import balances
from ..db import db
from ..schemas import CloseIn

router = APIRouter()


def _log_out(l):
    return {
        "id": l["id"], "method_id": l["method_id"], "expense_id": l["expense_id"],
        "expense": l["expenses"]["name"] if l["expenses"] else None,
        "amount": f"{Decimal(str(l['amount'])):.2f}", "description": l["description"],
    }


@router.get("/home")
def home():
    day = balances.open_day()
    logs = balances.day_logs(day)
    calc = balances.calculated_balances(day)
    return {
        "day": day,
        "balances": [
            {"id": m["id"], "name": m["name"], "kind": m["kind"], "balance": f"{calc[m['id']]:.2f}"}
            for m in balances.methods()
        ],
        "logs": [_log_out(l) for l in logs],
        "expenses": db().table("expenses").select("*").order("id").execute().data,
    }


@router.get("/close-preview")
def close_preview():
    calc = balances.calculated_balances(balances.open_day())
    return {
        "day": balances.open_day(),
        "methods": [
            {"id": m["id"], "name": m["name"], "calculated": f"{calc[m['id']]:.2f}"}
            for m in balances.methods()
        ],
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
    rows = db().table("days").select("*").eq("day", day).execute().data
    if not rows:
        raise HTTPException(404, "day not closed")
    closing = rows[0]["closing"]
    return {
        "day": day,
        "logs": [_log_out(l) for l in balances.day_logs(day)],
        "closing": [
            {"id": m["id"], "name": m["name"], **closing[str(m["id"])]}
            for m in balances.methods() if str(m["id"]) in closing
        ],
    }
