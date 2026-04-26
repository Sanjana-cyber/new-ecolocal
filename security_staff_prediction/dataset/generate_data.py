import pandas as pd
import numpy as np
import os

def generate_dataset(num_rows=600):
    np.random.seed(42)
    
    event_types = ['Concert', 'Sports', 'Festival', 'Political', 'College Fest']
    weather_conditions = ['Sunny', 'Rainy', 'Cloudy', 'Stormy']
    threat_levels = ['Low', 'Medium', 'High']
    day_types = ['Weekday', 'Weekend']
    
    data = []
    
    for _ in range(num_rows):
        event_type = np.random.choice(event_types)
        crowd_size = np.random.randint(500, 50000)
        venue_capacity = crowd_size + np.random.randint(100, 10000)
        is_outdoor = np.random.choice([0, 1])
        duration = np.random.randint(2, 10)
        vip_presence = np.random.choice([0, 1])
        entry_gates = np.random.randint(2, 15)
        incident_risk = np.random.randint(1, 11)
        weather = np.random.choice(weather_conditions)
        day_type = np.random.choice(day_types)
        is_holiday = np.random.choice([0, 1], p=[0.9, 0.1])
        alcohol_allowed = np.random.choice([0, 1])
        emergency_exits = np.random.randint(2, 20)
        threat_level = np.random.choice(threat_levels)
        
        # Logic for required staff prediction (the ground truth)
        # Base: 1 staff per 100 people
        base_staff = crowd_size / 80
        
        # Modifiers
        if alcohol_allowed: base_staff *= 1.25
        if threat_level == 'High': base_staff *= 1.5
        elif threat_level == 'Medium': base_staff *= 1.2
        
        if vip_presence: base_staff *= 1.15
        if incident_risk > 7: base_staff *= 1.2
        if weather in ['Rainy', 'Stormy']: base_staff *= 1.1
        if event_type == 'Political': base_staff *= 1.3
        
        # Gates and Exits factor
        base_staff += (entry_gates * 2) + (emergency_exits * 1)
        
        # Add some noise
        required_staff = int(base_staff + np.random.normal(0, 5))
        required_staff = max(5, required_staff) # Minimum 5 staff
        
        data.append([
            event_type, crowd_size, venue_capacity, is_outdoor, duration,
            vip_presence, entry_gates, incident_risk, weather, day_type,
            is_holiday, alcohol_allowed, emergency_exits, threat_level, required_staff
        ])
    
    columns = [
        'event_type', 'crowd_size', 'venue_capacity', 'is_outdoor', 'duration',
        'vip_presence', 'entry_gates', 'incident_risk', 'weather', 'day_type',
        'is_holiday', 'alcohol_allowed', 'emergency_exits', 'threat_level', 'required_staff'
    ]
    
    df = pd.DataFrame(data, columns=columns)
    output_path = os.path.join('dataset', 'event_data.csv')
    df.to_csv(output_path, index=False)
    print(f"Dataset generated with {num_rows} rows at {output_path}")

if __name__ == "__main__":
    generate_dataset()
