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


@router.post("/logs")
def add_log(item: LogIn):
    row = {**item.model_dump(mode="json"), "day": balances.open_day()}
    return db().table("logs").insert(row).execute().data[0]


@router.put("/logs/{log_id}")
def edit_log(log_id: int, item: LogIn):
    _open_log(log_id)
    return db().table("logs").update(item.model_dump(mode="json")).eq("id", log_id).execute().data[0]


@router.delete("/logs/{log_id}")
def delete_log(log_id: int):
    _open_log(log_id)
    db().table("logs").delete().eq("id", log_id).execute()
    return {"ok": True}
