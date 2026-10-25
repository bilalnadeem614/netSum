from decimal import Decimal

from .db import db


def methods():
    return db().table("payment_methods").select("*").order("id").execute().data


def calculated_balances(day):
    """method_id -> opening balance minus the day's logs. Slice 1: no logs/closed days yet."""
    # ponytail: opening = onboarding balance until the close gate lands (slice 3)
    return {m["id"]: Decimal(str(m["opening_balance"])) for m in methods()}
