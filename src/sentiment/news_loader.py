import yfinance as yf
import pandas as pd


def load_stock_news(ticker, limit=10):
    """
    Fetch recent financial news for a stock ticker.
    """

    empty_columns = [
        "title",
        "publisher",
        "published",
        "link",
        "image"
    ]

    if not ticker:
        return pd.DataFrame(columns=empty_columns)

    try:
        ticker = ticker.strip().upper()
        stock = yf.Ticker(ticker)

        news = stock.get_news(
            count=limit,
            tab="news"
        )

        if not news:
            return pd.DataFrame(columns=empty_columns)

        records = []

        for article in news:

            content = article.get("content") or {}

            title = content.get("title") or ""

            provider = content.get("provider") or {}

            publisher = provider.get(
                "displayName",
                "Unknown"
            )

            published = content.get("pubDate")

            canonical = content.get("canonicalUrl") or {}

            link = canonical.get(
                "url",
                ""
            )

            # -----------------------------
            # Get article image safely
            # -----------------------------

            image = ""

            thumbnail = content.get("thumbnail") or {}

            if isinstance(thumbnail, dict):

                image = thumbnail.get(
                    "originalUrl"
                ) or ""

                if not image:

                    resolutions = (
                        thumbnail.get("resolutions")
                        or []
                    )

                    if resolutions:

                        first_image = (
                            resolutions[0]
                            or {}
                        )

                        if isinstance(
                            first_image,
                            dict
                        ):
                            image = (
                                first_image.get("url")
                                or ""
                            )

            records.append({
                "title": title,
                "publisher": publisher,
                "published": published,
                "link": link,
                "image": image
            })

        df = pd.DataFrame(records)

        if df.empty:
            return pd.DataFrame(
                columns=empty_columns
            )

        df["published"] = pd.to_datetime(
            df["published"],
            errors="coerce"
        )

        return df

    except Exception as e:

        print(
            f"News loading error: {e}"
        )

        return pd.DataFrame(
            columns=empty_columns
        )