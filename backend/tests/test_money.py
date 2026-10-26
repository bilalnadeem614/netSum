from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.balances import calculated, fmt2
from app.schemas import CloseIn, GoalIn, LoanIn, LogIn, MethodIn, SavingIn


@pytest.mark.parametrize("amount", ["1234.98", "0.98", "5", "5.5", "99999999.99"])
def test_two_decimals_or_fewer_accepted(amount):
    assert LogIn(kind="income", method_id=1, amount=amount, description="x").amount == Decimal(amount)


@pytest.mark.parametrize("amount", ["12.345", "0.001", "1234.9876"])
def test_more_than_two_decimals_rejected_not_rounded(amount):
    with pytest.raises(ValidationError):
        LogIn(kind="income", method_id=1, amount=amount, description="x")


def test_every_money_field_enforces_two_decimals():
    with pytest.raises(ValidationError):
        MethodIn(name="Cash", kind="cash", opening_balance="1.234")
    with pytest.raises(ValidationError):
        LoanIn(name="Bike", total="10.005")
    with pytest.raises(ValidationError):
        SavingIn(name="Bank", starting_amount="1.999")
    with pytest.raises(ValidationError):
        GoalIn(purpose="x", goal_amount="100.123", daily_threshold="5")
    with pytest.raises(ValidationError):
        GoalIn(purpose="x", goal_amount="100", daily_threshold="5.001")
    with pytest.raises(ValidationError):
        CloseIn(real={1: "10.999"})


def test_too_many_digits_rejected():
    with pytest.raises(ValidationError):
        LogIn(kind="income", method_id=1, amount="1234567890123.45", description="x")  # beyond numeric(12,2)


def test_subscription_style_amounts_stay_exact():
    # e.g. a USD price converted to PKR: .98 must survive every step
    logs = [{"method_id": 1, "amount": "1234.98"}, {"method_id": 1, "amount": "0.98"}]
    assert calculated({1: "5000.00"}, logs) == {1: Decimal("3764.04")}


@pytest.mark.parametrize("raw,out", [(100.1, "100.10"), (250.0, "250.00"), ("1234.98", "1234.98"), (0.1 + 0.2, "0.30"), (3, "3.00")])
def test_fmt2_always_two_decimals(raw, out):
    assert fmt2(raw) == out
