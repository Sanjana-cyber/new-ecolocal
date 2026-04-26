# Security Staff Requirement Prediction for Large Event Days

A full-stack AI solution designed to predict security staffing needs for large-scale events using Random Forest Regression.

## 🚀 Features
- **AI-Powered Predictions**: Uses scikit-learn's Random Forest Regressor to estimate personnel needs.
- **Dynamic Dashboard**: Interactive visualizations of event history and staffing trends using Chart.js.
- **Premium UI**: Modern dark theme with glassmorphism, responsive layout, and smooth animations.
- **Detailed Analysis**: Breaks down staffing into core security, gate management, and VIP/Response teams.
- **Report Generation**: Export prediction results to professional PDF reports.
- **Comprehensive Inputs**: Analyzes 14+ variables including threat levels, crowd size, and weather conditions.

## 🛠️ Tech Stack
- **Backend**: Python, Flask
- **Machine Learning**: Scikit-Learn, Pandas, NumPy
- **Frontend**: HTML5, CSS3 (Vanilla + Bootstrap 5), JavaScript
- **Visualization**: Chart.js
- **PDF Generation**: FPDF

## 📁 Project Structure
```text
security_staff_prediction/
├── app.py              # Flask server and prediction logic
├── model/
│   ├── train_model.py  # ML Training script
│   └── model.pkl       # Serialized Random Forest model
├── dataset/
│   ├── generate_data.py# Synthetic dataset generator
│   └── event_data.csv  # Training data
├── static/
│   ├── css/style.css   # Custom premium styling
│   └── js/script.js    # Charting and interactivity
├── templates/          # HTML templates (layout, index, predict, etc.)
└── requirements.txt    # Project dependencies
```

## 🏁 Getting Started

### 1. Installation
Install the required Python packages:
```bash
pip install -r requirements.txt
```

### 2. Data & Model Preparation
If you want to re-train the model:
```bash
python dataset/generate_data.py
python model/train_model.py
```

### 3. Run the Application
```bash
python app.py
```
Access the app at `http://127.0.0.1:5000`

## 📊 Model Details
The prediction model uses a **Pipeline** approach:
1. **Preprocessing**: One-Hot Encoding for categorical features and Passthrough for numerical features.
2. **Regressor**: Random Forest Regressor (200 estimators) providing high accuracy and robustness against outliers.

---
Developed with ❤️ by Antigravity AI
