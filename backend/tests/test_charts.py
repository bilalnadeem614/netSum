from app.routes.charts import spend_totals


def test_spend_grouped_by_expense_and_method():
    logs = [
        {"amount": "10", "expenses": {"name": "Lunch"}, "payment_methods": {"name": "Cash"}},
        {"amount": "5.50", "expenses": {"name": "Lunch"}, "payment_methods": {"name": "Account"}},
        {"amount": "2", "expenses": {"name": "Bus"}, "payment_methods": {"name": "Cash"}},
    ]
    out = spend_totals(logs)
    assert out["by_expense"] == [{"name": "Lunch", "total": "15.50"}, {"name": "Bus", "total": "2.00"}]
    assert out["by_method"] == [{"name": "Cash", "total": "12.00"}, {"name": "Account", "total": "5.50"}]


def test_cashflow_groups_income_and_spend_by_month_and_source():
    from app.routes.charts import cashflow

    logs = [
        {"kind": "income", "day": "2026-09-30", "amount": "5000", "description": "Salary", "expense_id": None},
        {"kind": "income", "day": "2026-10-05", "amount": "200", "description": "Ali", "expense_id": None},
        {"kind": "income", "day": "2026-10-28", "amount": "5000", "description": "Salary", "expense_id": None},
        {"kind": "spend", "day": "2026-10-06", "amount": "150.50", "description": None, "expense_id": 1},
        {"kind": "spend", "day": "2026-10-07", "amount": "400", "description": None, "expense_id": None},  # loan/saving
        {"kind": "transfer", "day": "2026-10-08", "amount": "300", "description": None, "expense_id": None},
    ]
    out = cashflow(logs)
    assert out["months"] == [
        {"month": "2026-09", "income": "5000.00", "spend": "0.00"},
        {"month": "2026-10", "income": "5200.00", "spend": "150.50"},
    ]
    assert out["by_source"] == [{"name": "Salary", "total": "10000.00"}, {"name": "Ali", "total": "200.00"}]
    assert (out["income_total"], out["spend_total"], out["net"]) == ("10200.00", "150.50", "10049.50")
