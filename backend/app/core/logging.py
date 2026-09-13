"""Centralized Logging Configuration for SecArena."""

import logging
import sys
from app.core.config import settings


def setup_logging() -> logging.Logger:
    """Configures application-wide structured logging.

    Log Format: timestamp | log level | logger name | message
    """
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO

    # Custom log format: ISO-like timestamp | level | logger | message
    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # Standard output handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)

    # Root logger configuration
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Clear existing handlers to prevent duplicated logs
    if root_logger.hasHandlers():
        root_logger.handlers.clear()

    root_logger.addHandler(console_handler)

    # Silence overly verbose third-party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

    logger = logging.getLogger("secarena")
    logger.info(f"Logging initialized for {settings.APP_NAME} in [{settings.ENVIRONMENT}] mode.")
    return logger


# Global logger instance
logger = logging.getLogger("secarena")
