import pandas as pd
import numpy as np


def calculate_returns(df):
    """
    Calculate daily returns.
    """

    df["Daily_Return"] = (
        df["Close"]
        .pct_change()
    )

    return df



def calculate_volatility(df):
    """
    Calculate annualized volatility.
    """

    volatility = (
        df["Daily_Return"]
        .std()
        *
        np.sqrt(252)
    )

    return volatility



def calculate_sharpe_ratio(
    df,
    risk_free_rate=0
):
    """
    Calculate Sharpe Ratio.
    """

    annual_return = (
        df["Daily_Return"]
        .mean()
        *
        252
    )


    annual_volatility = calculate_volatility(df)


    sharpe_ratio = (
        (annual_return - risk_free_rate)
        /
        annual_volatility
    )


    return sharpe_ratio



def calculate_max_drawdown(df):
    """
    Calculate maximum drawdown.
    """

    cumulative_return = (
        1 + df["Daily_Return"]
    ).cumprod()


    running_peak = (
        cumulative_return
        .cummax()
    )


    drawdown = (
        cumulative_return - running_peak
    ) / running_peak


    max_drawdown = drawdown.min()


    return max_drawdown



def risk_report(df):
    """
    Generate complete risk report.
    """

    df = calculate_returns(df)


    report = {

        "Volatility":
            calculate_volatility(df),

        "Sharpe Ratio":
            calculate_sharpe_ratio(df),

        "Maximum Drawdown":
            calculate_max_drawdown(df)

    }


    return report



if __name__ == "__main__":

    file_path = "data/processed/stock_features.csv"

    df = pd.read_csv(file_path)


    report = risk_report(df)


    print("\nRisk Report")

    for key, value in report.items():

        print(
            f"{key}: {value:.4f}"
        )