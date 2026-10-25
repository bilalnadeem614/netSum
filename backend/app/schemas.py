from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field, model_validator


class MethodIn(BaseModel):
    name: str
    kind: Literal["cash", "account", "custom"]
    opening_balance: Decimal


class ExpenseIn(BaseModel):
    name: str
    kind: Literal["daily", "monthly"]
    essential: bool = True


class LoanIn(BaseModel):
    name: str
    total: Decimal = Field(gt=0)


class SavingIn(BaseModel):
    name: str
    starting_amount: Decimal = Field(ge=0, default=0)


class LogIn(BaseModel):
    method_id: int
    expense_id: int | None = None
    loan_id: int | None = None
    saving_id: int | None = None
    amount: Decimal = Field(gt=0)
    description: str | None = None

    @model_validator(mode="after")
    def one_target(self):
        if sum(x is not None for x in (self.expense_id, self.loan_id, self.saving_id)) != 1:
            raise ValueError("pick exactly one of expense, loan, saving")
        return self


class CloseIn(BaseModel):
    real: dict[int, Decimal]
