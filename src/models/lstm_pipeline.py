import numpy as np
from sklearn.preprocessing import MinMaxScaler


LSTM_FEATURES = [
    "Close",
    "Daily_Return",
    "SMA_10",
    "SMA_20",
    "EMA_20",
    "RSI",
    "MACD",
    "MACD_Signal",
    "MACD_Histogram",
    "BB_Upper",
    "BB_Middle",
    "BB_Lower",
]


def prepare_lstm_data(df, sequence_length=60):
    """
    Prepare stock data for LSTM time-series modeling.
    """

    df = df.copy()

    missing_columns = [
        col
        for col in LSTM_FEATURES
        if col not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing required features: {missing_columns}"
        )

    df = df.dropna(
        subset=LSTM_FEATURES
    ).reset_index(drop=True)

    if len(df) <= sequence_length:
        raise ValueError(
            f"Not enough data. Need more than "
            f"{sequence_length} rows."
        )

    scaler = MinMaxScaler()

    scaled_data = scaler.fit_transform(
        df[LSTM_FEATURES]
    )

    X = []
    y = []

    close_index = LSTM_FEATURES.index("Close")

    for i in range(
        sequence_length,
        len(scaled_data)
    ):
        X.append(
            scaled_data[
                i - sequence_length:i
            ]
        )

        y.append(
            scaled_data[i, close_index]
        )

    X = np.array(X)
    y = np.array(y)

    return X, y, scaler, df
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout


def train_lstm(X, y, epochs=20, batch_size=32):
    """
    Train an LSTM model on prepared stock data.
    """

    model = Sequential([
        LSTM(
            64,
            return_sequences=True,
            input_shape=(X.shape[1], X.shape[2])
        ),

        Dropout(0.2),

        LSTM(32),

        Dropout(0.2),

        Dense(16, activation="relu"),

        Dense(1)
    ])

    model.compile(
        optimizer="adam",
        loss="mean_squared_error"
    )

    history = model.fit(
        X,
        y,
        epochs=epochs,
        batch_size=batch_size,
        validation_split=0.2,
        shuffle=False,
        verbose=1
    )

    return model, history