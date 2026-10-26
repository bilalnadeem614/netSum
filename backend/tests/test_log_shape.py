import pytest
from pydantic import ValidationError

from app.schemas import LogIn


def make(**kw):
    return LogIn(method_id=1, amount="10", **kw)


def test_valid_shapes():
    make(expense_id=3)
    make(kind="income", description="Salary")
    make(kind="transfer", to_method_id=2)


@pytest.mark.parametrize("kw", [
    {},                                                    # spend with no target
    {"expense_id": 1, "loan_id": 2},                       # two targets
    {"kind": "income"},                                    # income without a source
    {"kind": "income", "description": "  "},               # blank source
    {"kind": "income", "description": "Pay", "expense_id": 1},
    {"kind": "transfer"},                                  # no destination
    {"kind": "transfer", "to_method_id": 1},               # same method
    {"kind": "transfer", "to_method_id": 2, "loan_id": 1},
])
def test_invalid_shapes(kw):
    with pytest.raises(ValidationError):
        make(**kw)
