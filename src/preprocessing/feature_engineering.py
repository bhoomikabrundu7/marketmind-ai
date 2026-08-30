import os
import pandas as pd


def load_processed_data(file_path):
    """
    Load cleaned stock data.
    """
    return pd.read_csv(file_path)


def add_daily_return(df):
    """
    Add daily percentage return.
    """
    df = df.copy()

    df["Daily_Return"] = df["Close"].pct_change()

    return df


def add_sma(df, window=20):
    """
    Add Simple Moving Average.
    """
    df = df.copy()

    df[f"SMA_{window}"] = (
        df["Close"]
        .rolling(window=window)
        .mean()
    )

    return df


def add_ema(df, window=20):
    """
    Add Exponential Moving Average.
    """
    df = df.copy()

    df[f"EMA_{window}"] = (
        df["Close"]
        .ewm(
            span=window,
            adjust=False
        )
        .mean()
    )

    return df


def add_rsi(df, window=14):
    """
    Add Relative Strength Index.
    """
    df = df.copy()

    delta = df["Close"].diff()

    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)

    avg_gain = gain.rolling(
        window=window
    ).mean()

    avg_loss = loss.rolling(
        window=window
    ).mean()

    rs = avg_gain.div(
        avg_loss.where(avg_loss != 0)
    )

    df["RSI"] = 100 - (
        100 / (1 + rs)
    )

    # When average loss is zero,
    # RSI is 100.
    df.loc[
        avg_loss == 0,
        "RSI"
    ] = 100

    return df


def add_macd(df):
    """
    Add MACD, Signal Line and Histogram.
    """
    df = df.copy()

    ema_12 = df["Close"].ewm(
        span=12,
        adjust=False
    ).mean()

    ema_26 = df["Close"].ewm(
        span=26,
        adjust=False
    ).mean()

    df["MACD"] = ema_12 - ema_26

    df["MACD_Signal"] = (
        df["MACD"]
        .ewm(
            span=9,
            adjust=False
        )
        .mean()
    )

    df["MACD_Histogram"] = (
        df["MACD"]
        - df["MACD_Signal"]
    )

    return df


def add_bollinger_bands(df, window=20):
    """
    Add Bollinger Bands.
    """
    df = df.copy()

    middle_band = (
        df["Close"]
        .rolling(window=window)
        .mean()
    )

    std = (
        df["Close"]
        .rolling(window=window)
        .std()
    )

    df["BB_Middle"] = middle_band

    df["BB_Upper"] = (
        middle_band + (2 * std)
    )

    df["BB_Lower"] = (
        middle_band - (2 * std)
    )

    return df


def engineer_features(df):
    """
    Complete technical-analysis
    feature-engineering pipeline.
    """

    df = df.copy()

    df = add_daily_return(df)

    # 10-day and 20-day moving averages
    df = add_sma(df, window=10)
    df = add_sma(df, window=20)

    df = add_ema(df, window=20)

    df = add_rsi(df)

    df = add_macd(df)

    df = add_bollinger_bands(df)

    return df


def save_feature_data(df, output_path):
    """
    Save feature-engineered dataset.
    """

    directory = os.path.dirname(output_path)

    if directory:
        os.makedirs(
            directory,
            exist_ok=True
        )

    df.to_csv(
        output_path,
        index=False
    )

    print(
        f"Feature dataset saved to: {output_path}"
    )


if __name__ == "__main__":

    input_file = (
        "data/processed/"
        "stock_processed.csv"
    )

    output_file = (
        "data/processed/"
        "stock_features.csv"
    )

    stock_df = load_processed_data(
        input_file
    )

    feature_df = engineer_features(
        stock_df
    )

    print(
        feature_df.head(25)
    )

    save_feature_data(
        feature_df,
        output_file
    )