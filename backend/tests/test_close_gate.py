from decimal import Decimal as D

from app.balances import calculated, differences, opening

METHODS = [{"id": 1, "opening_balance": "100.00"}, {"id": 2, "opening_balance": "50.00"}]


def test_match_has_no_differences():
    calc = calculated(opening(METHODS, None), [{"method_id": 1, "amount": "30"}])
    assert differences(calc, {1: D("70"), 2: D("50")}) == {}


def test_mismatch_reports_difference_per_method():
    calc = calculated(opening(METHODS, None), [{"method_id": 1, "amount": "30"}])
    assert differences(calc, {1: D("45"), 2: D("50")}) == {1: D("-25")}


def test_decimal_exactness():
    calc = calculated({1: "1.00"}, [{"method_id": 1, "amount": "0.10"}, {"method_id": 1, "amount": "0.20"}])
    assert differences(calc, {1: D("0.70")}) == {}


def test_next_day_opens_at_previous_real_balance():
    closing = {"1": {"calculated": "70.00", "real": "70.00"}}
    assert opening(METHODS, closing) == {1: D("70.00"), 2: D("50.00")}
