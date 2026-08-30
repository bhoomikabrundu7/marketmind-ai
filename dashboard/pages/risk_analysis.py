import streamlit as st

from src.analysis.risk_analysis import (
    risk_report
)



def show_risk_analysis(df):

    st.header(
        "📉 Risk Analysis"
    )


    report = risk_report(df)


    volatility = report["Volatility"]

    sharpe = report["Sharpe Ratio"]

    drawdown = report["Maximum Drawdown"]



    col1, col2, col3 = st.columns(3)



    with col1:

        st.metric(
            "Volatility",
            f"{volatility:.2%}"
        )


    with col2:

        st.metric(
            "Sharpe Ratio",
            f"{sharpe:.2f}"
        )


    with col3:

        st.metric(
            "Maximum Drawdown",
            f"{drawdown:.2%}"
        )



    st.subheader(
        "Risk Interpretation"
    )



    if volatility > 0.30:

        st.warning(
            "High volatility stock"
        )


    elif volatility > 0.15:

        st.info(
            "Moderate volatility stock"
        )


    else:

        st.success(
            "Low volatility stock"
        )



    st.write(
        """
        Note:
        
        Risk metrics are calculated
        using historical price movements.
        They do not guarantee future performance.
        """
    )