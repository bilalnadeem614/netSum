from decimal import Decimal
from typing import Literal

from pydantic import BaseModel


class MethodIn(BaseModel):
    name: str
    kind: Literal["cash", "account", "custom"]
    opening_balance: Decimal
