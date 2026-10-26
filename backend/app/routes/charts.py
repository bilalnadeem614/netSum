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
