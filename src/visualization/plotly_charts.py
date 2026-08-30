import plotly.graph_objects as go


def create_moving_average_chart(df, ticker):
    """
    Create a price chart with SMA and EMA.
    """

    fig = go.Figure()

    # Closing price
    fig.add_trace(
        go.Scatter(
            x=df.index,
            y=df["Close"],
            mode="lines",
            name="Close Price"
        )
    )

    # SMA
    fig.add_trace(
        go.Scatter(
            x=df.index,
            y=df["SMA_20"],
            mode="lines",
            name="SMA 20"
        )
    )

    # EMA
    fig.add_trace(
        go.Scatter(
            x=df.index,
            y=df["EMA_20"],
            mode="lines",
            name="EMA 20"
        )
    )

    fig.update_layout(
        title=f"{ticker} — Price & Moving Averages",
        xaxis_title="Date",
        yaxis_title="Price",
        hovermode="x unified"
    )

    return fig
def create_bollinger_chart(df, ticker):
    """
    Create a Bollinger Bands chart.
    """

    fig = go.Figure()

    fig.add_trace(
        go.Scatter(
            x=df.index,
            y=df["Close"],
            mode="lines",
            name="Close Price"
        )
    )

    fig.add_trace(
        go.Scatter(
            x=df.index,
            y=df["BB_Upper"],
            mode="lines",
            name="Upper Band"
        )
    )

    fig.add_trace(
        go.Scatter(
            x=df.index,
            y=df["BB_Middle"],
            mode="lines",
            name="Middle Band"
        )
    )

    fig.add_trace(
        go.Scatter(
            x=df.index,
            y=df["BB_Lower"],
            mode="lines",
            name="Lower Band"
        )
    )

    fig.update_layout(
        title=f"{ticker} — Bollinger Bands",
        xaxis_title="Date",
        yaxis_title="Price",
        hovermode="x unified"
    )

    return fig
def create_rsi_chart(df, ticker):
    """
    Create RSI chart.
    """

    fig = go.Figure()

    fig.add_trace(
        go.Scatter(
            x=df.index,
            y=df["RSI"],
            mode="lines",
            name="RSI"
        )
    )

    fig.add_hline(
        y=70,
        line_dash="dash",
        annotation_text="Overbought (70)"
    )

    fig.add_hline(
        y=30,
        line_dash="dash",
        annotation_text="Oversold (30)"
    )

    fig.add_hline(
        y=50,
        line_dash="dot",
        annotation_text="Neutral (50)"
    )

    fig.update_layout(
        title=f"{ticker} — Relative Strength Index",
        xaxis_title="Date",
        yaxis_title="RSI",
        yaxis_range=[0, 100],
        hovermode="x unified"
    )

    return fig
def create_macd_chart(df, ticker):
    """
    Create MACD chart.
    """

    fig = go.Figure()

    fig.add_trace(
        go.Scatter(
            x=df.index,
            y=df["MACD"],
            mode="lines",
            name="MACD"
        )
    )

    fig.add_trace(
        go.Scatter(
            x=df.index,
            y=df["MACD_Signal"],
            mode="lines",
            name="Signal"
        )
    )

    fig.add_trace(
        go.Bar(
            x=df.index,
            y=df["MACD_Histogram"],
            name="Histogram"
        )
    )

    fig.add_hline(y=0)

    fig.update_layout(
        title=f"{ticker} — MACD",
        xaxis_title="Date",
        yaxis_title="MACD",
        hovermode="x unified"
    )

    return fig