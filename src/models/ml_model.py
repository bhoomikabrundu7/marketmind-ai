import pandas as pd

from sklearn.model_selection import train_test_split

from sklearn.linear_model import LinearRegression

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

import joblib
import numpy as np



def load_data(file_path):

    return pd.read_csv(file_path)



def prepare_data(df):

    # Create tomorrow's closing price
    df["Target"] = df["Close"].shift(-1)

    df = df.dropna()


    features = [
        "Open",
        "High",
        "Low",
        "Volume",
        "MA10",
        "MA20",
        "RSI"
    ]


    X = df[features]

    y = df["Target"]


    return X, y



def train_model(X, y):

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        shuffle=False
    )


    model = LinearRegression()


    model.fit(
        X_train,
        y_train
    )


    predictions = model.predict(
        X_test
    )


    return model, y_test, predictions



def evaluate_model(y_test, predictions):

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


    print("MAE:", mae)

    print("RMSE:", rmse)

    print("R2 Score:", r2)



def save_model(model):

    joblib.dump(
        model,
        "models/linear_regression.pkl"
    )

    print("Model saved")



if __name__ == "__main__":

    df = load_data(
        "data/processed/stock_features.csv"
    )


    X, y = prepare_data(df)


    model, y_test, predictions = train_model(
        X,
        y
    )


    evaluate_model(
        y_test,
        predictions
    )


    save_model(model)