import pandas as pd


def calculate_moving_average(df, window=20):
    """
    Calculate moving average.
    """

    df[f"MA_{window}"] = (
        df["Close"]
        .rolling(window=window)
        .mean()
    )

    return df


def calculate_rsi(df, period=14):
    """
    Calculate Relative Strength Index.
    """

    delta = df["Close"].diff()

    gain = delta.clip(lower=0)

    loss = -delta.clip(upper=0)


    avg_gain = (
        gain
        .rolling(window=period)
        .mean()
    )

    avg_loss = (
        loss
        .rolling(window=period)
        .mean()
    )


    rs = avg_gain / avg_loss


    df["RSI"] = (
        100 -
        (100 / (1 + rs))
    )

    return df



def add_technical_indicators(df):
    """
    Add all technical indicators.
    """

    df = calculate_moving_average(
        df,
        window=20
    )

    df = calculate_rsi(
        df,
        period=14
    )

    return df


if __name__ == "__main__":

    file_path = "data/processed/stock_features.csv"

    df = pd.read_csv(file_path)

    df = add_technical_indicators(df)

    print(df.head(20))