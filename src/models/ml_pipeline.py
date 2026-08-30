import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import numpy as np

def prepare_ml_data(df):
    """
    Prepare feature-engineered stock data for machine learning.
    """

    df = df.copy()

    # Ensure required basic features exist
    if "Daily_Return" not in df.columns:
        df["Daily_Return"] = df["Close"].pct_change()

    if "SMA_10" not in df.columns:
        df["SMA_10"] = (
            df["Close"]
            .rolling(window=10)
            .mean()
        )

    if "SMA_20" not in df.columns:
        df["SMA_20"] = (
            df["Close"]
            .rolling(window=20)
            .mean()
        )

    if "EMA_20" not in df.columns:
        df["EMA_20"] = (
            df["Close"]
            .ewm(span=20, adjust=False)
            .mean()
        )

    required_features = [
        "Close",
        "Daily_Return",
        "SMA_10",
        "SMA_20",
        "EMA_20",
        "RSI",
        "MACD",
        "MACD_Signal",
        "MACD_Histogram",
        "BB_Upper",
        "BB_Middle",
        "BB_Lower",
    ]

    missing_columns = [
        col
        for col in required_features
        if col not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing required features: {missing_columns}"
        )

    # Target = next day's closing price
    df["Target"] = df["Close"].shift(-1)

    # Remove rows containing indicator NaN values
    df = df.dropna(
        subset=required_features + ["Target"]
    ).reset_index(drop=True)

    return df

from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import numpy as np


def train_random_forest(ml_data):

    if ml_data is None or ml_data.empty:
        raise ValueError("ML dataset is empty.")

    feature_columns = [
        "Close",
        "Daily_Return",
        "SMA_10",
        "SMA_20",
        "EMA_20",
        "RSI",
        "MACD",
        "MACD_Signal",
        "MACD_Histogram",
        "BB_Upper",
        "BB_Middle",
        "BB_Lower"
    ]

    X = ml_data[feature_columns]
    y = ml_data["Target"]

    # Time-aware split: first 80% for training,
    # last 20% for testing.
    split_index = int(len(X) * 0.8)

    X_train = X.iloc[:split_index]
    X_test = X.iloc[split_index:]

    y_train = y.iloc[:split_index]
    y_test = y.iloc[split_index:]

    model = RandomForestRegressor(
        n_estimators=200,
        random_state=42,
        n_jobs=-1
    )

    model.fit(
        X_train,
        y_train
    )

    predictions = model.predict(
        X_test
    )

    mae = mean_absolute_error(
        y_test,
        predictions
    )

    rmse = np.sqrt(
        mean_squared_error(
            y_test,
            predictions
        )
    )

    r2 = r2_score(
        y_test,
        predictions
    )

    return {
        "model": model,
        "X_train": X_train,
        "X_test": X_test,
        "y_train": y_train,
        "y_test": y_test,
        "predictions": predictions,
        "mae": mae,
        "rmse": rmse,
        "r2": r2
    }
    
def create_prediction_dataframe(result):

    prediction_df = pd.DataFrame({
        "Actual": result["y_test"].values,
        "Predicted": result["predictions"]
    })

    return prediction_df