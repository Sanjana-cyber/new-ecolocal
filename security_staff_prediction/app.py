import os
import pickle
import pandas as pd
import numpy as np
from flask import Flask, render_template, request, jsonify, send_file
from fpdf import FPDF
from datetime import datetime

app = Flask(__name__)

# Load Model
MODEL_PATH = 'model/model.pkl'
with open(MODEL_PATH, 'rb') as f:
    model = pickle.load(f)

# Prediction Logs (Simple storage)
prediction_history = []

def get_risk_level(staff_count, crowd_size):
    ratio = staff_count / crowd_size if crowd_size > 0 else 0
    if ratio < 0.005: return "High Risk", "danger", "Critical staffing levels detected. Immediate reinforcement recommended."
    if ratio < 0.01: return "Moderate Risk", "warning", "Standard staffing levels. Monitor entry points closely."
    return "Low Risk", "success", "Optimal staffing for this event scale. Ensure communication channels are clear."

@app.route('/')
def index():
    return render_template('index.html', history=prediction_history[:5])

@app.route('/predict', methods=['GET', 'POST'])
def predict():
    if request.method == 'POST':
        try:
            # Helper function to safely get integer from form
            def get_int(field, min_val=0, required=False):
                val = request.form.get(field)
                if required and not val:
                    raise ValueError(f"The field '{field.replace('_', ' ').title()}' is required.")
                try:
                    return max(min_val, int(val)) if val else 0
                except (ValueError, TypeError):
                    if required: raise
                    return 0

            # Toggle handling logic: Flask returns '1' if checked, nothing if unchecked.
            # Using getlist or checking for existence is standard.
            def get_toggle(field):
                return 1 if request.form.get(field) == '1' else 0

            data = {
                'event_type': request.form.get('event_type'),
                'crowd_size': get_int('crowd_size', required=True),
                'venue_capacity': get_int('venue_capacity', required=True),
                'is_outdoor': get_toggle('is_outdoor'),
                'duration': get_int('duration', 1),
                'vip_presence': get_toggle('vip_presence'),
                'entry_gates': get_int('entry_gates', 1),
                'incident_risk': get_int('incident_risk', 1),
                'weather': request.form.get('weather', 'Sunny'),
                'day_type': request.form.get('day_type', 'Weekday'),
                'is_holiday': get_toggle('is_holiday'),
                'alcohol_allowed': get_toggle('alcohol_allowed'),
                'emergency_exits': get_int('emergency_exits', 1),
                'threat_level': request.form.get('threat_level', 'Low')
            }
            
            # Create DataFrame for prediction
            input_df = pd.DataFrame([data])
            prediction = model.predict(input_df)[0]
            predicted_staff = int(np.round(prediction))
            
            risk_label, risk_class, message = get_risk_level(predicted_staff, data['crowd_size'])
            
            result = {
                **data,
                'predicted_staff': predicted_staff,
                'risk_label': risk_label,
                'risk_class': risk_class,
                'message': message,
                'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            
            prediction_history.insert(0, result)
            return render_template('result.html', result=result)
            
        except Exception as e:
            return render_template('predict.html', error=str(e))
            
    return render_template('predict.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/bulk-upload', methods=['GET', 'POST'])
def bulk_upload():
    if request.method == 'POST':
        file = request.files.get('file')
        if not file or not file.filename.endswith('.csv'):
            return render_template('bulk.html', error="Please upload a valid CSV file.")
        
        try:
            df = pd.read_csv(file)
            predictions = model.predict(df)
            df['predicted_staff'] = np.round(predictions).astype(int)
            
            output_path = 'static/reports/bulk_results.csv'
            if not os.path.exists("static/reports"):
                os.makedirs("static/reports")
            df.to_csv(output_path, index=False)
            
            return send_file(output_path, as_attachment=True, download_name="bulk_predictions.csv")
        except Exception as e:
            return render_template('bulk.html', error=f"Error processing CSV: {str(e)}")
            
    return render_template('bulk.html')
    # Return some mock stats for the charts on index
    stats = {
        'labels': ['Concert', 'Sports', 'Festival', 'Political', 'College Fest'],
        'staff_avg': [120, 150, 90, 200, 60],
        'risk_levels': [10, 5, 15, 20, 5]
    }
    return jsonify(stats)

if __name__ == '__main__':
    app.run(debug=True)
