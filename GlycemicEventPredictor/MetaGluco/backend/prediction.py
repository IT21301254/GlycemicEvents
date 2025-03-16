# prediction.py
import numpy as np
import pandas as pd
import tensorflow as tf
import joblib
import os
from preprocessing import prepare_input_data
from utils.recommendation import generate_recommendation

# Define model directory
model_dir = os.path.join(os.path.dirname(__file__), 'models')

# Check if model directory exists, if not create it
if not os.path.exists(model_dir):
    os.makedirs(model_dir)
    print(f"Created model directory at {model_dir}")

# Check if model files exist
model_path = os.path.join(model_dir, 'glycemic_event_prediction_model.keras')
feature_scaler_path = os.path.join(model_dir, 'feature_scaler.pkl')
regression_scaler_path = os.path.join(model_dir, 'regression_scaler.pkl')

# Initialize global variables
model = None
feature_scaler = None
regression_scaler = None

# Try to load model and scalers
try:
    if os.path.exists(model_path):
        print(f"Loading model from {model_path}")
        model = tf.keras.models.load_model(model_path)
        print("Model loaded successfully")
    else:
        print(f"WARNING: Model file not found at {model_path}")
        
    if os.path.exists(feature_scaler_path):
        feature_scaler = joblib.load(feature_scaler_path)
    else:
        print(f"WARNING: Feature scaler not found at {feature_scaler_path}")
        
    if os.path.exists(regression_scaler_path):
        regression_scaler = joblib.load(regression_scaler_path)
    else:
        print(f"WARNING: Regression scaler not found at {regression_scaler_path}")
except Exception as e:
    print(f"Error loading model or scalers: {str(e)}")

# Load feature and target column names if available
try:
    feature_columns = np.load(os.path.join(model_dir, 'feature_columns.npy'), allow_pickle=True).tolist()
    target_columns = np.load(os.path.join(model_dir, 'target_columns.npy'), allow_pickle=True).tolist()
except FileNotFoundError:
    print("Using default feature and target columns")
    # Default column names from your notebook
    feature_columns = [
        'cbg', 'glucose_change', 'glucose_acceleration',
        'glucose_rolling_mean_1h', 'glucose_rolling_std_1h',
        'basal', 'bolus', 'carbInput', 'insulin_on_board', 'carbs_on_board',
        'hr', 'gsr'
    ]
    target_columns = ['hypo_next_30min', 'hyper_next_30min', 'time_to_hypo', 'time_to_hyper']

def predict_glucose_events(recent_glucose_data, recent_insulin_data, recent_meal_data,
                          recent_activity_data=None, recent_hr_data=None, recent_gsr_data=None):
    """
    Make predictions using the trained model with user input data
    """
    # Check if model and scalers are loaded
    if model is None or feature_scaler is None or regression_scaler is None:
        return {
            "error": "Model or scalers not loaded. Please ensure model files are in the correct location.",
            "model_path": model_path,
            "model_exists": os.path.exists(model_path)
        }
    
    # Ensure we have enough data points
    if len(recent_glucose_data) < 12:
        return {"error": "Need at least 12 glucose readings (1 hour of data)"}

    # Process the input data
    input_sequence = prepare_input_data(
        recent_glucose_data, 
        recent_insulin_data,
        recent_meal_data,
        recent_activity_data,
        recent_hr_data,
        recent_gsr_data,
        feature_columns,
        feature_scaler
    )

    # Make prediction
    prediction = model.predict(input_sequence)[0]

    # Extract classification and regression predictions
    hypo_probability = prediction[0]
    hyper_probability = prediction[1]
    time_to_hypo_scaled = prediction[2]
    time_to_hyper_scaled = prediction[3]

    # Convert regression predictions back to original scale
    regression_predictions = regression_scaler.inverse_transform(
        np.array([[time_to_hypo_scaled, time_to_hyper_scaled]])
    )[0]

    time_to_hypo = max(0, regression_predictions[0])
    time_to_hyper = max(0, regression_predictions[1])

    # Get current glucose (most recent reading)
    current_glucose = recent_glucose_data[-1]

    # Get risk levels
    hypo_risk = "High" if hypo_probability > 0.7 else "Medium" if hypo_probability > 0.3 else "Low"
    hyper_risk = "High" if hyper_probability > 0.7 else "Medium" if hyper_probability > 0.3 else "Low"

    # Get recommendation
    recommendation = generate_recommendation(
        current_glucose, 
        float(hypo_probability), 
        float(hyper_probability),
        float(time_to_hypo), 
        float(time_to_hyper)
    )

    # Return results
    return {
        "current_glucose": float(current_glucose),
        "hypo_probability": float(hypo_probability),
        "hyper_probability": float(hyper_probability),
        "hypo_risk": hypo_risk,
        "hyper_risk": hyper_risk,
        "time_to_hypo_minutes": float(time_to_hypo) if hypo_probability > 0.3 else None,
        "time_to_hyper_minutes": float(time_to_hyper) if hyper_probability > 0.3 else None,
        "recommendation": recommendation,
        "timestamp": pd.Timestamp.now().isoformat()
    }