import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "The Creator Crew"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("JWT_SECRET", "super-secret-creator-crew-key-change-in-production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./creator_crew.db")

settings = Settings()
