import os
import pandas as pd
import yfinance as yf


def download_stock_data(ticker, start_date, end_date):
    """
    Download historical stock data from Yahoo Finance.

    Parameters:
        ticker (str): Stock ticker symbol (e.g., AAPL, RELIANCE.NS)
        start_date (str): Start date in YYYY-MM-DD format
        end_date (str): End date in YYYY-MM-DD format

    Returns:
        pandas.DataFrame: Downloaded stock data
    """

    df = yf.download(
        tickers=ticker,
        start=start_date,
        end=end_date,
        progress=False
    )

    if df.empty:
        raise ValueError(f"No data found for ticker: {ticker}")

    return df


def save_raw_data(df, file_path):
    """
    Save the DataFrame as a CSV file.
    """

    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    df.to_csv(file_path)
    print(f"Raw data saved to: {file_path}")


if __name__ == "__main__":

    ticker = "AAPL"
    start_date = "2023-01-01"
    end_date = "2024-01-01"

    stock_df = download_stock_data(
        ticker=ticker,
        start_date=start_date,
        end_date=end_date
    )

    print(stock_df.head())

    save_raw_data(
        stock_df,
        "data/raw/stock_raw.csv"
    )
