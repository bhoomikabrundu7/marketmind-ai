import numpy as np
import pandas as pd

def calculate_shap_contributions(model, X_test: pd.DataFrame) -> list[dict]:
    """
    Generate feature importance breakdown for Random Forest predictions.
    """
    if model is None or X_test.empty:
        return []

    try:
        import shap
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X_test.iloc[-1:])
        
        feature_names = X_test.columns.tolist()
        last_shap = shap_values[0] if isinstance(shap_values, list) else shap_values[-1]
        
        contributions = []
        for name, impact in zip(feature_names, last_shap):
            contributions.append({
                "feature": name,
                "impact": round(float(impact), 4),
                "direction": "Positive" if impact > 0 else "Negative"
            })
            
        return sorted(contributions, key=lambda x: abs(x["impact"]), reverse=True)
    except Exception:
        # Fallback to standard Random Forest feature importances
        importances = model.feature_importances_
        feature_names = X_test.columns.tolist()
        
        contributions = []
        for name, imp in zip(feature_names, importances):
            contributions.append({
                "feature": name,
                "impact": round(float(imp), 4),
                "direction": "Positive"
            })
            
        return sorted(contributions, key=lambda x: x["impact"], reverse=True)