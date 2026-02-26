import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import os
from statsmodels.tsa.arima.model import ARIMA
from sklearn.preprocessing import MinMaxScaler # type: ignore
from tensorflow.keras.models import Sequential # type: ignore
from tensorflow.keras.layers import LSTM, Dense # type: ignore

# --- 1. SETUP & PATHS ---
st.set_page_config(page_title="Ocean Conditions Dashboard", layout="wide")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FILE_PATH = os.path.join(BASE_DIR, 'combined_ocean_sales_data.csv')

# --- 2. DATA LOADING ---
@st.cache_data
def load_data():
    if not os.path.exists(FILE_PATH):
        st.error(f"File not found: {FILE_PATH}")
        st.stop()
    df = pd.read_csv(FILE_PATH)
    df['date'] = pd.to_datetime(df['date'])
    return df

try:
    df = load_data()
except Exception as e:
    st.error(f"Error loading data: {e}")
    st.stop()

# --- 3. SIDEBAR MENU ---
st.sidebar.title("📊 Control Panel")
st.sidebar.info("Select the data parameter you wish to analyze and forecast for 2026.")

view_mode = st.sidebar.selectbox(
    "Select Parameter:",
    ["Fishing Density", "Sea Surface Temperature (SST)", "Chlorophyll Levels"]
)

# Configuration mapping for columns
menu_map = {
    "Sea Surface Temperature (SST)": {"col": "SST", "unit": "°C", "color": "#FF4B4B"},
    "Fishing Density": {"col": "fish_density", "unit": "Count/km²", "color": "#1C83E1"},
    "Chlorophyll Levels": {"col": "chlorophyll", "unit": "mg/m³", "color": "#00C781"}
}

config = menu_map[view_mode]
# Focus on North Region
target_df = df[df['region'] == 'North'].sort_values('date')
data_series = target_df[config['col']].values

# --- 4. FORECASTING ENGINE ---
st.header(f"📈 2026 Forecast: {view_mode}")

with st.spinner(f"Processing models for {view_mode}..."):
    # A. ARIMA Baseline
    arima_model = ARIMA(data_series, order=(5,1,1)).fit()
    arima_forecast = arima_model.forecast(steps=30)

    # B. LSTM Advanced
    scaler = MinMaxScaler()
    scaled_data = scaler.fit_transform(data_series.reshape(-1, 1))
    
    # Sequence generation (14 day window)
    X, y = [], []
    for i in range(len(scaled_data)-14):
        X.append(scaled_data[i:i+14])
        y.append(scaled_data[i+14])
    X, y = np.array(X), np.array(y)

    model = Sequential([
        LSTM(32, activation='relu', input_shape=(14, 1)),
        Dense(1)
    ])
    model.compile(optimizer='adam', loss='mse')
    model.fit(X, y, epochs=5, verbose=0)

    # Recursive 30-day forecast
    last_window = scaled_data[-14:].reshape(1, 14, 1)
    lstm_preds = []
    for _ in range(30):
        p = model.predict(last_window, verbose=0)
        lstm_preds.append(p[0,0])
        last_window = np.append(last_window[:,1:,:], [[p[0]]], axis=1)
    
    lstm_final = scaler.inverse_transform(np.array(lstm_preds).reshape(-1, 1)).flatten()

# --- 5. VISUALIZATION ---
col1, col2 = st.columns([3, 1])

with col1:
    fig, ax = plt.subplots(figsize=(10, 5))
    ax.plot(data_series[-60:], label="Historical (Last 60 Days)", color="#333333", alpha=0.5)
    ax.plot(range(60, 90), arima_forecast, label="ARIMA Baseline", color="red", linestyle="--")
    ax.plot(range(60, 90), lstm_final, label="LSTM Advanced", color=config['color'], linewidth=2)
    ax.set_ylabel(config['unit'])
    ax.set_xlabel("Forecast Horizon (Days)")
    ax.legend()
    ax.grid(True, alpha=0.2)
    st.pyplot(fig)

with col2:
    st.metric(label="ARIMA Avg Prediction", value=f"{arima_forecast.mean():.2f} {config['unit']}")
    st.metric(label="LSTM Avg Prediction", value=f"{lstm_final.mean():.2f} {config['unit']}")

# --- 6. DATA TABLE ---
st.subheader("📋 Forecast Summary Table")
forecast_table = pd.DataFrame({
    "Day": [f"Day {i+1}" for i in range(30)],
    "ARIMA (Linear)": arima_forecast,
    "LSTM (Non-Linear)": lstm_final
})
st.dataframe(forecast_table, use_container_width=True)