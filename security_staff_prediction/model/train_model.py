import pandas as pd
import numpy as np
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, r2_score

def train_model():
    dataset_path = os.path.join('dataset', 'event_data.csv')
    if not os.path.exists(dataset_path):
        print("Dataset not found. Run generate_data.py first.")
        return

    df = pd.read_csv(dataset_path)

    X = df.drop('required_staff', axis=1)
    y = df['required_staff']

    # Define categorical and numerical features
    categorical_features = ['event_type', 'weather', 'day_type', 'threat_level']
    numerical_features = [
        'crowd_size', 'venue_capacity', 'is_outdoor', 'duration', 
        'vip_presence', 'entry_gates', 'incident_risk', 'is_holiday', 
        'alcohol_allowed', 'emergency_exits'
    ]

    # Preprocessing pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', 'passthrough', numerical_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ])

    # Model pipeline
    model = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=200, random_state=42))
    ])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Training model...")
    model.fit(X_train, y_train)

    # Evaluation
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print(f"Model trained. MAE: {mae:.2f}, R2 Score: {r2:.2f}")

    # Save model
    model_dir = 'model'
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)
    
    model_path = os.path.join(model_dir, 'model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_model()
