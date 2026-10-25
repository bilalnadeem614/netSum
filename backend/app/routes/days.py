from decimal import Decimal

from fastapi import APIRouter, HTTPException

from .. import balances
from ..db import db
from ..schemas import CloseIn

router = APIRouter()


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
        "logs": [
            {
                "id": l["id"], "method_id": l["method_id"], "expense_id": l["expense_id"],
                "expense": l["expenses"]["name"] if l["expenses"] else None,
                "amount": f"{Decimal(str(l['amount'])):.2f}", "description": l["description"],
            }
            for l in logs
        ],
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
