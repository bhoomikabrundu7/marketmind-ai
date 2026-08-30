import pandas as pd
import joblib



def load_model(model_path):
    """
    Load trained ML model.
    """

    model = joblib.load(model_path)

    return model



def prepare_prediction_data(df):
    """
    Select required features for prediction.
    """

    features = [
        "Open",
        "High",
        "Low",
        "Volume",
        "MA10",
        "MA20",
        "RSI"
    ]


    latest_data = df[features].tail(1)


    return latest_data



def predict_price(model, data):
    """
    Generate stock price prediction.
    """

    prediction = model.predict(data)


    return prediction[0]



if __name__ == "__main__":


    model_path = (
        "models/best_model.pkl"
    )


    data_path = (
        "data/processed/stock_features.csv"
    )


    model = load_model(
        model_path
    )


    df = pd.read_csv(
        data_path
    )


    input_data = prepare_prediction_data(
        df
    )


    predicted_price = predict_price(
        model,
        input_data
    )


    print(
        f"Predicted Price: {predicted_price:.2f}"
    )