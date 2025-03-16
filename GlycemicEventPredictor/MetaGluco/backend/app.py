# app.py
from flask import Flask, request, jsonify
from prediction import predict_glucose_events
import os

app = Flask(__name__)

@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Endpoint to predict glycemic events based on recent data
    """
    if request.method == 'POST':
        try:
            data = request.get_json()
            
            # Extract data from request
            glucose_readings = data.get('glucose_readings', [])
            insulin_data = data.get('insulin', {'basal': [], 'bolus': []})
            carb_data = data.get('carbs', [])
            activity_data = data.get('activity', [])
            heart_rate_data = data.get('heart_rate', [])
            gsr_data = data.get('gsr', [])
            
            # Validate input data
            if len(glucose_readings) < 12:
                return jsonify({
                    'error': 'Not enough glucose readings. At least 12 readings (1 hour of data) are required.'
                }), 400
            
            # Call prediction function
            prediction_result = predict_glucose_events(
                glucose_readings, 
                insulin_data,
                carb_data,
                activity_data,
                heart_rate_data,
                gsr_data
            )
            
            # Check if prediction returned an error
            if 'error' in prediction_result:
                return jsonify(prediction_result), 500
                
            return jsonify(prediction_result)
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    return jsonify({'error': 'Method not allowed'}), 405

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple endpoint to check if API is running"""
    return jsonify({
        'status': 'healthy',
        'version': '1.0.0'
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))