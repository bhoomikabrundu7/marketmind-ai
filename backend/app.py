from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import yfinance as yf
from datetime import date, timedelta
from textblob import TextBlob

# Import custom ML & sentiment modules from your src directory
try:
    from src.preprocessing.feature_engineering import engineer_features
    from src.sentiment.news_loader import load_stock_news
    from src.sentiment.news_cleaning import clean_news_data
    from src.sentiment.sentiment_analyzer import add_sentiment_scores, get_sentiment_summary
    from src.models.ml_pipeline import prepare_ml_data, train_random_forest, create_prediction_dataframe
except ImportError as e:
    print(f"Warning: Custom module import failed. Ensure 'src' folder is in Python path: {e}")

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for Next.js frontend (localhost:3000)

def safe_float(v, default=0.0):
    """Safely converts input values to rounded floats to prevent formatting errors."""
    try:
        if pd.isna(v):
            return default
        return round(float(v), 2)
    except Exception:
        return default

def risk_from_volatility(volatility):
    """Calculates risk categories and gauge positioning based on annualized volatility."""
    if volatility < 15:
        return "Low", 18
    if volatility < 25:
        return "Moderate", 40
    if volatility < 35:
        return "Moderately High", 62
    if volatility < 50:
        return "High", 82
    return "Very High", 94

@app.route("/api/stock/<symbol>", methods=["GET"])
def get_stock_analysis(symbol):
    symbol = symbol.upper().strip()
    ticker = yf.Ticker(symbol)
    
    # 1. Fetch yfinance Ticker metadata
    try:
        info = ticker.info or {}
    except Exception:
        info = {}

    # 2. Download historical stock performance data (1 year)
    end_date = date.today()
    start_date = end_date - timedelta(days=365)
    
    try:
        raw_df = yf.download(
            symbol,
            start=str(start_date),
            end=str(end_date + timedelta(days=1)),
            progress=False,
            auto_adjust=False,
        )
    except Exception as e:
        return jsonify({"error": f"Failed to download market data for {symbol}: {str(e)}"}), 400

    if raw_df is None or raw_df.empty:
        return jsonify({"error": f"No market data found for symbol {symbol}"}), 404

    # Clean Pandas MultiIndex columns if present
    df = raw_df.copy()
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)
    df = df.reset_index().dropna(subset=["Close"]).sort_values("Date").reset_index(drop=True)

    # 3. Calculate technical indicators via Feature Engineering module
    try:
        df = engineer_features(df)
    except Exception as e:
        print(f"Feature engineering fallback for {symbol}: {e}")

    # Core pricing metrics
    current_price = safe_float(df["Close"].iloc[-1])
    first_price = safe_float(df["Close"].iloc[0])
    prev_close = safe_float(df["Close"].iloc[-2]) if len(df) > 1 else current_price
    period_change_pct = safe_float(((current_price - first_price) / first_price) * 100) if first_price else 0.0

    # Market details formatting
    day_low = safe_float(df["Low"].iloc[-1])
    day_high = safe_float(df["High"].iloc[-1])
    year_low = safe_float(df["Low"].min())
    year_high = safe_float(df["High"].max())
    vol_latest = int(safe_float(df["Volume"].iloc[-1]))

    # Market Cap formatting
    market_cap_raw = info.get("marketCap")
    if market_cap_raw:
        if market_cap_raw >= 1e12:
            market_cap_str = f"₹{market_cap_raw / 1e12:.2f}T INR" if ".NS" in symbol else f"${market_cap_raw / 1e12:.2f}T"
        elif market_cap_raw >= 1e9:
            market_cap_str = f"₹{market_cap_raw / 1e9:.2f}B INR" if ".NS" in symbol else f"${market_cap_raw / 1e9:.2f}B"
        else:
            market_cap_str = f"{market_cap_raw:,}"
    else:
        market_cap_str = "N/A"

    pe_ratio_raw = info.get("trailingPE") or info.get("forwardPE")
    pe_ratio_str = f"{pe_ratio_raw:.2f}" if pe_ratio_raw else "N/A"

    # Risk & Volatility metrics
    volatility = safe_float(df["Close"].pct_change().dropna().std() * (252 ** 0.5) * 100)
    risk_label, risk_score = risk_from_volatility(volatility)
    rsi_val = safe_float(df["RSI"].iloc[-1]) if "RSI" in df.columns and not df["RSI"].dropna().empty else 50.0

    # 4. Machine Learning Forecast Pipeline (Random Forest)
    predicted_price = None
    r2_score = 0.0
    try:
        ml_data = prepare_ml_data(df)
        result = train_random_forest(ml_data)
        pred_df = create_prediction_dataframe(result)
        if not pred_df.empty and "Predicted" in pred_df.columns:
            predicted_price = safe_float(pred_df["Predicted"].iloc[-1])
        r2_score = safe_float(result.get("r2", 0))
    except Exception as e:
        print(f"ML Pipeline execution warning for {symbol}: {e}")

    # 5. Dynamic Company News & Sentiment Engine
    formatted_news = []
    overall_sentiment = "Neutral"
    sentiment_score_num = 0.5
    try:
        # Fetch news directly for the queried ticker
        news_raw = load_stock_news(symbol, limit=6)
        news_df = add_sentiment_scores(clean_news_data(news_raw))
        
        if not news_df.empty:
            summary = get_sentiment_summary(news_df)
            overall_sentiment = summary.get("overall_sentiment", "Neutral")
            sentiment_score_num = safe_float(summary.get("average_score", 0.5))

            for _, article in news_df.head(6).iterrows():
                formatted_news.append({
                    "title": str(article.get("title", "")),
                    "url": str(article.get("link", "#")),
                    "source": str(article.get("publisher", "Financial Wire")),
                    "published_at": str(article.get("published", "Recent"))[:10],
                    "sentiment": str(article.get("sentiment", "Neutral")).title(),
                    "image_url": str(article.get("image", ""))
                })
    except Exception as e:
        print(f"News sentiment execution warning for {symbol}: {e}")

    # Decision Consensus Signal Logic
    signal = "Neutral"
    if predicted_price and predicted_price > current_price and rsi_val < 70:
        signal = "Buy Signal (Bullish)"
    elif predicted_price and predicted_price < current_price:
        signal = "Sell Signal (Bearish)"

    # Historical price series for frontend charts
    price_history = []
    for _, row in df.tail(90).iterrows():
        price_history.append({
            "date": row["Date"].strftime("%Y-%m-%d") if hasattr(row["Date"], "strftime") else str(row["Date"]),
            "close": safe_float(row["Close"]),
            "open": safe_float(row["Open"]),
            "high": safe_float(row["High"]),
            "low": safe_float(row["Low"]),
            "volume": int(safe_float(row["Volume"])),
        })

    # Return full, formatted JSON response to Next.js dashboard
    return jsonify({
        "symbol": symbol,
        "name": info.get("longName") or info.get("shortName") or symbol,
        "overview": {
            "current_price": current_price,
            "period_change_pct": period_change_pct,
            "previous_close": f"₹{prev_close:,.2f}" if ".NS" in symbol else f"${prev_close:,.2f}",
            "day_range": f"{day_low:,.2f} – {day_high:,.2f}",
            "year_range": f"{year_low:,.2f} – {year_high:,.2f}",
            "market_cap": market_cap_str,
            "volume": f"{vol_latest:,}",
            "pe_ratio": pe_ratio_str,
        },
        "predicted_price": predicted_price,
        "signal": signal,
        "signal_reason": f"Random Forest forecasts {symbol} based on R²={r2_score:.2f} model performance and RSI={rsi_val:.1f}.",
        "ai_score": int(min(max(50 + (period_change_pct * 0.5), 10), 99)),
        "risk_label": risk_label,
        "risk_score": risk_score,
        "indicators": {
            "rsi": rsi_val,
            "volatility_pct": volatility,
        },
        "sentiment": {
            "overall_sentiment": overall_sentiment,
            "score": sentiment_score_num,
        },
        "recent_news": formatted_news,
        "price_history": price_history,
        "explainability": [
            {"feature": "Technical RSI (14)", "impact": f"{rsi_val:.1f}", "type": "positive" if rsi_val < 70 else "negative"},
            {"feature": "Annual Volatility", "impact": f"{volatility:.1f}%", "type": "negative" if volatility > 30 else "positive"},
            {"feature": "ML R² Score", "impact": f"{r2_score:.2f}", "type": "positive" if r2_score > 0 else "negative"},
        ]
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)