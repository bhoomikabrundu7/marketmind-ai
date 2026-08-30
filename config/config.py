"""Application settings. Keep secrets in environment variables or Streamlit secrets."""
import os

DEFAULT_TICKER = os.getenv("DEFAULT_TICKER", "AAPL")
DEFAULT_PERIOD = os.getenv("DEFAULT_PERIOD", "1y")
ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY", "")
