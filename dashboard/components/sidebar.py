import streamlit as st

from src.data_collection.market_config import MARKETS



def create_sidebar():

    st.sidebar.title(
        "📊 Stock Controls"
    )


    market = st.sidebar.selectbox(
        "Select Market",
        list(MARKETS.keys())
    )


    stocks = MARKETS[market]


    stock = st.sidebar.selectbox(
        "Select Stock",
        list(stocks.keys())
    )


    ticker = stocks[stock]


    start_date = st.sidebar.date_input(
        "Start Date"
    )


    end_date = st.sidebar.date_input(
        "End Date"
    )


    return {
        "market": market,
        "stock": stock,
        "ticker": ticker,
        "start_date": start_date,
        "end_date": end_date
    }