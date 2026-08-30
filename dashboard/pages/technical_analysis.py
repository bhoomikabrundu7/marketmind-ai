import streamlit as st
import pandas as pd
import plotly.graph_objects as go

from src.analysis.technical_analysis import (
    add_technical_indicators
)



def create_ma_chart(df):

    fig = go.Figure()


    fig.add_trace(
        go.Scatter(
            x=df.index,
            y=df["Close"],
            name="Close Price"
        )
    )


    fig.add_trace(
        go.Scatter(
            x=df.index,
            y=df["MA_20"],
            name="20 Day Moving Average"
        )
    )


    fig.update_layout(
        title="Price Trend with Moving Average",
        xaxis_title="Date",
        yaxis_title="Price"
    )


    return fig



def create_rsi_chart(df):

    fig = go.Figure()


    fig.add_trace(
        go.Scatter(
            x=df.index,
            y=df["RSI"],
            name="RSI"
        )
    )


    fig.add_hline(
        y=70,
        line_dash="dash",
        annotation_text="Overbought"
    )


    fig.add_hline(
        y=30,
        line_dash="dash",
        annotation_text="Oversold"
    )


    fig.update_layout(
        title="Relative Strength Index",
        yaxis_title="RSI"
    )


    return fig



def show_technical_analysis(df):


    st.header(
        "📊 Technical Analysis"
    )


    df = add_technical_indicators(
        df
    )


    st.plotly_chart(
        create_ma_chart(df),
        use_container_width=True
    )


    st.plotly_chart(
        create_rsi_chart(df),
        use_container_width=True
    )


    latest_rsi = (
        df["RSI"]
        .iloc[-1]
    )


    st.subheader(
        "Current RSI Status"
    )


    if latest_rsi > 70:

        st.warning(
            "Stock may be overbought"
        )


    elif latest_rsi < 30:

        st.warning(
            "Stock may be oversold"
        )


    else:

        st.success(
            "Stock is in normal range"
        )


    st.metric(
        "Current RSI",
        f"{latest_rsi:.2f}"
    )