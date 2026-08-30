import streamlit as st
import yfinance as yf
import plotly.graph_objects as go



def load_stock_data(
    ticker,
    start_date,
    end_date
):

    df = yf.download(
        ticker,
        start=start_date,
        end=end_date,
        progress=False
    )

    return df



def create_price_chart(df):

    fig = go.Figure()


    fig.add_trace(
        go.Scatter(
            x=df.index,
            y=df["Close"],
            mode="lines",
            name="Closing Price"
        )
    )


    fig.update_layout(
        title="Stock Price Movement",
        xaxis_title="Date",
        yaxis_title="Price"
    )


    return fig



def create_volume_chart(df):

    fig = go.Figure()


    fig.add_trace(
        go.Bar(
            x=df.index,
            y=df["Volume"],
            name="Volume"
        )
    )


    fig.update_layout(
        title="Trading Volume",
        xaxis_title="Date",
        yaxis_title="Volume"
    )


    return fig



def show_stock_overview(
    ticker,
    start_date,
    end_date
):

    st.header(
        "📈 Stock Overview"
    )


    df = load_stock_data(
        ticker,
        start_date,
        end_date
    )


    if df.empty:

        st.error(
            "No data available"
        )

        return



    latest_price = (
        df["Close"]
        .iloc[-1]
    )


    previous_price = (
        df["Close"]
        .iloc[-2]
    )


    change = (
        (latest_price - previous_price)
        /
        previous_price
        *
        100
    )


    col1, col2 = st.columns(2)


    with col1:

        st.metric(
            "Current Price",
            f"{latest_price:.2f}"
        )


    with col2:

        st.metric(
            "Daily Change",
            f"{change:.2f}%"
        )


    st.plotly_chart(
        create_price_chart(df),
        use_container_width=True
    )


    st.plotly_chart(
        create_volume_chart(df),
        use_container_width=True
    )



    st.subheader(
        "Statistics"
    )


    st.write(
        df.describe()
    )