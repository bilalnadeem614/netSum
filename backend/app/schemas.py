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
    kind: Literal["spend", "income", "transfer"] = "spend"
    method_id: int  # spend: paid from; income: received in; transfer: from
    to_method_id: int | None = None  # transfer only
    expense_id: int | None = None
    loan_id: int | None = None
    saving_id: int | None = None
    amount: Decimal = Field(gt=0)
    description: str | None = None  # spend/transfer: note; income: the source (required)

    @model_validator(mode="after")
    def shape(self):
        targets = sum(x is not None for x in (self.expense_id, self.loan_id, self.saving_id))
        if self.kind == "spend":
            if targets != 1 or self.to_method_id is not None:
                raise ValueError("a spend needs exactly one of expense, loan, saving")
        elif targets or (self.kind == "income" and self.to_method_id is not None):
            raise ValueError(f"{self.kind} cannot name an expense, loan or saving")
        if self.kind == "income" and not (self.description or "").strip():
            raise ValueError("income needs a source")
        if self.kind == "transfer" and (self.to_method_id is None or self.to_method_id == self.method_id):
            raise ValueError("a transfer needs a different destination method")
        return self


class CloseIn(BaseModel):
    real: dict[int, Decimal]


class GoalIn(BaseModel):
    purpose: str
    goal_amount: Decimal = Field(gt=0)
    daily_threshold: Decimal = Field(ge=0)
