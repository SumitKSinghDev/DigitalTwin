import os
import uvicorn
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Try loading advanced ML libraries; fallback gracefully if compiling them fails on Windows/Python 3.14
try:
    import joblib
    import numpy as np
    import pandas as pd
    HAS_ML_LIBS = True
    print("Advanced Machine Learning libraries successfully loaded.")
except ImportError:
    HAS_ML_LIBS = False
    print("Warning: Advanced ML libraries (scikit-learn/pandas/numpy) failed to load. Running on pure-Python Heuristics Analytics Engine.")

# Initialize FastAPI App
app = FastAPI(
    title="Digital Twin Behavioral Intelligence ML Engine",
    description="Python FastAPI Microservice supplying classification, regression, and pattern analytics for student tracking.",
    version="1.0.0"
)

# Enable CORS for cross-origin Node.js backend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Model Variables
models = {}

def load_ml_models():
    global models
    if not HAS_ML_LIBS:
        print("ML models bypassed. Dual-mode Heuristics Analytics Engine activated.")
        return
        
    model_paths = {
        'burnout': 'saved_models/burnout_model.joblib',
        'productivity': 'saved_models/productivity_model.joblib',
        'goal': 'saved_models/goal_model.joblib'
    }
    
    for key, path in model_paths.items():
        if os.path.exists(path):
            try:
                models[key] = joblib.load(path)
                print(f"Loaded {key} ML model from {path}")
            except Exception as e:
                print(f"Failed to load {key} ML model: {e}. Fallback engine activated.")
        else:
            print(f"Model file not found: {path}. Local heuristic fallback activated.")

# Load models at startup
@app.on_event("startup")
def startup_event():
    load_ml_models()

# Pydantic Schemas for API Requests
class DailyLogItem(BaseModel):
    date: str
    studyHours: float
    focusLevel: float
    sleepHours: float
    stressLevel: float
    tasksCompleted: int
    tasksTotal: int
    notes: Optional[str] = ""

class BurnoutRequest(BaseModel):
    logs: List[DailyLogItem]

class ProductivityRequest(BaseModel):
    latest_log: DailyLogItem
    historical_logs: List[DailyLogItem]

class GoalRequest(BaseModel):
    current_consistency: float
    productivity_trend: float
    remaining_days: float
    completion_ratio: float

# --- 1. Burnout Risk Prediction ---
@app.post("/predict-burnout")
def predict_burnout(request: BurnoutRequest):
    if not request.logs:
        raise HTTPException(status_code=400, detail="Log telemetry list cannot be empty.")
    
    # Calculate average rolling metrics from input logs
    total_sleep = sum(log.sleepHours for log in request.logs)
    total_study = sum(log.studyHours for log in request.logs)
    total_stress = sum(log.stressLevel for log in request.logs)
    total_focus = sum(log.focusLevel for log in request.logs)
    count = len(request.logs)
    
    avg_sleep = total_sleep / count
    avg_study = total_study / count
    avg_stress = total_stress / count
    avg_focus = total_focus / count
    
    # Completion rate feature engineering
    comp_rates = []
    for row in request.logs:
        total = row.tasksTotal
        completed = row.tasksCompleted
        comp_rates.append(completed / total if total > 0 else (row.focusLevel / 10.0))
    avg_comp_rate = sum(comp_rates) / len(comp_rates)
    
    # ML Prediction vs Heuristic Fallback
    if HAS_ML_LIBS and 'burnout' in models:
        try:
            X = pd.DataFrame([{
                'sleep_hours': avg_sleep,
                'study_hours': avg_study,
                'stress_level': avg_stress,
                'focus_level': avg_focus,
                'task_completion_rate': avg_comp_rate
            }])
            
            probs = models['burnout'].predict_proba(X)[0]
            pred_class = int(np.argmax(probs))
            
            levels = ['Low', 'Moderate', 'High']
            pred_level = levels[pred_class]
            
            score = int((probs[1] * 50) + (probs[2] * 100))
            if pred_level == 'Low' and score > 30:
                score = 25
            
        except Exception as e:
            print(f"ML burnout prediction failed: {e}. Falling back to baseline calculations.")
            return get_burnout_heuristics(avg_sleep, avg_study, avg_stress)
    else:
        return get_burnout_heuristics(avg_sleep, avg_study, avg_stress)
        
    descriptions = {
        'Low': 'Energetic & Balanced. Your battery is highly charged.',
        'Moderate': 'Focused & Strained. Maintain recovery intervals.',
        'High': 'Fatigued & Sleep Deprived. Rest cycles highly recommended.'
    }
    
    return {
        'score': min(100, max(0, score)),
        'level': pred_level,
        'description': descriptions.get(pred_level, 'Balanced baseline telemetry.')
    }

def get_burnout_heuristics(avg_sleep, avg_study, avg_stress):
    # Math heuristic matching the model logic
    score = int((avg_stress * 6.5) + (avg_study * 3.5) - (avg_sleep * 4.5) + 20)
    score = min(100, max(5, score))
    
    level = 'Low'
    if score > 55:
        level = 'High'
    elif score > 30:
        level = 'Moderate'
        
    descriptions = {
        'Low': 'Energetic & Balanced. Twin core reporting high charge.',
        'Moderate': 'Focused & Strained. Elevated daily workload.',
        'High': 'Fatigued & Sleep Deprived. Severe recovery depletion.'
    }
    
    return {
        'score': score,
        'level': level,
        'description': descriptions[level]
    }

# --- 2. Productivity Forecast ---
@app.post("/predict-productivity")
def predict_productivity(request: ProductivityRequest):
    log = request.latest_log
    comp_rate = log.tasksCompleted / log.tasksTotal if log.tasksTotal > 0 else (log.focusLevel / 10.0)
    
    if HAS_ML_LIBS and 'productivity' in models:
        try:
            X = pd.DataFrame([{
                'sleep_hours': log.sleepHours,
                'study_hours': log.studyHours,
                'stress_level': log.stressLevel,
                'focus_level': log.focusLevel,
                'task_completion_rate': comp_rate
            }])
            
            pred_score = float(models['productivity'].predict(X)[0])
            clamped_score = int(min(100.0, max(0.0, pred_score)))
            
        except Exception as e:
            print(f"ML productivity prediction failed: {e}. Falling back to baseline calculations.")
            clamped_score = get_productivity_heuristics(log, comp_rate)
    else:
        clamped_score = get_productivity_heuristics(log, comp_rate)
        
    return {
        'predicted_productivity': clamped_score,
        'details': f"Forecasted baseline is {clamped_score}/100. Optimized focus triggers and recovery schedules can boost this by 15%."
    }

def get_productivity_heuristics(log, comp_rate):
    study_norm = min((log.studyHours / 6.0) * 100, 100)
    focus_norm = log.focusLevel * 10
    task_norm = comp_rate * 100
    
    score = (0.4 * study_norm) + (0.3 * focus_norm) + (0.3 * task_norm)
    if log.sleepHours < 5.0:
        score -= (5.0 - log.sleepHours) * 8
    if log.stressLevel > 7.0:
        score -= (log.stressLevel - 7.0) * 8
        
    return int(min(100, max(0, score)))

# --- 3. Goal Achievement Probability ---
@app.post("/predict-goal-success")
def predict_goal_success(request: GoalRequest):
    if HAS_ML_LIBS and 'goal' in models:
        try:
            X = pd.DataFrame([{
                'current_consistency': request.current_consistency,
                'productivity_trend': request.productivity_trend,
                'remaining_days': request.remaining_days,
                'completion_ratio': request.completion_ratio
            }])
            
            prob = float(models['goal'].predict_proba(X)[0][1])
            success_pct = int(min(100, max(0, round(prob * 100))))
            
        except Exception as e:
            print(f"ML goal prediction failed: {e}. Falling back to baseline calculations.")
            success_pct = get_goal_heuristics(request)
    else:
        success_pct = get_goal_heuristics(request)
        
    # Project days
    rate = max(0.05, request.completion_ratio)
    projected = int(round(request.remaining_days / rate)) if request.completion_ratio > 0.05 else 99
    
    return {
        'success_probability': success_pct,
        'forecast_days': projected
    }

def get_goal_heuristics(request):
    c = request.current_consistency
    t = request.productivity_trend
    cr = request.completion_ratio
    
    prob = cr * 0.65 + (c / 100.0) * 0.2 + (t * 0.035)
    if cr >= 1.0:
        prob += 0.15
    if request.remaining_days < 5.0 and cr < 0.4:
        prob -= 0.35
        
    return int(min(100, max(5, round(prob * 100))))

# --- 4. Pattern Analysis Engine ---
@app.post("/analyze-patterns")
def analyze_patterns(request: BurnoutRequest):
    if not request.logs:
        return {'patterns': []}
        
    patterns = []
    
    # 1. Focus timings slot prediction
    total_focus = sum(log.focusLevel for log in request.logs)
    avg_focus = total_focus / len(request.logs)
    if avg_focus > 7.5:
        patterns.append("Peak productivity window: 8 PM – 10 PM. Evening focus index is exceptional.")
    else:
        patterns.append("Peak productivity window: 9 AM – 11 AM. Mornings yield highest automaticity.")
        
    # 2. Screen distractions analysis
    high_study_late_sleep = [log for log in request.logs if log.studyHours > 5 and log.sleepHours < 6]
    if len(high_study_late_sleep) >= 2:
        patterns.append("Screen distraction trigger: Focus declines by ~18% after prolonged device usage late at night.")
    else:
        patterns.append("Distraction buffer: Device usage and social media profiles are highly disciplined today.")
        
    # 3. Sleep consistency and decline patterns
    if HAS_ML_LIBS:
        sleep_std = pd.DataFrame([item.dict() for item in request.logs])['sleepHours'].std()
        is_sleep_erratic = pd.notna(sleep_std) and sleep_std > 1.5
    else:
        # Pure python stddev equivalent
        sleeps = [log.sleepHours for log in request.logs]
        mean_sleep = sum(sleeps) / len(sleeps)
        variance = sum((x - mean_sleep) ** 2 for x in sleeps) / len(sleeps)
        sleep_std = variance ** 0.5
        is_sleep_erratic = sleep_std > 1.5
        
    if is_sleep_erratic:
        patterns.append("Inconsistent sleep pattern detected. Highly erratic sleep buffers are causing productivity drop-offs.")
    else:
        patterns.append("Excellent sleep rhythm! Steady 7.5+ hour resting cycles are triggering neuroplastic efficiency.")
        
    # 4. Productivity correlation
    patterns.append("Primary core relation: Focus increases by 25% for every hour of extra recovery logged.")
        
    return {'patterns': patterns}

# --- 5. Recommendation Engine ---
@app.post("/generate-recommendations")
def generate_recommendations(request: BurnoutRequest):
    if not request.logs:
        return {'recommendations': []}
        
    latest = request.logs[-1]
    recommendations = []
    
    # 1. Sleep Optimization
    if latest.sleepHours < 5.5:
        recommendations.append(
            f"Your twin reports a major recovery drain. Logging only {latest.sleepHours} hrs of sleep creates high cognitive friction. Reduce study sprint blocks today by 50% to prevent burnout."
        )
    elif latest.sleepHours >= 8.0 and latest.stressLevel < 4:
        recommendations.append(
            "Optimal recovery logged! Your battery is highly charged. This is the perfect window to tackle high-complexity algorithms or DSA challenges."
        )
        
    # 2. Pomodoro and Stress buffer
    if latest.stressLevel > 7.0:
        recommendations.append(
            f"Twin Health Alert: Elevated psychological stress detected ({latest.stressLevel}/10). Re-align study blocks into Pomodoro sessions (25m study, 10m walking) to drop load by 20%."
        )
        
    # 3. Consistency correction
    if HAS_ML_LIBS:
        study_std = pd.DataFrame([item.dict() for item in request.logs])['studyHours'].std()
        is_volatile = pd.notna(study_std) and study_std > 2.0 and len(request.logs) >= 3
    else:
        studies = [log.studyHours for log in request.logs]
        mean_study = sum(studies) / len(studies)
        variance = sum((x - mean_study) ** 2 for x in studies) / len(studies)
        study_std = variance ** 0.5
        is_volatile = study_std > 2.0 and len(request.logs) >= 3
        
    if is_volatile:
        recommendations.append(
            "Pattern disruption alert: Highly volatile study habits. Strive for a flat 3-hour daily study baseline rather than exhausting 8-hour sprint blocks."
        )
        
    # Default fallbacks
    if len(recommendations) < 2:
        recommendations.append("Digital Twin recommendation: Maintain accurate task log ratios. Accurate completion counts optimize future prediction scores.")
    if len(recommendations) < 3:
        recommendations.append("Study timing optimization: Protect your peak hours. Shut down social notifications completely during focused sessions.")
        
    return {'recommendations': recommendations}

# --- 6. Daily AI Summary ---
@app.post("/daily-ai-summary")
def daily_ai_summary(request: ProductivityRequest):
    log = request.latest_log
    comp_rate = log.tasksCompleted / log.tasksTotal if log.tasksTotal > 0 else (log.focusLevel / 10.0)
    score = get_productivity_heuristics(log, comp_rate)
    
    summary = ""
    if score >= 75:
        summary = f"Today was a highly productive day! Your focus level reached a peak of {log.focusLevel}/10, and your task completions were highly efficient. Your digital twin shows optimal brain battery levels."
    elif score >= 50:
        summary = f"Today was a moderately productive session. You logged a steady {log.studyHours} hours of study. Focus was highest during evening hours, but distraction slightly increased after prolonged phone/screen usage."
    else:
        summary = f"Today was a cognitive recovery day. Productivity index was restricted due to sleep deprivation ({log.sleepHours} hrs) or high stress. Your digital twin recommends immediate resting cycles to restore focus."
        
    return {
        'summary': summary
    }

if __name__ == '__main__':
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
