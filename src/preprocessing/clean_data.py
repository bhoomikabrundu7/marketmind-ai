import os
import pandas as pd


def load_raw_data(file_path):
    """
    Load raw stock data from CSV.
    """

    df = pd.read_csv(file_path)

    return df


def inspect_data(df):
    """
    Display basic information about the dataset.
    """

    print("\nFirst 5 Rows")
    print(df.head())

    print("\nDataset Shape")
    print(df.shape)

    print("\nMissing Values")
    print(df.isnull().sum())

    print("\nDuplicate Rows")
    print(df.duplicated().sum())


def clean_data(df):
    """
    Perform basic cleaning.
    """

    df = df.drop_duplicates()

    return df


def save_processed_data(df, output_path):
    """
    Save cleaned dataset.
    """

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    df.to_csv(output_path, index=False)

    print(f"\nProcessed data saved to: {output_path}")


if __name__ == "__main__":

    raw_file = "data/raw/stock_raw.csv"

    processed_file = "data/processed/stock_processed.csv"

    stock_df = load_raw_data(raw_file)

    inspect_data(stock_df)

    cleaned_df = clean_data(stock_df)

    save_processed_data(
        cleaned_df,
        processed_file
    )