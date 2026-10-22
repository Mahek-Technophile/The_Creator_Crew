import os
import pytest

def pytest_addoption(parser):
    parser.addoption(
        "--headless",
        action="store_true",
        default=os.environ.get("HEADLESS", "false").lower() in ("true", "1", "yes"),
        help="Run Chrome in headless mode (default: headed for live visual demos)",
    )
    parser.addoption(
        "--slowmo",
        action="store",
        default=float(os.environ.get("SLOWMO", "0.2")),
        type=float,
        help="Delay in seconds between actions for headed visual demos (default: 0.2s)",
    )
