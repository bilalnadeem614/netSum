from datetime import date

from fastapi import APIRouter, HTTPException

from .. import balances
from ..db import db
from ..schemas import ExpenseIn, LoanIn, MethodIn, SavingIn

router = APIRouter()


def _any(table):
    return bool(db().table(table).select("id").limit(1).execute().data)


@router.get("/state")
def state():
    return {"has_methods": _any("payment_methods"), "has_expenses": _any("expenses")}


@router.post("/methods")
def add_methods(items: list[MethodIn]):
    if not items:
        raise HTTPException(422, "no methods")
    db().table("settings").upsert({"id": 1, "start_date": str(date.today())}, ignore_duplicates=True).execute()
    rows = [m.model_dump(mode="json") for m in items]
    return db().table("payment_methods").insert(rows).execute().data


@router.post("/expenses")
def add_expenses(items: list[ExpenseIn]):
    if not items:
        raise HTTPException(422, "no expenses")
    return db().table("expenses").insert([e.model_dump(mode="json") for e in items]).execute().data


@router.get("/loans")
def loans():
    return balances.loans_with_remaining()


@router.post("/loans")
def add_loans(items: list[LoanIn]):
    db().table("loans").insert([x.model_dump(mode="json") for x in items]).execute()
    return balances.loans_with_remaining()


@router.get("/savings")
def savings():
    return balances.savings_with_totals()


@router.post("/savings")
def add_savings(items: list[SavingIn]):
    db().table("savings").insert([x.model_dump(mode="json") for x in items]).execute()
    return balances.savings_with_totals()
