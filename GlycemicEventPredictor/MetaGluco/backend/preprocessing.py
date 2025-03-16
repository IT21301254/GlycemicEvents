# preprocessing.py
import numpy as np
import pandas as pd

def prepare_input_data(recent_glucose_data, recent_insulin_data, recent_meal_data,
                      recent_activity_data=None, recent_hr_data=None, recent_gsr_data=None,
                      feature_columns=None, feature_scaler=None):
    """
    Process raw input data and prepare it for the model
    
    Returns:
        Preprocessed input sequence ready for model prediction
    """
    # Use the most recent 12 readings
    glucose_data = recent_glucose_data[-12:]

    # Create a dataframe with the input data
    input_df = pd.DataFrame({
        'cbg': glucose_data,
        'basal': recent_insulin_data.get('basal', [0] * len(glucose_data))[-12:],
        'bolus': recent_insulin_data.get('bolus', [0] * len(glucose_data))[-12:],
        'carbInput': recent_meal_data[-12:] if len(recent_meal_data) >= 12 else [0] * 12,
        'hr': recent_hr_data[-12:] if recent_hr_data and len(recent_hr_data) >= 12 else [70] * 12,  # Default HR
        'gsr': recent_gsr_data[-12:] if recent_gsr_data and len(recent_gsr_data) >= 12 else [1] * 12   # Default GSR
    })

    # Calculate glucose changes
    input_df['glucose_change'] = input_df['cbg'].diff().fillna(0)
    input_df['glucose_acceleration'] = input_df['glucose_change'].diff().fillna(0)

    # Calculate rolling statistics
    input_df['glucose_rolling_mean_1h'] = input_df['cbg'].rolling(window=12, min_periods=1).mean()
    input_df['glucose_rolling_std_1h'] = input_df['cbg'].rolling(window=12, min_periods=1).std().fillna(0)

    # Calculate insulin on board (simplified version)
    input_df['insulin_on_board'] = calculate_insulin_on_board(input_df['bolus'])
    
    # Calculate carbs on board (simplified version)
    input_df['carbs_on_board'] = calculate_carbs_on_board(input_df['carbInput'])

    # Ensure all required feature columns exist
    for col in feature_columns:
        if col not in input_df.columns:
            input_df[col] = 0

    # Extract features in the correct order
    input_features = input_df[feature_columns].values

    # Scale the features
    input_features_scaled = feature_scaler.transform(input_features)

    # Reshape for LSTM input [samples, time steps, features]
    input_sequence = input_features_scaled.reshape(1, 12, len(feature_columns))

    return input_sequence

def calculate_insulin_on_board(bolus_series):
    """Calculate insulin on board based on bolus history"""
    # Simple exponential decay model
    iob = [0] * len(bolus_series)
    
    # Assuming insulin activity peaks at 1 hour and then declines over 4 hours