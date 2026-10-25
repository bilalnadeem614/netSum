from datetime import date, timedelta
from decimal import Decimal

from .db import db


def methods():
    return db().table("payment_methods").select("*").order("id").execute().data


def last_closed():
    rows = db().table("days").select("*").order("day", desc=True).limit(1).execute().data
    return rows[0] if rows else None


def open_day():
    last = last_closed()
    if last:
        return str(date.fromisoformat(last["day"]) + timedelta(days=1))
    s = db().table("settings").select("start_date").execute().data
    return s[0]["start_date"] if s else str(date.today())


def opening(method_rows, closing):
    """method_id -> previous closed day's real balance, else the onboarding balance. Pure."""
    closing = closing or {}
    return {
        m["id"]: Decimal(str(closing[str(m["id"])]["real"] if str(m["id"]) in closing else m["opening_balance"]))
        for m in method_rows
    }


def calculated(opening_bal, logs):
    """method_id -> opening balance minus that method's logs. Pure."""
    out = {m: Decimal(str(v)) for m, v in opening_bal.items()}
    for log in logs:
        out[log["method_id"]] -= Decimal(str(log["amount"]))
    return out


def differences(calc, real):
    """method_id -> real minus calculated, only where they differ. Exact Decimal compare. Pure."""
    return {m: real[m] - c for m, c in calc.items() if real[m] != c}


def day_logs(day):
    return db().table("logs").select("*, expenses(name)").eq("day", day).order("id").execute().data


def calculated_balances(day):
    last = last_closed()
    return calculated(opening(methods(), last and last["closing"]), day_logs(day))
