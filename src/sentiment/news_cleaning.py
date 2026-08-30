import pandas as pd


def clean_news_data(df):

    if df is None or df.empty:
        return pd.DataFrame(
            columns=[
                "title",
                "publisher",
                "published",
                "link"
            ]
        )

    df = df.copy()

    # Remove duplicate articles
    df = df.drop_duplicates(
        subset=["title"],
        keep="first"
    )

    # Remove articles without titles
    df = df.dropna(
        subset=["title"]
    )

    df["title"] = (
        df["title"]
        .astype(str)
        .str.strip()
    )

    # Remove empty titles
    df = df[
        df["title"] != ""
    ]

    # Clean publisher
    if "publisher" in df.columns:
        df["publisher"] = (
            df["publisher"]
            .fillna("Unknown")
            .astype(str)
            .str.strip()
        )

    # Convert publication date
    if "published" in df.columns:
        df["published"] = pd.to_datetime(
            df["published"],
            errors="coerce"
        )

    # Sort newest first
    if "published" in df.columns:
        df = df.sort_values(
            "published",
            ascending=False
        )

    return df.reset_index(
        drop=True
    )