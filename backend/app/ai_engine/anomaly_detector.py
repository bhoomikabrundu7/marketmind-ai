import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

def detect_market_anomalies(df: pd.DataFrame, contamination: float = 0.05) -> pd.DataFrame:
    """
    Detect price and volume anomalies using Isolation Forest.
    """
    if df is None or len(df) < 20:
        df["is_anomaly"] = False
        df["anomaly_score"] = 0.0
        return df

    data = df.copy()
    
    # Feature engineering for anomaly detection
    data["Return"] = data["Close"].pct_change().fillna(0)
    data["Vol_Change"] = data["Volume"].pct_change().fillna(0)
    data["Range_Pct"] = ((data["High"] - data["Low"]) / data["Close"]).fillna(0)
    
    features = ["Return", "Vol_Change", "Range_Pct"]
    X = data[features].replace([np.inf, -np.inf], 0).fillna(0)
    
    iso = IsolationForest(contamination=contamination, random_state=42)
    preds = iso.fit_predict(X)
    scores = iso.decision_function(X)
    
    data["is_anomaly"] = preds == -1
    data["anomaly_score"] = np.round(scores, 4)
    return data