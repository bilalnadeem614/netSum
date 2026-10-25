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
