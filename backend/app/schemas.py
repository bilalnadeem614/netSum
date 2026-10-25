from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field


class MethodIn(BaseModel):
    name: str
    kind: Literal["cash", "account", "custom"]
    opening_balance: Decimal


class ExpenseIn(BaseModel):
    name: str
    kind: Literal["daily", "monthly"]
    essential: bool = True


class LogIn(BaseModel):
    method_id: int
    expense_id: int
    amount: Decimal = Field(gt=0)
    description: str | None = None


class CloseIn(BaseModel):
    real: dict[int, Decimal]
