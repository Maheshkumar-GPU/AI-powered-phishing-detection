from pydantic_settings import BaseSettings
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    APP_NAME: str = "PhishGuard AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/data/phishing.db"

    DATASET_PATH: str = r"D:\ml project datasets\phishing\PhiUSIIL_Phishing_URL_Dataset.csv"

    MODEL_PATH: str = str(BASE_DIR / "models" / "phishing_detector.pkl")
    SCALER_PATH: str = str(BASE_DIR / "models" / "scaler.pkl")

    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"

    LOG_PATH: str = str(BASE_DIR / "logs" / "app.log")

    CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
