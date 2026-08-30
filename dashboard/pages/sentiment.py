import streamlit as st
from src.models.sentiment_model import score_sentiment

st.title("Sentiment Analysis")
text = st.text_area("Enter a market headline or article excerpt")
if text:
    st.metric("Sentiment polarity", f"{score_sentiment(text):.2f}")
