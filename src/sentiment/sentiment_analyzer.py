import pandas as pd
from textblob import TextBlob


def analyze_sentiment(text):
    """
    Calculate sentiment polarity and classify the text.
    """

    if not text or pd.isna(text):
        return 0.0, "Neutral"

    text = str(text).strip()

    if not text:
        return 0.0, "Neutral"

    polarity = TextBlob(text).sentiment.polarity

    if polarity > 0.05:
        label = "Positive"

    elif polarity < -0.05:
        label = "Negative"

    else:
        label = "Neutral"

    return polarity, label


def add_sentiment_scores(df):

    if df is None or df.empty:
        return df.copy()

    df = df.copy()

    results = df["title"].apply(
        analyze_sentiment
    )

    df["sentiment_score"] = results.apply(
        lambda x: x[0]
    )

    df["sentiment"] = results.apply(
        lambda x: x[1]
    )

    return df
def get_sentiment_summary(df):

    if df is None or df.empty:
        return {
            "overall_sentiment": "Neutral",
            "average_score": 0.0,
            "positive_count": 0,
            "neutral_count": 0,
            "negative_count": 0,
            "total_articles": 0
        }

    positive_count = int(
        (df["sentiment"] == "Positive").sum()
    )

    neutral_count = int(
        (df["sentiment"] == "Neutral").sum()
    )

    negative_count = int(
        (df["sentiment"] == "Negative").sum()
    )

    average_score = float(
        df["sentiment_score"].mean()
    )

    if average_score > 0.05:
        overall_sentiment = "Positive"

    elif average_score < -0.05:
        overall_sentiment = "Negative"

    else:
        overall_sentiment = "Neutral"

    return {
        "overall_sentiment": overall_sentiment,
        "average_score": round(average_score, 4),
        "positive_count": positive_count,
        "neutral_count": neutral_count,
        "negative_count": negative_count,
        "total_articles": len(df)
    }