from datetime import date

from fastapi import APIRouter

from .. import balances
from ..db import db

router = APIRouter()


@router.get("/home")
def home():
    s = db().table("settings").select("start_date").execute().data
    day = s[0]["start_date"] if s else str(date.today())
    calc = balances.calculated_balances(day)
    return {
        "day": day,
        "balances": [
            {"id": m["id"], "name": m["name"], "kind": m["kind"], "balance": str(calc[m["id"]])}
            for m in balances.methods()
        ],
        "logs": [],
    }
