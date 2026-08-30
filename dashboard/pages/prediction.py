import streamlit as st
import pandas as pd

from src.models.predict import (
    load_model,
    prepare_prediction_data,
    predict_price
)



def show_prediction(df):

    st.header(
        "🤖 Stock Price Prediction"
    )


    model = load_model(
        "models/best_model.pkl"
    )


    input_data = prepare_prediction_data(
        df
    )


    predicted_price = predict_price(
        model,
        input_data
    )


    current_price = (
        df["Close"]
        .iloc[-1]
    )


    percentage_change = (
        (predicted_price - current_price)
        /
        current_price
        *
        100
    )



    col1, col2, col3 = st.columns(3)



    with col1:

        st.metric(
            "Current Price",
            f"{current_price:.2f}"
        )



    with col2:

        st.metric(
            "Predicted Price",
            f"{predicted_price:.2f}"
        )



    with col3:

        st.metric(
            "Expected Change",
            f"{percentage_change:.2f}%"
        )



    st.subheader(
        "Prediction Explanation"
    )


    st.write(
        """
        The prediction is generated using
        historical stock features including:

        - Price data
        - Moving averages
        - RSI
        - Trading volume

        This prediction is an estimate
        based on historical patterns.
        It is not a guaranteed future price.
        """
    )