"""Basic sentiment scoring."""
from textblob import TextBlob


def score_sentiment(text: str) -> float:
    return float(TextBlob(text).sentiment.polarity)
