from decimal import Decimal

from fastapi import APIRouter

from .. import balances
from ..db import db

router = APIRouter()


@router.get("/home")
def home():
    day = balances.open_day()
    logs = balances.day_logs(day)
    opening = {m["id"]: m["opening_balance"] for m in balances.methods()}
    calc = balances.calculated(opening, logs)
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
