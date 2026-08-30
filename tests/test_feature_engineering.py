import pandas as pd

from src.preprocessing.feature_engineering import engineer_features


# Create sample stock data
data = {
    "Open": [100, 102, 101, 105, 107, 106, 108, 110, 109, 112,
             115, 114, 116, 118, 120, 119, 121, 123, 122, 125,
             127, 126, 129, 131, 130, 133, 135, 134, 137, 140],

    "High": [102, 104, 103, 107, 109, 108, 110, 112, 111, 114,
             117, 116, 118, 120, 122, 121, 123, 125, 124, 127,
             129, 128, 131, 133, 132, 135, 137, 136, 139, 142],

    "Low": [99, 101, 100, 103, 105, 104, 106, 108, 107, 110,
            113, 112, 114, 116, 118, 117, 119, 121, 120, 123,
            125, 124, 127, 129, 128, 131, 133, 132, 135, 138],

    "Close": [101, 103, 102, 106, 108, 107, 109, 111, 110, 113,
              116, 115, 117, 119, 121, 120, 122, 124, 123, 126,
              128, 127, 130, 132, 131, 134, 136, 135, 138, 141],

    "Volume": [
        1000, 1100, 1050, 1200, 1300, 1250, 1400, 1500, 1450, 1600,
        1700, 1650, 1800, 1900, 2000, 1950, 2100, 2200, 2150, 2300,
        2400, 2350, 2500, 2600, 2550, 2700, 2800, 2750, 2900, 3000
    ]
}


df = pd.DataFrame(data)


# Apply feature engineering
result = engineer_features(df)


# Display the result
print("\nFeature-engineered DataFrame:\n")
print(result)


# Display column names
print("\nColumns:\n")
print(result.columns.tolist())


# Check required indicators
required_columns = [
    "SMA_20",
    "EMA_20",
    "RSI",
    "MACD",
    "MACD_Signal",
    "MACD_Histogram",
    "BB_Middle",
    "BB_Upper",
    "BB_Lower"
]


print("\nChecking technical indicators...\n")

for column in required_columns:

    if column in result.columns:
        print(f"✓ {column} created")
    else:
        print(f"✗ {column} missing")