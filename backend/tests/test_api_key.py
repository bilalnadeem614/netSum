import os

os.environ.update(API_KEY="k", SUPABASE_URL="http://x", SUPABASE_SERVICE_KEY="x")

from fastapi.testclient import TestClient

from app.main import app

c = TestClient(app)


def test_missing_key_rejected():
    assert c.get("/api/state").status_code == 401


def test_wrong_key_rejected():
    assert c.get("/api/state", headers={"X-API-Key": "no"}).status_code == 401
