from datetime import date
from decimal import Decimal

from .db import db


def methods():
    return db().table("payment_methods").select("*").order("id").execute().data


def open_day():
    # ponytail: no closed days yet; slice 3 makes this the day after the latest closed one
    s = db().table("settings").select("start_date").execute().data
    return s[0]["start_date"] if s else str(date.today())


def calculated(opening, logs):
    """method_id -> opening balance minus that method's logs. Pure."""
    out = {m: Decimal(str(v)) for m, v in opening.items()}
    for log in logs:
        out[log["method_id"]] -= Decimal(str(log["amount"]))
    return out


def day_logs(day):
    return (
        db().table("logs").select("*, expenses(name)").eq("day", day).order("id").execute().data
    )


def calculated_balances(day):
    opening = {m["id"]: m["opening_balance"] for m in methods()}
    return calculated(opening, day_logs(day))
