from decimal import Decimal

from app.balances import calculated


def test_logs_reduce_their_method_only():
    opening = {1: "100.00", 2: "250.00"}
    logs = [{"method_id": 1, "amount": "30.10"}, {"method_id": 1, "amount": "0.20"}]
    assert calculated(opening, logs) == {1: Decimal("69.70"), 2: Decimal("250.00")}


def test_no_logs_is_opening():
    assert calculated({1: 5.5}, []) == {1: Decimal("5.5")}


def test_loan_and_saving_logs_reduce_method_like_any_log():
    logs = [{"method_id": 1, "amount": "200", "loan_id": 9}, {"method_id": 1, "amount": "50", "saving_id": 3}]
    assert calculated({1: "1000"}, logs) == {1: Decimal("750")}


def test_non_essential_spend_counts_only_flagged_expenses():
    from app.balances import non_essential_spend

    logs = [
        {"amount": "60", "expenses": {"essential": False}},
        {"amount": "40", "expenses": {"essential": True}},
        {"amount": "10", "expenses": None},
    ]
    assert non_essential_spend(logs) == Decimal("60")


def test_income_adds_to_its_method():
    logs = [{"kind": "income", "method_id": 2, "amount": "5000"}]
    assert calculated({1: "100", 2: "250"}, logs) == {1: Decimal("100"), 2: Decimal("5250")}


def test_transfer_moves_money_and_keeps_the_total():
    logs = [{"kind": "transfer", "method_id": 2, "to_method_id": 1, "amount": "300"}]
    out = calculated({1: "100", 2: "1000"}, logs)
    assert out == {1: Decimal("400"), 2: Decimal("700")}
    assert sum(out.values()) == Decimal("1100")
