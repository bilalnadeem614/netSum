import os
import threading

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

_local = threading.local()


def db():
    # one client (and HTTP/2 connection) per thread: a shared one breaks under concurrent requests
    if not hasattr(_local, "client"):
        _local.client = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])
    return _local.client
