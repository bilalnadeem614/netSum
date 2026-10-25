import os

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .routes import days, setup

load_dotenv()
app = FastAPI()


@app.middleware("http")
async def api_key(request: Request, call_next):
    key = os.environ.get("API_KEY")
    if request.method != "OPTIONS" and key and request.headers.get("X-API-Key") != key:
        return JSONResponse({"detail": "bad api key"}, status_code=401)
    return await call_next(request)


# added last so CORS headers wrap the 401 too
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("ALLOWED_ORIGIN", "http://localhost:5173")],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(setup.router, prefix="/api")
app.include_router(days.router, prefix="/api")
