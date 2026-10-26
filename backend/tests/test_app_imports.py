import os

os.environ.update(SUPABASE_URL="http://x", SUPABASE_SERVICE_KEY="x")


def test_app_and_all_routes_import():
    from app.main import app

    paths = set(app.openapi()["paths"])
    assert {"/api/close-day", "/api/logs", "/api/home", "/api/goal", "/api/charts/spend"} <= paths
