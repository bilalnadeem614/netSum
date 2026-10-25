from datetime import date

from fastapi import APIRouter, HTTPException

from ..db import db
from ..schemas import MethodIn

router = APIRouter()


@router.get("/state")
def state():
    return {"setup_done": bool(db().table("payment_methods").select("id").limit(1).execute().data)}


@router.post("/methods")
def add_methods(items: list[MethodIn]):
    if not items:
        raise HTTPException(422, "no methods")
    db().table("settings").upsert({"id": 1, "start_date": str(date.today())}, ignore_duplicates=True).execute()
    rows = [{**m.model_dump(mode="json")} for m in items]
    return db().table("payment_methods").insert(rows).execute().data
