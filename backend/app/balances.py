from concurrent.futures import ThreadPoolExecutor
from datetime import date, timedelta
from decimal import Decimal

from .db import db

_pool = ThreadPoolExecutor(max_workers=10)


def par(*fns):
    """Run independent DB reads concurrently; Supabase latency dominates, not CPU."""
    return [f.result() for f in [_pool.submit(fn) for fn in fns]]


def _rows(table, cols="*", order="id"):
    return db().table(table).select(cols).order(order).execute().data


def methods():
    return _rows("payment_methods")


def last_closed():
    rows = db().table("days").select("*").order("day", desc=True).limit(1).execute().data
    return rows[0] if rows else None


def settings():
    return db().table("settings").select("start_date").execute().data


def _open_day(last, settings_rows):
    if last:
        return str(date.fromisoformat(last["day"]) + timedelta(days=1))
    return settings_rows[0]["start_date"] if settings_rows else str(date.today())


def open_day():
    return _open_day(*par(last_closed, settings))


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
    return (
        db().table("logs").select("*, expenses(name, essential), loans(name), savings(name)")
        .eq("day", day).order("id").execute().data
    )


def day_state(day):
    """(methods, calculated balances, logs) for a day, fetched concurrently."""
    ms, last, logs = par(methods, last_closed, lambda: day_logs(day))
    return ms, calculated(opening(ms, last and last["closing"]), logs), logs


def calculated_balances(day):
    return day_state(day)[1]


def non_essential_spend(logs):
    """Sum of the day's logs whose expense is flagged non-essential. Pure."""
    return sum(
        (Decimal(str(l["amount"])) for l in logs if l["expenses"] and not l["expenses"]["essential"]),
        Decimal(0),
    )


def _logs_with(col):
    return db().table("logs").select(f"{col}, day, amount").not_.is_(col, "null").order("day").execute().data


def loans_remaining(loans, loan_logs):
    """Pure: loan rows + their payment logs -> total/paid/remaining."""
    paid = {}
    for l in loan_logs:
        paid[l["loan_id"]] = paid.get(l["loan_id"], Decimal(0)) + Decimal(str(l["amount"]))
    out = []
    for loan in loans:
        total, p = Decimal(str(loan["total"])), paid.get(loan["id"], Decimal(0))
        out.append({**loan, "total": f"{total:.2f}", "paid": f"{p:.2f}", "remaining": f"{total - p:.2f}"})
    return out


def savings_totals(savings, saving_logs):
    """Pure: saving rows + their deposit logs (sorted by day) -> total and growth series."""
    by_saving = {}
    for l in saving_logs:
        by_saving.setdefault(l["saving_id"], []).append(l)
    out = []
    for sv in savings:
        total = Decimal(str(sv["starting_amount"]))
        series = [{"day": "start", "total": f"{total:.2f}"}]
        for l in by_saving.get(sv["id"], []):
            total += Decimal(str(l["amount"]))
            if series[-1]["day"] == l["day"]:
                series[-1]["total"] = f"{total:.2f}"
            else:
                series.append({"day": l["day"], "total": f"{total:.2f}"})
        out.append({**sv, "starting_amount": f"{Decimal(str(sv['starting_amount'])):.2f}", "total": f"{total:.2f}", "series": series})
    return out


def goal_progress(goal_rows, savings_out):
    if not goal_rows:
        return None
    g = goal_rows[0]
    saved = sum((Decimal(s["total"]) for s in savings_out), Decimal(0))
    return {
        "purpose": g["purpose"],
        "goal_amount": f"{Decimal(str(g['goal_amount'])):.2f}",
        "daily_threshold": f"{Decimal(str(g['daily_threshold'])):.2f}",
        "saved": f"{saved:.2f}",
    }


def _loans_rows():
    return _rows("loans")


def _savings_rows():
    return _rows("savings")


def _goal_rows():
    return db().table("goal").select("*").execute().data


def loans_with_remaining():
    return loans_remaining(*par(_loans_rows, lambda: _logs_with("loan_id")))


def savings_with_totals():
    return savings_totals(*par(_savings_rows, lambda: _logs_with("saving_id")))


def goal_with_progress():
    goal_rows, sv = par(_goal_rows, savings_with_totals)
    return goal_progress(goal_rows, sv)
