import os
from functools import lru_cache

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()


@lru_cache
def db():
    return create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])
