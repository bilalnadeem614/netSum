import pytest
from fastapi import HTTPException

from app.routes.logs import income_method_ok


@pytest.mark.parametrize("kind", ["cash", "account"])
def test_income_allowed_in_cash_and_account(kind):
    income_method_ok(kind)


def test_income_rejected_for_custom_method():
    with pytest.raises(HTTPException) as e:
        income_method_ok("custom")
    assert e.value.status_code == 422
