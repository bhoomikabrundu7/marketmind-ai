import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

def cluster_market_peers(company_data: list[dict], n_clusters: int = 3) -> list[dict]:
    """
    Cluster stocks by volatility, returns, and momentum using K-Means.
    """
    if not company_data or len(company_data) < n_clusters:
        return company_data

    df = pd.DataFrame(company_data)
    features = ["volatility_pct", "period_change_pct", "ai_score"]
    
    X = df[features].fillna(0)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    df["cluster_id"] = kmeans.fit_predict(X_scaled)
    
    # Map clusters to descriptive risk tiers based on average volatility
    cluster_means = df.groupby("cluster_id")["volatility_pct"].mean().sort_values()
    cluster_map = {cid: f"Peer Group {i+1}" for i, cid in enumerate(cluster_means.index)}
    df["cluster_label"] = df["cluster_id"].map(cluster_map)
    
    return df.to_dict(orient="records")