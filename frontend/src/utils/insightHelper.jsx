import React from 'react';
import { TrendingUp, Zap, AlertTriangle, Award } from 'lucide-react';

export const getDynamicInsights = (user, twinData) => {
  // 1. Peak study window timing calculation
  const preferredTiming = user?.onboardingData?.preferredStudyTiming || 'Night';
  const isMorning = preferredTiming.toLowerCase().includes('morning');
  const peakWindow = isMorning ? '9 AM – 11 AM' : '8 PM – 10 PM';

  // 2. Strength Insight
  const strength = {
    type: 'strength',
    title: 'Strength',
    icon: TrendingUp,
    colorClass: 'emerald',
    text: (
      <>
        You are most productive between <span className="text-emerald-400 font-bold">{peakWindow}</span>.
      </>
    )
  };

  // 3. Warning Insight
  let warningText = (
    <>
      Your focus drops after <span className="text-amber-400 font-bold">3 consecutive late nights</span>.
    </>
  );
  if (twinData.burnout?.score > 60) {
    warningText = (
      <>
        Focus degradation detected during <span className="text-amber-400 font-bold">consecutive late-night study hours</span>.
      </>
    );
  } else if (twinData.productivityScore > 80) {
    warningText = (
      <>
        Maintain <span className="text-amber-400 font-bold">regular recovery breaks</span> to sustain this study efficiency window.
      </>
    );
  }

  const warning = {
    type: 'warning',
    title: 'Warning',
    icon: Zap,
    colorClass: 'amber',
    text: warningText
  };

  // 4. Alert Insight
  let alertText = (
    <>
      Burnout risk increasing due to <span className="text-rose-400 font-bold">inconsistent sleep</span>.
    </>
  );
  if (twinData.burnout?.score > 70) {
    alertText = (
      <>
        High Burnout Risk: Critical sleep deficit. Reduce study blocks by <span className="text-rose-400 font-bold">50% today</span>.
      </>
    );
  } else if (twinData.consistencyIndex < 60) {
    alertText = (
      <>
        Study rhythm volatility detected. Target a <span className="text-rose-400 font-bold">fixed daily study duration</span>.
      </>
    );
  }

  const alert = {
    type: 'alert',
    title: 'Alert',
    icon: AlertTriangle,
    colorClass: 'rose',
    text: alertText
  };

  // 5. Motivation Insight
  let motivationText = (
    <>
      Keep going! You've completed <span className="text-blue-400 font-bold">90% of your weekly goal</span>.
    </>
  );
  if (twinData.activeStreak > 0) {
    motivationText = (
      <>
        Sensational streak! You have preserved a <span className="text-blue-400 font-bold">{twinData.activeStreak}-day active logging consistency</span>.
      </>
    );
  }

  const motivation = {
    type: 'motivation',
    title: 'Motivation',
    icon: Award,
    colorClass: 'blue',
    text: motivationText
  };

  return [strength, warning, alert, motivation];
};
