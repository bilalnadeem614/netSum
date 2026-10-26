from decimal import Decimal

from fastapi import APIRouter

from ..db import db

router = APIRouter()


def spend_totals(logs):
    """Group expense logs by expense name and by method name. Pure."""
    by_expense, by_method = {}, {}
    for l in logs:
        amt = Decimal(str(l["amount"]))
        by_expense[l["expenses"]["name"]] = by_expense.get(l["expenses"]["name"], Decimal(0)) + amt
        by_method[l["payment_methods"]["name"]] = by_method.get(l["payment_methods"]["name"], Decimal(0)) + amt
    fmt = lambda d: [{"name": k, "total": f"{v:.2f}"} for k, v in d.items()]
    return {"by_expense": fmt(by_expense), "by_method": fmt(by_method)}


@router.get("/charts/spend")
def spend():
    logs = (
        db().table("logs").select("amount, expenses(name), payment_methods!method_id(name)")
        .not_.is_("expense_id", "null").execute().data
    )
    return spend_totals(logs)


def cashflow(logs):
    """Income and spend per month, plus income by source. Spend = expenses only; transfers count as neither. Pure."""
    months, sources = {}, {}
    inc_total = spend_total = Decimal(0)
    for l in logs:
        amt, month = Decimal(str(l["amount"])), l["day"][:7]
        if l["kind"] == "income":
            months.setdefault(month, [Decimal(0), Decimal(0)])[0] += amt
            sources[l["description"]] = sources.get(l["description"], Decimal(0)) + amt
            inc_total += amt
        elif l["kind"] == "spend" and l["expense_id"] is not None:
            months.setdefault(month, [Decimal(0), Decimal(0)])[1] += amt
            spend_total += amt
    return {
        "months": [{"month": m, "income": f"{i:.2f}", "spend": f"{s:.2f}"} for m, (i, s) in sorted(months.items())],
        "by_source": [{"name": k, "total": f"{v:.2f}"} for k, v in sorted(sources.items(), key=lambda kv: -kv[1])],
        "income_total": f"{inc_total:.2f}",
        "spend_total": f"{spend_total:.2f}",
        "net": f"{inc_total - spend_total:.2f}",
    }


@router.get("/charts/cashflow")
def cashflow_route():
    return cashflow(db().table("logs").select("kind, day, amount, description, expense_id").execute().data)
