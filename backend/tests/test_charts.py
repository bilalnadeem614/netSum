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
