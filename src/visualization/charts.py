"""Reusable Plotly charts."""
import plotly.graph_objects as go


def price_chart(data, ticker: str):
    chart = go.Figure(go.Scatter(x=data.index, y=data["Close"], mode="lines", name="Close"))
    chart.update_layout(title=f"{ticker} closing price", xaxis_title="Date", yaxis_title="Price")
    return chart
