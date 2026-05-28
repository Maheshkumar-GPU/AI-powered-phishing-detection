import os
import sys
from loguru import logger
from app.config import settings

os.makedirs(os.path.dirname(settings.LOG_PATH), exist_ok=True)

logger.remove()
logger.add(sys.stdout, level="INFO", colorize=True,
           format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level}</level> | {message}")
logger.add(settings.LOG_PATH, level="DEBUG", rotation="10 MB", retention="7 days",
           format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{line} | {message}")

__all__ = ["logger"]
