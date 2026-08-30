import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split

from sklearn.linear_model import LinearRegression

from sklearn.ensemble import RandomForestRegressor

from xgboost import XGBRegressor

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

import joblib



def load_data(path):

    return pd.read_csv(path)



def prepare_data(df):

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


    return train_test_split(
        X,
        y,
        test_size=0.2,
        shuffle=False
    )



def train_models(
    X_train,
    y_train
):

    models = {

        "Linear Regression":
            LinearRegression(),

        "Random Forest":
            RandomForestRegressor(
                n_estimators=100,
                random_state=42
            ),

        "XGBoost":
            XGBRegressor(
                n_estimators=100,
                random_state=42
            )

    }


    trained_models = {}


    for name, model in models.items():

        model.fit(
            X_train,
            y_train
        )

        trained_models[name] = model


    return trained_models



def evaluate_models(
    models,
    X_test,
    y_test
):

    results = {}


    for name, model in models.items():

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


        results[name] = {

            "MAE": mae,

            "RMSE": rmse,

            "R2": r2

        }


    return results



def save_best_model(
    models,
    results
):

    best_model_name = max(
        results,
        key=lambda x: results[x]["R2"]
    )


    best_model = models[
        best_model_name
    ]


    joblib.dump(
        best_model,
        "models/best_model.pkl"
    )


    print(
        f"Best Model: {best_model_name}"
    )



if __name__ == "__main__":


    df = load_data(
        "data/processed/stock_features.csv"
    )


    X_train, X_test, y_train, y_test = prepare_data(df)


    models = train_models(
        X_train,
        y_train
    )


    results = evaluate_models(
        models,
        X_test,
        y_test
    )


    print(results)


    save_best_model(
        models,
        results
    )