import os
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

def generate_student_data(num_samples=800):
    np.random.seed(42)
    
    # 1. Generate core daily log inputs
    sleep_hours = np.random.uniform(3, 10, num_samples)
    study_hours = np.random.uniform(0, 12, num_samples)
    stress_level = np.random.uniform(1, 10, num_samples)
    focus_level = np.random.uniform(1, 10, num_samples)
    tasks_total = np.random.randint(2, 10, num_samples)
    tasks_completed = np.array([np.random.randint(0, t + 1) for t in tasks_total])
    
    # Feature engineering: Task completion rate
    task_completion_rate = tasks_completed / tasks_total
    
    # 2. Simulate Burnout Labeling
    # Low = 0, Medium = 1, High = 2
    burnout_risk = []
    for i in range(num_samples):
        # Multi-variable triggers
        stress = stress_level[i]
        sleep = sleep_hours[i]
        study = study_hours[i]
        
        if stress >= 7.5 and sleep <= 5.0 and study >= 7.0:
            burnout_risk.append(2)  # High
        elif stress >= 5.5 and sleep <= 6.0:
            burnout_risk.append(1)  # Medium
        elif stress >= 8.0:
            burnout_risk.append(1)  # Medium
        else:
            burnout_risk.append(0)  # Low
            
    burnout_risk = np.array(burnout_risk)
    
    # 3. Simulate Productivity Labeling (0 to 100)
    productivity_scores = []
    for i in range(num_samples):
        study = study_hours[i]
        focus = focus_level[i]
        t_rate = task_completion_rate[i]
        sleep = sleep_hours[i]
        stress = stress_level[i]
        
        # 40% study hours, 30% focus level, 30% task rate
        study_norm = min((study / 6.0) * 100, 100)
        focus_norm = focus * 10
        task_norm = t_rate * 100
        
        score = (0.4 * study_norm) + (0.3 * focus_norm) + (0.3 * task_norm)
        
        # Apply penalties
        if sleep < 5.0:
            score -= (5.0 - sleep) * 8
        if stress > 7.0:
            score -= (stress - 7.0) * 8
            
        # Add random noise for realistic regression patterns
        score += np.random.normal(0, 3)
        clamped_score = max(0.0, min(100.0, score))
        productivity_scores.append(clamped_score)
        
    productivity_scores = np.array(productivity_scores)
    
    df_logs = pd.DataFrame({
        'sleep_hours': sleep_hours,
        'study_hours': study_hours,
        'stress_level': stress_level,
        'focus_level': focus_level,
        'task_completion_rate': task_completion_rate,
        'burnout_risk': burnout_risk,
        'productivity_score': productivity_scores
    })
    
    # 4. Generate Goal Success Dataset
    # Features: current_consistency (0-100), productivity_trend (-5 to 5), remaining_days (1-90), completion_ratio (0 to 1.5)
    consistency = np.random.uniform(20, 100, num_samples)
    trend = np.random.uniform(-4, 4, num_samples)
    remaining_days = np.random.uniform(2, 60, num_samples)
    completion_ratio = np.random.uniform(0.0, 1.2, num_samples)
    
    goal_success = []
    for i in range(num_samples):
        c = consistency[i]
        t = trend[i]
        r = remaining_days[i]
        cr = completion_ratio[i]
        
        # Probability logic
        prob = cr * 0.6 + (c / 100.0) * 0.2 + (t * 0.03)
        if cr >= 1.0:
            prob += 0.2
        if r < 5.0 and cr < 0.4:
            prob -= 0.4
            
        # Random noise threshold
        success = 1 if prob + np.random.normal(0, 0.05) >= 0.5 else 0
        goal_success.append(success)
        
    df_goals = pd.DataFrame({
        'current_consistency': consistency,
        'productivity_trend': trend,
        'remaining_days': remaining_days,
        'completion_ratio': completion_ratio,
        'goal_completed': goal_success
    })
    
    return df_logs, df_goals

def train_and_save_models():
    print("Generating synthetic student datasets...")
    df_logs, df_goals = generate_student_data()
    
    # Create saved_models folder
    os.makedirs('saved_models', exist_ok=True)
    
    # --- MODEL 1: Burnout Risk Classifier (Random Forest) ---
    print("\nTraining Burnout Risk Classifier...")
    X_burn = df_logs[['sleep_hours', 'study_hours', 'stress_level', 'focus_level', 'task_completion_rate']]
    y_burn = df_logs['burnout_risk']
    
    X_train_b, X_test_b, y_train_b, y_test_b = train_test_split(X_burn, y_burn, test_size=0.2, random_state=42)
    
    burn_pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('classifier', RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42))
    ])
    
    burn_pipeline.fit(X_train_b, y_train_b)
    acc = burn_pipeline.score(X_test_b, y_test_b)
    print(f"Burnout Classifier Accuracy: {acc * 100:.2f}%")
    
    joblib.dump(burn_pipeline, 'saved_models/burnout_model.joblib')
    print("Burnout Model saved successfully!")
    
    # --- MODEL 2: Productivity Score Regressor (Random Forest Regressor) ---
    print("\nTraining Productivity Score Regressor...")
    X_prod = df_logs[['sleep_hours', 'study_hours', 'stress_level', 'focus_level', 'task_completion_rate']]
    y_prod = df_logs['productivity_score']
    
    X_train_p, X_test_p, y_train_p, y_test_p = train_test_split(X_prod, y_prod, test_size=0.2, random_state=42)
    
    prod_pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('regressor', RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42))
    ])
    
    prod_pipeline.fit(X_train_p, y_train_p)
    r2 = prod_pipeline.score(X_test_p, y_test_p)
    print(f"Productivity Regressor R^2 Score: {r2 * 100:.2f}%")
    
    joblib.dump(prod_pipeline, 'saved_models/productivity_model.joblib')
    print("Productivity Model saved successfully!")
    
    # --- MODEL 3: Goal Success Probability (Logistic Regression) ---
    print("\nTraining Goal Success Predictor...")
    X_goal = df_goals[['current_consistency', 'productivity_trend', 'remaining_days', 'completion_ratio']]
    y_goal = df_goals['goal_completed']
    
    X_train_g, X_test_g, y_train_g, y_test_g = train_test_split(X_goal, y_goal, test_size=0.2, random_state=42)
    
    goal_pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('classifier', LogisticRegression(random_state=42))
    ])
    
    goal_pipeline.fit(X_train_g, y_train_g)
    g_acc = goal_pipeline.score(X_test_g, y_test_g)
    print(f"Goal Success Predictor Accuracy: {g_acc * 100:.2f}%")
    
    joblib.dump(goal_pipeline, 'saved_models/goal_model.joblib')
    print("Goal Model saved successfully!")
    
    print("\nAll behavioral intelligence models successfully trained and serialized inside saved_models/!")

if __name__ == '__main__':
    train_and_save_models()
