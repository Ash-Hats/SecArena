"""Centralized Logging Configuration for SecArena."""

import logging
import sys
from app.core.config import settings


def setup_logging() -> logging.Logger:
    """Configures application-wide structured logging.

    Log Format: timestamp | log level | logger name | message
    """
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO

    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    if root_logger.hasHandlers():
        root_logger.handlers.clear()

    root_logger.addHandler(console_handler)

    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

    logger = logging.getLogger("secarena")
    logger.info(f"Logging initialized for {settings.APP_NAME} in [{settings.ENVIRONMENT}] mode.")
    return logger


logger = logging.getLogger("secarena")
