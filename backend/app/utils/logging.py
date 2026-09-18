import logging
import sys

def setup_logging(log_level: str = "INFO"):
    """
    Configures structured logging for the FastAPI application.
    """
    logging_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    logging.basicConfig(
        level=getattr(logging, log_level.upper(), logging.INFO),
        format=logging_format,
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )

def get_logger(name: str) -> logging.Logger:
    """
    Returns a configured logger instance for a given module name.
    """
    return logging.getLogger(name)
