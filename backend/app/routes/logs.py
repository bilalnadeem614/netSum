from fastapi import APIRouter, HTTPException

from .. import balances
from ..db import db
from ..schemas import LogIn

router = APIRouter()


def _open_log(log_id):
    rows = db().table("logs").select("day").eq("id", log_id).execute().data
    if not rows:
        raise HTTPException(404, "log not found")
    if rows[0]["day"] != balances.open_day():
        raise HTTPException(403, "closed day is read-only")


def income_method_ok(method_kind):
    """Pure: income may only be received into Cash or Account, not a custom method."""
    if method_kind == "custom":
        raise HTTPException(422, "income can only go to Cash or Account")


def _check_income(item):
    if item.kind == "income":
        rows = db().table("payment_methods").select("kind").eq("id", item.method_id).execute().data
        income_method_ok(rows[0]["kind"] if rows else "custom")


@router.post("/logs")
def add_log(item: LogIn):
    _check_income(item)
    row = {**item.model_dump(mode="json"), "day": balances.open_day()}
    saved = db().table("logs").insert(row).execute().data[0]
    return {"id": saved["id"], "amount": balances.fmt2(saved["amount"])}


@router.put("/logs/{log_id}")
def edit_log(log_id: int, item: LogIn):
    _open_log(log_id)
    _check_income(item)
    saved = db().table("logs").update(item.model_dump(mode="json")).eq("id", log_id).execute().data[0]
    return {"id": saved["id"], "amount": balances.fmt2(saved["amount"])}


@router.delete("/logs/{log_id}")
def delete_log(log_id: int):
    _open_log(log_id)
    db().table("logs").delete().eq("id", log_id).execute()
    return {"ok": True}
